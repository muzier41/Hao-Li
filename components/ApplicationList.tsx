import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../types';
import { STATUS_COLORS, COMPANY_TYPE_COLORS, STATUS_LABELS_CN, COMPANY_TYPE_LABELS_CN } from '../constants';
import { Search, Plus, ChevronRight, Filter, MoreHorizontal } from 'lucide-react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import zhCN from 'date-fns/locale/zh-CN';

interface ApplicationListProps {
  applications: Application[];
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({ applications, onEdit, onDelete, onNew }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All');

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(search.toLowerCase()) || app.position.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">秋招进度</h1>
          <p className="text-gray-500 text-sm mt-1">已投递 {applications.length} 个岗位</p>
        </div>
        <button 
            onClick={onNew}
            className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 hover:bg-gray-800 transition-all active:scale-95"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 sticky top-0 z-10 bg-[#F2F2F7]/95 backdrop-blur-sm py-2">
        <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
                type="text" 
                placeholder="搜索公司或岗位..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 shadow-sm border border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <div className="relative">
             <select 
                className="appearance-none bg-white pl-4 pr-9 py-2.5 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none border border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
             >
                <option value="All">全部状态</option>
                {Object.values(ApplicationStatus).map(s => (
                    <option key={s} value={s}>{STATUS_LABELS_CN[s]}</option>
                ))}
             </select>
             <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Application Cards List */}
      <div className="space-y-3">
        {filteredApps.map(app => (
            <div 
                key={app.id} 
                onClick={() => onEdit(app)}
                className="bg-white p-4 rounded-2xl shadow-ios active:scale-[0.99] transition-transform cursor-pointer flex items-center justify-between group border border-transparent hover:border-blue-500/10"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 truncate text-lg">{app.company}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                            {COMPANY_TYPE_LABELS_CN[app.companyType]}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 truncate mb-2">{app.position}</div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                            {app.industry}
                        </span>
                        <span>
                            {format(parseISO(app.applyDate), 'M月d日', { locale: zhCN })}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-4">
                    <span 
                        className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                        style={{ backgroundColor: `${STATUS_COLORS[app.status]}15`, color: STATUS_COLORS[app.status] }}
                    >
                        {STATUS_LABELS_CN[app.status]}
                    </span>
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
            </div>
        ))}

        {filteredApps.length === 0 && (
            <div className="text-center py-16">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">没有找到相关记录</h3>
                <p className="text-gray-500 text-sm mt-1">尝试调整搜索词或筛选条件</p>
            </div>
        )}
      </div>
    </div>
  );
};