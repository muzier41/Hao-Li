import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { Application, ApplicationStatus, CompanyType, DashboardStats } from '../types';
import { STATUS_COLORS, COMPANY_TYPE_COLORS, COMPANY_TYPE_LABELS_CN, STATUS_LABELS_CN } from '../constants';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import addDays from 'date-fns/addDays';
import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';

interface DashboardProps {
  applications: Application[];
}

export const Dashboard: React.FC<DashboardProps> = ({ applications }) => {
  const stats: DashboardStats = useMemo(() => {
    const total = applications.length;

    // Industry
    const indMap: Record<string, number> = {};
    applications.forEach(a => {
      indMap[a.industry] = (indMap[a.industry] || 0) + 1;
    });
    const byIndustry = Object.keys(indMap).map(name => ({ name, value: indMap[name] }));

    // Type
    const typeMap: Record<string, number> = {};
    applications.forEach(a => {
      const label = COMPANY_TYPE_LABELS_CN[a.companyType];
      typeMap[label] = (typeMap[label] || 0) + 1;
    });
    const byType = Object.keys(typeMap).map(name => ({ name, value: typeMap[name] }));

    // Funnel
    const funnel = [
      { name: '已投递', value: applications.length },
      { name: '笔/面试', value: applications.filter(a => a.status !== ApplicationStatus.Applied && a.status !== ApplicationStatus.Rejected).length },
      { name: 'Offer', value: applications.filter(a => a.status === ApplicationStatus.Offer).length },
    ];

    // Trend (Last 4 weeks)
    const trendMap: Record<string, number> = {};
    const today = new Date();
    for(let i=0; i<28; i++) {
        const d = addDays(today, -i);
        const key = format(startOfWeek(d, { weekStartsOn: 1 }), 'MM/dd');
        trendMap[key] = 0; // Init
    }
    applications.forEach(a => {
        const d = parseISO(a.applyDate);
        if (differenceInDays(today, d) < 28) {
            const key = format(startOfWeek(d, { weekStartsOn: 1 }), 'MM/dd');
            if (trendMap[key] !== undefined) trendMap[key]++;
        }
    });
    
    const trend = Object.keys(trendMap).reverse().map(name => ({ name, value: trendMap[name] }));

    return { total, byIndustry, byType, funnel, trend };
  }, [applications]);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 pt-2">数据看板</h1>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-ios flex flex-col items-center justify-center text-center h-28">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <span className="text-xs font-medium text-gray-500">总投递</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-ios flex flex-col items-center justify-center text-center h-28">
            <div className="text-3xl font-bold text-apple-blue">
                {applications.filter(a => a.status !== ApplicationStatus.Rejected && a.status !== ApplicationStatus.Offer).length}
            </div>
            <span className="text-xs font-medium text-gray-500">进行中</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-ios flex flex-col items-center justify-center text-center h-28">
            <div className="text-3xl font-bold text-apple-green">
                {applications.filter(a => a.status === ApplicationStatus.Offer).length}
            </div>
            <span className="text-xs font-medium text-gray-500">Offer</span>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-3xl p-6 shadow-ios">
           <h3 className="text-md font-bold mb-6 text-gray-900">每周投递趋势</h3>
           <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.trend}>
                      <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#AF52DE" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#AF52DE" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 10}} dy={10} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="value" stroke="#AF52DE" strokeWidth={3} fill="url(#colorValue)" />
                  </AreaChart>
              </ResponsiveContainer>
           </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Industry Distribution */}
          <div className="bg-white rounded-3xl p-6 shadow-ios">
            <h3 className="text-md font-bold mb-6 text-gray-900">行业分布</h3>
            <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats.byIndustry}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {stats.byIndustry.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={[ '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30' ][index % 5]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-300 opacity-20">Industry</span>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {stats.byIndustry.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: [ '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30' ][index % 5] }} />
                        {entry.name}
                    </div>
                ))}
            </div>
          </div>

          {/* Company Type */}
          <div className="bg-white rounded-3xl p-6 shadow-ios">
            <h3 className="text-md font-bold mb-6 text-gray-900">企业类型</h3>
            <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byType} layout="vertical" margin={{left: 10}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F2F2F7" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 11}} width={50} />
                        <Tooltip cursor={{fill: '#F2F2F7', radius: 4}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                             {stats.byType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#007AFF" />
                             ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
      </div>
    </div>
  );
};