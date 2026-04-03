import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

type Tier = { name: string; price: string; cadence: string; badge: string; highlight: boolean; features: string[]; credits: number };

export const Subscription = () => {
  const { user, refresh } = useAuth();
  const [mockOrderId, setMockOrderId] = useState('');
  const [tiers, setTiers] = useState<Tier[]>([
    { name: 'Basic', price: '₹499', cadence: 'per month', badge: 'Starter', highlight: false, features: ['10 AI audits per month','Standard heatmaps','Email support'], credits: 10 },
    { name: 'Pro', price: '₹1,999', cadence: 'per month', badge: 'Most Popular', highlight: true, features: ['75 AI audits per month','Priority GPU queue','Groq-powered audits','Priority support'], credits: 75 },
    { name: 'Enterprise', price: 'Let’s talk', cadence: '', badge: 'Custom', highlight: false, features: ['Unlimited team seats','Custom model tuning','Dedicated success engineer','On-prem or VPC deploy'], credits: 300 },
  ]);
  const [pricing, setPricing] = useState<any>({ starterPrice: 499, starterCredits: 10, proPrice: 1999, proCredits: 75, enterprisePrice: 0, enterpriseCredits: 300 });
  const [savingPricing, setSavingPricing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/content/pricing/public');
        const rupee = (n: number) => (n && n > 0 ? `₹${n.toLocaleString('en-IN')}` : 'Let’s talk');
        setTiers([
          { name: 'Basic', price: rupee(Number(data?.starter?.price ?? 499)), cadence: 'per month', badge: 'Starter', highlight: false, features: ['10 AI audits per month','Standard heatmaps','Email support'], credits: Number(data?.starter?.credits ?? 10) },
          { name: 'Pro', price: rupee(Number(data?.pro?.price ?? 1999)), cadence: 'per month', badge: 'Most Popular', highlight: true, features: ['75 AI audits per month','Priority GPU queue','Groq-powered audits','Priority support'], credits: Number(data?.pro?.credits ?? 75) },
          { name: 'Enterprise', price: rupee(Number(data?.enterprise?.price ?? 0)), cadence: '', badge: 'Custom', highlight: false, features: ['Unlimited team seats','Custom model tuning','Dedicated success engineer','On-prem or VPC deploy'], credits: Number(data?.enterprise?.credits ?? 300) },
        ]);
      } catch {
        // keep defaults
      }
    };
    load();
    const loadAdmin = async () => {
      if (user?.role === 'admin') {
        try {
          const p = await api.get('/admin/pricing');
          setPricing({
            starterPrice: p.data?.starterPrice ?? 499,
            starterCredits: p.data?.starterCredits ?? 10,
            proPrice: p.data?.proPrice ?? 1999,
            proCredits: p.data?.proCredits ?? 75,
            enterprisePrice: p.data?.enterprisePrice ?? 0,
            enterpriseCredits: p.data?.enterpriseCredits ?? 300,
          });
        } catch {}
      }
    };
    loadAdmin();
  }, []);

  const isDev = (import.meta as any)?.env?.MODE === 'development' || (import.meta as any)?.env?.DEV;

  const handleActivate = async (tier: { name: string; credits: number }) => {
    if (!user) {
      alert('Please sign in to activate a plan.');
      return;
    }

    if (!isDev) {
      alert('In production, connect this button to your Razorpay/UPI checkout flow.');
      return;
    }

    if (user.role !== 'admin') {
      alert('Dev payment stub uses an admin billing endpoint. Log in as admin to simulate top-ups, then wire Razorpay/UPI for real users.');
      return;
    }

    try {
      const amount = tier.credits;
      const orderId = mockOrderId || `order_${Date.now()}`;
      await api.post('/admin/credits/topup', { userId: user._id, amount, orderId });
      setMockOrderId(orderId);
      await refresh();
      alert(`Simulated payment success for ${tier.name}. Added ${amount} credits.`);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Top-up simulation failed. Check backend logs.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Credits Exhausted</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Choose your visibility stack
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base">
            Every new account starts with <span className="text-white font-semibold">10 free credits</span>.
            Recharge in rupees to keep the Neural Lab running at full power.
          </p>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">Revenue & Pricing</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">Starter Price (₹)</label>
                  <input type="number" value={pricing.starterPrice} onChange={(e) => setPricing({ ...pricing, starterPrice: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-200 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">Starter Credits</label>
                  <input type="number" value={pricing.starterCredits} onChange={(e) => setPricing({ ...pricing, starterCredits: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-200 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">Pro Price (₹)</label>
                  <input type="number" value={pricing.proPrice} onChange={(e) => setPricing({ ...pricing, proPrice: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-200 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">Pro Credits</label>
                  <input type="number" value={pricing.proCredits} onChange={(e) => setPricing({ ...pricing, proCredits: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-200 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">Enterprise Price (₹)</label>
                  <input type="number" value={pricing.enterprisePrice} onChange={(e) => setPricing({ ...pricing, enterprisePrice: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-200 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">Enterprise Credits</label>
                  <input type="number" value={pricing.enterpriseCredits} onChange={(e) => setPricing({ ...pricing, enterpriseCredits: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-200 outline-none" />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    setSavingPricing(true);
                    try {
                      await api.put('/admin/pricing', pricing);
                      const { data } = await api.get('/content/pricing/public');
                      const rupee = (n: number) => (n && n > 0 ? `₹${n.toLocaleString('en-IN')}` : 'Let’s talk');
                      setTiers([
                        { name: 'Basic', price: rupee(Number(data?.starter?.price ?? 499)), cadence: 'per month', badge: 'Starter', highlight: false, features: ['10 AI audits per month','Standard heatmaps','Email support'], credits: Number(data?.starter?.credits ?? 10) },
                        { name: 'Pro', price: rupee(Number(data?.pro?.price ?? 1999)), cadence: 'per month', badge: 'Most Popular', highlight: true, features: ['75 AI audits per month','Priority GPU queue','Groq-powered audits','Priority support'], credits: Number(data?.pro?.credits ?? 75) },
                        { name: 'Enterprise', price: rupee(Number(data?.enterprise?.price ?? 0)), cadence: '', badge: 'Custom', highlight: false, features: ['Unlimited team seats','Custom model tuning','Dedicated success engineer','On-prem or VPC deploy'], credits: Number(data?.enterprise?.credits ?? 300) },
                      ]);
                    } finally {
                      setSavingPricing(false);
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 disabled:opacity-50"
                  disabled={savingPricing}
                >
                  {savingPricing ? 'Saving…' : 'Save Pricing'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-3xl border p-8 bg-zinc-950 ${
                tier.highlight
                  ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.25)]'
                  : 'border-zinc-900'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>{tier.badge}</span>
                </div>
              )}
              {!tier.highlight && (
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-900 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">
                  <Shield className="w-3 h-3" />
                  <span>{tier.badge}</span>
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{tier.name}</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black">{tier.price}</span>
                {tier.cadence && (
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">
                    {tier.cadence}
                  </span>
                )}
              </div>
              <ul className="space-y-3 mb-6 text-sm text-zinc-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <button
                  onClick={() => handleActivate(tier)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] ${
                    tier.highlight
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                  } transition-colors`}
                >
                  <span>Activate plan</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase tracking-[0.25em]">
                  <span className="px-2 py-1 rounded-full border border-zinc-800 bg-black/60">UPI</span>
                  <span className="px-2 py-1 rounded-full border border-zinc-800 bg-black/60">Cards</span>
                  <span className="px-2 py-1 rounded-full border border-zinc-800 bg-black/60">Netbanking</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border border-zinc-900 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-950">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
              Current workspace
            </p>
            <p className="text-sm text-zinc-200">
              {user ? `${user.name} • ${user.credits} credits remaining` : 'Guest session'}
            </p>
          </div>
          {isDev && user?.role === 'admin' && (
            <div className="w-full md:w-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
                Mock Razorpay order id
              </p>
              <input
                value={mockOrderId}
                onChange={(e) => setMockOrderId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none"
                placeholder="order_1234abcd"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <button className="px-4 py-2 rounded-xl bg-zinc-900 text-xs font-black uppercase tracking-[0.2em] text-zinc-300 hover:bg-zinc-800">
                View reports
              </button>
            </Link>
            <Link to="/analysis">
              <button className="px-4 py-2 rounded-xl bg-white text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-blue-500 hover:text-white">
                Back to Neural Lab
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
