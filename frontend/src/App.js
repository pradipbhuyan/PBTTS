import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [results, setResults] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  
  // ... rest of your component code ...
  
  // Use API_BASE_URL for all axios calls
  // Example: await axios.post(`${API_BASE_URL}/convert-batch`, formData)
  
  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);
  
  const loadFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files`);
      setConvertedFiles(response.data.files);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };
  
  // ... rest of your component
}

export default App;
