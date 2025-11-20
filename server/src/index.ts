import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { summarize } from './controllers/aiController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import authRoutes from './routes/auth.routes';

app.post('/api/ai/summarize', summarize);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
