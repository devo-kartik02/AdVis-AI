import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { uploadAudit } from '../api'; // Import our API helper
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileVideo, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Drag Events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Manual Selection
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Validate File Type
  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['video/mp4', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg("Format not supported. Please use MP4, JPG, or PNG.");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      setErrorMsg("File is too large (Max 50MB).");
      return;
    }
    setErrorMsg('');
    setFile(selectedFile);
  };

  // 🚀 THE UPLOAD ACTION
  const handleSubmit = async () => {
    if (!file) return;
    setStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the Backend
      const response = await uploadAudit(formData); // Using our api.js helper
      
      // Success!
      setStatus('success');
      setTimeout(() => {
        navigate(`/report/${response.data._id}`); // Redirect to Report Page
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg("Upload failed. Please check your connection.");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        
        {/* HEADER TEXT */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-2xl">
            Analyze Creative Assets
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Upload your ad creative to generate instant saliency heatmaps, 
            visibility scores, and distraction metrics using AI.
          </p>
        </div>

        {/* THE UPLOAD CARD */}
        <div className="w-full max-w-xl relative">
          
          {/* Animated Glow Behind Card */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-20 transition duration-1000 ${dragActive ? 'opacity-50' : ''}`}></div>

          <div className="relative bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
            
            <AnimatePresence mode="wait">
              
              {/* STATE 1: IDLE (Drag Zone) */}
              {status === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Drag Zone */}
                  <div 
                    className={`relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 ${dragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleChange} accept="video/mp4,image/jpeg,image/png" />
                    
                    {!file ? (
                      <>
                        <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                          <UploadCloud size={32} className="text-zinc-400 group-hover:text-white" />
                        </div>
                        <p className="text-lg font-medium text-white">Click to upload or drag and drop</p>
                        <p className="text-sm text-zinc-500 mt-2">MP4, JPG, PNG (Max 50MB)</p>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="p-4 rounded-full bg-primary/20 mb-4 inline-block">
                          <FileVideo size={32} className="text-primary" />
                        </div>
                        <p className="text-lg font-medium text-white break-all px-4">{file.name}</p>
                        <p className="text-sm text-zinc-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="mt-4 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {errorMsg && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/5 p-3 rounded-lg text-sm border border-red-500/10">
                      <AlertCircle size={16} /> {errorMsg}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!file}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Start Analysis
                  </button>
                </motion.div>
              )}

              {/* STATE 2: UPLOADING (Scanner) */}
              {status === 'uploading' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <Loader2 size={40} className="absolute inset-0 m-auto text-primary animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Uploading Asset...</h3>
                  <p className="text-zinc-400">Securely transferring to AI Engine</p>
                </motion.div>
              )}

              {/* STATE 3: SUCCESS (Checkmark) */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400 border border-green-500/20">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Upload Complete</h3>
                  <p className="text-zinc-400">Redirecting to Analysis Dashboard...</p>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;