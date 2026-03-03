import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { createUserClient } from '../db.ts';

const router = Router();

// GET /api/stats - Get current user stats
router.get('/', async (req: AuthRequest, res) => {
    try {
        const client = createUserClient(req.userJwt!);
        const { data, error } = await client
            .from('user_stats')
            .select('*')
            .eq('user_id', req.userId!)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Stats not exist, create them
                const { data: newStats, error: insertError } = await client
                    .from('user_stats')
                    .insert({ user_id: req.userId })
                    .select()
                    .single();
                if (insertError) throw insertError;
                return res.json(newStats);
            }
            throw error;
        }

        return res.json(data);
    } catch (err: any) {
        console.error('Get stats error:', err);
        return res.status(500).json({ error: err.message || '获取统计数据失败' });
    }
});

// PUT /api/stats - Update stats (after workout completion)
router.put('/', async (req: AuthRequest, res) => {
    try {
        const {
            streak,
            total_minutes,
            today_minutes,
            last_workout,
            last_active_date,
            unlocked_badges,
            workouts_completed,
        } = req.body;

        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

        if (streak !== undefined) updateData.streak = streak;
        if (total_minutes !== undefined) updateData.total_minutes = total_minutes;
        if (today_minutes !== undefined) updateData.today_minutes = today_minutes;
        if (last_workout !== undefined) updateData.last_workout = last_workout;
        if (last_active_date !== undefined) updateData.last_active_date = last_active_date;
        if (unlocked_badges !== undefined) updateData.unlocked_badges = unlocked_badges;
        if (workouts_completed !== undefined) updateData.workouts_completed = workouts_completed;

        const client = createUserClient(req.userJwt!);
        const { data, error } = await client
            .from('user_stats')
            .update(updateData)
            .eq('user_id', req.userId!)
            .select()
            .single();

        if (error) throw error;
        return res.json(data);
    } catch (err: any) {
        console.error('Update stats error:', err);
        return res.status(500).json({ error: err.message || '更新统计数据失败' });
    }
});

// PUT /api/stats/preferences - Update preferences
router.put('/preferences', async (req: AuthRequest, res) => {
    try {
        const { sound_enabled, haptics_enabled, reminder_time, daily_goal } = req.body;

        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

        if (sound_enabled !== undefined) updateData.sound_enabled = sound_enabled;
        if (haptics_enabled !== undefined) updateData.haptics_enabled = haptics_enabled;
        if (reminder_time !== undefined) updateData.reminder_time = reminder_time;
        if (daily_goal !== undefined) updateData.daily_goal = daily_goal;

        const client = createUserClient(req.userJwt!);
        const { data, error } = await client
            .from('user_stats')
            .update(updateData)
            .eq('user_id', req.userId!)
            .select()
            .single();

        if (error) throw error;
        return res.json(data);
    } catch (err: any) {
        console.error('Update preferences error:', err);
        return res.status(500).json({ error: err.message || '更新偏好设置失败' });
    }
});

export default router;
