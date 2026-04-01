// types/express/index.d.ts
import { User as PassportUser } from 'passport';
import type { UserContext } from '../../../packages/shared/api-types';

declare global {
  namespace Express {
    // Extend Passport's User type
    interface User {
      accessToken?: string;
      idToken?: string;
      refreshToken?: string;
      profile?: any; // Define Keycloak profile type as needed
      username?: string;
    }

    interface Request {
      // isAuthenticated is injected by Passport
      isAuthenticated(): this is RequestWithUser;
      policyContext?: UserContext;
    }

    // Request type guaranteed to be authenticated
    interface RequestWithUser extends Request {
      user: User;
    }
  }
}