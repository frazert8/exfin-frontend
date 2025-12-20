import React, { useState, useEffect, useCallback } from 'react';
import { getFinancialData, seedDatabase, formatCurrency } from './api';
import { AnimatePresence, motion } from 'framer-motion';

import Card from './components/Card';
import KPICard from './components/KPICard';
import CustomTooltip from './components/CustomTooltip';

import { 
  LayoutDashboard, BarChart2, Lock, BrainCircuit, Menu, Search, Bell, RefreshCw, 
  ChevronDown, DollarSign, Activity, Wallet, Users, ExternalLink, MoreHorizontal,
  CheckCircle, Database, Check
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from 'recharts';


// --- Main App Component ---
const App = () => {
  const [view, setView] = useState('dashboard'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('loading'); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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

  const motionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900 selection:bg-indigo-100">
      
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        {/* ... sidebar content ... */}
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* ... header content ... */}
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <AnimatePresence mode="wait">
            {loading ? (
               <motion.div key="loader" className="space-y-6 animate-pulse">{/* ... loader ... */}</motion.div>
            ) : (
              <motion.div
                key={view}
                variants={motionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {view === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* ... header title ... */}
                    </div>
                    
                    {/* --- BENTO GRID START --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-3 gap-6">
                      <Card className="lg:col-span-2 lg:row-span-2 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="font-bold text-zinc-900 text-lg">Revenue vs Net Income</h3>
                            <p className="text-xs text-zinc-500">Monthly breakdown</p>
                          </div>
                          <button className="text-zinc-400 hover:text-zinc-600"><ExternalLink size={16} /></button>
                        </div>
                        <div className="h-80 w-full">
                           <ResponsiveContainer width="100%" height="100%"><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} /><RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} /><Legend iconType="circle" /><Bar dataKey="revenue" name="Revenue" barSize={30} fill="#6366f1" radius={[4, 4, 0, 0]} /><Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill:'#10b981', strokeWidth:2, stroke:'#fff'}} activeDot={{r: 6}} /></ComposedChart></ResponsiveContainer>
                        </div>
                      </Card>

                      <KPICard title="Net Margin" rawValue={margin} format={(v) => `${v.toFixed(1)}%`} trend="up" trendValue="2.1%" icon={Activity} color="emerald" />
                      <KPICard title="Cash on Hand" rawValue={latest.cashOnHand} format={formatCurrency} trend="down" trendValue="0.4%" icon={Wallet} color="blue" />
                      
                      <KPICard title="Total Revenue (YTD)" rawValue={totalRev} format={formatCurrency} trend="up" trendValue="12.4%" icon={DollarSign} color="indigo" />
                      
                      <Card className="lg:col-span-2">
                         <h3 className="font-bold text-zinc-900 text-lg mb-2">Cost Distribution</h3>
                         <p className="text-xs text-zinc-500 mb-6">Latest month breakdown</p>
                         <div className="h-40 relative flex justify-around items-center">
                            <div className="h-40 w-40"><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={expenseData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{expenseData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="none" />))}</Pie></RePieChart></ResponsiveContainer></div>
                            <div className="space-y-3">{expenseData.map((item) => (<div key={item.name} className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div><span className="text-zinc-600">{item.name}</span></div><span className="font-bold text-zinc-900">{formatCurrency(item.value)}</span></div>))}</div>
                         </div>
                      </Card>

                      <KPICard title="Total Headcount" rawValue={latest.headcount} format={(v) => String(Math.round(v))} trend="up" trendValue="+3" icon={Users} color="violet" />

                    </div>
                    {/* --- BENTO GRID END --- */}

                    {/* ... a simplified data table could go here ... */}
                  </div>
                )}
                
                {/* ... other views (analytics, admin) ... */}

              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
