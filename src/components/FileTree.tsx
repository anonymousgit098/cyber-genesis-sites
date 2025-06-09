
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from 'lucide-react';

interface FileTreeProps {
  files: { path: string; content: string }[];
  selectedFile: string;
  onFileSelect: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, selectedFile, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Build tree structure from flat file list
  const buildTree = () => {
    const tree: any = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          // It's a file
          current[part] = { type: 'file', path: file.path };
        } else {
          // It's a folder
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} };
          }
          current = current[part].children;
        }
      }
    });
    
    return tree;
  };

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-4 w-4 text-blue-400" />;
  };

  const renderTree = (node: any, path: string = '', level: number = 0) => {
    return Object.entries(node).map(([name, item]: [string, any]) => {
      const currentPath = path ? `${path}/${name}` : name;
      const isFolder = item.type === 'folder';
      const isExpanded = expandedFolders.has(currentPath);
      const isSelected = !isFolder && item.path === selectedFile;

      return (
        <div key={currentPath}>
          <div
            className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-white/10 transition-colors ${
              isSelected ? 'bg-purple-500/20 border-l-2 border-purple-500' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(currentPath);
              } else {
                onFileSelect(item.path);
              }
            }}
          >
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Folder className="h-4 w-4 text-yellow-400" />
                )}
              </>
            ) : (
              <>
                <div className="w-4" />
                {getFileIcon(name)}
              </>
            )}
            <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
              {name}
            </span>
          </div>
          {isFolder && isExpanded && (
            <div>
              {renderTree(item.children, currentPath, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const tree = buildTree();

  return (
    <div className="h-full overflow-auto">
      <div className="space-y-1">
        {renderTree(tree)}
      </div>
    </div>
  );
};

export default FileTree;
