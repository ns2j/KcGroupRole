import type { UserContext } from '../../packages/shared/api-types';

export interface KeycloakTokenPayload {
    realm_access?: { roles?: string[] };
    resource_access?: { [clientId: string]: { roles?: string[] } };
    groups?: string[];
    [key: string]: any;
}

/**
 * Safely extracts roles and groups from a decoded Keycloak JWT.
 */
export const extractUserContext = (
    tokenPayload: KeycloakTokenPayload,
    clientId?: string
): UserContext => {
    const extractedRoles = new Set<string>();

    if (tokenPayload.realm_access?.roles) {
        tokenPayload.realm_access.roles.forEach(role => extractedRoles.add(role));
    }

    if (clientId && tokenPayload.resource_access?.[clientId]?.roles) {
        tokenPayload.resource_access[clientId].roles.forEach(role => extractedRoles.add(role));
    }

    return {
        roles: Array.from(extractedRoles),
        groups: tokenPayload.groups || []
    };
};