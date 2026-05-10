import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Download, Code, AlignLeft, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import './ResultDisplay.css';

const ResultDisplay = ({ result, extractionType, tokensUsed, filename }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('rendered');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const ext = extractionType === 'structured' ? 'json' : 'md';
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-${filename?.replace(/\.[^/.]+$/, '') || 'result'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const typeLabel = {
    full: 'Full Analysis',
    text: 'Extracted Text',
    summary: 'Summary',
    structured: 'JSON Data',
    code: 'Code Extraction',
    custom: 'Custom Result',
  }[extractionType] || 'Result';

  return (
    <div className="result-display">
      {/* Result header */}
      <div className="result-header">
        <div className="result-meta">
          <div className="result-type-badge">{typeLabel}</div>
          {tokensUsed && (
            <div className="token-count">
              <Cpu size={12} />
              <span>{tokensUsed.toLocaleString()} tokens</span>
            </div>
          )}
        </div>

        <div className="result-actions">
          {extractionType !== 'structured' && (
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'rendered' ? 'toggle-btn--active' : ''}`}
                onClick={() => setViewMode('rendered')}
                title="Rendered view"
              >
                <AlignLeft size={14} />
              </button>
              <button
                className={`toggle-btn ${viewMode === 'raw' ? 'toggle-btn--active' : ''}`}
                onClick={() => setViewMode('raw')}
                title="Raw markdown"
              >
                <Code size={14} />
              </button>
            </div>
          )}

          <button className="action-btn" onClick={downloadResult} title="Download result">
            <Download size={14} />
          </button>

          <button className="action-btn" onClick={copyToClipboard} title="Copy to clipboard">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Result content */}
      <div className="result-content">
        {extractionType === 'structured' ? (
          <SyntaxHighlighter
            language="json"
            style={oneDark}
            customStyle={{
              background: 'transparent',
              margin: 0,
              padding: '20px',
              fontSize: '13px',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {(() => {
              try {
                return JSON.stringify(JSON.parse(result), null, 2);
              } catch {
                return result;
              }
            })()}
          </SyntaxHighlighter>
        ) : viewMode === 'raw' ? (
          <pre className="raw-content">{result}</pre>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      language={match[1]}
                      style={oneDark}
                      customStyle={{
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: "'Space Mono', monospace",
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
