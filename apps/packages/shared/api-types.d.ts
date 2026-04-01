export interface UserContext {
    roles: string[];
    groups: string[];
}

export interface AuthorizationResponse {
    message: string;
    user: string;
    context: UserContext;
}
