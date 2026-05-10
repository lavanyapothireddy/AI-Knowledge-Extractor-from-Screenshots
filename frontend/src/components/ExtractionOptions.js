import React from 'react';
import { FileText, AlignLeft, List, Braces, Code2, Wand2 } from 'lucide-react';
import './ExtractionOptions.css';

const options = [
  {
    id: 'full',
    icon: FileText,
    label: 'Full Analysis',
    desc: 'Complete extraction with summary, insights & structure',
  },
  {
    id: 'text',
    icon: AlignLeft,
    label: 'Text Only',
    desc: 'Extract all visible text in reading order',
  },
  {
    id: 'summary',
    icon: List,
    label: 'Quick Summary',
    desc: 'Concise 3-5 sentence overview',
  },
  {
    id: 'structured',
    icon: Braces,
    label: 'JSON Output',
    desc: 'Structured data as valid JSON',
  },
  {
    id: 'code',
    icon: Code2,
    label: 'Code Extract',
    desc: 'Extract code, commands & technical content',
  },
  {
    id: 'custom',
    icon: Wand2,
    label: 'Custom Prompt',
    desc: 'Define your own extraction instructions',
  },
];

const ExtractionOptions = ({ selected, onSelect, customPrompt, onCustomPromptChange }) => {
  return (
    <div className="extraction-options">
      <div className="options-grid">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              className={`option-card ${isSelected ? 'option-card--selected' : ''}`}
              onClick={() => onSelect(opt.id)}
            >
              <div className="option-icon">
                <Icon size={18} />
              </div>
              <div className="option-text">
                <span className="option-label">{opt.label}</span>
                <span className="option-desc">{opt.desc}</span>
              </div>
              {isSelected && <div className="option-indicator" />}
            </button>
          );
        })}
      </div>

      {selected === 'custom' && (
        <div className="custom-prompt-area">
          <label className="custom-prompt-label">
            <Wand2 size={14} />
            Your Custom Instruction
          </label>
          <textarea
            className="custom-prompt-input"
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder="E.g., Extract all email addresses and phone numbers from this screenshot..."
            rows={4}
          />
        </div>
      )}
    </div>
  );
};

export default ExtractionOptions;
