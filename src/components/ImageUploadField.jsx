import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertTriangle, CheckCircle, Image as ImageIcon, Info } from 'lucide-react';
import IMAGE_SPECS from './imageSpecs';
import './ImageUploadField.css';

const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ImageUploadField = ({
    specKey,              // key from IMAGE_SPECS
    onChange,             // callback(file | null)
    existingImageUrl,     // existing server image URL for preview
    required = false,
    disabled = false,
}) => {
    const spec = IMAGE_SPECS[specKey] || IMAGE_SPECS.event_banner;
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [validation, setValidation] = useState({ status: null, messages: [] });

    const validateFile = useCallback((file) => {
        return new Promise((resolve) => {
            const messages = [];
            let status = 'success';

            // File size check
            if (file.size > spec.maxFileSize) {
                messages.push(`File size ${formatFileSize(file.size)} exceeds max ${formatFileSize(spec.maxFileSize)}`);
                status = 'error';
            }

            // Format check
            if (!spec.formats.includes(file.type)) {
                messages.push(`Format "${file.type || 'unknown'}" not accepted. Use: ${spec.formats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
                status = 'error';
            }

            // Dimension check
            const img = new window.Image();
            img.onload = () => {
                const w = img.naturalWidth;
                const h = img.naturalHeight;

                if (w < spec.width * 0.5 || h < spec.height * 0.5) {
                    messages.push(`Image is too small (${w}×${h}). Minimum recommended: ${Math.round(spec.width * 0.5)}×${Math.round(spec.height * 0.5)}px`);
                    if (status !== 'error') status = 'error';
                } else if (w !== spec.width || h !== spec.height) {
                    // Check aspect ratio tolerance
                    const expectedRatio = spec.width / spec.height;
                    const actualRatio = w / h;
                    const ratioDiff = Math.abs(expectedRatio - actualRatio) / expectedRatio;

                    if (ratioDiff > 0.15) {
                        messages.push(`Aspect ratio mismatch. Expected ${spec.aspectRatio} (${spec.width}×${spec.height}px), got ${w}×${h}px`);
                        if (status !== 'error') status = 'warning';
                    } else if (w < spec.width || h < spec.height) {
                        messages.push(`Image (${w}×${h}) is smaller than recommended (${spec.width}×${spec.height}). May appear stretched.`);
                        if (status !== 'error') status = 'warning';
                    } else {
                        messages.push(`Dimensions: ${w}×${h}px — Close to recommended size ✓`);
                    }
                } else {
                    messages.push(`Perfect dimensions: ${w}×${h}px ✓`);
                }

                URL.revokeObjectURL(img.src);
                resolve({ status, messages });
            };
            img.onerror = () => {
                messages.push('Could not read image dimensions');
                if (status !== 'error') status = 'warning';
                resolve({ status, messages });
            };
            img.src = URL.createObjectURL(file);
        });
    }, [spec]);

    const handleFile = useCallback(async (file) => {
        if (!file) return;

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Validate
        const result = await validateFile(file);
        setValidation(result);

        // Pass file to parent regardless of validation
        onChange(file);
    }, [validateFile, onChange]);

    const handleInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        setPreview(null);
        setValidation({ status: null, messages: [] });
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const currentPreview = preview || (existingImageUrl ? (existingImageUrl.startsWith('http') ? existingImageUrl : `http://localhost:5000${existingImageUrl}`) : null);

    const aspectPaddingPerc = (spec.height / spec.width) * 100;

    if (!IMAGE_SPECS[specKey]) {
        return <div style={{ color: '#ff4444', fontSize: '0.8rem' }}>Unknown spec: {specKey}</div>;
    }

    return (
        <div className={`img-upload-field ${disabled ? 'disabled' : ''}`}>
            {/* Spec Info Header */}
            <div className="img-upload-spec-header">
                <div className="img-upload-spec-icon">{spec.icon}</div>
                <div className="img-upload-spec-info">
                    <span className="img-upload-spec-label">{spec.label}</span>
                    <span className="img-upload-spec-desc">{spec.description}</span>
                </div>
                {required && <span className="img-upload-required">Required</span>}
            </div>

            {/* Dimension Badge */}
            <div className="img-upload-dimensions-bar">
                <div className="img-upload-dim-badge">
                    <ImageIcon size={13} />
                    <span>{spec.width} × {spec.height}px</span>
                </div>
                <div className="img-upload-dim-badge">
                    <Info size={13} />
                    <span>Ratio: {spec.aspectRatio}</span>
                </div>
                <div className="img-upload-dim-badge">
                    <Upload size={13} />
                    <span>Max: {formatFileSize(spec.maxFileSize)}</span>
                </div>
                <div className="img-upload-dim-badge">
                    <span>{spec.formats.map(f => f.split('/')[1].toUpperCase()).join(', ')}</span>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                className={`img-upload-dropzone ${dragOver ? 'drag-over' : ''} ${validation.status === 'error' ? 'has-error' : ''} ${validation.status === 'success' ? 'has-success' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                {currentPreview ? (
                    <div className="img-upload-preview-wrapper">
                        <div className="img-upload-preview-frame" style={{ paddingBottom: `${Math.min(aspectPaddingPerc, 66)}%` }}>
                            <img src={currentPreview} alt="Preview" />
                        </div>
                        <button
                            className="img-upload-remove-btn"
                            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                            title="Remove image"
                        >
                            <X size={16} />
                        </button>
                        <div className="img-upload-preview-overlay">
                            <Upload size={20} />
                            <span>Click to replace</span>
                        </div>
                    </div>
                ) : (
                    <div className="img-upload-placeholder">
                        <div className="img-upload-placeholder-icon">
                            <Upload size={28} />
                        </div>
                        <p className="img-upload-placeholder-text">
                            <strong>Drag & drop</strong> or <strong>click to browse</strong>
                        </p>
                        <p className="img-upload-placeholder-hint">
                            Recommended: <strong>{spec.width}×{spec.height}px</strong> ({spec.aspectRatio})
                        </p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={spec.formats.join(',')}
                    onChange={handleInputChange}
                    disabled={disabled}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Validation Messages */}
            {validation.status && (
                <div className={`img-upload-validation ${validation.status}`}>
                    {validation.status === 'error' && <AlertTriangle size={14} />}
                    {validation.status === 'warning' && <AlertTriangle size={14} />}
                    {validation.status === 'success' && <CheckCircle size={14} />}
                    <div className="img-upload-validation-msgs">
                        {validation.messages.map((msg, i) => (
                            <span key={i}>{msg}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadField;
