import React from 'react';

export const StatCard = ({ title, value, footer }: { title: any; value: any; footer?: any }) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[110px] w-full h-full">
      <div>
        <span className="text-[11px] sm:text-xs font-bold text-slate-500 block uppercase tracking-wider truncate">
          {title}
        </span>
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 block tracking-tight break-words">
          {value}
        </span>
      </div>

      {footer && (
        <span className="text-xs text-slate-500 font-medium mt-2 block truncate">
          {footer}
        </span>
      )}
    </div>
  );
}
