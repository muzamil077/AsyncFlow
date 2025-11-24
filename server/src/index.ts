import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { summarize } from './controllers/aiController';
import { authenticate } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[Global Logger] ${req.method} ${req.url}`);
    next();
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';

app.post('/api/ai/summarize', authenticate, summarize);
app.use('/api/auth', authRoutes);
console.log('Mounting project routes...');
console.log('Type of projectRoutes:', typeof projectRoutes);
console.log('Is projectRoutes a function?', typeof projectRoutes === 'function');

app.use('/api/projects', (req, res, next) => {
    console.log('Request received at /api/projects:', req.method, req.url);
    next();
});



app.use('/api/projects', projectRoutes);
import taskRoutes from './routes/task.routes';
app.use('/api/tasks', taskRoutes);
import discussionRoutes from './routes/discussion.routes';
app.use('/api/discussions', discussionRoutes);
import projectMembersRoutes from './routes/project-members.routes';
app.use('/api/members', projectMembersRoutes);
import memberRoutes from './routes/member.routes';
app.use('/api/team', memberRoutes);
import assignmentRoutes from './routes/assignment.routes';
app.use('/api/assignments', assignmentRoutes);
import skillsRoutes from './routes/skills.routes';
app.use('/api/skills', skillsRoutes);
import meetingRoutes from './routes/meeting.routes';
app.use('/api/meetings', meetingRoutes);
import integrationRoutes from './routes/integration.routes';
app.use('/api/integrations', integrationRoutes);
import wikiRoutes from './routes/wiki.routes';
app.use('/api/wiki', wikiRoutes);

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
