import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { createUserClient } from '../db.ts';

const router = Router();

// POST /api/workouts - Add a workout record
router.post('/', async (req: AuthRequest, res) => {
    try {
        const {
            workout_date,
            program_id,
            program_name,
            contract_time,
            rest_time,
            cycles,
            duration_minutes,
        } = req.body;

        if (!workout_date || !program_id || !program_name) {
            return res.status(400).json({ error: '缺少必要的训练记录字段' });
        }

        const client = createUserClient(req.userJwt!);
        const { data, error } = await client
            .from('workout_records')
            .insert({
                user_id: req.userId,
                workout_date,
                program_id,
                program_name,
                contract_time,
                rest_time,
                cycles,
                duration_minutes,
            })
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json(data);
    } catch (err: any) {
        console.error('Add workout error:', err);
        return res.status(500).json({ error: err.message || '添加训练记录失败' });
    }
});

// GET /api/workouts - Get workout history
router.get('/', async (req: AuthRequest, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;

        const client = createUserClient(req.userJwt!);
        const { data, error } = await client
            .from('workout_records')
            .select('*')
            .eq('user_id', req.userId!)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return res.json(data || []);
    } catch (err: any) {
        console.error('Get workouts error:', err);
        return res.status(500).json({ error: err.message || '获取训练记录失败' });
    }
});

// GET /api/workouts/dates - Get all workout dates (for calendar)
router.get('/dates', async (req: AuthRequest, res) => {
    try {
        const client = createUserClient(req.userJwt!);
        const { data, error } = await client
            .from('workout_records')
            .select('workout_date')
            .eq('user_id', req.userId!);

        if (error) throw error;

        // Return unique dates
        const uniqueDates = [...new Set((data || []).map(r => r.workout_date))];
        return res.json(uniqueDates);
    } catch (err: any) {
        console.error('Get workout dates error:', err);
        return res.status(500).json({ error: err.message || '获取训练日期失败' });
    }
});

// POST /api/workouts/checkin - Manual check-in
router.post('/checkin', async (req: AuthRequest, res) => {
    try {
        const { workout_date } = req.body;
        const dateStr = workout_date || new Date().toDateString();

        const client = createUserClient(req.userJwt!);

        // Check if already checked in
        const { data: existing } = await client
            .from('workout_records')
            .select('id')
            .eq('user_id', req.userId!)
            .eq('workout_date', dateStr)
            .eq('program_id', 'manual_checkin')
            .limit(1);

        if (existing && existing.length > 0) {
            return res.json({ message: '今日已打卡', alreadyCheckedIn: true });
        }

        // Create check-in record
        const { data, error } = await client
            .from('workout_records')
            .insert({
                user_id: req.userId,
                workout_date: dateStr,
                program_id: 'manual_checkin',
                program_name: '手动打卡',
                contract_time: 0,
                rest_time: 0,
                cycles: 0,
                duration_minutes: 0,
            })
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json(data);
    } catch (err: any) {
        console.error('Check-in error:', err);
        return res.status(500).json({ error: err.message || '打卡失败' });
    }
});

export default router;
