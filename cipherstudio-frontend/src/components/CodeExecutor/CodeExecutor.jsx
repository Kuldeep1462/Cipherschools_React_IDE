"use client"

import { useState, useCallback } from "react"
import "./CodeExecutor.css"

/**
 * CodeExecutor Component
 * Handles safe execution of user code with error boundaries and console capture
 */
function CodeExecutor({ code, language = "javascript", onOutput, onError }) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [output, setOutput] = useState([])

  const executeCode = useCallback(async () => {
    setIsExecuting(true)
    setOutput([])

    try {
      if (language === "javascript" || language === "jsx") {
        const capturedOutput = []
        const originalLog = console.log
        const originalError = console.error

        console.log = (...args) => {
          capturedOutput.push({
            type: "log",
            message: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "),
          })
          originalLog(...args)
        }

        console.error = (...args) => {
          capturedOutput.push({
            type: "error",
            message: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "),
          })
          originalError(...args)
        }

        try {
          // eslint-disable-next-line no-eval
          const result = eval(code)
          if (result !== undefined) {
            capturedOutput.push({
              type: "result",
              message: typeof result === "object" ? JSON.stringify(result, null, 2) : String(result),
            })
          }
        } finally {
          console.log = originalLog
          console.error = originalError
        }

        setOutput(capturedOutput)
        onOutput?.(capturedOutput)
      }
    } catch (error) {
      const errorOutput = {
        type: "error",
        message: error.message,
      }
      setOutput([errorOutput])
      onError?.(error)
    } finally {
      setIsExecuting(false)
    }
  }, [code, language, onOutput, onError])

  return {
    execute: executeCode,
    output,
    isExecuting,
  }
}

export default CodeExecutor
