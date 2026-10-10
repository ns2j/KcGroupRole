import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { requirePolicy, authenticateToken } from './middleware';
import { PolicyRule } from './policy';
import publicRouter from './publicApi';
import authorizationRouter from './authorization';

const apiRouter = Router();
import { callBackend } from './backendClient';

apiRouter.use('/public', publicRouter);
apiRouter.use('/authorization', authorizationRouter);

apiRouter.get('/info', authenticateToken, (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    const userAny = req.user as any;
    // Remove raw tokens from the profile data
    const { accessToken, idToken, refreshToken, _raw, _json, ...safeUser } = userAny;

    let decodedAccessToken = null;
    if (accessToken) {
      try {
        decodedAccessToken = jwt.decode(accessToken);
      } catch (e) {
        console.error('Failed to decode access token:', e);
      }
    }

    res.json({
      isAuthenticated: true,
      context: req.policyContext,
      user: safeUser,
      decodedAccessToken
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});




apiRouter.get('/protected-resource', authenticateToken, (req, res) => callBackend(req, res, '/mock-api/protected-resource'));
apiRouter.get('/admin-only', authenticateToken, (req, res) => callBackend(req, res, '/mock-api/admin-only'));
apiRouter.get('/group-restricted', authenticateToken, (req, res) => callBackend(req, res, '/mock-api/group-restricted'));

export default apiRouter;
