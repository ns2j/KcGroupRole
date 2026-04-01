declare module 'passport-openidconnect' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface Profile {
    provider: string;
    id: string;
    displayName: string;
    name?: {
      familyName: string;
      givenName: string;
      middleName?: string;
    };
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
    _raw: string;
    _json: any;
  }

  export interface VerifyCallback {
    (err: any, user?: any, info?: any): void;
  }

  export interface VerifyFunction {
    (issuer: string, profile: Profile, done: VerifyCallback): void;
  }

  export interface VerifyFunctionWithContext {
    (issuer: string, profile: Profile, context: any, done: VerifyCallback): void;
  }

  export interface StrategyOptions {
    issuer: string;
    authorizationURL: string;
    tokenURL: string;
    userInfoURL: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string | string[];
    passReqToCallback?: boolean;
    skipUserProfile?: boolean;
    responseType?: string;
    responseMode?: string;
    nonce?: string;
    display?: string;
    prompt?: string;
    maxAge?: number;
    uiLocales?: string;
    idTokenHint?: string;
    loginHint?: string;
    acrValues?: string;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction | VerifyFunctionWithContext);
    name: string;
    authenticate(req: import('express').Request, options?: any): void;
  }
}
