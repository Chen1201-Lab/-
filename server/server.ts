import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.ts';
import usersRouter from './routes/users.ts';
import statsRouter from './routes/stats.ts';
import workoutsRouter from './routes/workouts.ts';

// dotenv v17 auto-injects .env variables

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
}));
app.use(express.json());

// Health check (no auth needed)
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected API routes
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/stats', authMiddleware, statsRouter);
app.use('/api/workouts', authMiddleware, workoutsRouter);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 凯格尔大师 Pro API Server`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
