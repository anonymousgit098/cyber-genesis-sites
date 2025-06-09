
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

      // Try to connect to LM Studio with proper CORS handling
      const response = await fetch('http://localhost:1234/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          model: 'local-model',
          prompt: `Generate a complete website based on this prompt: "${prompt}". Return only valid JSON in this format: {"files":[{"path":"index.html","content":"..."},{"path":"styles.css","content":"..."}],"entry":"index.html"}`,
          max_tokens: 2000,
          temperature: 0.7,
          stream: false
        })
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`LM Studio server error: ${response.status}`);
      }

      const data = await response.json();
      let parsedResponse: LLMResponse;

      try {
        // Try to parse the LLM response
        parsedResponse = JSON.parse(data.choices[0].text);
      } catch {
        // Fallback demo response if parsing fails
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
    <header class="hero">
        <div class="container">
            <h1>Welcome to Your Generated Website</h1>
            <p class="subtitle">This is a professional website generated based on your prompt: "${prompt}"</p>
            <button class="cta-button">Get Started</button>
        </div>
    </header>
    <main class="main-content">
        <section class="features">
            <div class="container">
                <h2>Key Features</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>Responsive Design</h3>
                        <p>Looks great on all devices</p>
                    </div>
                    <div class="feature-card">
                        <h3>Modern UI</h3>
                        <p>Clean and professional appearance</p>
                    </div>
                    <div class="feature-card">
                        <h3>Fast Loading</h3>
                        <p>Optimized for performance</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Generated Website. All rights reserved.</p>
        </div>
    </footer>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #ffffff;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: 700;
}

.subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-button {
    background: #fff;
    color: #667eea;
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.main-content {
    padding: 80px 0;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #2c3e50;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    border: 1px solid #e9ecef;
    transition: transform 0.2s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #495057;
}

.footer {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

@media (max-width: 768px) {
    .hero h1 {
        font-size: 2rem;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
    }
}`
            },
            {
              path: "app.js",
              content: `console.log('Professional website generated successfully!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded and ready');
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add interactive hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // CTA button interaction
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            alert('Welcome! This is your generated website.');
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

      toast.success('Website generated successfully!');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to connect to LM Studio. Make sure it\'s running on localhost:1234');
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

  // Create project object for PreviewFrame
  const currentProject = generatedFiles.length > 0 ? {
    files: generatedFiles,
    entry: "index.html"
  } : null;

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
            
            <PreviewFrame 
              project={currentProject}
              fileContents={fileContents}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
