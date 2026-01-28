import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const FileDropzone = ({ onFileSelect, acceptedFormats = '.json,.xml' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive 
            ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }`}
      >
        <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors" />
        <p className="text-gray-600 dark:text-gray-400 mb-2 transition-colors">
          Húzd ide a fájlt vagy kattints a tallózáshoz
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 transition-colors">
          JSON vagy XML formátum
        </p>
        
        <input
          type="file"
          accept={acceptedFormats}
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
        >
          Fájl kiválasztása
        </label>
      </div>

      {selectedFile && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
            Kiválasztott fájl:
          </p>
          <p className="font-medium text-gray-800 dark:text-white transition-colors">
            {selectedFile.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;