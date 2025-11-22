import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { Application, ApplicationStatus, DashboardStats } from '../types';
import { COMPANY_TYPE_LABELS_CN } from '../constants';
import { format, startOfWeek, addDays, parseISO, differenceInDays, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import { X, Target, Briefcase, CheckCircle2, Trophy, Edit2, ChevronDown } from 'lucide-react';

interface DashboardProps {
  applications: Application[];
}

type GoalPeriod = 'daily' | 'weekly' | 'monthly';

// Component for the Details Modal
const StatsDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: Application[];
    colorClass: string;
}> = ({ isOpen, onClose, title, data, colorClass }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="bg-gray-100 rounded-full p-1.5 text-gray-500 hover:bg-gray-200">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                    {data.length === 0 ? (
                        <p className="text-gray-400 text-center text-sm py-4">暂无数据</p>
                    ) : (
                        data.map(app => (
                            <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">{app.company}</div>
                                    <div className="text-xs text-gray-500">{app.position}</div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold bg-white shadow-sm ${colorClass}`}>
                                    {app.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ applications }) => {
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; title: string; data: Application[]; color: string }>({
      isOpen: false,
      title: '',
      data: [],
      color: ''
  });

  // Goal State
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriod>('daily');
  const [goalTargets, setGoalTargets] = useState({
      daily: 5,
      weekly: 20,
      monthly: 50
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(5);

  // Load goals from localStorage
  useEffect(() => {
      const savedGoals = localStorage.getItem('career_track_goals');
      if (savedGoals) {
          try {
              setGoalTargets(JSON.parse(savedGoals));
          } catch (e) {}
      }
  }, []);

  // Save goals
  const saveGoal = () => {
      const newTargets = { ...goalTargets, [goalPeriod]: tempGoal };
      setGoalTargets(newTargets);
      localStorage.setItem('career_track_goals', JSON.stringify(newTargets));
      setIsEditingGoal(false);
  };

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

  // Goal Calculation
  const currentCount = useMemo(() => {
      const today = new Date();
      return applications.filter(a => {
          const d = parseISO(a.applyDate);
          if (goalPeriod === 'daily') return isSameDay(d, today);
          if (goalPeriod === 'weekly') return isSameWeek(d, today, { weekStartsOn: 1 });
          if (goalPeriod === 'monthly') return isSameMonth(d, today);
          return false;
      }).length;
  }, [applications, goalPeriod]);

  const currentTarget = goalTargets[goalPeriod];
  const goalPercentage = Math.min((currentCount / currentTarget) * 100, 100);

  const openModal = (type: 'active' | 'offer') => {
      if (type === 'active') {
          setDetailModal({
              isOpen: true,
              title: '进行中的投递',
              data: applications.filter(a => a.status !== ApplicationStatus.Rejected && a.status !== ApplicationStatus.Offer && a.status !== ApplicationStatus.Applied),
              color: 'text-apple-blue'
          });
      } else {
          setDetailModal({
              isOpen: true,
              title: '收获 Offer',
              data: applications.filter(a => a.status === ApplicationStatus.Offer),
              color: 'text-apple-green'
          });
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">数据看板</h1>
      </div>

      {/* Enhanced Goal Card */}
      <div className="bg-white rounded-3xl p-5 shadow-ios relative">
          <div className="flex items-start justify-between mb-4">
               <div>
                   <div className="flex items-center gap-2 text-apple-red mb-1">
                       <Target size={18} />
                       <span className="text-xs font-bold uppercase tracking-wide">投递目标</span>
                   </div>
                   {/* Toggle Period */}
                   <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit mt-2">
                        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => { setGoalPeriod(p); setIsEditingGoal(false); }}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                                    goalPeriod === p ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {p === 'daily' ? '日' : p === 'weekly' ? '周' : '月'}
                            </button>
                        ))}
                   </div>
               </div>
               
               {/* Chart */}
               <div className="w-24 h-24 relative shrink-0 -mr-2 -mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                            <Pie
                                data={[{ value: goalPercentage }, { value: 100 - goalPercentage }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={32}
                                outerRadius={42}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="#FF3B30" />
                                <Cell fill="#F2F2F7" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center text-apple-red font-bold text-sm">
                        {Math.round(goalPercentage)}%
                    </div>
               </div>
          </div>

          <div className="flex items-end gap-2">
              {isEditingGoal ? (
                  <div className="flex items-center gap-2 animate-fade-in">
                      <input 
                        type="number" 
                        className="w-20 text-3xl font-bold border-b-2 border-gray-200 focus:border-apple-red outline-none p-0 bg-transparent"
                        value={tempGoal}
                        onChange={e => setTempGoal(Number(e.target.value))}
                        autoFocus
                      />
                      <button onClick={saveGoal} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold">确认</button>
                  </div>
              ) : (
                  <div className="flex items-baseline gap-1 group cursor-pointer" onClick={() => { setTempGoal(currentTarget); setIsEditingGoal(true); }}>
                      <div className="text-4xl font-bold text-gray-900">{currentCount}</div>
                      <div className="text-lg text-gray-400 font-medium flex items-center gap-1">
                          / {currentTarget} 
                          <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                  </div>
              )}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
             {currentCount >= currentTarget ? "太棒了！目标达成 🎉" : "继续加油，再接再厉！"}
          </p>
      </div>

      {/* Top Stats Cards (Clickable) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-ios flex flex-col items-center justify-center text-center h-28 border border-transparent transition-all">
            <Briefcase size={20} className="text-gray-400 mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{stats.total}</div>
            <span className="text-[10px] font-medium text-gray-500">总投递</span>
        </div>
        <div 
            onClick={() => openModal('active')}
            className="bg-white rounded-2xl p-4 shadow-ios flex flex-col items-center justify-center text-center h-28 border border-transparent active:scale-95 hover:border-blue-100 transition-all cursor-pointer"
        >
            <CheckCircle2 size={20} className="text-apple-blue mb-2" />
            <div className="text-2xl font-bold text-apple-blue">
                {applications.filter(a => a.status !== ApplicationStatus.Rejected && a.status !== ApplicationStatus.Offer && a.status !== ApplicationStatus.Applied).length}
            </div>
            <span className="text-[10px] font-medium text-gray-500">进行中</span>
        </div>
        <div 
            onClick={() => openModal('offer')}
            className="bg-white rounded-2xl p-4 shadow-ios flex flex-col items-center justify-center text-center h-28 border border-transparent active:scale-95 hover:border-green-100 transition-all cursor-pointer"
        >
            <Trophy size={20} className="text-apple-green mb-2" />
            <div className="text-2xl font-bold text-apple-green">
                {applications.filter(a => a.status === ApplicationStatus.Offer).length}
            </div>
            <span className="text-[10px] font-medium text-gray-500">Offer</span>
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

      <StatsDetailModal 
        isOpen={detailModal.isOpen} 
        onClose={() => setDetailModal(prev => ({...prev, isOpen: false}))} 
        title={detailModal.title}
        data={detailModal.data}
        colorClass={detailModal.color}
      />
    </div>
  );
};