import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload, Cpu, Zap, Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const Analysis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('cosmetic');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing'>('idle');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  const handleUpload = async () => {
    if (!file) return;
    if (user && user.credits <= 0) {
      alert('You have 0 credits left. Redirecting to Subscription.');
      navigate('/subscription');
      return;
    }

    setStatus('uploading');
    
    try {
      const { data } = await uploadVideo(file, category);
      setStatus('processing');
      
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        setProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          refresh().catch(() => {});
          navigate(`/report/${data._id}`);
        }
      }, 500);

    } catch (err: any) {
      console.error(err);
      setStatus('idle');
      const status = err?.response?.status;
      if (status === 403) {
        alert(err.response?.data?.message || 'Insufficient credits. Redirecting to Subscription.');
        navigate('/subscription');
      } else {
        alert('Analysis failed. Ensure Python server is active.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic">Analysis <span className="text-blue-500">Engine</span></h1>
          <p className="text-zinc-500 text-sm uppercase tracking-[0.3em]">Initialize Visual Audit Sequence</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
          {status === 'idle' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
                <Cpu className="w-10 h-10 text-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-10 w-full max-w-sm">
                <button 
                  onClick={() => setCategory('cosmetic')}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${category === 'cosmetic' ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-800 text-zinc-500'}`}
                >
                  Cosmetic Mode
                </button>
                <button 
                  onClick={() => setCategory('food')}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${category === 'food' ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-800 text-zinc-500'}`}
                >
                  Food/FMCG Mode
                </button>
              </div>

              <label className="w-full max-w-md cursor-pointer group">
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files![0])} />
                <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-12 group-hover:border-blue-500/50 transition-all bg-black/40 text-center">
                  <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-4 group-hover:text-blue-400" />
                  <p className="text-sm font-bold text-zinc-400">{file ? file.name : "Inject Video Asset"}</p>
                </div>
              </label>

              {file && (
                <button 
                  onClick={handleUpload}
                  className="mt-10 px-12 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
                >
                  Begin AI Inference
                </button>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-10">
              <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-8" />
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">
                {status === 'uploading' ? 'Streaming to Server...' : 'Neural Engine Active'}
              </h2>
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  <span>Processing Frames</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-blue-500" animate={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
