import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ProjectProvider } from "./context/ProjectContext"
import { ThemeProvider } from "./context/ThemeContext"
import Navbar from "./components/Navbar/Navbar"
import EditorPage from "./pages/EditorPage"
import Home from "./pages/Home"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import "./App.css"

function App() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <Router>
          <div className="app-container">
            <div className="app-main">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="*"
                  element={
                    <>
                      <Navbar />
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/editor/:projectId" element={<EditorPage />} />
                      </Routes>
                    </>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </ProjectProvider>
    </ThemeProvider>
  )
}

export default App
