import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImagePlus, X, FileImage } from 'lucide-react';
import './ImageDropzone.css';

const ImageDropzone = ({ onImageSelect, currentImage }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onImageSelect(file, e.target.result);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const clearImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName('');
    onImageSelect(null, null);
  };

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreview(ev.target.result);
          setFileName('pasted-image.png');
          onImageSelect(file, ev.target.result);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  }, [onImageSelect]);

  React.useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div className="dropzone-wrapper">
      {preview ? (
        <div className="preview-container">
          <img src={preview} alt="Screenshot preview" className="preview-image" />
          <div className="preview-overlay">
            <div className="preview-info">
              <FileImage size={14} />
              <span>{fileName}</span>
            </div>
            <button className="clear-btn" onClick={clearImage}>
              <X size={14} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <div className={`dropzone-icon ${isDragActive ? 'dropzone-icon--active' : ''}`}>
              {isDragActive ? <Upload size={32} /> : <ImagePlus size={32} />}
            </div>
            <div className="dropzone-text">
              <p className="dropzone-primary">
                {isDragActive ? 'Drop screenshot here' : 'Upload a Screenshot'}
              </p>
              <p className="dropzone-secondary">
                Drag & drop, click to browse, or <kbd>Ctrl+V</kbd> to paste
              </p>
              <p className="dropzone-formats">PNG · JPG · WEBP · GIF · BMP · Max 10MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
