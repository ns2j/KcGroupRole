import { Router, Request, Response } from 'express';
import { requirePolicy, authenticateToken } from './middleware';
import { PolicyRule } from './policy';
import type { UserContext, AuthorizationResponse } from '../../packages/shared/api-types';
const authzRouter = Router();

/**
 * Simple authentication state check (OK if logged in)
 */
authzRouter.get(
  '/authenticated',
  authenticateToken,
  (req: Request, res: Response<AuthorizationResponse>) => {
    res.json({
      message: 'You are authenticated.',
      user: req.user?.username || 'unknown',
      context: req.policyContext!
    });
  }
);

authzRouter.get(
  '/roleorgroup',
  requirePolicy({ operator: 'or', rules: [{ operator: 'hasRole', roles: ['admin', 'user'] }, { operator: 'isInGroup', groups: ['/A'] }] }),
  (req: Request, res: Response<AuthorizationResponse>) => {
    res.json({
      message: 'You have the required role or group.',
      user: req.user?.username || 'unknown',
      context: req.policyContext!
    });
  }
);

const adminPolicy: PolicyRule = {
  operator: 'hasRole',
  roles: ['manager']
};

const APolicy: PolicyRule = {
  operator: 'or',
  rules: [
    { operator: 'hasRole', roles: ['super_manager'] },
    {
      operator: 'and', rules: [
        { operator: 'hasRole', roles: ['manager'] },
        { operator: 'isInGroup', groups: ['/A/B'] }
      ]
    }
  ]
};

authzRouter.get(
  '/admin',
  requirePolicy(adminPolicy),  // Evaluates the AST policy against req.policyContext
  (req: Request, res: Response<AuthorizationResponse>) => {
    res.json({
      message: 'Welcome to the Admin Zone!',
      user: req.user?.username || 'unknown',
      context: req.policyContext!
    });
  }
);

authzRouter.get(
  '/a',
  requirePolicy(APolicy),
  (req: Request, res: Response<AuthorizationResponse>) => {
    res.json({
      message: 'Welcome to the complex Role and Group',
      user: req.user?.username || 'unknown',
      context: req.policyContext!
    });
  }
);

export default authzRouter;
