import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { summarize } from './controllers/aiController';

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

app.post('/api/ai/summarize', summarize);
app.use('/api/auth', authRoutes);
console.log('Mounting project routes...');
console.log('Type of projectRoutes:', typeof projectRoutes);
console.log('Is projectRoutes a function?', typeof projectRoutes === 'function');

app.use('/api/projects', (req, res, next) => {
    console.log('Request received at /api/projects:', req.method, req.url);
    next();
});



app.use('/api/projects', projectRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
