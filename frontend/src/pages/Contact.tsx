import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        message: formData.company
          ? `${formData.message}\n\nCompany: ${formData.company}`
          : formData.message,
      };
      await api.post('/content/inquiry', payload);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', company: '', message: '' });
      }, 5000);
    } catch (err) {
      console.error('Failed to send inquiry', err);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Neural Support',
      value: 'support@advis.ai',
    },
    {
      icon: MapPin,
      title: 'Base of Operations',
      value: 'Nagpur, MH (AdVis AI Global Systems)',
    },
    {
      icon: Clock,
      title: 'Inference Availability',
      value: '24/7 AI Processing',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Communication Channel</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
            Connect with <br />
            <span className="text-blue-500 underline decoration-blue-500/20">The Lab</span>
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed">
            Need custom AI training or API access? Our engineering team is ready to scale your visual auditing.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-12">
              <h2 className="text-3xl font-black tracking-tight mb-8">Technical Support</h2>
              <div className="space-y-8">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-6 group">
                    <div className="w-14 h-14 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center group-hover:border-blue-500/50 transition-all duration-500">
                      <info.icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{info.title}</h3>
                      <p className="text-lg font-bold text-zinc-200">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-zinc-900 bg-zinc-950 group">
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
              <div className="p-8 relative z-10">
                <div className="aspect-video bg-black rounded-2xl flex items-center justify-center border border-zinc-800">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-bounce" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Geospatial Tag: Nagpur Hub</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-zinc-950 border border-zinc-900 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
              
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 relative z-10"
                  >
                    <div>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 block">Identificaton</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-4 bg-black border border-zinc-800 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all placeholder:text-zinc-800"
                        placeholder="Operator Name"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 block">Email Source</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-5 py-4 bg-black border border-zinc-800 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all placeholder:text-zinc-800"
                          placeholder="comm_link@host.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 block">Organization</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-5 py-4 bg-black border border-zinc-800 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all placeholder:text-zinc-800"
                          placeholder="Agency Name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 block">Query Payload</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-5 py-4 bg-black border border-zinc-800 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all resize-none placeholder:text-zinc-800"
                        rows={5}
                        placeholder="Describe your technical requirements..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-5 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 group"
                    >
                      Transmit Message
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 text-center relative z-10"
                  >
                    <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Transmission Successful</h2>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                      Your query payload has been received. Our neural lab team will respond shortly.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
