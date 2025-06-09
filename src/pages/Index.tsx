import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Play, 
  Settings, 
  FileText, 
  Monitor,
  Lightbulb,
  Code2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

import FileTree from '@/components/FileTree';
import CodeEditor from '@/components/CodeEditor';
import PreviewFrame from '@/components/PreviewFrame';
import TemplateSelector from '@/components/TemplateSelector';
import JsonViewer from '@/components/JsonViewer';

interface GeneratedFile {
  path: string;
  content: string;
}

interface LLMResponse {
  files: GeneratedFile[];
  entry: string;
}

const templates = [
  {
    name: "Landing Page",
    description: "Modern business landing page with hero section",
    prompt: "Create a modern landing page for a SaaS product with a hero section, features, testimonials, and call-to-action"
  },
  {
    name: "Portfolio",
    description: "Professional developer portfolio",
    prompt: "Build a clean portfolio website for a web developer with projects showcase, skills, and contact form"
  },
  {
    name: "Blog",
    description: "Clean blog layout with articles",
    prompt: "Design a minimalist blog website with article listings, single post view, and sidebar"
  },
  {
    name: "Dashboard",
    description: "Admin dashboard with charts",
    prompt: "Create a responsive admin dashboard with sidebar navigation, charts, and data tables"
  }
];

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const generateWebsite = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:1234/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'local-model',
          prompt: `Generate a complete website based on this prompt: "${prompt}". Return only valid JSON in this format: {"files":[{"path":"index.html","content":"..."},{"path":"styles.css","content":"..."}],"entry":"index.html"}`,
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('LLM server not available');
      }

      const data = await response.json();
      let parsedResponse: LLMResponse;

      try {
        parsedResponse = JSON.parse(data.choices[0].text);
      } catch {
        // Fallback demo response
        parsedResponse = {
          files: [
            {
              path: "index.html",
              content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to Your Generated Website</h1>
        <p>This is a demo website generated based on your prompt: "${prompt}"</p>
    </header>
    <main>
        <section>
            <h2>Features</h2>
            <ul>
                <li>Responsive design</li>
                <li>Clean layout</li>
                <li>Modern styling</li>
            </ul>
        </section>
    </main>
    <script src="app.js"></script>
</body>
</html>`
            },
            {
              path: "styles.css",
              content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

header {
    text-align: center;
    padding: 4rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    margin: 2rem;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #2c3e50;
}

main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

h2 {
    color: #34495e;
    margin-bottom: 1rem;
}

ul {
    list-style-position: inside;
}

li {
    margin-bottom: 0.5rem;
}`
            },
            {
              path: "app.js",
              content: `console.log('Website generated successfully!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Add some interactive features
    const header = document.querySelector('header');
    if (header) {
        header.addEventListener('click', function() {
            this.style.transform = this.style.transform === 'scale(1.02)' ? 'scale(1)' : 'scale(1.02)';
        });
    }
});`
            }
          ],
          entry: "index.html"
        };
      }

      setLastResponse(parsedResponse);
      setGeneratedFiles(parsedResponse.files);
      
      // Create file contents map
      const contents: { [key: string]: string } = {};
      parsedResponse.files.forEach(file => {
        contents[file.path] = file.content;
      });
      setFileContents(contents);

      // Set first file as selected
      if (parsedResponse.files.length > 0) {
        setSelectedFile(parsedResponse.files[0].path);
      }

      // Create preview URL
      const entryFile = parsedResponse.files.find(f => f.path === parsedResponse.entry);
      if (entryFile) {
        const blob = new Blob([entryFile.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }

      toast.success('Website generated successfully!');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate website. Make sure your local LLM is running on localhost:1234');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const updateFileContent = (path: string, content: string) => {
    setFileContents(prev => ({
      ...prev,
      [path]: content
    }));

    // Update the generated files array
    setGeneratedFiles(prev => 
      prev.map(file => 
        file.path === path ? { ...file, content } : file
      )
    );

    // If updating the entry file, refresh preview
    if (path === 'index.html') {
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  };

  const downloadZip = async () => {
    if (generatedFiles.length === 0) {
      toast.error('No files to download');
      return;
    }

    const zip = new JSZip();
    
    generatedFiles.forEach(file => {
      zip.file(file.path, fileContents[file.path] || file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-website.zip';
    a.click();
    
    toast.success('Website downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AI Website Builder</h1>
                <p className="text-sm text-slate-600">Build websites with local AI</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Offline Mode
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Prompt Section */}
            <Card className="p-6 bg-white shadow-sm border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">Describe Your Website</h2>
              </div>
              
              <Textarea
                placeholder="Describe the website you want to build... (e.g., 'Create a modern portfolio website for a photographer with image gallery and contact form')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] mb-4 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
              
              <div className="flex gap-3">
                <Button 
                  onClick={generateWebsite}
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Website
                    </>
                  )}
                </Button>
                
                {generatedFiles.length > 0 && (
                  <Button 
                    onClick={downloadZip}
                    variant="outline" 
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              {isGenerating && (
                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-slate-600 mt-2">Generating your website...</p>
                </div>
              )}
            </Card>

            {/* Templates */}
            <TemplateSelector 
              templates={templates}
              onSelect={(template) => setPrompt(template.prompt)}
            />

            {/* File Tree & Editor */}
            {generatedFiles.length > 0 && (
              <Card className="flex-1 p-6 bg-white shadow-sm border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Project Files</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowJsonViewer(!showJsonViewer)}
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    {showJsonViewer ? 'Hide' : 'Show'} JSON
                  </Button>
                </div>

                <div className="space-y-4">
                  <FileTree 
                    files={generatedFiles}
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                  />
                  
                  <Separator className="bg-slate-200" />
                  
                  <CodeEditor
                    selectedFile={selectedFile}
                    fileContents={fileContents}
                    onFileChange={updateFileContent}
                    files={generatedFiles}
                    onFileSelect={setSelectedFile}
                  />
                </div>
              </Card>
            )}

            {/* JSON Viewer */}
            {showJsonViewer && lastResponse && (
              <JsonViewer data={lastResponse} />
            )}
          </div>

          {/* Right Panel - Preview */}
          <Card className="p-6 bg-white shadow-sm border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Live Preview</h3>
            </div>
            
            <PreviewFrame url={previewUrl} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
