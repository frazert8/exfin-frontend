import React from 'react';
import { formatCurrency } from '../api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] text-white p-4 rounded-xl shadow-xl text-sm border border-[#374151]">
        <p className="font-bold mb-2 text-[#D1D5DB]">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="capitalize text-[#9CA3AF]">{entry.name}:</span>
            <span className="font-mono font-bold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
