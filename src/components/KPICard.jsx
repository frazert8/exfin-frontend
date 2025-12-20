import React from 'react';
import Card from './Card';
import { ArrowUpRight, TrendingUp, DollarSign, Activity, Wallet, Users } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
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

export default KPICard;
