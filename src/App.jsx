import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, Activity, Briefcase, Lock, 
  BrainCircuit, CheckCircle, Menu, X, BarChart2, Check, ExternalLink, Database
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "exfin-ai.firebaseapp.com",
  projectId: "exfin-ai",
  storageBucket: "exfin-ai.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Card = ({ children, className="" }) => <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>;

const KPICard = ({ title, value, trend, trendType, icon: Icon }) => (
  <Card className="p-6 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <div className={`flex items-center mt-2 text-sm font-medium ${trendType === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trendType === 'positive' ? <TrendingUp size={16} className="mr-1" /> : <Activity size={16} className="mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
    <div className="p-3 bg-slate-50 rounded-lg text-slate-600"><Icon size={24} /></div>
  </Card>
);

const App = () => {
  const [activeView, setActiveView] = useState('client_dashboard'); 
  const [isConnected, setIsConnected] = useState(false);
  const [financialData, setFinancialData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { fetchFinancials(); }, []);

  const fetchFinancials = async () => {
    try {
      const q = query(collection(db, "financials"), orderBy("id", "asc"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setFinancialData(querySnapshot.docs.map(doc => doc.data()));
        setIsConnected(true);
      } else {
        setFinancialData(generateFallbackData());
      }
    } catch (e) {
      setFinancialData(generateFallbackData());
    }
  };

  const seedDatabase = async () => {
    const mockData = generateFallbackData();
    for (let i = 0; i < mockData.length; i++) {
      await addDoc(collection(db, "financials"), { ...mockData[i], id: i });
    }
    alert("Database seeded! Refreshing...");
    window.location.reload();
  };

  const generateFallbackData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let currentCash = 45000;
    return months.map((month, index) => {
      const revenue = Math.floor(45000 + (index * 2500) + (Math.random() * 2000));
      const cogs = Math.floor(revenue * 0.42);
      const opex = Math.floor(15000 * 1.05); 
      const netIncome = revenue - cogs - opex;
      currentCash += netIncome; 
      return { month, revenue, forecast: revenue * 1.05, cogs, opex, netIncome, cashOnHand: currentCash, headcount: 5 + Math.floor(index / 4), id: index };
    });
  };

  const ClientDashboard = () => {
    const latest = financialData[financialData.length - 1] || {};
    const totalRevenue = financialData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
              <p className="text-slate-500">Financial Health Overview</p>
            </div>
            {isConnected ? (
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center"><CheckCircle size={14} className="mr-1"/> Firebase Connected</span>
            ) : (
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold flex items-center"><Database size={14} className="mr-1"/> Local Mode</span>
            )}
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title="Revenue YTD" value={`$${(totalRevenue/1000).toFixed(1)}k`} trend="+12.4%" trendType="positive" icon={DollarSign} />
            <KPICard title="Net Margin" value="30.2%" trend="+1.5%" trendType="positive" icon={TrendingUp} />
            <KPICard title="Cash on Hand" value={`$${(latest.cashOnHand/1000).toFixed(1)}k`} trend="4.5 Mo Runway" trendType="positive" icon={Briefcase} />
            <KPICard title="Headcount" value={latest.headcount} trend="+2 this qtr" trendType="neutral" icon={Users} />
         </div>
         <div className="grid grid-cols-1 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-4">Revenue Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
         </div>
      </div>
    );
  };

  const AdminPanel = () => (
    <div className="max-w-4xl mx-auto space-y-6">
       <h1 className="text-2xl font-bold text-slate-900 flex items-center"><Lock className="mr-3 text-indigo-600" size={24} /> Consultant Control Center</h1>
       <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Database Tools</h3>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-2">Firebase Status: {isConnected ? <span className="text-emerald-600">Active</span> : <span className="text-orange-500">Not Synced</span>}</h4>
              <button onClick={seedDatabase} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center">
                  <Database size={16} className="mr-2"/> Seed Database
              </button>
          </div>
       </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center h-[73px]">
          <span className="text-lg font-bold tracking-tight text-white flex items-center"><Activity className="mr-2 text-indigo-500"/> ExFin Ai</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="p-4 space-y-1.5">
          <button onClick={() => setActiveView('client_dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${activeView === 'client_dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard size={18} /><span>Dashboard</span>
          </button>
          <button onClick={() => setActiveView('admin')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${activeView === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
            <Lock size={18} /><span>Admin Portal</span>
          </button>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex md:hidden justify-between items-center shadow-sm z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600"><Menu size={24} /></button>
          <span className="font-bold text-slate-900">ExFin Ai</span>
          <div className="w-6"></div> 
        </header>
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeView === 'client_dashboard' ? <ClientDashboard /> : <AdminPanel />}
        </main>
      </div>
    </div>
  );
};
export default App;
