import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';


// At the top, clean the API URL
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function App() {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [results, setResults] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('en-IN-NeerjaNeural');
  const [availableVoices, setAvailableVoices] = useState({});
  const [showGuide, setShowGuide] = useState(true);
  const [uploadOption, setUploadOption] = useState('single');
  const fileInputRef = useRef(null);

  // Load available voices on mount
  useEffect(() => {
    loadVoices();
    loadFiles();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/voices`);
      setAvailableVoices(response.data.voices);
    } catch (error) {
      console.error('Error loading voices:', error);
      // Set default voices if API fails
      setAvailableVoices({
        "en-IN-NeerjaNeural (Indian English)": "en-IN-NeerjaNeural",
        "en-US-JennyNeural (US English)": "en-US-JennyNeural"
      });
    }
  };

  const loadFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files`);
      setConvertedFiles(response.data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setConvertedFiles([]);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (uploadOption === 'batch' && selectedFiles.length > 5) {
      alert('Maximum 5 files allowed for batch upload');
      setFiles(selectedFiles.slice(0, 5));
    } else {
      setFiles(selectedFiles);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      alert('Please select files to convert');
      return;
    }

    setConverting(true);
    setResults([]);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('voice', selectedVoice);

    try {
      const endpoint = files.length === 1 ? '/convert' : '/convert-batch';
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const conversionResults = files.length === 1 
        ? [response.data] 
        : response.data.results;
      
      setResults(conversionResults);

      const successfulFiles = conversionResults.filter(r => r.success);
      if (successfulFiles.length > 0) {
        await loadFiles();
      }

    } catch (error) {
      console.error('Conversion error:', error);
      alert(error.response?.data?.detail || 'Error converting files. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const deleteFile = async (filename) => {
    try {
      await axios.delete(`${API_BASE_URL}/files/${filename}`);
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all converted files?')) {
      try {
        await axios.delete(`${API_BASE_URL}/files`);
        await loadFiles();
        setFiles([]);
        setResults([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error('Error clearing files:', error);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getVoiceName = (voiceCode) => {
    for (const [name, code] of Object.entries(availableVoices)) {
      if (code === voiceCode) return name;
    }
    return voiceCode;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎙️ Text to MP3 Converter</h1>
        <p>Convert text files to speech using Edge TTS</p>
      </header>

      <main className="App-main">
        {/* Quick Start Guide */}
        {showGuide && (
          <div className="guide-card">
            <button className="close-guide" onClick={() => setShowGuide(false)}>×</button>
            <h3>📖 Quick Start Guide</h3>
            <ol>
              <li>Select voice from dropdown</li>
              <li>Upload Text Files (Single or Batch up to 5)</li>
              <li>Click "Convert & Auto-Send Email"</li>
              <li>Wait for processing - Files convert sequentially</li>
              <li>Check your email - MP3 sent (ZIP if &gt;30MB)</li>
              <li>Download manually from the section below</li>
            </ol>
            <p><strong>✨ Features:</strong> Auto-email | Manual download | Batch processing | Multiple voices | Auto-ZIP</p>
          </div>
        )}

        {/* Voice Selection */}
        <div className="voice-section">
          <h3>🎤 Voice Selection</h3>
          <select 
            value={selectedVoice} 
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="voice-select"
          >
            {Object.entries(availableVoices).map(([name, code]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        {/* Upload Options */}
        <div className="upload-section">
          <h2>📁 Upload Files</h2>
          <div className="upload-options">
            <label>
              <input
                type="radio"
                value="single"
                checked={uploadOption === 'single'}
                onChange={(e) => setUploadOption(e.target.value)}
              />
              Single File
            </label>
            <label>
              <input
                type="radio"
                value="batch"
                checked={uploadOption === 'batch'}
                onChange={(e) => setUploadOption(e.target.value)}
              />
              Batch (Max 5 files)
            </label>
          </div>
          
          <input
            type="file"
            accept=".txt"
            multiple={uploadOption === 'batch'}
            onChange={handleFileSelect}
            ref={fileInputRef}
            disabled={converting}
            className="file-input"
          />
          
          {files.length > 0 && (
            <div className="file-list">
              <p>{files.length} file(s) selected:</p>
              <ul>
                {files.map((file, idx) => (
                  <li key={idx}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            className="convert-btn"
            onClick={handleConvert}
            disabled={converting || files.length === 0}
          >
            {converting ? '🔄 Converting...' : '🔄 Convert & Auto-Send Email'}
          </button>
        </div>

        {/* Conversion Results */}
        {results.length > 0 && (
          <div className="results-section">
            <h3>📊 Conversion Results</h3>
            <div className="results-grid">
              {results.map((result, idx) => (
                <div key={idx} className={`result-card ${result.success ? 'success' : 'error'}`}>
                  <span className="status">{result.success ? '✅' : '❌'}</span>
                  <span className="filename">{result.original_name || result.filename}</span>
                  {result.success ? (
                    <>
                      <span className="size">{formatFileSize(result.size)}</span>
                      {result.needs_zip && <span className="zip-badge">📦 Zipped</span>}
                    </>
                  ) : (
                    <span className="error-msg">{result.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Download Section */}
        <div className="download-section">
          <h2>💾 Manual Download Section</h2>
          {convertedFiles.length === 0 ? (
            <p className="no-files">No converted files yet. Upload and convert files to see them here.</p>
          ) : (
            <>
              <p className="file-count">📀 {convertedFiles.length} converted file(s) available</p>
              <div className="download-grid">
                {convertedFiles.map((file, idx) => (
                  <div key={idx} className="download-card">
                    <div className="file-info">
                      <strong>{file.filename}</strong>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                      {file.created && (
                        <span className="file-date">
                          {new Date(file.created).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="file-actions">
                      <a
                        href={`${API_BASE_URL}${file.download_url}`}
                        download
                        className="download-btn"
                      >
                        📥 Download
                      </a>
                      <button
                        onClick={() => deleteFile(file.filename)}
                        className="delete-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleClearAll} className="clear-btn">
                🗑️ Clear All Files
              </button>
            </>
          )}
        </div>
      </main>

      <footer>
        <p>Made with ❤️ using Edge TTS | Voice: {getVoiceName(selectedVoice)}</p>
      </footer>
    </div>
  );
}

export default App;
