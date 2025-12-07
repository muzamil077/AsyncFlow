"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const aiController_1 = require("./controllers/aiController");
const auth_middleware_1 = require("./middleware/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`[Global Logger] ${req.method} ${req.url}`);
    next();
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
app.post('/api/ai/summarize', auth_middleware_1.authenticate, aiController_1.summarize);
app.use('/api/auth', auth_routes_1.default);
console.log('Mounting project routes...');
console.log('Type of projectRoutes:', typeof project_routes_1.default);
console.log('Is projectRoutes a function?', typeof project_routes_1.default === 'function');
app.use('/api/projects', (req, res, next) => {
    console.log('Request received at /api/projects:', req.method, req.url);
    next();
});
app.use('/api/projects', project_routes_1.default);
const task_routes_1 = __importDefault(require("./routes/task.routes"));
app.use('/api/tasks', task_routes_1.default);
const discussion_routes_1 = __importDefault(require("./routes/discussion.routes"));
app.use('/api/discussions', discussion_routes_1.default);
const project_members_routes_1 = __importDefault(require("./routes/project-members.routes"));
app.use('/api/members', project_members_routes_1.default);
const member_routes_1 = __importDefault(require("./routes/member.routes"));
app.use('/api/team', member_routes_1.default);
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
app.use('/api/assignments', assignment_routes_1.default);
const skills_routes_1 = __importDefault(require("./routes/skills.routes"));
app.use('/api/skills', skills_routes_1.default);
const meeting_routes_1 = __importDefault(require("./routes/meeting.routes"));
app.use('/api/meetings', meeting_routes_1.default);
const integration_routes_1 = __importDefault(require("./routes/integration.routes"));
app.use('/api/integrations', integration_routes_1.default);
const wiki_routes_1 = __importDefault(require("./routes/wiki.routes"));
app.use('/api/wiki', wiki_routes_1.default);
// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
exports.default = app;
