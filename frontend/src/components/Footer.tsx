import { Link } from 'react-router-dom';
import { Zap, Github, Linkedin, Mail, Cpu, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [engineOnline, setEngineOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000/api';
    let ORIGIN = 'http://localhost:5000';
    try { ORIGIN = new URL(API_BASE).origin; } catch { if (typeof window !== 'undefined') ORIGIN = window.location.origin; }
    const check = async () => {
      try {
        const resp = await fetch(`${ORIGIN}/api/health`, { method: 'GET' });
        if (!active) return;
        setEngineOnline(resp.ok);
      } catch {
        if (!active) return;
        setEngineOnline(false);
      }
    };
    check();
    const id = setInterval(check, 15000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const links = {
    platform: [
      { name: 'Neural Lab', path: '/analysis' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'α/β Testing', path: '/comparison' },
      { name: 'Subscription', path: '/subscription' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'System Status', path: '/admin' },
    ],
  };

  return (
    <footer className="bg-black border-t border-zinc-900 pt-20 pb-10 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter uppercase">
                AdVis <span className="text-blue-500">AI</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Next-generation visual auditing platform powered by YOLOv8 and Groq. 
              Engineering attention before you spend.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Inference Engine</h4>
            <ul className="space-y-4">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-zinc-500 hover:text-blue-500 transition-colors font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Organization</h4>
            <ul className="space-y-4">
              {links.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-zinc-500 hover:text-blue-500 transition-colors font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Spec Column */}
          <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-3xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">Node Health</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-600 font-bold uppercase">AI Engine</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${engineOnline ? 'bg-green-500' : engineOnline === false ? 'bg-red-500' : 'bg-zinc-700'} animate-pulse`} />
                <span className="text-[10px] text-zinc-400 font-mono">{engineOnline ? 'Active' : engineOnline === false ? 'Offline' : 'Checking'}</span>
              </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-600 font-bold uppercase">DB Clusters</span>
                <span className="text-[10px] text-zinc-400 font-mono">Synced</span>
              </div>
              <div className="pt-4 border-t border-zinc-900 mt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-zinc-600" />
                  <span className="text-[9px] text-zinc-600 font-medium">Verified Engineering Project</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            © {currentYear} AdVis AI. 
          </p>
          {/* <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Developed by <span className="text-blue-500">Kartik & Team</span> • AdVis.ai Global Systems
          </p> */}
        </div>
      </div>
    </footer>
  );
};
