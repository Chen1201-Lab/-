import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { createUserClient } from '../db.ts';

const router = Router();

// GET /api/users/profile - Get current user profile
router.get('/profile', async (req: AuthRequest, res) => {
    try {
        const client = createUserClient(req.userJwt!);
        const { data, error } = await client
            .from('user_profiles')
            .select('*')
            .eq('id', req.userId!)
            .single();

        if (error) {
            // Profile might not exist yet (trigger may not have fired)
            if (error.code === 'PGRST116') {
                // Create it
                const { data: newProfile, error: insertError } = await client
                    .from('user_profiles')
                    .insert({ id: req.userId })
                    .select()
                    .single();
                if (insertError) throw insertError;
                return res.json(newProfile);
            }
            throw error;
        }

        return res.json(data);
    } catch (err: any) {
        console.error('Get profile error:', err);
        return res.status(500).json({ error: err.message || '获取用户信息失败' });
    }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req: AuthRequest, res) => {
    try {
        const { gender, user_name } = req.body;
        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

        if (gender !== undefined) updateData.gender = gender;
        if (user_name !== undefined) updateData.user_name = user_name;

        const client = createUserClient(req.userJwt!);
        const { data, error } = await client
            .from('user_profiles')
            .update(updateData)
            .eq('id', req.userId!)
            .select()
            .single();

        if (error) throw error;
        return res.json(data);
    } catch (err: any) {
        console.error('Update profile error:', err);
        return res.status(500).json({ error: err.message || '更新用户信息失败' });
    }
});

export default router;
