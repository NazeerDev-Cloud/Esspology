// Mounts every API router in the right order with session + CSRF handling.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { session, csrfGuard, authRouter } from './auth.js';
import { publicRouter } from './public.js';
import { adminRouter } from './admin.js';

export { authRouter };
export const adminRouterGuard = Router();
adminRouterGuard.use(session, csrfGuard);
adminRouterGuard.use('/auth', rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }), authRouter);
adminRouterGuard.use('/admin', adminRouter);
adminRouterGuard.use('/', publicRouter);
