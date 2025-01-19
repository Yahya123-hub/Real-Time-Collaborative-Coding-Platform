import React, { useCallback, useState } from 'react';
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import CodeMirror from "@uiw/react-codemirror";
import { FaCode } from 'react-icons/fa'; // Optional: for code icon

const Hcj = () => {
  //* Create state variables
  const [html_edit, setHtml_Edit] = useState('');
  const [css_edit, setCss_Edit] = useState('');
  const [js_edit, setJs_Edit] = useState('');

  //* Html onchange handler
  const onChangeHtml = useCallback((value) => {
    setHtml_Edit(value);
  }, []);

  //* Css onchange handler
  const onChangeCss = useCallback((value) => {
    setCss_Edit(value);
  }, []);

  //* JavaScript onchange handler
  const onChangeJavaScript = useCallback((value) => {
    setJs_Edit(value);
  }, []);

  //* Create HTML Document
  const srcCode = `
  <html>
      <body>${html_edit}</body>
      <style>${css_edit}</style>
      <script>${js_edit}</script>
  </html>
  `;

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <div className='main lg:flex md:flex flex-wrap justify-between items-center px-4 bg-[#2f3640] py-4'>
        <div className="left">
          <div className="logo font-bold text-2xl text-white text-center">
            <FaCode size={40} /> {/* Optional: code icon */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-2 flex flex-col">
        {/* Editors */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2">
          
          {/* HTML Editor */}
          <div className="bg-[#282c34] p-4 rounded-lg shadow flex-1">
            <h2 className="text-lg font-semibold mb-2 text-white">HTML</h2>
            <CodeMirror
              className="text-xl border-gray-700 border"
              value={html_edit}
              height="calc(100vh - 400px)" // Adjust height based on layout
              theme="dark"
              extensions={[html(true)]}
              onChange={onChangeHtml}
            />
          </div>

          {/* CSS Editor */}
          <div className="bg-[#282c34] p-4 rounded-lg shadow flex-1">
            <h2 className="text-lg font-semibold mb-2 text-white">CSS</h2>
            <CodeMirror
              className="text-xl border-gray-700 border"
              value={css_edit}
              height="calc(100vh - 400px)" // Adjust height based on layout
              theme="dark"
              extensions={[css(true)]}
              onChange={onChangeCss}
            />
          </div>

          {/* JavaScript Editor */}
          <div className="bg-[#282c34] p-4 rounded-lg shadow flex-1">
            <h2 className="text-lg font-semibold mb-2 text-white">JavaScript</h2>
            <CodeMirror
              className="text-xl border-gray-700 border"
              value={js_edit}
              height="calc(100vh - 400px)" // Adjust height based on layout
              theme="dark"
              extensions={[javascript(true)]}
              onChange={onChangeJavaScript}
            />
          </div>
        </div>

        {/* Result */}
        <div className="bg-[#282c34] p-4 shadow mt-4 rounded-lg flex-1">
          <h2 className="text-lg font-semibold mb-2 text-white">Result</h2>
          <iframe
            className="w-full h-full border border-gray-700 rounded-md"
            srcDoc={srcCode}
            title="output"
            sandbox="allow-scripts"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default Hcj;
