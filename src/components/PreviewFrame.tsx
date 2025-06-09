
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface PreviewFrameProps {
  project: {
    files: { path: string; content: string }[];
    entry: string;
  } | null;
  fileContents: { [key: string]: string };
}

const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  ({ project, fileContents }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => iframeRef.current!);

    useEffect(() => {
      if (!project || !iframeRef.current) return;

      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!iframeDoc) return;

      try {
        // Get the entry file content (usually index.html)
        const entryContent = fileContents[project.entry] || 
          project.files.find(f => f.path === project.entry)?.content || '';

        if (!entryContent) return;

        // Process the HTML to inject CSS and JS inline
        let processedHtml = entryContent;

        // Replace CSS link tags with inline styles
        project.files.forEach(file => {
          if (file.path.endsWith('.css')) {
            const cssContent = fileContents[file.path] || file.content;
            const linkRegex = new RegExp(`<link[^>]*href=["']${file.path}["'][^>]*>`, 'gi');
            processedHtml = processedHtml.replace(linkRegex, `<style>${cssContent}</style>`);
          }
        });

        // Replace JS script tags with inline scripts
        project.files.forEach(file => {
          if (file.path.endsWith('.js')) {
            const jsContent = fileContents[file.path] || file.content;
            const scriptRegex = new RegExp(`<script[^>]*src=["']${file.path}["'][^>]*></script>`, 'gi');
            processedHtml = processedHtml.replace(scriptRegex, `<script>${jsContent}</script>`);
          }
        });

        // Write the processed HTML to iframe
        iframeDoc.open();
        iframeDoc.write(processedHtml);
        iframeDoc.close();

        // Add error handling to iframe
        iframe.contentWindow?.addEventListener('error', (e) => {
          console.error('Preview error:', e);
        });

      } catch (error) {
        console.error('Error updating preview:', error);
        
        // Fallback: show error message
        iframeDoc.open();
        iframeDoc.write(`
          <html>
            <head>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px; 
                  background: #1a1a1a; 
                  color: #fff; 
                  text-align: center;
                }
                .error { 
                  background: #ff4444; 
                  padding: 10px; 
                  border-radius: 5px; 
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <h3>Preview Error</h3>
              <div class="error">Unable to render preview</div>
              <p>Check the console for details</p>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    }, [project, fileContents]);

    if (!project) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-lg border border-white/10">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-600 rounded"></div>
            </div>
            <p>Generate a website to see preview</p>
          </div>
        </div>
      );
    }

    return (
      <iframe
        ref={iframeRef}
        className="w-full h-full bg-white rounded-lg border border-white/10"
        sandbox="allow-scripts allow-same-origin"
        title="Website Preview"
      />
    );
  }
);

PreviewFrame.displayName = 'PreviewFrame';

export default PreviewFrame;
