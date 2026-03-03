import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../db.ts';

export interface AuthRequest extends Request {
    userId?: string;
    userJwt?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await getSupabase().auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: '认证令牌无效或已过期' });
        }

        req.userId = user.id;
        req.userJwt = token;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ error: '认证验证失败' });
    }
}
