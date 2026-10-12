import type { RequestHandler } from 'express';

export function createApiReadinessMiddleware(isReady: () => boolean): RequestHandler {
  return (_req, res, next) => {
    if (isReady()) {
      next();
      return;
    }

    res.setHeader('Retry-After', '1');
    res.status(503).json({
      status: 'starting',
      error: {
        code: 'API_STARTING',
        message: 'API routes are not ready yet.',
      },
    });
  };
}
