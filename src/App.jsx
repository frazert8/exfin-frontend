import React, { useState, useEffect, useCallback } from 'react';
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

const Card = ({ children, className="" }) => (
  <div className={`bg-card-bg rounded-xl shadow-lg border border-border transition-all hover:shadow-xl ${className}`}>
    {children}
  </div>
);

// eslint-disable-next-line no-unused-vars
const KPICard = ({ title, value, trend, trendType, icon: Icon }) => (
  <Card className="p-6 flex items-start justify-between">
    <div>
      <p className="text-text-light text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-text">{value}</h3>
      <div className={`flex items-center mt-2 text-sm font-medium ${trendType === 'positive' ? 'text-success' : 'text-danger'}`}>
        {trendType === 'positive' ? <TrendingUp size={16} className="mr-1" /> : <Activity size={16} className="mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
    <div className="p-3 bg-primary-light/10 rounded-lg text-primary">
      <Icon size={24} />
    </div>
  </Card>
);

const ClientDashboard = ({ financialData, isConnected }) => {
  const latest = financialData[financialData.length - 1] || {};
  const totalRevenue = financialData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text">Executive Dashboard</h1>
            <p className="text-text-light">Your Financial Health Overview</p>
          </div>
          {isConnected ? (
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-bold border border-success/20 flex items-center"><CheckCircle size={14} className="mr-1.5"/> Firebase Connected</span>
          ) : (
              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold border border-secondary/20 flex items-center"><Database size={14} className="mr-1.5"/> Local Mode</span>
          )}
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Revenue YTD" value={`$${(totalRevenue/1000).toFixed(1)}k`} trend="+12.4%" trendType="positive" icon={DollarSign} />
          <KPICard title="Net Margin" value="30.2%" trend="+1.5%" trendType="positive" icon={TrendingUp} />
          <KPICard title="Cash on Hand" value={`$${(latest.cashOnHand/1000).toFixed(1)}k`} trend="4.5 Mo Runway" trendType="positive" icon={Briefcase} />
          <KPICard title="Headcount" value={latest.headcount} trend="+2 this qtr" trendType="neutral" icon={Users} />
       </div>
       <Card className="p-6">
         <h3 className="font-bold text-text mb-4">Revenue Trend</h3>
         <div className="h-80">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={financialData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
               <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-light)', fontSize: 12}} />
               <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-light)', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
               <Tooltip 
                 contentStyle={{ 
                   backgroundColor: 'var(--card-bg)', 
                   borderColor: 'var(--border)',
                   borderRadius: '0.75rem',
                   boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                 }} 
               />
               <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
             </AreaChart>
           </ResponsiveContainer>
         </div>
       </Card>
    </div>
  );
};

const AdminPanel = ({ isConnected, seedDatabase }) => (
  <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
     <h1 className="text-3xl font-bold text-text flex items-center"><Lock className="mr-3 text-primary" size={28} /> Consultant Control Center</h1>
     <Card className="p-6">
        <h3 className="text-sm font-bold text-text-light uppercase tracking-wider mb-4">Database Tools</h3>
        <div className="p-4 bg-background rounded-lg border border-border">
            <h4 className="font-bold text-text mb-2">Firebase Status: {isConnected ? <span className="text-success">Active</span> : <span className="text-danger">Not Synced</span>}</h4>
            <p className="text-sm text-text-light mb-4">Seed the database with mock financial data. This will overwrite any existing data.</p>
            <button onClick={seedDatabase} className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg font-medium text-sm transition-colors flex items-center shadow-md hover:shadow-lg">
                <Database size={16} className="mr-2"/> Seed Database
            </button>
        </div>
     </Card>
  </div>
);

const App = () => {
  const [activeView, setActiveView] = useState('client_dashboard'); 
  const [isConnected, setIsConnected] = useState(false);
  const [financialData, setFinancialData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const generateFallbackData = useCallback(() => {
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
  }, []);

  useEffect(() => {
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
        console.error("Firebase connection error:", e);
        setFinancialData(generateFallbackData());
      }
    };
    
    fetchFinancials(); 
  }, [generateFallbackData]);

  const seedDatabase = async () => {
    try {
      const mockData = generateFallbackData();
      for (let i = 0; i < mockData.length; i++) {
        await addDoc(collection(db, "financials"), { ...mockData[i], id: i });
      }
      alert("Database seeded successfully! The page will now refresh.");
      window.location.reload();
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("There was an error seeding the database. Check the console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-text flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-300 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center h-[73px]">
          <span className="text-xl font-bold tracking-tight text-white flex items-center"><Activity className="mr-2 text-primary"/> ExFin Ai</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><X size={24} /></button>
        </div>
        <nav className="p-4 space-y-2">
          <button onClick={() => setActiveView('client_dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-sm font-semibold ${activeView === 'client_dashboard' ? 'bg-primary text-white' : 'hover:bg-gray-800'}`}>
            <LayoutDashboard size={20} /><span>Dashboard</span>
          </button>
          <button onClick={() => setActiveView('admin')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-sm font-semibold ${activeView === 'admin' ? 'bg-primary text-white' : 'hover:bg-gray-800'}`}>
            <Lock size={20} /><span>Admin Portal</span>
          </button>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-card-bg border-b border-border p-4 flex md:hidden justify-between items-center shadow-sm z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="text-text-light"><Menu size={24} /></button>
          <span className="font-bold text-text">ExFin Ai</span>
          <div className="w-6"></div> 
        </header>
        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {activeView === 'client_dashboard' ? <ClientDashboard financialData={financialData} isConnected={isConnected} /> : <AdminPanel isConnected={isConnected} seedDatabase={seedDatabase} />}
        </main>
      </div>
    </div>
  );
};
export default App;
