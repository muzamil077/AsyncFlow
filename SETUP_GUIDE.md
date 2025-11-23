# AsyncFlow Setup Guide

## Quick Start

### 1. Database Migration (REQUIRED)

The new team management, skills, and invitation features require database changes.

**Run in Command Prompt (not PowerShell):**
```bash
cd C:\Users\meixu\OneDrive\Desktop\asyncFlow\server
npx prisma migrate dev --name add_team_management
npx prisma generate
```

**If using PowerShell, enable scripts first:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## New Features Available

### ✅ Quick Wins: Task Assignment
- Assign tasks to team members
- View "My Tasks" at `/my-tasks`
- Filter tasks by status

### ✅ Phase 4: Team Management
- Invite members: Project Settings → Invite Member
- Accept invitations: `/invite/[token]`
- Manage team roles (Owner, Admin, Member)
- Remove team members

### ✅ Phase 5: AI Assignee Suggestions (Backend)
- Smart assignee recommendations based on:
  - Current workload
  - Skill matching
  - Task history
- API: `POST /api/assignments/suggest`

### ✅ Phase 6: Team-Aware AI (Backend)
- Meeting summaries with team context
- Auto-create tasks from meetings
- Smart task assignment based on skills
- API: `POST /api/ai/summarize-with-context`

## API Endpoints

### Team Management
- `POST /api/team/invite` - Invite member
- `POST /api/team/accept/:token` - Accept invitation
- `GET /api/team/project/:projectId` - Get members
- `DELETE /api/team/:memberId` - Remove member

### Task Assignment
- `GET /api/tasks/my-tasks` - Get my assigned tasks
- `GET /api/members/project/:projectId` - Get project members

## Troubleshooting

### Server won't start
- Make sure you ran `npx prisma migrate dev` and `npx prisma generate`
- Check that PostgreSQL is running
- Verify `.env` file has correct `DATABASE_URL`

### TypeScript errors
- Run `npx prisma generate` to regenerate Prisma client
- Restart your IDE/editor

### OpenAI API errors
- The app uses mock data fallbacks if OpenAI quota is exceeded
- Check `OPENAI_API_KEY` in `server/.env`

## Next Steps

To complete the implementation, you can add:
1. **Phase 5 Frontend**: AI suggestion panel in task creation
2. **Phase 6 Frontend**: "Create All Tasks" button on meeting summaries
3. **Email Service**: Send actual invitation emails instead of links
