# CipherStudio - Browser-Based React IDE

A full-featured, browser-based React IDE that allows developers to write, run, and preview React code directly in the browser without any setup. Similar to CodeSandbox and NextLeap.js, but built from scratch.

## 🌐 Live Website

[https://cipherschoolside.vercel.app/](https://cipherschoolside.vercel.app/)

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- npm or yarn
- MongoDB Atlas account (for database)
- AWS account (optional, for S3 file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cipherstudio.git
   cd cipherstudio
   ```

2. **Setup Backend**
   ```bash
   cd cipherstudio-backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB and AWS credentials
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd cipherstudio-frontend
   npm install
   npm start
   ```

4. **Open in Browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## ✨ Features

### Core Features
- ✅ **File Management** - Create, edit, and organize project files
- ✅ **Monaco Editor** - Professional code editor with syntax highlighting
- ✅ **Live Preview** - Real-time React code execution with Babel
- ✅ **Save & Load** - Projects persist to MongoDB with localStorage backup
- ✅ **Autosave** - Automatic saving every 2 seconds (toggleable)
- ✅ **Dark/Light Theme** - Customizable theme with CSS variables
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

### Bonus Features
- 🔐 Authentication (Login/Register)
- 🎨 Theme customization (Dark, Light, Ocean themes)
- 📱 Responsive UI
- 🔄 Project versioning
- 💾 Offline support with localStorage

## 📁 Project Structure

```
cipherstudio/
├── cipherstudio-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── Auth.css
│   │   │   ├── Editor/
│   │   │   │   ├── Editor.jsx
│   │   │   │   └── Editor.css
│   │   │   ├── Preview/
│   │   │   │   ├── Preview.jsx
│   │   │   │   └── Preview.css
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Navbar.css
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Sidebar.css
│   │   │   ├── FileExplorer/
│   │   │   │   ├── FileExplorer.jsx
│   │   │   │   └── FileExplorer.css
│   │   │   ├── ThemeToggle/
│   │   │   │   ├── ThemeToggle.jsx
│   │   │   │   └── ThemeToggle.css
│   │   │   └── CodeExecutor/
│   │   │       ├── CodeExecutor.jsx
│   │   │       └── CodeExecutor.css
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Home.css
│   │   │   ├── EditorPage.jsx
│   │   │   └── EditorPage.css
│   │   ├── context/
│   │   │   ├── ProjectContext.js
│   │   │   └── ThemeContext.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── App.test.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── README.md
├── cipherstudio-backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── s3Config.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── projectController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Project.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── projectRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── README.md
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── pnpm-lock.yaml
├── SETUP_GUIDE.md
├── DEPLOYMENT.md
├── FEATURES.md
├── PROJECT_SUMMARY.md
├── USAGE_GUIDE.md
├── COMPLETE_FEATURE_SUMMARY.md
├── TODO.md
└── README.md (this file)
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Monaco Editor, Babel Standalone |
| Backend | Node.js, Express.js, MongoDB, JWT |
| Database | MongoDB Atlas |
| Storage | AWS S3 (optional) |
| Authentication | JWT, bcryptjs |
| Deployment | Vercel (Frontend), Render/Railway (Backend) |

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- AWS account (optional, for S3)

## ⚙️ Installation & Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd cipherstudio-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the backend root:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cipherstudio
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd cipherstudio-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the frontend root:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 🔧 Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cipherstudio
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
JWT_SECRET=your_secret
PORT=5000
```

## 🔄 API Endpoints

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - User login
GET    /api/auth/profile      - Get user profile
```

### Projects
```
POST   /api/projects              - Create project
GET    /api/projects/:projectId   - Get project
PUT    /api/projects/:projectId   - Update project
DELETE /api/projects/:projectId   - Delete project
GET    /api/projects/user/projects - Get user projects
```

## 📖 Usage Guide

### Creating a New Project
1. Navigate to the home page
2. Click "Create New Project"
3. Enter a project name and description
4. Click "Create"

### Creating Files
1. In the sidebar, click the "+" button
2. Enter a file name
3. Select file type (JSX, CSS, JSON, HTML, JS)
4. Click "Create"

### Writing Code
- Use Monaco Editor with syntax highlighting
- Support for JSX, JavaScript, CSS, JSON, HTML
- Real-time preview updates
- Autosave every 2 seconds

### File Management
- **Rename**: Click pencil icon next to file name
- **Delete**: Click trash icon next to file name
- **Switch Files**: Click on file names in sidebar

### Theme Switching
- Click theme toggle in navbar
- Available themes: Dark, Light, Ocean
- Preference saved automatically

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Database Setup (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Create database user
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

## 🐛 Troubleshooting

### Backend Connection Issues
- Check MongoDB URI in `.env`
- Ensure backend is running on port 5000
- Verify CORS settings

### Editor Not Loading
- Clear browser cache
- Check Monaco Editor CDN
- Check browser console for errors

### Preview Not Working
- Verify React/ReactDOM CDN links
- Check code syntax
- Look for Babel transpilation errors

### Authentication Issues
- Check JWT_SECRET in backend `.env`
- Verify MongoDB connection
- Check password hashing with bcryptjs

## 🎯 How It Works

1. **Create Project** - User creates a new project from the home page
2. **Edit Code** - Write React code in Monaco Editor
3. **Live Preview** - See changes in real-time in the preview pane
4. **Save Project** - Autosave or manual save to MongoDB
5. **Load Project** - Reload projects anytime from home page

## 📝 Key Design Decisions

- **Monaco Editor** - Professional code editing experience
- **Babel Standalone** - Client-side JSX transpilation
- **Context API** - Lightweight state management
- **localStorage** - Offline support and faster loading
- **CSS Variables** - Easy theme switching
- **Responsive Design** - Mobile-first approach

## 🔒 Security Considerations

- Sandbox iframe for code execution
- Input validation on backend
- CORS configuration
- Environment variables for sensitive data
- JWT authentication
- Password hashing with bcryptjs

## 🚀 Performance Optimizations

- Lazy loading of Monaco Editor
- localStorage caching
- Debounced autosave (2-second interval)
- Optimized re-renders with React Context
- Minified CSS and JavaScript
- CDN for external libraries

## 📱 Responsive Design

- **Desktop**: Optimized for 1024px+
- **Tablet**: Adjusted for 768px - 1024px
- **Mobile**: Stacked layout for < 768px
- Touch-friendly controls
- Flexible components

## 🧪 Testing Recommendations

- Unit tests for API endpoints
- Integration tests for frontend components
- E2E tests for user workflows
- Performance testing for large projects
- Security testing for code execution

## 🔄 Future Enhancements

- Real-time collaboration
- Custom npm packages support
- Code formatting (Prettier)
- Linting (ESLint)
- GitHub integration
- Code snippets library
- Version control
- Project sharing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by CodeSandbox and NextLeap.js
- Monaco Editor by Microsoft
- React by Facebook
- Babel for transpilation

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ by Kuldeep**
