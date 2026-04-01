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
  console.log('--- /info call from Flutter ---');
  console.log('Received Cookies:', req.headers.cookie);
  console.log('Authentication status:', req.isAuthenticated());

  if (req.isAuthenticated()) {
    const accessToken = req.user?.accessToken;
    let decodedToken = null;

    if (accessToken) {
      try {
        decodedToken = jwt.decode(accessToken);
      } catch (e) {
        console.error('Failed to decode access token:', e);
      }
    }

    res.json({
      accessToken: accessToken,
      decodedAccessToken: decodedToken,
      idToken: req.user?.idToken,
      user: req.user
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});




apiRouter.get('/protected-resource', authenticateToken, (req, res) => callBackend(req, res, '/mock-api/protected-resource'));
apiRouter.get('/admin-only', authenticateToken, (req, res) => callBackend(req, res, '/mock-api/admin-only'));
apiRouter.get('/group-restricted', authenticateToken, (req, res) => callBackend(req, res, '/mock-api/group-restricted'));

export default apiRouter;
