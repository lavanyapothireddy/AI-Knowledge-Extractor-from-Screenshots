import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Sparkles, Loader2, Brain, ChevronRight } from 'lucide-react';
import ImageDropzone from '../components/ImageDropzone';
import ExtractionOptions from '../components/ExtractionOptions';
import ResultDisplay from '../components/ResultDisplay';
import './ExtractorPage.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

const ExtractorPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractionType, setExtractionType] = useState('full');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultMeta, setResultMeta] = useState(null);

  const handleImageSelect = (file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
    setResult(null);
    setResultMeta(null);
  };

  const handleExtract = async () => {
    if (!imageFile) {
      toast.error('Please upload a screenshot first');
      return;
    }
    if (extractionType === 'custom' && !customPrompt.trim()) {
      toast.error('Please enter your custom instruction');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('extraction_type', extractionType);
      if (customPrompt) formData.append('custom_prompt', customPrompt);

      const response = await axios.post(`${API_BASE}/api/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (response.data.success) {
        setResult(response.data.result);
        setResultMeta({
          tokensUsed: response.data.tokens_used,
          filename: response.data.filename,
          extractionType: response.data.extraction_type,
        });
        toast.success('Knowledge extracted successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Extraction failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canExtract = imageFile && !loading && (extractionType !== 'custom' || customPrompt.trim());

  return (
    <div className="extractor-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <Brain size={14} />
          <span>Powered by Claude AI Vision</span>
        </div>
        <h1 className="hero-title">
          Extract <span className="gradient-text">Knowledge</span>
          <br />from Screenshots
        </h1>
        <p className="hero-subtitle">
          Drop any screenshot and let AI distill insights, text, data, and code — instantly.
        </p>
      </section>

      {/* Main tool */}
      <div className="tool-container">
        <div className="tool-grid">
          {/* Left panel */}
          <div className="panel">
            <div className="panel-section">
              <h2 className="section-label">
                <span className="step-num">01</span>
                Upload Screenshot
              </h2>
              <ImageDropzone onImageSelect={handleImageSelect} currentImage={imagePreview} />
            </div>

            <div className="panel-section">
              <h2 className="section-label">
                <span className="step-num">02</span>
                Choose Extraction Mode
              </h2>
              <ExtractionOptions
                selected={extractionType}
                onSelect={setExtractionType}
                customPrompt={customPrompt}
                onCustomPromptChange={setCustomPrompt}
              />
            </div>

            <button
              className={`extract-btn ${canExtract ? 'extract-btn--ready' : ''}`}
              onClick={handleExtract}
              disabled={!canExtract}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Analyzing Screenshot...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Extract Knowledge</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Right panel */}
          <div className="panel panel--result">
            {loading && (
              <div className="loading-state">
                <div className="loading-orb">
                  <div className="orb-inner" />
                </div>
                <p className="loading-text">Claude is analyzing your screenshot</p>
                <p className="loading-sub">This may take a few seconds...</p>
              </div>
            )}

            {!loading && !result && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Brain size={40} />
                </div>
                <p className="empty-title">Results will appear here</p>
                <p className="empty-sub">Upload a screenshot and select extraction mode to begin</p>
              </div>
            )}

            {!loading && result && (
              <ResultDisplay
                result={result}
                extractionType={resultMeta?.extractionType}
                tokensUsed={resultMeta?.tokensUsed}
                filename={resultMeta?.filename}
              />
            )}
          </div>
        </div>
      </div>

      {/* Features bar */}
      <section className="features-bar">
        {[
          { label: 'Multi-format support', value: 'PNG, JPG, WEBP, GIF' },
          { label: 'AI Model', value: 'Claude Vision' },
          { label: 'Max file size', value: '10 MB' },
          { label: 'Batch support', value: 'Up to 5 images' },
        ].map((feat) => (
          <div key={feat.label} className="feature-item">
            <span className="feature-value">{feat.value}</span>
            <span className="feature-label">{feat.label}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ExtractorPage;
