
import React, { useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';

interface CodeEditorProps {
  selectedFile: string;
  fileContents: { [key: string]: string };
  onFileChange: (path: string, content: string) => void;
  files: { path: string; content: string }[];
  onFileSelect: (path: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  selectedFile,
  fileContents,
  onFileChange,
  files,
  onFileSelect
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const getLanguageFromFile = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      case 'json': return 'json';
      default: return 'plaintext';
    }
  };

  const handleContentChange = (content: string) => {
    if (selectedFile) {
      onFileChange(selectedFile, content);
    }
  };

  const currentContent = selectedFile ? (fileContents[selectedFile] || '') : '';

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* File Selector */}
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-slate-600" />
        <Select value={selectedFile} onValueChange={onFileSelect}>
          <SelectTrigger className="w-full bg-white border-slate-200">
            <SelectValue placeholder="Select a file to edit" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            {files.map((file) => (
              <SelectItem key={file.path} value={file.path} className="text-slate-900 hover:bg-slate-50">
                {file.path}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Code Editor */}
      {selectedFile ? (
        <div className="flex-1 relative">
          <textarea
            ref={editorRef}
            value={currentContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Start editing your code..."
            spellCheck={false}
          />
          
          {/* Language indicator */}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded border border-blue-200">
              {getLanguageFromFile(selectedFile)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p>Select a file to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
