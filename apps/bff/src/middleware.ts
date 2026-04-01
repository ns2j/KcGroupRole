import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PolicyRule, evaluatePolicy } from './policy';
import type { UserContext } from '../../packages/shared/api-types';

// Helper to check and auto-refresh token expiration
const refreshAccessToken = async (refreshToken: string) => {
    const params = new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID || 'example-client',
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    });

    const tokenUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
    }

    return await response.json();
};

// ---------------------------------------------------------
// 1. Types & Interfaces
// ---------------------------------------------------------

export interface KeycloakTokenPayload {
    realm_access?: { roles: string[] };
    resource_access?: { [clientId: string]: { roles: string[] } };
    groups?: string[];
    sub: string;
    email?: string;
    preferred_username?: string;
    [key: string]: any;
}

// ---------------------------------------------------------
// 2. Helper Functions
// ---------------------------------------------------------

/**
 * Hybrid token extractor: Checks headers first, then Passport session.
 */
const getToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    if (req.isAuthenticated() && req.user.accessToken) {
        return req.user.accessToken;
    }

    return null;
};

/**
 * Formats the raw Keycloak JWT into the strict UserContext.
 */
const extractUserContext = (payload: KeycloakTokenPayload, clientId?: string): UserContext => {
    const roles = new Set<string>();

    if (payload.realm_access?.roles) {
        payload.realm_access.roles.forEach(r => roles.add(r));
    }
    if (clientId && payload.resource_access?.[clientId]?.roles) {
        payload.resource_access[clientId].roles.forEach(r => roles.add(r));
    }

    return {
        roles: Array.from(roles),
        groups: payload.groups || []
    };
};

/**
 * Helper to populate req.policyContext from the token.
 * It dynamically handles token refresh, decoding, and parsing.
 * Returns true if successful, false if it sent an error response.
 */
const populatePolicyContext = async (req: Request, res: Response): Promise<boolean> => {
    if (req.policyContext) return true;

    // --- Integration of auto-refresh functionality ---
    if (req.isAuthenticated() && req.user?.accessToken && req.user?.refreshToken) {
        const decoded = jwt.decode(req.user.accessToken) as any;
        const now = Math.floor(Date.now() / 1000);

        if (decoded && decoded.exp && (decoded.exp - now) < 60) {
            console.log('🔄 Token is about to expire. Executing auto-refresh in the background...');
            try {
                const newTokens = await refreshAccessToken(req.user.refreshToken);
                
                req.user.accessToken = newTokens.access_token;
                if (newTokens.refresh_token) req.user.refreshToken = newTokens.refresh_token;
                if (newTokens.id_token) req.user.idToken = newTokens.id_token;

                // Explicitly wait for session save
                await new Promise<void>((resolve, reject) => {
                    req.session.save((err) => err ? reject(err) : resolve());
                });
                console.log('✨ Token auto-refresh completed!');
            } catch (e) {
                console.error('⚠️ An error occurred during the refresh process:', e);
                await new Promise<void>((resolve) => req.logout(() => resolve()));
                res.status(401).json({ error: 'Session expired. Please login again.' });
                return false;
            }
        }
    }

    const token = getToken(req);

    if (!token) {
        res.status(401).json({ error: 'Unauthorized: Access token missing' });
        return false;
    }

    try {
        const decoded = jwt.decode(token) as KeycloakTokenPayload;

        if (!decoded) {
            res.status(401).json({ error: 'Unauthorized: Malformed token' });
            return false;
        }

        req.policyContext = extractUserContext(decoded, 'your-client-id');
        return true;
    } catch (error) {
        res.status(403).json({ error: 'Forbidden: Invalid token' });
        return false;
    }
};

/**
 * Step 1: Extracts and decodes the Keycloak token, attaching the 
 * formatted UserContext to req.policyContext. Also auto-refreshes if needed.
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (await populatePolicyContext(req, res)) {
        next();
    }
};



/**
 * Step 2: A middleware factory that enforces a specific AST policy.
 * @param policy The JSON AST policy to enforce
 */
export const requirePolicy = (policy: PolicyRule) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!(await populatePolicyContext(req, res))) {
            return;
        }

        const isAllowed = evaluatePolicy(policy, req.policyContext!);

        if (isAllowed) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions to access this resource.' });
        }
    };
};