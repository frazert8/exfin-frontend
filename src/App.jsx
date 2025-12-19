import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, Activity, Briefcase, Lock, 
  BrainCircuit, CheckCircle, Menu, X, BarChart2, Check, ExternalLink, Database, ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

// --- SUPABASE CONFIGURATION ---
// REPLACE THESE WITH YOUR KEYS FROM SUPABASE DASHBOARD
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- MOCK DATA ---
const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let cash = 45000;
  return months.map((month, i) => {
    const rev = Math.floor(45000 + (i * 2500) + (Math.random() * 2000));
    const exp = Math.floor(rev * 0.65);
    cash += (rev - exp);
    return {
      month, revenue: rev, cogs: Math.floor(rev * 0.4), opex: Math.floor(rev * 0.25), netIncome: rev - exp, cashOnHand: cash, headcount: 5 + Math.floor(i/4)
    };
  });
};

const Card = ({ children, className="" }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>{children}</div>
);

const KPICard = ({ title, value, trend, icon: Icon, color="indigo" }) => {
  const colorClasses = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600" };
  return (
    <Card className="hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}><Icon size={22} /></div>
        <span className="flex items-center text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100"><ArrowUpRight size={12} className="mr-1" /> {trend}</span>
      </div>
      <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p><h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3></div>
    </Card>
  );
};

const App = () => {
  const [view, setView] = useState('dashboard'); 
  const [data, setData] = useState([]);
  const [source, setSource] = useState('loading'); 
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sbData, error } = await supabase.from('financials').select('*').order('id', { ascending: true });
        if (!error && sbData.length > 0) { setData(sbData); setSource('supabase'); }
        else { throw new Error("Empty"); }
      } catch (err) { setData(generateMockData()); setSource('local'); }
    };
    fetchData();
  }, []);

  const seedDatabase = async () => {
    if (source === 'supabase') return alert("Database already has data!");
    const mock = generateMockData();
    const { error } = await supabase.from('financials').insert(mock);
    if (error) alert("Error: " + error.message);
    else window.location.reload();
  };

  const totalRev = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const latest = data[data.length - 1] || {};
  const margin = latest.revenue ? ((latest.netIncome / latest.revenue) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 shadow-2xl`}>
        <div className="p-8 flex items-center justify-between"><div className="flex items-center gap-3"><Activity className="text-white" size={20} /><span className="text-xl font-bold text-white">ExFin Ai</span></div><button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><X size={24} /></button></div>
        <nav className="px-4 space-y-2 mt-4">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}><LayoutDashboard size={20} /> <span>Dashboard</span></button>
          <button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${view === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}><Lock size={20} /> <span>Admin Portal</span></button>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500"><Menu size={24} /></button>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center border ${source === 'supabase' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${source === 'supabase' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
            {source === 'supabase' ? 'Live Supabase Data' : 'Local Demo Mode'}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {view === 'dashboard' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KPICard title="Revenue YTD" value={`$${(totalRev/1000).toFixed(1)}k`} trend="12.4%" icon={DollarSign} color="indigo" />
                <KPICard title="Net Margin" value={`${margin}%`} trend="2.1%" icon={Activity} color="emerald" />
                <KPICard title="Cash on Hand" value={`$${(latest.cashOnHand/1000).toFixed(1)}k`} trend="Stable" icon={Briefcase} color="blue" />
                <KPICard title="Headcount" value={latest.headcount} trend="Growing" icon={Users} color="amber" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 min-h-[400px]">
                  <h3 className="font-bold text-slate-800 text-lg mb-6">Revenue Trajectory</h3>
                  <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#colorRev)" /></AreaChart></ResponsiveContainer></div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
               <Card className="p-0 overflow-hidden">
                 <div className="p-8">
                   <h3 className="font-bold text-slate-900 mb-4">Supabase Connection</h3>
                   <button onClick={seedDatabase} disabled={source === 'supabase'} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg ${source === 'supabase' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white'}`}>
                     {source === 'supabase' ? 'Database Already Seeded' : 'Seed Database'}
                   </button>
                 </div>
               </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
