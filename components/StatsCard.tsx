'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  accentColor?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  bgColor = 'bg-slate-900', // stronger fill
  accentColor = 'from-purple-500 to-blue-500',
}: StatsCardProps) {
  return (
    <div
      className={`
        ${bgColor}
        rounded-xl
        p-6
        shadow-lg
        hover:shadow-2xl
        transition-all
        hover:-translate-y-1
      `}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className={`p-4 rounded-lg bg-gradient-to-br ${accentColor} text-white shadow-md`}
        >
          {icon}
        </div>
      </div>

      <h3 className="text-slate-300 text-sm font-medium mb-1">{title}</h3>

      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-white">{value}</p>

        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
          >
            {trend.isPositive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {trend && (
        <p
          className={`text-xs mt-2 ${trend.isPositive ? 'text-green-400/70' : 'text-red-400/70'
            }`}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% this month
        </p>
      )}
    </div>
  );
}