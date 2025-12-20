import React, { useState, useEffect, useCallback } from 'react';
import { getFinancialData, seedDatabase, formatCurrency } from './api';
import { AnimatePresence, motion } from 'framer-motion';

import Card from './components/Card';
import KPICard from './components/KPICard';

const icons = {
  rocket: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11.63-.42 1.22-.9 1.77-1.44 .9-.9 1.7-2.1 2.28-3.65.53-1.44.56-3.03.04-4.52-1.31-3.9-5.26-5.36-9.5-2.82-4.25 2.54-5.69 7.1-2.82 9.5Z"/><path d="m15 12-3 3 3 3 3-3-3-3Z"/><path d="m22 2-3 1 3 3 1-3Z"/><path d="M19 8c-2 3-5 3-5 3s0-3 3-5"/><path d="M14 13s.5 2.5 2.5 4.5"/></svg>,
  chevronsLeft: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>,
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  lock: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  search: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  bell: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  dollar: <svg xmlns="http://www.w3.org/2000/svg" className="text-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  activity: <svg xmlns="http://www.w3.org/2000/svg" className="text-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" className="text-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  users: <svg xmlns="http://www.w3.org/2000/svg" className="text-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  database: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
};

const App = () => {
  const [view, setView] = useState('dashboard'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('loading'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleFetchData = useCallback(async () => { setLoading(true); try { const { data: fetchedData } = await getFinancialData(); setData(fetchedData); } catch (error) { console.error("Failed to fetch financial data:", error); } finally { setLoading(false); } }, []);
  useEffect(() => { handleFetchData(); }, [handleFetchData]);
  
  const handleSeedDatabase = async () => { if (source === 'supabase') { alert("Database already has data!"); return; } setLoading(true); const success = await seedDatabase(); if (success) { alert("Database seeded successfully! Reloading..."); window.location.reload(); } else { setLoading(false); alert("Database seeding failed. Check console for errors."); } };
  
  const totalRev = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const latest = data[data.length - 1] || {};
  const margin = latest.revenue ? ((latest.netIncome / latest.revenue) * 100) : 0;

  const pageMotionVariants = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-[#1F2937]">
      <motion.aside initial={false} animate={{ width: isSidebarOpen ? '16rem' : '5rem' }} transition={{ duration: 0.3, ease: "easeInOut" }} className="bg-[#1F2937] text-[#FFFFFF] relative flex flex-col flex-shrink-0">
        <div className="h-full flex flex-col overflow-hidden">
          <div className="p-4 h-20 flex items-center justify-between flex-shrink-0">
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} exit={{ opacity: 0, transition: { duration: 0.1} }}>
                  <div className="flex items-center gap-3">{icons.rocket} <span className="text-xl font-bold">ExFin.ai</span></div>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-full hover:bg-[#374151]">
              <div className={`text-[#9CA3AF] transition-transform duration-500 ${isSidebarOpen ? '' : 'rotate-180'}`}>{icons.chevronsLeft}</div>
            </button>
          </div>
          <nav className="px-4">
            <ul>
              <li><button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isSidebarOpen ? '' : 'justify-center'} ${view === 'dashboard' ? 'bg-[#111827]' : 'text-[#9CA3AF] hover:bg-[#374151]'}`}>{icons.dashboard} {isSidebarOpen && <span className="truncate">Dashboard</span>}</button></li>
              <li><button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isSidebarOpen ? '' : 'justify-center'} ${view === 'admin' ? 'bg-[#111827] text-white' : 'text-[#9CA3AF] hover:bg-[#374151]'}`}>{icons.lock} {isSidebarOpen && <span className="truncate">Admin</span>}</button></li>
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
            <div className="text-[#6B7280]">{icons.search}</div>
            <div className="text-[#6B7280]">{icons.bell}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            {loading ? ( <div key="loader" className="text-center text-[#6B7280]">Loading...</div> ) : (
              <motion.div key={view} variants={pageMotionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                {view === 'dashboard' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard title="Total Revenue (YTD)" value={formatCurrency(totalRev)} trend="+12.4%" icon={icons.dollar} color="indigo" />
                    <KPICard title="Net Margin" value={`${margin.toFixed(1)}%`} trend="+2.1%" icon={icons.activity} color="emerald" />
                    <KPICard title="Cash on Hand" value={formatCurrency(latest.cashOnHand || 0)} trend="+0.4%" icon={icons.wallet} color="blue" />
                    <KPICard title="Total Headcount" value={latest.headcount || 0} trend="+3" icon={icons.users} color="amber" />
                  </div>
                )}
                {view === 'admin' && (
                  <div className="max-w-xl mx-auto">
                    <Card>
                      <h3 className="font-bold text-lg mb-4">Data Management</h3>
                      <p className="text-[#6B7280] text-sm mb-4">If you are running this locally, you can seed the database with mock data.</p>
                      <button onClick={handleSeedDatabase} disabled={source === 'supabase' || loading} className={`w-full py-2 rounded-lg font-semibold transition-colors ${source === 'supabase' ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed' : 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'}`}>
                        {source === 'supabase' ? icons.check : icons.database}
                        <span className="ml-2">{source === 'supabase' ? 'Database Already Synced' : 'Seed Database'}</span>
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