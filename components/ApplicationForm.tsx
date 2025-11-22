import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus, CompanyType, JobEvent, EventType } from '../types';
import { classifyCompany } from '../services/geminiService';
import { STATUS_LABELS_CN, COMPANY_TYPE_LABELS_CN, EVENT_TYPE_LABELS_CN, EVENT_TYPE_COLORS } from '../constants';
import { X, Loader2, Sparkles, Trash2, CalendarClock, Plus, Clock, Video, FileText, ArrowRight } from 'lucide-react';
import { format, addHours, addDays, parseISO } from 'date-fns';

interface ApplicationFormProps {
  initialData?: Application;
  existingEvents?: JobEvent[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: Omit<Application, 'id'> & { id?: string }, events: JobEvent[]) => void;
  onDelete?: (id: string) => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ initialData, existingEvents = [], isOpen, onClose, onSave, onDelete }) => {
  // Form Data State
  const [formData, setFormData] = useState<Partial<Application>>({
    company: '',
    position: '',
    applyDate: new Date().toISOString().slice(0, 10),
    status: ApplicationStatus.Applied,
    industry: '',
    companyType: CompanyType.Other,
    note: '',
  });
  
  // Events State
  const [localEvents, setLocalEvents] = useState<JobEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // Duration state for range events (default 3 days)
  const [durationDays, setDurationDays] = useState<number>(3);

  const [newEventData, setNewEventData] = useState<{
    type: EventType;
    title: string;
    start: string;
    end: string;
  }>({
    type: EventType.Interview,
    title: '一面',
    start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
  });

  const [isClassifying, setIsClassifying] = useState(false);

  // Initialize State on Open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData, applyDate: initialData.applyDate.slice(0, 10) });
        setLocalEvents([...existingEvents]); // Load existing events for this app
      } else {
        // Reset for new entry
        setFormData({
          company: '',
          position: '',
          applyDate: new Date().toISOString().slice(0, 10),
          status: ApplicationStatus.Applied,
          industry: '',
          companyType: CompanyType.Other,
          note: '',
        });
        setLocalEvents([]);
      }
      setIsAddingEvent(false);
    }
  }, [initialData, existingEvents, isOpen]);

  const handleAutoClassify = async () => {
    if (!formData.company) return;
    setIsClassifying(true);
    try {
        const result = await classifyCompany(formData.company);
        setFormData(prev => ({
            ...prev,
            industry: result.industry,
            companyType: result.companyType
        }));
    } finally {
        setIsClassifying(false);
    }
  };

  const handleAddEvent = () => {
    const isRange = newEventData.type === EventType.TestOrAI;

    const newEvent: JobEvent = {
      id: Math.random().toString(36).substring(2, 9), // Temp ID
      applicationId: initialData?.id || '', // Will be assigned real ID on save if new
      title: newEventData.title || EVENT_TYPE_LABELS_CN[newEventData.type],
      type: newEventData.type,
      start: new Date(newEventData.start).toISOString(),
      end: isRange ? new Date(newEventData.end).toISOString() : undefined,
    };
    setLocalEvents([...localEvents, newEvent]);
    setIsAddingEvent(false);
    
    // Reset form
    const now = new Date();
    setNewEventData({
      type: EventType.Interview,
      title: '一面',
      start: format(now, "yyyy-MM-dd'T'HH:mm"),
      end: format(addHours(now, 1), "yyyy-MM-dd'T'HH:mm"),
    });
    setDurationDays(3);
  };

  const handleDeleteEvent = (eventId: string) => {
    setLocalEvents(prev => prev.filter(e => e.id !== eventId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm sm:p-4">
      <div className="bg-[#F2F2F7] sm:rounded-3xl rounded-t-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up sm:animate-scale-in max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shrink-0">
            <h3 className="text-lg font-bold text-gray-900">
                {initialData ? '编辑记录' : '新增投递'}
            </h3>
            <button onClick={onClose} className="bg-gray-100 rounded-full p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
            </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Section 1: Basic Info */}
            <div className="bg-white rounded-2xl p-4 space-y-4 shadow-sm">
              {/* Company & AI */}
              <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">公司名称</label>
                  <div className="flex gap-2">
                      <input 
                          type="text" 
                          className="flex-1 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 border-transparent p-3 text-base font-bold text-gray-900 placeholder-gray-400 transition-all"
                          value={formData.company}
                          onChange={e => setFormData({...formData, company: e.target.value})}
                          placeholder="例如：腾讯"
                      />
                      <button 
                          onClick={handleAutoClassify}
                          disabled={isClassifying || !formData.company}
                          className="bg-gray-50 text-apple-purple px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-purple-50 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                      >
                          {isClassifying ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                          <span className="text-xs sm:text-sm">AI 识别</span>
                      </button>
                  </div>
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">岗位名称</label>
                  <input 
                      type="text" 
                      className="w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 border-transparent p-3 text-base font-medium transition-all"
                      value={formData.position}
                      onChange={e => setFormData({...formData, position: e.target.value})}
                      placeholder="例如：产品经理"
                  />
              </div>

              {/* Status & Date Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">投递日期</label>
                    <input 
                        type="date" 
                        className="w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 border-transparent p-2.5 text-sm"
                        value={formData.applyDate}
                        onChange={e => setFormData({...formData, applyDate: e.target.value})}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">当前进度</label>
                    <select 
                        className="w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 border-transparent p-2.5 text-sm font-medium text-blue-600"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as ApplicationStatus})}
                    >
                        {Object.values(ApplicationStatus).map(s => (
                            <option key={s} value={s}>{STATUS_LABELS_CN[s]}</option>
                        ))}
                    </select>
                </div>
              </div>

              {/* Industry & Type Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">所属行业</label>
                    <input 
                        type="text" 
                        className="w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 border-transparent p-2.5 text-sm"
                        value={formData.industry}
                        onChange={e => setFormData({...formData, industry: e.target.value})}
                        placeholder="AI 自动生成"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">企业性质</label>
                    <select 
                        className="w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 border-transparent p-2.5 text-sm"
                        value={formData.companyType}
                        onChange={e => setFormData({...formData, companyType: e.target.value as CompanyType})}
                    >
                        {Object.values(CompanyType).map(t => (
                            <option key={t} value={t}>{COMPANY_TYPE_LABELS_CN[t]}</option>
                        ))}
                    </select>
                </div>
              </div>
            </div>

            {/* Section 2: Schedule (Updated) */}
            <div className="bg-white rounded-2xl p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-gray-900">
                    <CalendarClock size={18} className="text-apple-blue" />
                    <h4 className="font-bold text-sm">招聘日程</h4>
                 </div>
                 {!isAddingEvent && (
                    <button 
                        onClick={() => setIsAddingEvent(true)}
                        className="text-xs font-medium text-apple-blue bg-blue-50 px-2.5 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        + 添加日程
                    </button>
                 )}
              </div>
              
              {/* Event List */}
              <div className="space-y-2">
                  {localEvents.length === 0 && !isAddingEvent && (
                      <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          暂无面试或笔试安排
                      </div>
                  )}
                  
                  {localEvents.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(event => (
                      <div key={event.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
                                style={{ backgroundColor: EVENT_TYPE_COLORS[event.type] }}
                              >
                                  {event.type === EventType.TestOrAI ? '测' : '面'}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-gray-900">{event.title}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                     <Clock size={10} />
                                     {format(new Date(event.start), 'MM月dd日 HH:mm')}
                                     {event.end && (
                                         <>
                                            <span className="text-gray-300">-</span>
                                            {format(new Date(event.end), 'HH:mm')}
                                         </>
                                     )}
                                  </div>
                              </div>
                          </div>
                          <button 
                             onClick={() => handleDeleteEvent(event.id)}
                             className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
              </div>

              {/* Add Event Form */}
              {isAddingEvent && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-fade-in space-y-4">
                      
                      {/* Type Toggle */}
                      <div>
                        <div className="text-xs font-bold text-gray-500 mb-1.5">日程类型</div>
                        <div className="flex p-1 bg-gray-200/50 rounded-lg">
                            <button
                                onClick={() => setNewEventData({...newEventData, type: EventType.Interview, title: '一面', end: ''})}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                    newEventData.type === EventType.Interview
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                面试
                            </button>
                            <button
                                onClick={() => {
                                    const end = format(addDays(new Date(newEventData.start), durationDays), "yyyy-MM-dd'T'HH:mm");
                                    setNewEventData({...newEventData, type: EventType.TestOrAI, title: '笔试', end});
                                }}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                    newEventData.type === EventType.TestOrAI
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                测试/AI面试
                            </button>
                        </div>
                      </div>

                      {/* Title Input */}
                      <div>
                         <div className="text-xs font-bold text-gray-500 mb-1">标题</div>
                         <input 
                            type="text"
                            className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white"
                            value={newEventData.title}
                            onChange={e => setNewEventData({...newEventData, title: e.target.value})}
                            placeholder="例如：一面、笔试、AI初面"
                         />
                      </div>
                      
                      {/* Time Inputs */}
                      <div className="flex flex-col gap-3">
                          <div>
                             <div className="text-xs font-bold text-gray-500 mb-1">开始时间</div>
                             <input 
                                type="datetime-local"
                                className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white"
                                value={newEventData.start}
                                onChange={e => {
                                    const newStart = e.target.value;
                                    // If range, update end time based on existing duration days
                                    if (newEventData.type === EventType.TestOrAI) {
                                        const newEnd = format(addDays(parseISO(newStart), durationDays), "yyyy-MM-dd'T'HH:mm");
                                        setNewEventData({...newEventData, start: newStart, end: newEnd})
                                    } else {
                                        setNewEventData({...newEventData, start: newStart})
                                    }
                                }}
                             />
                          </div>
                          
                          {newEventData.type === EventType.TestOrAI && (
                              <div className="animate-fade-in">
                                 <div className="text-xs font-bold text-gray-500 mb-1">持续天数</div>
                                 <div className="relative">
                                    <input 
                                        type="number"
                                        min="1"
                                        className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white"
                                        value={durationDays}
                                        onChange={e => {
                                            const days = parseInt(e.target.value) || 1;
                                            setDurationDays(days);
                                            // Update End Date
                                            const newEnd = format(addDays(parseISO(newEventData.start), days), "yyyy-MM-dd'T'HH:mm");
                                            setNewEventData({...newEventData, end: newEnd});
                                        }}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold pointer-events-none">天</span>
                                 </div>
                                 <div className="text-[10px] text-gray-400 mt-1 text-right">
                                     截止于: {format(parseISO(newEventData.end), 'MM月dd日 HH:mm')}
                                 </div>
                              </div>
                          )}
                      </div>

                      <div className="flex gap-2 pt-2">
                          <button 
                             onClick={() => setIsAddingEvent(false)}
                             className="flex-1 py-2 bg-white text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                          >
                             取消
                          </button>
                          <button 
                             onClick={handleAddEvent}
                             className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                          >
                             确认添加
                          </button>
                      </div>
                  </div>
              )}
            </div>

            {/* Section 3: Note */}
             <div className="bg-white rounded-2xl p-4 space-y-2 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">备注</label>
                <textarea 
                    className="w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 border-transparent p-3 text-sm h-24 resize-none transition-all"
                    value={formData.note}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                    placeholder="记录面试复盘、内推码等..."
                />
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 pb-8 sm:pb-4">
            {initialData && onDelete ? (
                <button 
                    onClick={() => { onDelete(initialData.id); onClose(); }}
                    className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                    <Trash2 size={20} />
                </button>
            ) : <div></div>}
            
            <div className="flex gap-3">
                <button onClick={onClose} className="px-6 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                    取消
                </button>
                <button 
                    onClick={() => {
                        if (formData.company && formData.position) {
                            onSave(formData as any, localEvents);
                        }
                    }}
                    className="px-8 py-3 text-sm font-bold text-white bg-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    保存
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};