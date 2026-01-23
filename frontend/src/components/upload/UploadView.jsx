// ═══════════════════════════════════════════════════════════
// FRONTEND - UPLOAD VIEW MÓDOSÍTÁS
// Moodle XML feltöltés → Edit View-ba
// ═══════════════════════════════════════════════════════════

// File: frontend/src/components/quiz/UploadView.jsx

import React, { useState } from 'react';
import { Upload, FileText, FileCode } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import { API_URL } from '../../utils/constants';

const UploadView = ({ onUploadSuccess, onLoadToEditor }) => {  // ← onLoadToEditor prop!
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Kérlek válassz ki egy fájlt!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      alert('Teszt sikeresen feltöltve!');
      setFile(null);
      onUploadSuccess();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Hiba történt a feltöltés során');
    } finally {
      setUploading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ÚJ FUNKCIÓ: Load to Editor (Moodle XML → Edit View)
  // ═══════════════════════════════════════════════════════════
  
  const handleLoadToEditor = async () => {
    if (!file) {
      alert('Kérlek válassz ki egy fájlt!');
      return;
    }

    // Csak XML fájlokat engedélyez
    if (!file.name.endsWith('.xml')) {
      alert('Csak Moodle XML fájlokat lehet betölteni a szerkesztőbe!');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/parse-xml`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Parse failed');
      }

      const quizData = await response.json();
      
      console.log('📦 Parsed quiz data:', quizData);
      
      // Redirect to Edit View with parsed data
      onLoadToEditor(quizData);
    } catch (err) {
      console.error('Parse error:', err);
      alert('Hiba történt a fájl feldolgozása során. Ellenőrizd hogy valid Moodle XML-e!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardBody className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Teszt Feltöltése</h2>
          </div>

          <div className="space-y-6">
            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válassz fájlt (JSON vagy Moodle XML)
              </label>
              <input
                type="file"
                accept=".json,.xml"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                  {file.name.endsWith('.xml') ? (
                    <FileCode className="w-4 h-4 text-blue-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-green-600" />
                  )}
                  {file.name}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Upload & Save */}
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                {uploading ? 'Feltöltés...' : 'Feltöltés és Mentés'}
              </Button>

              {/* Load to Editor (Only for XML) */}
              {file?.name.endsWith('.xml') && (
                <Button
                  onClick={handleLoadToEditor}
                  disabled={uploading}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                >
                  {uploading ? 'Betöltés...' : 'Betöltés Szerkesztőbe'}
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tipp:</strong> Moodle XML fájlokat betöltheted a szerkesztőbe módosításhoz, 
                majd újra exportálhatod vagy mentheted a rendszerbe.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UploadView;