
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Minimize2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface JsonViewerProps {
  data: any;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('JSON copied to clipboard!');
  };

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-lg">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold">JSON Response</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="border-white/20 hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-white/20 hover:bg-white/10"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className={`p-4 ${isExpanded ? 'max-h-96' : 'max-h-48'} overflow-auto`}>
        <pre className="text-sm text-gray-300 font-mono bg-gray-900/50 p-4 rounded-lg overflow-x-auto">
          {jsonString}
        </pre>
      </div>
    </Card>
  );
};

export default JsonViewer;
