import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { backendBaseUrl } from './backendClient';

const publicRouter = Router();

const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Allow up to 10 requests per minute per IP address
  message: { error: 'Request limit exceeded. Please try again after 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all /public endpoints
publicRouter.use(publicApiLimiter);

publicRouter.get('/welcome', (req, res) => {
  res.json({
    message: 'Welcome to the public API endpoint in the BFF!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Unprotected Route passing through to Spring Boot public API
publicRouter.get('/hello', async (req, res) => {
  try {
    const backendApiUrl = `${backendBaseUrl}/public/hello`;
    const backendResponse = await fetch(backendApiUrl);

    if (!backendResponse.ok) {
      return res.status(backendResponse.status).json({ error: 'Cannot access backend API' });
    }
    const data = await backendResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Communication error:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});


export default publicRouter;
