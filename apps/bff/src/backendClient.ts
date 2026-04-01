import { Request, Response } from 'express';

export const backendBaseUrl = process.env.SPRING_BACKEND_URL || '';

export const callBackend = async (req: Request, res: Response, endpointPath: string) => {
  if (!req.isAuthenticated() || !req.user?.accessToken) {
    return res.status(401).json({ error: 'Not logged in, or no access token available' });
  }

  try {
    const accessToken = req.user.accessToken;
    const backendApiUrl = `${backendBaseUrl}${endpointPath}`;

    console.log(`Sending request to backend API: ${backendApiUrl}`);

    const backendResponse = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!backendResponse.ok) {
      console.error('Backend API error:', backendResponse.status);
      return res.status(backendResponse.status).json({ error: 'Cannot access backend API' });
    }

    const data = await backendResponse.json();
    res.json(data);

  } catch (error) {
    console.error('Communication error:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};
