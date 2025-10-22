"use client"

import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { ProjectContext } from "../../context/ProjectContext"
import "./Preview.css"

function Preview() {
  const { currentProject } = useContext(ProjectContext)
  const iframeRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [executionTime, setExecutionTime] = useState(0)
  const [consoleOutput, setConsoleOutput] = useState([])
  const [showConsole, setShowConsole] = useState(false)

  const generatePreviewHTML = useCallback(() => {
    const files = currentProject?.files || []
    console.log("Generating preview with files:", files.map(f => ({ name: f.name, contentLength: f.content?.length })))
    const appFile = files.find((f) => f.name === "App.jsx")
    const indexFile = files.find((f) => f.name === "index.js")

    if (!appFile || !indexFile) {
      return "<div style='padding: 20px; color: #666;'>App.jsx and index.js files are required</div>"
    }

    const cssFiles = files.filter((f) => f.name.endsWith(".css"))
    const cssContent = cssFiles.map((f) => f.content).join("\n")

    const jsxFiles = files.filter((f) => f.name.endsWith(".jsx"))

    // Transform ES6 modules to global variables for browser compatibility
    const transformCode = (code, fileName) => {
      let transformed = code

      // Remove import statements
      transformed = transformed.replace(/import\s+.*?\s+from\s+['"].*?['"];?\s*/g, '')
      transformed = transformed.replace(/import\s+['"].*?['"];?\s*/g, '')

      if (fileName.endsWith(".jsx")) {
        // Convert export default to window.ComponentName
        const componentName = fileName.replace('.jsx', '')
        transformed = transformed.replace(/export\s+default\s+function\s+(\w+)/, `window.${componentName} = function $1`)
        transformed = transformed.replace(/export\s+default\s+/, `window.${componentName} = `)
      } else if (fileName === "index.js") {
        // Convert imports to global references and execution
        transformed = transformed
          .replace(/import\s+React\s+from\s+['"]react['"];?\s*/g, '')
          .replace(/import\s+ReactDOM\s+from\s+['"]react-dom\/client['"];?\s*/g, '')
          .replace(/const\s+root\s*=\s*ReactDOM\.createRoot\(document\.getElementById\('root'\)\);\s*root\.render\(.*?\);/, 'ReactDOM.createRoot(document.getElementById(\'root\')).render(React.createElement(window.App));')
      }
      return transformed
    }

    const transformedJsxCodes = jsxFiles.map(file => transformCode(file.content, file.name))
    const transformedIndexCode = transformCode(indexFile.content, "index.js")

    const jsxScripts = transformedJsxCodes.map(code => `<script type="text/babel" data-presets="react">${code}</script>`).join('\n')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://unpkg.com/@babel/preset-react@7/babel.min.js"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
              background-color: #ffffff;
            }
            #root {
              width: 100%;
              min-height: 100vh;
            }
            .error-boundary {
              padding: 20px;
              background-color: #fee;
              border: 1px solid #fcc;
              border-radius: 4px;
              color: #c33;
              font-family: monospace;
              white-space: pre-wrap;
              word-break: break-word;
              font-size: 12px;
            }
            ${cssContent}
          </style>
        </head>
        <body>
          <div id="root"></div>
          ${jsxScripts}
          <script type="text/babel" data-presets="react">
            ${transformedIndexCode}
          </script>
          <script>
            // Override console methods after Babel has processed the scripts
            setTimeout(() => {
              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;

              window.__consoleLogs = [];

              console.log = function(...args) {
                window.__consoleLogs.push({ type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
                originalLog.apply(console, args);
              };

              console.error = function(...args) {
                window.__consoleLogs.push({ type: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
                originalError.apply(console, args);
              };

              console.warn = function(...args) {
                window.__consoleLogs.push({ type: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
                originalWarn.apply(console, args);
              };
            }, 200);
          </script>
        </body>
      </html>
    `

    return html
  }, [currentProject?.files])

  const refreshPreview = useCallback(() => {
    console.log("🔄 Preview: Starting refresh");
    setIsLoading(true);
    setError(null);
    setConsoleOutput([]);
    const startTime = performance.now();

    try {
      // Log current project state
      console.log("📄 Preview: Current files", {
        files: currentProject?.files?.map(f => ({
          name: f.name,
          contentLength: f.content?.length,
          preview: f.content?.substring(0, 50) + "..."
        }))
      });

      const html = generatePreviewHTML();
      console.log("🔨 Preview: Generated HTML length:", html.length);
      
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      if (iframeRef.current) {
        console.log("🖼️ Preview: Updating iframe content");
        iframeRef.current.onload = () => {
          const endTime = performance.now();
          setExecutionTime(Math.round(endTime - startTime));

          try {
            const iframeWindow = iframeRef.current.contentWindow;
            if (iframeWindow.__consoleLogs) {
              console.log("📟 Preview: Captured console output", iframeWindow.__consoleLogs);
              setConsoleOutput(iframeWindow.__consoleLogs);
            }
          } catch (e) {
            console.warn("⚠️ Preview: Could not access iframe console", e);
          }

          setIsLoading(false);
          console.log("✅ Preview: Refresh complete");
        };
        iframeRef.current.src = url;
      }
    } catch (err) {
      console.error("❌ Preview: Refresh failed", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [generatePreviewHTML, currentProject?.files])

  useEffect(() => {
    refreshPreview()
  }, [currentProject?.files, refreshPreview])

  // Force refresh when selectedFile changes to ensure preview updates
  useEffect(() => {
    if (currentProject?.selectedFile) {
      console.log("Selected file or content changed, refreshing preview")
      const selectedFileContent = currentProject.files.find(
        f => f.id === currentProject.selectedFile.id
      )?.content
      
      // Add a small delay to ensure state is settled
      const timer = setTimeout(() => {
        refreshPreview()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [
    currentProject?.selectedFile?.id,
    currentProject?.files?.map(f => f.content).join(''),
    refreshPreview
  ])

  return (
    <div className="preview-container">
      <div className="preview-header">
        <div className="preview-header-left">
          <span className="preview-title">Preview</span>
          {executionTime > 0 && <span className="preview-execution-time">{executionTime}ms</span>}
        </div>
        <div className="preview-actions">
          {consoleOutput.length > 0 && (
            <button
              className={`preview-button console-button ${showConsole ? "active" : ""}`}
              onClick={() => setShowConsole(!showConsole)}
              title="Toggle console output"
            >
              Console ({consoleOutput.length})
            </button>
          )}
          <button className="preview-button refresh" onClick={refreshPreview}>
            Refresh
          </button>
        </div>
      </div>

      {showConsole && consoleOutput.length > 0 && (
        <div className="preview-console">
          <div className="console-header">
            <span>Console Output</span>
            <button className="console-close" onClick={() => setShowConsole(false)}>
              ×
            </button>
          </div>
          <div className="console-content">
            {consoleOutput.map((log, idx) => (
              <div key={idx} className={`console-line console-${log.type}`}>
                <span className="console-type">{log.type}</span>
                <span className="console-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="preview-content">
        {isLoading && (
          <div className="preview-loading">
            <div className="preview-spinner"></div>
            Loading preview...
          </div>
        )}
        {error && <div className="preview-error">Error: {error}</div>}
        <iframe
          ref={iframeRef}
          className="preview-iframe"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  )
}

export default Preview
