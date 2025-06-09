
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
    <Card className="p-6 bg-white shadow-sm border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Quick Templates</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSelect(template)}
            className="h-auto p-4 flex flex-col items-start gap-2 border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-left"
          >
            <div className="font-semibold text-slate-900">{template.name}</div>
            <div className="text-xs text-slate-600">{template.description}</div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default TemplateSelector;
