# CipherStudio Backend

Backend API for CipherStudio - Browser-based React IDE

## Setup

1. Install dependencies: `npm install`
2. Configure `.env` file with MongoDB and AWS credentials
3. Run development server: `npm run dev`
4. Run production server: `npm start`

## API Endpoints

- `POST /api/projects` - Create new project
- `GET /api/projects/:projectId` - Get project details
- `PUT /api/projects/:projectId` - Update project
- `DELETE /api/projects/:projectId` - Delete project
- `GET /api/projects/user/projects` - Get user's projects
