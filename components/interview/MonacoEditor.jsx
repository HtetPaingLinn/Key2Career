import React from 'react';
import Editor from '@monaco-editor/react';

const MonacoEditor = ({ 
  value, 
  onChange, 
  language = 'javascript', 
  height = '400px',
  readOnly = false,
  theme = 'vs'
}) => {
  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value || '');
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <style jsx>{`
        .monaco-editor .suggest-widget {
          z-index: 1000 !important;
          position: fixed !important;
        }
        .monaco-editor .suggest-widget .monaco-list {
          background: white !important;
          border: 1px solid #ccc !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        .monaco-editor .suggest-widget .monaco-list .monaco-list-row {
          padding: 4px 8px !important;
        }
        .monaco-editor .suggest-widget .monaco-list .monaco-list-row:hover {
          background: #f0f0f0 !important;
        }
        .monaco-editor .suggest-widget .monaco-list .monaco-list-row.selected {
          background: #007acc !important;
          color: white !important;
        }
      `}</style>
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
          // Auto-suggestions and code completion
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          quickSuggestionsDelay: 100,
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
            showVariables: true,
            showClasses: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showWords: true,
            // Better suggestion positioning
            insertMode: 'insert',
            selectionMode: 'whenQuickSuggestion',
            showIcons: true,
            maxVisibleSuggestions: 8,
            showStatusBar: true,
            showMethodSuggestions: true,
            showConstructorSuggestions: true,
            showFieldSuggestions: true,
            showVariableSuggestions: true,
            showClassSuggestions: true,
            showStructSuggestions: true,
            showInterfaceSuggestions: true,
            showModuleSuggestions: true,
            showPropertySuggestions: true,
            showEventSuggestions: true,
            showOperatorSuggestions: true,
            showUnitSuggestions: true,
            showValueSuggestions: true,
            showConstantSuggestions: true,
            showEnumSuggestions: true,
            showEnumMemberSuggestions: true,
            showKeywordSuggestions: true,
            showTextSuggestions: true,
            showColorSuggestions: true,
            showFileSuggestions: true,
            showReferenceSuggestions: true,
            showFolderSuggestions: true,
            showTypeParameterSuggestions: true,
            showSnippetSuggestions: true,
            showUserSuggestions: true,
            showIssueSuggestions: true,
            showOtherSuggestions: true,
            // Fix positioning
            showDeprecated: false,
            showReturns: true,
            showParameters: true,
            showTypes: true,
          },
          // IntelliSense features
          parameterHints: {
            enabled: true,
            cycle: true,
          },
          hover: {
            enabled: true,
            delay: 300,
          },
          // Auto-completion
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          wordBasedSuggestions: true,
          // Snippets
          snippets: {
            enabled: true,
          },
          // Better layout and positioning
          fixedOverflowWidgets: true,
          overviewRulerBorder: false,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 14,
          },
          // Additional positioning fixes
          suggestSelection: 'first',
        }}
      />
    </div>
  );
};

export default MonacoEditor;

