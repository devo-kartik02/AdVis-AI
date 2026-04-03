import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, TrendingUp, Target, ArrowRight, Sparkles, BrainCircuit, ShieldCheck, BarChart4 } from 'lucide-react';
import { api } from '../lib/api';

export const Home = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<any | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await api.get('/content/home');
        if (!active) return;
        setContent(data?.data || data || null);
      } catch {
        // fallback to static
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const features: Array<{ icon?: any; title: string; description: string }> = content?.features ?? [
    {
      icon: Eye,
      title: 'Visual Saliency',
      description: 'Leverage Computer Vision to predict where viewers will focus. Generate heatmaps in seconds.',
    },
    {
      icon: TrendingUp,
      title: 'α/β Comparison',
      description: 'Compare multiple creative versions side-by-side. Use data to crown the winning asset.',
    },
    {
      icon: BrainCircuit,
      title: 'Groq Audit',
      description: 'Get deep strategic insights from our Groq LLM auditor. Receive 100-word tactical improvements.',
    },
  ];

  const brands = ['Coca-Cola', 'Nivea', 'PepsiCo', 'L’Oréal', 'Lay\'s', 'Maybelline'];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <div className="pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] text-zinc-400 font-black tracking-[0.2em] uppercase">
                  Next-Gen Neural Auditing
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
                {(content?.heroTitleLine1 ?? 'Predict Attention')} <br />
                <span className="text-blue-500">{content?.heroTitleLine2 ?? 'Before The Launch.'}</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                {content?.heroSubtitle ?? <>AdVis AI combines <span className="text-white">YOLOv8 saliency mapping</span> with <span className="text-white">Groq auditing</span> to optimize your video ads for maximum brand recall and ROI.</>}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={user ? '/analysis' : '/register'} className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full group px-10 py-5 bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3"
                  >
                    Analyze My First Ad
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link to="/about" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-10 py-5 bg-zinc-900 text-zinc-400 font-black text-xs uppercase tracking-widest rounded-2xl border border-zinc-800 hover:text-white transition-colors"
                  >
                    Explore Technology
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tech Specs / Stats Row */}
        <section className="py-20 border-y border-zinc-900 bg-zinc-950/50">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Model', val: 'YOLOv8', icon: ShieldCheck },
                { label: 'Inference', val: '< 30s', icon: Zap },
                { label: 'Auditor', val: 'Groq', icon: BrainCircuit },
                { label: 'Accuracy', val: '94.2%', icon: BarChart4 },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center md:items-start">
                   <div className="flex items-center gap-2 mb-1">
                      <stat.icon className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                   </div>
                   <span className="text-2xl font-bold">{stat.val}</span>
                </div>
              ))}
           </div>
        </section>

        {/* Brand Scroller */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center gap-12 flex-wrap grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                {brands.map((brand) => (
                  <span key={brand} className="text-xl font-black text-white tracking-tighter italic">
                    {brand}
                  </span>
                ))}
              </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
                Visual Intelligence <br />
                <span className="text-blue-500">For Modern Marketers.</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature: { icon?: any; title: string; description: string }, index: number) => {
                const IconComp = feature.icon || Eye;
                return (
                <motion.div
                  key={`${feature.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-10 bg-zinc-950 border border-zinc-900 rounded-[32px] hover:border-blue-500/30 transition-all"
                >
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <IconComp className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              )})}
            </div>
          </div>
        </section>

        {/* Final CTA (hide when logged in) */}
        {!user && (
          <section className="py-40 relative">
            <div className="absolute inset-0 bg-blue-600/5 blur-[150px] rounded-full" />
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-5xl font-black mb-8 tracking-tighter">Ready to Audit?</h2>
              <p className="text-zinc-500 mb-12 text-lg">Stop guessing. Start auditing with the world's first AI video saliency engine.</p>
              <Link to="/register">
                <button className="px-12 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-500 hover:text-white transition-all">
                  Create Free Account
                </button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
