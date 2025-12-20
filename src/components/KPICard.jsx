import React from 'react';
import { ArrowUp } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const KPICard = ({ title, value, trend, icon: Icon, color, trendColor = 'green' }) => {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600", 
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600"
  };

  const trendColors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors[color] || colors.indigo}`}>
          <Icon className="text-xl" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trendColors[trendColor]}`}>
            <ArrowUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default KPICard;