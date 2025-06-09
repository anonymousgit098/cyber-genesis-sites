
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface Template {
  name: string;
  description: string;
  prompt: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  onSelect: (template: Template) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect }) => {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-400" />
        <h3 className="text-lg font-semibold">Quick Templates</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSelect(template)}
            className="h-auto p-4 flex flex-col items-start gap-2 border-white/20 hover:bg-white/10 hover:border-purple-500/50"
          >
            <div className="font-semibold text-left">{template.name}</div>
            <div className="text-xs text-gray-400 text-left">{template.description}</div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default TemplateSelector;
