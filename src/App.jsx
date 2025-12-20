import React, { useState, useEffect, useCallback } from 'react';
import { getFinancialData, seedDatabase, formatCurrency } from './api';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

import Card from './components/Card';
import KPICard from './components/KPICard';

import { 
  LayoutDashboard, BarChart2, Lock, RocketLaunch, Menu, Search, Bell,
  ChevronsLeft, DollarSign, Activity, Wallet, Users, Database, Check
} from 'lucide-react';

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
      alert("Database seeded successfully! Reloading...");
      window.location.reload();
    } else {
      setLoading(false);
      alert("Database seeding failed. Check console for errors.");
    }
  };
  
  const totalRev = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const latest = data[data.length - 1] || {};
  const margin = latest.revenue ? ((latest.netIncome / latest.revenue) * 100) : 0;

  const pageMotionVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-[#1F2937]">
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? '16rem' : '5rem' }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#1F2937] text-[#FFFFFF] relative flex flex-col flex-shrink-0"
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="p-4 h-20 flex items-center justify-between flex-shrink-0">
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} exit={{ opacity: 0, transition: { duration: 0.1} }}>
                  <div className="flex items-center gap-3">
                    <RocketLaunch size={24} />
                    <span className="text-xl font-bold">ExFin.ai</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-full hover:bg-[#374151]">
              <ChevronsLeft size={20} className={`text-[#9CA3AF] transition-transform duration-500 ${isSidebarOpen ? '' : 'rotate-180'}`} />
            </button>
          </div>
          
          <nav className="px-4">
            <ul>
              <li><button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isSidebarOpen ? '' : 'justify-center'} ${view === 'dashboard' ? 'bg-[#111827]' : 'text-[#9CA3AF] hover:bg-[#374151]'}`}><LayoutDashboard size={20} />{isSidebarOpen && <span className="truncate">Dashboard</span>}</button></li>
              <li><button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isSidebarOpen ? '' : 'justify-center'} ${view === 'admin' ? 'bg-[#111827] text-white' : 'text-[#9CA3AF] hover:bg-[#374151]'}`}><Lock size={20} />{isSidebarOpen && <span className="truncate">Admin</span>}</button></li>
            </ul>
          </nav>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-[#FFFFFF] border-b border-[#E5E7EB] px-10 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937] capitalize">{view}</h2>
            <p className="text-[#6B7280] text-sm">Here is your overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <Search size={20} className="text-[#6B7280]" />
            <Bell size={20} className="text-[#6B7280]" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            {loading ? (
               <div key="loader" className="text-center text-[#6B7280]">Loading...</div>
            ) : (
              <motion.div key={view} variants={pageMotionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                {view === 'dashboard' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard title="Total Revenue (YTD)" value={formatCurrency(totalRev)} trend="+12.4%" icon={DollarSign} color="indigo" />
                    <KPICard title="Net Margin" value={`${margin.toFixed(1)}%`} trend="+2.1%" icon={Activity} color="emerald" />
                    <KPICard title="Cash on Hand" value={formatCurrency(latest.cashOnHand || 0)} trend="+0.4%" icon={Wallet} color="blue" />
                    <KPICard title="Total Headcount" value={latest.headcount || 0} trend="+3" icon={Users} color="amber" />
                  </div>
                )}
                {view === 'admin' && (
                  <div className="max-w-xl mx-auto">
                    <Card>
                      <h3 className="font-bold text-lg mb-4">Data Management</h3>
                      <p className="text-[#6B7280] text-sm mb-4">If you are running this locally, you can seed the database with mock data.</p>
                      <button onClick={handleSeedDatabase} disabled={source === 'supabase' || loading} className={`w-full py-2 rounded-lg font-semibold transition-colors ${source === 'supabase' ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed' : 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'}`}>
                          {source === 'supabase' ? 'Database Already Synced' : 'Seed Database'}
                      </button>
                    </Card>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
