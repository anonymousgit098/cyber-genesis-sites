
import React, { useState, useRef, useEffect } from 'react';
import { Download, Play, Eye, EyeOff, FileText, Folder, FolderOpen, Monitor, Code, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import FileTree from '@/components/FileTree';
import CodeEditor from '@/components/CodeEditor';
import PreviewFrame from '@/components/PreviewFrame';
import TemplateSelector from '@/components/TemplateSelector';
import JsonViewer from '@/components/JsonViewer';

interface GeneratedFile {
  path: string;
  content: string;
}

interface GeneratedProject {
  files: GeneratedFile[];
  entry: string;
}

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showJsonResponse, setShowJsonResponse] = useState(false);
  const [jsonResponse, setJsonResponse] = useState<any>(null);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});
  const [previewKey, setPreviewKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const examplePrompts = [
    "Create a modern portfolio website with a hero section, about me, and contact form",
    "Build a responsive blog layout with navigation and article cards",
    "Design a landing page for a SaaS product with pricing tiers",
    "Make a restaurant website with menu and reservation system"
  ];

  const templates = [
    {
      name: "Portfolio",
      description: "Personal portfolio showcase",
      prompt: "Create a modern portfolio website with a hero section, skills showcase, project gallery, and contact form. Use a dark theme with purple accents."
    },
    {
      name: "Blog",
      description: "Clean blog layout",
      prompt: "Build a responsive blog website with header navigation, featured posts section, sidebar, and footer. Include article cards with images and excerpts."
    },
    {
      name: "Landing Page",
      description: "Product landing page",
      prompt: "Design a SaaS landing page with hero section, features grid, pricing table, testimonials, and call-to-action buttons. Use modern gradients and animations."
    },
    {
      name: "Restaurant",
      description: "Restaurant website",
      prompt: "Create a restaurant website with hero banner, menu sections, image gallery, reservation form, and contact information. Use warm colors and food imagery."
    }
  ];

  const generateWebsite = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your website');
      return;
    }

    setIsGenerating(true);
    setJsonResponse(null);
    
    try {
      // Simulate API call to local LLM (LM Studio)
      const response = await fetch('http://localhost:1234/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'local-model',
          prompt: `Generate a complete website based on this description: "${prompt}". 
          
          Return ONLY a valid JSON object with this exact structure:
          {
            "files": [
              { "path": "index.html", "content": "<!DOCTYPE html>..." },
              { "path": "styles.css", "content": "/* CSS styles */" },
              { "path": "script.js", "content": "// JavaScript code" }
            ],
            "entry": "index.html"
          }
          
          Make sure the HTML is complete with proper DOCTYPE, head, and body tags. Include responsive CSS and any necessary JavaScript. Create a modern, professional design.`,
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to local LLM. Make sure LM Studio is running on localhost:1234');
      }

      const data = await response.json();
      let generatedContent = data.choices[0].text;
      
      // Try to extract JSON from the response
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = jsonMatch[0];
      }

      const projectData = JSON.parse(generatedContent);
      setJsonResponse(projectData);
      setGeneratedProject(projectData);
      
      // Initialize file contents
      const contents: { [key: string]: string } = {};
      projectData.files.forEach((file: GeneratedFile) => {
        contents[file.path] = file.content;
      });
      setFileContents(contents);
      
      // Select the entry file by default
      setSelectedFile(projectData.entry);
      setPreviewKey(prev => prev + 1);
      
      toast.success('Website generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      
      // Fallback: Generate a demo project for offline testing
      const demoProject = {
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
        <nav>
            <h1>My Website</h1>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="hero">
            <h2>Welcome to My Website</h2>
            <p>This is a generated website based on your prompt: "${prompt}"</p>
            <button onclick="showAlert()">Click me!</button>
        </section>
    </main>
    <script src="script.js"></script>
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

nav h1 {
    color: white;
    font-size: 1.5rem;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

nav a:hover {
    opacity: 0.8;
}

#hero {
    text-align: center;
    padding: 4rem 2rem;
    color: white;
}

#hero h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

#hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s;
}

button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    #hero h2 {
        font-size: 2rem;
    }
}`
          },
          {
            path: "script.js",
            content: `function showAlert() {
    alert('Hello from your generated website!');
}

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

console.log('Website generated successfully!');`
          }
        ],
        entry: "index.html"
      };
      
      setJsonResponse(demoProject);
      setGeneratedProject(demoProject);
      
      const contents: { [key: string]: string } = {};
      demoProject.files.forEach((file: GeneratedFile) => {
        contents[file.path] = file.content;
      });
      setFileContents(contents);
      setSelectedFile(demoProject.entry);
      setPreviewKey(prev => prev + 1);
      
      toast.warning('Using demo project. To use real AI generation, start LM Studio on localhost:1234');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadZip = async () => {
    if (!generatedProject) {
      toast.error('No project to download');
      return;
    }

    try {
      // Dynamic import of JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      generatedProject.files.forEach(file => {
        zip.file(file.path, fileContents[file.path] || file.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-website.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Website downloaded as ZIP!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download ZIP file');
    }
  };

  const updateFileContent = (path: string, content: string) => {
    setFileContents(prev => ({
      ...prev,
      [path]: content
    }));
    setPreviewKey(prev => prev + 1);
  };

  const selectTemplate = (template: any) => {
    setPrompt(template.prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Code className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Website Builder
              </h1>
              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                Offline
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJsonResponse(!showJsonResponse)}
                className="border-white/20 hover:bg-white/10"
              >
                {showJsonResponse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Debug JSON
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
          {/* Left Panel - Input & Controls */}
          <div className="space-y-6">
            {/* Template Selector */}
            <TemplateSelector templates={templates} onSelect={selectTemplate} />

            {/* Prompt Input */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold">Describe Your Website</h3>
                </div>
                <Textarea
                  placeholder="Describe the website you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] bg-white/5 border-white/20 resize-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={generateWebsite}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Generate Website
                      </div>
                    )}
                  </Button>
                  {generatedProject && (
                    <Button
                      onClick={downloadZip}
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Example Prompts */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Example Prompts</h3>
              <div className="space-y-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm border border-white/10"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </Card>

            {/* JSON Response Viewer */}
            {showJsonResponse && jsonResponse && (
              <JsonViewer data={jsonResponse} />
            )}
          </div>

          {/* Right Panel - Preview & Editor */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-lg h-96">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                </div>
              </div>
              <div className="p-4 h-80">
                <PreviewFrame
                  key={previewKey}
                  ref={iframeRef}
                  project={generatedProject}
                  fileContents={fileContents}
                />
              </div>
            </Card>

            {/* File Tree & Code Editor */}
            {generatedProject && (
              <Card className="bg-black/40 border-white/10 backdrop-blur-lg flex-1">
                <Tabs defaultValue="editor" className="h-full">
                  <div className="p-4 border-b border-white/10">
                    <TabsList className="bg-white/5">
                      <TabsTrigger value="editor">Code Editor</TabsTrigger>
                      <TabsTrigger value="files">File Tree</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="editor" className="p-4 h-80">
                    <CodeEditor
                      selectedFile={selectedFile}
                      fileContents={fileContents}
                      onFileChange={updateFileContent}
                      files={generatedProject.files}
                      onFileSelect={setSelectedFile}
                    />
                  </TabsContent>
                  <TabsContent value="files" className="p-4 h-80">
                    <FileTree
                      files={generatedProject.files}
                      selectedFile={selectedFile}
                      onFileSelect={setSelectedFile}
                    />
                  </TabsContent>
                </Tabs>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
