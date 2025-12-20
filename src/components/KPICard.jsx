import React from 'react';

const KPICard = ({ title, value, trend, icon, color }) => {
  const colors = {
    indigo: "bg-[#E0E7FF] text-[#4F46E5]",
    emerald: "bg-[#D1FAE5] text-[#059669]", 
    blue: "bg-[#DBEAFE] text-[#2563EB]",
    amber: "bg-[#FEF3C7] text-[#D97706]"
  };

  const arrowIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  );

  return (
    <div className="bg-[#FFFFFF] rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors[color] || colors.indigo}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-[#D1FAE5] text-[#047857]">
            {arrowIcon}
            <span className="ml-1">{trend}</span>
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
