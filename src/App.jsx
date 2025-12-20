import React, { useState, useEffect, useCallback } from 'react';
import { getFinancialData, seedDatabase, formatCurrency } from './api';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

import Card from './components/Card';
import KPICard from './components/KPICard';
import CustomTooltip from './components/CustomTooltip';

import { 
  LayoutDashboard, BarChart2, Lock, BrainCircuit, Menu, Search, Bell, RefreshCw, 
  ChevronDown, ChevronsLeft, DollarSign, Activity, Wallet, Users, ExternalLink, MoreHorizontal,
  CheckCircle, Database, Check
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart 
} from 'recharts';


const App = () => {
  const [view, setView] = useState('dashboard'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('loading'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleFetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: fetchedData, source: fetchedSource } = await getFinancialData();
      setData(fetchedData);
      setSource(fetchedSource);
    } catch (error) {
      console.error("Failed to fetch financial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  const handleSeedDatabase = async () => {
    if (source === 'supabase') {
      alert("Database already has data!");
      return;
    }
    setLoading(true);
    const success = await seedDatabase();
    if (success) {
      window.location.reload();
    } else {
      setLoading(false);
    }
  };
  
  const totalRev = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const latest = data[data.length - 1] || {};
  const margin = latest.revenue ? ((latest.netIncome / latest.revenue) * 100) : 0;

  const expenseData = [
    { name: 'COGS', value: latest.cogs || 0, color: '#6366f1' },
    { name: 'OpEx', value: latest.opex || 0, color: '#ec4899' },
    { name: 'Net', value: latest.netIncome || 0, color: '#10b981' },
  ];

  const pageMotionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };
  
  const mainContentVariants = {
    open: { scale: 1, borderRadius: "0px" },
    closed: { scale: 0.9, borderRadius: "30px" },
  };

  const renderView = () => {
    switch(view) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Financial Performance</h2>
                <p className="text-zinc-500 text-sm">Real-time overview of key metrics.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleFetchData} className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"><RefreshCw size={18} /></button>
                <button className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">Last 12 Months <ChevronDown size={14} /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-3 gap-6 h-[700px]">
              <Card className="lg:col-span-3 lg:row-span-2">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg">Revenue vs Net Income</h3>
                    <p className="text-xs text-zinc-500">Monthly breakdown</p>
                  </div>
                  <button className="text-zinc-400 hover:text-zinc-600"><ExternalLink size={16} /></button>
                </div>
                <div className="h-[90%] w-full">
                   <ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} /><RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} /><Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} /><Bar dataKey="revenue" name="Revenue" barSize={30} fill="#6366f1" radius={[4, 4, 0, 0]} /><Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill:'#10b981', strokeWidth:2, stroke:'#fff'}} activeDot={{r: 6}} /></ComposedChart></ResponsiveContainer>
                </div>
              </Card>

              <div className="lg:col-span-1 lg:row-span-3 space-y-6">
                <KPICard title="Total Revenue (YTD)" rawValue={totalRev} format={formatCurrency} trend="up" trendValue="12.4%" icon={DollarSign} color="indigo" />
                <KPICard title="Net Margin" rawValue={margin} format={(v) => `${v.toFixed(1)}%`} trend="up" trendValue="2.1%" icon={Activity} color="emerald" />
                <KPICard title="Cash on Hand" rawValue={latest.cashOnHand} format={formatCurrency} trend="down" trendValue="0.4%" icon={Wallet} color="blue" />
                <KPICard title="Total Headcount" rawValue={latest.headcount} format={(v) => String(Math.round(v))} trend="up" trendValue="+3" icon={Users} color="violet" />
              </div>
              
              <Card className="lg:col-span-3">
                 <h3 className="font-bold text-zinc-900 text-lg mb-2">Cost Distribution</h3>
                 <div className="h-40 relative flex justify-around items-center">
                    <div className="h-40 w-40"><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={expenseData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{expenseData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="none" />))}</Pie></RePieChart></ResponsiveContainer></div>
                    <div className="space-y-3">{expenseData.map((item) => (<div key={item.name} className="flex justify-between items-center text-sm w-40"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div><span className="text-zinc-600">{item.name}</span></div><span className="font-bold text-zinc-900">{formatCurrency(item.value)}</span></div>))}</div>
                 </div>
              </Card>
            </div>
          </div>
        );
      // ... other cases
      case 'admin':
        return (
          <div className="max-w-xl mx-auto pt-10">
              <Card className="text-center p-10">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Database size={32} /></div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">Data Management</h3>
                  <p className="text-zinc-500 mb-8">Manage your Supabase connection and seed initial demo data.</p>
                  <button onClick={handleSeedDatabase} disabled={source === 'supabase' || loading} className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${source === 'supabase' ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}>
                      {source === 'supabase' ? <Check size={18} /> : <Database size={18} />}
                      {source === 'supabase' ? 'Database Synced' : 'Seed Database with Mock Data'}
                  </button>
              </Card>
          </div>
        );
      default:
        return (
          <div className="text-center p-20">
            <h2 className="text-2xl font-bold">{view.charAt(0).toUpperCase() + view.slice(1)}</h2>
            <p>Coming soon!</p>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex font-sans text-zinc-900 selection:bg-indigo-100 overflow-hidden">
      
      <motion.aside 
        className="fixed inset-y-0 left-0 z-30 w-64 bg-zinc-900 text-zinc-300"
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between gap-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><BrainCircuit size={20} /></div>
              <span className="text-xl font-bold tracking-tight text-white">ExFin.ai</span>
            </div>
          </div>

          <div className="px-4 py-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">Menu</p>
            <nav className="space-y-1">
              <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800'}`}>
                <LayoutDashboard size={18} /> <span>Dashboard</span>
              </button>
              <button onClick={() => setView('analytics')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${view === 'analytics' ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800'}`}>
                <BarChart2 size={18} /> <span>Analytics</span>
              </button>
              <button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${view === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800'}`}>
                <Lock size={18} /> <span>Admin Portal</span>
              </button>
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="bg-zinc-800 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">JD</div>
                <div>
                  <p className="text-sm font-bold text-white">John Doe</p>
                  <p className="text-xs text-zinc-400">CFO Access</p>
                </div>
              </div>
              <div className={`text-xs font-semibold flex items-center gap-2 ${source === 'supabase' ? 'text-emerald-400' : 'text-amber-400'}`}>
                <div className={`w-2 h-2 rounded-full ${source === 'supabase' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                {source === 'supabase' ? 'Live Connection' : 'Demo Data'}
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      <motion.div 
        className="flex-1 flex flex-col h-screen overflow-hidden relative"
        style={{ transformOrigin: "left center" }}
        variants={mainContentVariants}
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-20">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-500">
             <Menu size={20} />
           </button>
           <div className="flex items-center gap-4">
             <div className="hidden md:flex relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
               <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-zinc-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
             </div>
             <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors relative"><Bell size={20} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <AnimatePresence mode="wait">
            {loading ? (
               <motion.div key="loader">{/* ... loader ... */}</motion.div>
            ) : (
              <motion.div key={view} variants={pageMotionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                {renderView()}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default App;
