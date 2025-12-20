import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, Activity, Briefcase, Lock, 
  BrainCircuit, CheckCircle, Menu, X, BarChart2, Check, ExternalLink, Database, 
  ArrowUpRight, Wallet, MoreHorizontal, Search, Bell, ChevronDown, RefreshCw
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from 'recharts';

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// --- UTILS & MOCK DATA ---
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let cash = 45000;
  return months.map((month, i) => {
    const rev = Math.floor(45000 + (i * 3500) + (Math.random() * 5000));
    const exp = Math.floor(rev * 0.65);
    cash += (rev - exp);
    return {
      month, 
      revenue: rev, 
      cogs: Math.floor(rev * 0.4), 
      opex: Math.floor(rev * 0.25), 
      netIncome: rev - exp, 
      cashOnHand: cash, 
      headcount: 5 + Math.floor(i/4)
    };
  });
};

// --- COMPONENTS ---

const Card = ({ children, className="", noPadding = false }) => (
  <div className={`bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${className}`}>
    <div className={noPadding ? "" : "p-6"}>{children}</div>
  </div>
);

const KPICard = ({ title, value, trend, trendValue, icon: Icon, color, className }) => {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600", 
    blue: "bg-blue-100 text-blue-600",
    violet: "bg-violet-100 text-violet-600"
  };

  return (
    <Card className={`relative overflow-hidden group ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} className="text-zinc-900" />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${colors[color] || colors.indigo}`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1 rotate-180" />}
            {trendValue}
          </div>
        </div>
        <div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{value}</h3>
        </div>
      </div>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-xl text-sm border border-zinc-700">
        <p className="font-bold mb-2 text-zinc-300">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="capitalize text-zinc-400">{entry.name}:</span>
            <span className="font-mono font-bold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN APP ---

const App = () => {
  const [view, setView] = useState('dashboard'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('loading'); 
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: sbData, error } = await supabase.from('financials').select('*').order('id', { ascending: true });
      if (!error && sbData.length > 0) { 
        setData(sbData.map((d, i) => ({...d, index: i}))); 
        setSource('supabase'); 
      } else { 
        throw new Error("Empty"); 
      }
    } catch (err) { 
      setTimeout(() => {
        setData(generateMockData()); 
        setSource('local'); 
        setLoading(false);
      }, 800);
      return;
    }
    setLoading(false);
  };

  const seedDatabase = async () => {
    if (source === 'supabase') return alert("Database already has data!");
    setLoading(true);
    const mock = generateMockData();
    const { error } = await supabase.from('financials').insert(mock);
    if (error) alert("Error: " + error.message);
    else window.location.reload();
  };

  const totalRev = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const latest = data[data.length - 1] || {};
  const margin = latest.revenue ? ((latest.netIncome / latest.revenue) * 100).toFixed(1) : 0;

  const expenseData = [
    { name: 'COGS', value: latest.cogs || 0, color: '#6366f1' },
    { name: 'OpEx', value: latest.opex || 0, color: '#ec4899' },
    { name: 'Net', value: latest.netIncome || 0, color: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900 selection:bg-indigo-100">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <BrainCircuit size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-800">ExFin<span className="text-indigo-600">.ai</span></span>
          </div>

          <div className="px-4 py-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 px-2">Main Menu</p>
            <nav className="space-y-1">
              <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${view === 'dashboard' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                <LayoutDashboard size={18} /> <span>Dashboard</span>
              </button>
              <button onClick={() => setView('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${view === 'analytics' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                <BarChart2 size={18} /> <span>Analytics</span>
              </button>
              <button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${view === 'admin' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                <Lock size={18} /> <span>Admin Portal</span>
              </button>
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-zinc-100">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">JD</div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">John Doe</p>
                  <p className="text-xs text-zinc-500">CFO Access</p>
                </div>
              </div>
              <div className={`text-xs font-semibold flex items-center gap-2 ${source === 'supabase' ? 'text-emerald-600' : 'text-amber-600'}`}>
                <div className={`w-2 h-2 rounded-full ${source === 'supabase' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                {source === 'supabase' ? 'Live Connection' : 'Demo Data'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden text-zinc-500"><Menu size={20} /></button>
            <h1 className="text-lg font-bold text-zinc-800 capitalize">{view} Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input type="text" placeholder="Search metrics..." className="pl-10 pr-4 py-2 bg-zinc-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
            </div>
            <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          {loading ? (
             <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-200 rounded-2xl"></div>)}
                </div>
                <div className="h-96 bg-zinc-200 rounded-2xl"></div>
             </div>
          ) : view === 'dashboard' ? (
            <div className="space-y-6">
              
              {/* Filter Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Financial Performance</h2>
                  <p className="text-zinc-500 text-sm">Real-time overview of key metrics.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={fetchData} className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"><RefreshCw size={18} /></button>
                  <button className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">Last 12 Months <ChevronDown size={14} /></button>
                  <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 shadow-lg shadow-zinc-200">Export Report</button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KPICard title="Total Revenue" value={formatCurrency(totalRev)} trend="up" trendValue="12.4%" icon={DollarSign} color="indigo" className="animate-in fade-in slide-in-from-bottom-4 duration-500" />
                <KPICard title="Net Margin" value={`${margin}%`} trend="up" trendValue="2.1%" icon={Activity} color="emerald" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100" />
                <KPICard title="Cash on Hand" value={formatCurrency(latest.cashOnHand)} trend="down" trendValue="0.4%" icon={Wallet} color="blue" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200" />
                <KPICard title="Total Headcount" value={latest.headcount} trend="up" trendValue="+3" icon={Users} color="violet" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300" />
              </div>

              {/* Charts Area */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 min-h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg">Revenue vs Net Income</h3>
                      <p className="text-xs text-zinc-500">Monthly breakdown for current fiscal year</p>
                    </div>
                    <button className="text-zinc-400 hover:text-zinc-600"><ExternalLink size={16} /></button>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Legend iconType="circle" />
                        <Bar dataKey="revenue" name="Revenue" barSize={30} fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill:'#10b981', strokeWidth:2, stroke:'#fff'}} activeDot={{r: 6}} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                   <h3 className="font-bold text-zinc-900 text-lg mb-2">Cost Distribution</h3>
                   <p className="text-xs text-zinc-500 mb-6">Breakdown of latest month financials</p>
                   <div className="h-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-xs text-zinc-400 font-medium">Profit</p>
                        <p className="text-xl font-bold text-zinc-800">{margin}%</p>
                      </div>
                   </div>
                   <div className="space-y-3 mt-4">
                      {expenseData.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                             <span className="text-zinc-600">{item.name}</span>
                           </div>
                           <span className="font-bold text-zinc-900">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>

              {/* Data Table */}
              <Card noPadding className="overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                  <h3 className="font-bold text-zinc-900 text-lg">Detailed Monthly Ledger</h3>
                  <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100">
                      <tr>
                        <th className="px-6 py-4">Month</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Revenue</th>
                        <th className="px-6 py-4 text-right">Expenses (OpEx)</th>
                        <th className="px-6 py-4 text-right">Net Income</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {[...data].reverse().slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-zinc-700">{row.month} 2024</td>
                          <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle size={12} className="mr-1"/> Audited</span></td>
                          <td className="px-6 py-4 text-right text-zinc-600">{formatCurrency(row.revenue)}</td>
                          <td className="px-6 py-4 text-right text-zinc-600">{formatCurrency(row.opex)}</td>
                          <td className="px-6 py-4 text-right font-bold text-zinc-900">{formatCurrency(row.netIncome)}</td>
                          <td className="px-6 py-4 text-center">
                            <button className="text-zinc-400 hover:text-zinc-600"><MoreHorizontal size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : (
            <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500 pt-10">
                <Card className="text-center p-10">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Database size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">Data Management</h3>
                    <p className="text-zinc-500 mb-8">Manage your Supabase connection and seed initial demo data.</p>
                    
                    <button 
                        onClick={seedDatabase} 
                        disabled={source === 'supabase' || loading} 
                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${source === 'supabase' ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                        {source === 'supabase' ? <Check size={18} /> : <Database size={18} />}
                        {source === 'supabase' ? 'Database Synced' : 'Seed Database with Mock Data'}
                    </button>
                </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;