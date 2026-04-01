import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import { SESSION_SECRET, ALLOWED_ORIGINS, isAllowedRedirect } from './config';

const authRouter = express.Router();

authRouter.get('/login',
    (req, res, next) => {
        const redirectTo = req.query.redirect_to as string;
        if (redirectTo && isAllowedRedirect(redirectTo)) {
            console.log('Saving allowed redirect destination:', redirectTo);
            res.cookie('returnTo', redirectTo, {
                maxAge: 5 * 60 * 1000,
                httpOnly: true,
                path: '/',
            });
        } else if (redirectTo) {
            console.warn('An invalid redirect destination was specified:', redirectTo);
        }
        next();
    },
    passport.authenticate('keycloak')
);

authRouter.get('/callback',
    passport.authenticate('keycloak', { failureRedirect: '/login-failed' }),
    (req, res) => {
        const returnTo = req.cookies?.returnTo;
        res.clearCookie('returnTo', { path: '/' });

        let targetUrl = (returnTo && isAllowedRedirect(returnTo))
            ? returnTo
            : ALLOWED_ORIGINS[0];

        if (targetUrl.startsWith('com.example.flutterauthapp://')) {
            const newSessionId = req.sessionID;
            const signature = crypto.createHmac('sha256', SESSION_SECRET)
                .update(newSessionId)
                .digest('base64')
                .replace(/\=+$/, '');
            const signedSessionCookie = `s:${newSessionId}.${signature}`;

            const urlObj = new URL(targetUrl);
            urlObj.searchParams.append('session', signedSessionCookie);
            targetUrl = urlObj.toString();
            console.log('📱 Passing the [latest] session to the mobile app:', targetUrl);
        }

        console.log('Final redirect destination:', targetUrl);
        res.redirect(targetUrl);
    }
);

authRouter.get('/logout', (req, res, next) => {
    const requestedRedirect = req.query.redirect_to as string;
    const bffBasePath = process.env.BFF_BASE_PATH || '/';
    let safeRedirectUri = `${process.env.BFF_BASE_URL}${bffBasePath}`;

    if (requestedRedirect && isAllowedRedirect(requestedRedirect)) {
        safeRedirectUri = requestedRedirect;
    }

    if (!req.user) {
        return res.redirect(safeRedirectUri);
    }

    const idToken = req.user.idToken;

    req.logout((err) => {
        if (err) { return next(err); }

        req.session.destroy(() => {
            const redirectUri = encodeURIComponent(safeRedirectUri);
            let logoutUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout?post_logout_redirect_uri=${redirectUri}`;

            if (idToken) {
                logoutUrl += `&id_token_hint=${idToken}`;
            }

            console.log('Logout request to Keycloak:', logoutUrl);
            res.redirect(logoutUrl);
        });
    });
});

authRouter.get('/me', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        return res.json({
            isAuthenticated: true,
            user: {
                idToken: (req.user as any).idToken,
            }
        });
    }

    return res.json({
        isAuthenticated: false,
        user: null
    });
});

export default authRouter;