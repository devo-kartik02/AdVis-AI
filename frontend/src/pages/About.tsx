import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Code, Brain, Rocket, Users, Globe, Database, Cpu, Layers } from 'lucide-react';

export const About = () => {
  const [content, setContent] = useState<any | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await api.get('/content/about');
        if (!active) return;
        setContent(data?.data || data || null);
      } catch {
        // silent fallback to static content
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const team = (content?.team as any[]) ?? [
    { name: 'Kartik Gorde', role: 'Head of AI / Lead Dev', initials: 'KG' },
    { name: 'Anuradha Karule', role: 'Chief Technical Officer', initials: 'AK' },
    { name: 'Sharwari Mondhe', role: 'Chief Operations Officer', initials: 'SM' },
    { name: 'Shlok Patel', role: 'Lead UI/UX Designer', initials: 'SP' },
    { name: 'Ved Misar', role: 'Lead Product Designer', initials: 'VM' },
  ];

  const techStack = (content?.techStack as any[]) ?? [
    { name: 'React', icon: Globe, desc: 'Frontend Interface' },
    { name: 'Node.js', icon: Layers, desc: 'Backend Logic' },
    { name: 'MongoDB', icon: Database, desc: 'Data Persistence' },
    { name: 'YOLOv8', icon: Cpu, desc: 'Computer Vision' },
  ];

  const values = [
    {
      icon: Code,
      title: 'Built by Engineers',
      description: 'Deep technical expertise from AdVis.ai Global Systems meets practical marketing needs.',
    },
    {
      icon: Brain,
      title: 'AI-First',
      description: 'YOLOv8 and Groq power every visual prediction.',
    },
    {
      icon: Rocket,
      title: 'Real-Time Insights',
      description: 'Get deep-learning heatmaps in seconds, not days.',
    },
    {
      icon: Users,
      title: 'For Humans',
      description: 'Complex computer vision simplified for everyday marketers.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
            {(content?.heroTitleLeft ?? 'Engineering')}{' '}
            <span className="text-blue-500">{content?.heroTitleRight ?? 'Attention'}</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed font-medium">
            {content?.heroSubtitle ?? 'Built at AdVis.ai Global Systems, AdVantage AI bridges the gap between complex computer vision and high-performance advertising.'}
          </p>
        </motion.div>

        {/* Story Section */}
        <section className="mb-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold uppercase tracking-widest text-blue-500">The Mission</h2>
              <div className="space-y-4 text-zinc-400 leading-relaxed text-lg">
                <p>
                  As engineering students, we saw a fundamental flaw in how digital ads were created: 
                  it was all guesswork. Marketers were spending millions without knowing where the human eye 
                  would actually land.
                </p>
                <p>
                  We integrated <span className="text-white">Saliency Mapping</span> and <span className="text-white">Object Detection </span> 
                  to build a tool that predicts human behavior. AdVis AI isn't just a platform; it's a 
                  neural laboratory for your creatives.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {techStack.map((tech) => (
                <div key={tech.name} className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl text-center">
                  <tech.icon className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <p className="text-sm font-bold uppercase tracking-widest">{tech.name}</p>
                  <p className="text-[10px] text-zinc-600 font-mono mt-1">{tech.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Meeting the Team */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Core Team</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group text-center"
              >
                <div className="aspect-square mb-4 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center text-2xl font-black text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  {member.initials}
                </div>
                <h3 className="font-bold text-sm mb-1">{member.name}</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Value Grid */}
        <section>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 hover:border-zinc-800 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-bold mb-2">{value.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
