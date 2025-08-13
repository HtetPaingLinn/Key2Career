import React from 'react';
import Editor from '@monaco-editor/react';

const MonacoEditor = ({ 
  value, 
  onChange, 
  language = 'javascript', 
  height = '400px',
  readOnly = false,
  theme = 'vs-dark'
}) => {
  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value || '');
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme={theme}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};

export default MonacoEditor;

