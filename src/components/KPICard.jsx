import React from 'react';
import { ArrowUp } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const KPICard = ({ title, value, trend, icon: Icon, color, trendColor = 'green' }) => {
  const colors = {
    indigo: "bg-[#E0E7FF] text-[#4F46E5]",
    emerald: "bg-[#D1FAE5] text-[#059669]", 
    blue: "bg-[#DBEAFE] text-[#2563EB]",
    amber: "bg-[#FEF3C7] text-[#D97706]"
  };

  const trendColors = {
    green: "bg-[#D1FAE5] text-[#047857]",
    red: "bg-[#FEE2E2] text-[#B91C1C]",
  };

  return (
    <div className="bg-[#FFFFFF] rounded-xl shadow-sm p-6">
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
        <p className="text-sm font-bold text-[#6B7280] uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-[#1F2937] mt-1">{value}</p>
      </div>
    </div>
  );
};

export default KPICard;
