"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";
import Editor from "@monaco-editor/react"; // Use Monaco Editor
import { Button } from "./button";
import { codeSnippets, languageOptions } from "./config";
import { compileCode } from "./compile";
import toast from "react-hot-toast";
import * as monaco from "monaco-editor";
import ACTIONS from "../Actions"; // Import actions for WebSocket communication

export default function EditorComponent({ socketRef, roomId }) {
  const [sourceCode, setSourceCode] = useState(codeSnippets["htmlcssjs"]); // Default language: htmlcssjs
  const [languageOption, setLanguageOption] = useState(languageOptions[0]); // Default: first language (HTML/CSS/JS)
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState([]);
  const [err, setErr] = useState(false);
  const editorRef = useRef(null);

  // Emit code change through WebSocket
  const emitCodeChange = (code) => {
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        language: languageOption.language, // Emit language along with code
        code,
      });
    }
  };

  // Emit language change through WebSocket
  const emitLanguageChange = (language) => {
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
        roomId,
        language,
        code: codeSnippets[language], // Emit initial code for the new language
      });
    }
  };

  // Handle incoming code and language changes
  useEffect(() => {
    if (socketRef.current) {
      // Listen for code changes
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ language, code }) => {
        if (language === languageOption.language) {
          setSourceCode(code);
        }
      });

      // Listen for language changes
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language, code }) => {
        const selectedOption = languageOptions.find(
          (option) => option.language === language
        );
        if (selectedOption) {
          setLanguageOption(selectedOption);
          setSourceCode(code); // Set code for the new language
        }
      });

      return () => {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
        socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
      };
    }
  }, [socketRef, languageOption]);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    editor.focus();

    // Define custom theme
    monaco.editor.defineTheme("default", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "identifier", foreground: "9CDCFE" },
        { token: "identifier.function", foreground: "DCDCAA" },
        { token: "type", foreground: "1AAFB0" },
      ],
      colors: {},
    });

    // Set the custom theme
    monaco.editor.setTheme("default");
  }

  function handleOnChange(value) {
    if (value) {
      setSourceCode(value);
      emitCodeChange(value); // Emit code change
    }
  }

  function onSelect(event) {
    const selectedOption = languageOptions.find(
      (option) => option.language === event.target.value
    );

    // Check if selectedOption is defined before using it
    if (selectedOption) {
      setLanguageOption(selectedOption);
      setSourceCode(codeSnippets[selectedOption.language]);
      emitLanguageChange(selectedOption.language); // Emit language change
    } else {
      console.error("Selected language option not found.");
    }
  }

  async function executeCode() {
    setLoading(true);
    const requestData = {
      language: languageOption.language,
      version: languageOption.version,
      files: [{ content: sourceCode }],
    };
    try {
      const result = await compileCode(requestData);
      setOutput(result.run.output.split("\n"));
      setLoading(false);
      setErr(false);
      toast.success("Compiled Successfully");
    } catch (error) {
      setErr(true);
      setLoading(false);
      setOutput([error.message || "An error occurred while executing the code."]);
      toast.error("Failed to compile the Code");
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen dark:bg-slate-900 rounded-2xl shadow-2xl py-6 px-8">
      {/* EDITOR HEADER */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center space-x-4">
          <select
            value={languageOption.language}
            onChange={onSelect}
            className="bg-slate-300 dark:bg-slate-800 p-2 rounded-md shadow-md transition duration-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
          >
            <option value="" disabled>
              Select Language
            </option>
            {languageOptions.map((option) => (
              <option key={option.language} value={option.language}>
                {option.language.charAt(0).toUpperCase() + option.language.slice(1)}
              </option>
            ))}
          </select>
          <Button onClick={executeCode} disabled={loading}>
            {loading ? "Compiling..." : "Run Code"}
          </Button>
        </div>
      </div>

      <div className="my-4"></div>

      {/* EDITOR */}
      <div className="editorWrap">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full rounded-lg border dark:bg-slate-900"
        >
          <ResizablePanel defaultSize={50} minSize={35}>
            <Editor
              height="100vh"
              defaultLanguage={languageOption.language}
              defaultValue={sourceCode}
              onMount={handleEditorDidMount}
              value={sourceCode}
              onChange={handleOnChange}
              options={{
                selectOnLineNumbers: true,
                automaticLayout: true,
              }}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={35}>
            {/* Output Rendering */}
            <div className="space-y-3 bg-slate-300 dark:bg-slate-900 min-h-screen p-4">
              <h2 className="font-bold text-lg">Output</h2>
              {err ? (
                <div className="text-red-600">
                  <strong>Error:</strong>
                  <pre>{output.join("\n")}</pre>
                </div>
              ) : (
                <pre>{output.join("\n")}</pre>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
