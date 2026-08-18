import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { mediaApi } from '../api/client';
import { mockApi } from '../api/mocks/mockApi';

interface MediaUploadProps {
  onUploadComplete: (key: string, previewUrl: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadComplete,
  onError,
  accept = 'image/jpeg,image/png,image/webp',
  maxSize = MAX_SIZE,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || true;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato no válido. Use JPG, PNG o WebP';
    }
    if (file.size > maxSize) {
      return `El archivo excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress for mock mode
      if (USE_MOCKS) {
        for (let i = 0; i <= 100; i += 20) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setProgress(i);
        }
        const result = await mockApi.media.createUploadUrl({
          content_type: file.type,
          content_length: file.size,
        });
        setSelectedKey(result.key);
        onUploadComplete(result.key, previewUrl);
      } else {
        // Real API flow
        const result = await mediaApi.createUploadUrl({
          content_type: file.type,
          content_length: file.size,
        });

        // Upload to S3 using the presigned URL
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error('Error al subir el archivo'));
            }
          };
          xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
          xhr.open('PUT', result.upload_url);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });

        setSelectedKey(result.key);
        onUploadComplete(result.key, previewUrl);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir el archivo';
      setError(message);
      onError?.(message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedKey(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {preview ? (
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={preview}
            alt="Vista previa"
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <IconButton
            size="small"
            onClick={handleRemove}
            disabled={uploading}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
          {uploading && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: '0 0 4px 4px',
              }}
            />
          )}
        </Box>
      ) : (
        <Button
          variant="outlined"
          onClick={handleClick}
          disabled={disabled || uploading}
          startIcon={<CloudUpload />}
          sx={{
            width: '100%',
            height: 120,
            borderStyle: 'dashed',
            borderWidth: 2,
            '&:hover': {
              borderStyle: 'dashed',
            },
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              JPG, PNG o WebP (máx. 5MB)
            </Typography>
          </Box>
        </Button>
      )}

      {selectedKey && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Clave: {selectedKey}
        </Typography>
      )}
    </Box>
  );
};

export default MediaUpload;
