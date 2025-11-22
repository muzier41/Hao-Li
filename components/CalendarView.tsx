import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, X, AlertCircle } from 'lucide-react';
import { JobEvent, Application, EventType } from '../types';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths, 
    parseISO, 
    isWithinInterval,
    differenceInHours,
    startOfDay,
    endOfDay,
    getDay
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CalendarViewProps {
  events: JobEvent[];
  applications: Application[];
  onEventUpdate: (event: JobEvent) => void;
}

// --- Helper for colors ---
const getEventStyles = (type: EventType, isCompleted: boolean) => {
    if (isCompleted) return {
        bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-300'
    };

    switch (type) {
        case EventType.Interview: 
            return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }; 
        case EventType.TestOrAI: 
            return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
        case EventType.Other:
            return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
        default:
            return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    }
};

// --- Simple Event Edit Modal ---
const SimpleEventModal: React.FC<{
    event: JobEvent | null;
    applicationName: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedEvent: JobEvent) => void;
}> = ({ event, applicationName, isOpen, onClose, onSave }) => {
    const [localStart, setLocalStart] = useState('');
    const [localEnd, setLocalEnd] = useState('');
    
    React.useEffect(() => {
        if (event) {
            setLocalStart(format(parseISO(event.start), "yyyy-MM-dd'T'HH:mm"));
            setLocalEnd(event.end ? format(parseISO(event.end), "yyyy-MM-dd'T'HH:mm") : '');
        }
    }, [event]);

    if (!isOpen || !event) return null;

    const handleSave = () => {
        onSave({ 
            ...event, 
            start: new Date(localStart).toISOString(),
            end: localEnd ? new Date(localEnd).toISOString() : undefined
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl p-5 space-y-4 animate-scale-in">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900">{applicationName}</h3>
                        <p className="text-xs text-gray-500">{event.title}</p>
                    </div>
                    <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={() => onSave({ ...event, isCompleted: !event.isCompleted })}
                        className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors ${
                            event.isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {event.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        {event.isCompleted ? '已完成' : '标记完成'}
                    </button>
                    
                    <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">开始时间</label>
                        <input type="datetime-local" className="w-full bg-gray-50 rounded-lg p-2 text-sm" value={localStart} onChange={e => setLocalStart(e.target.value)} />
                        
                        <label className="text-[10px] font-bold text-gray-400 uppercase">结束时间</label>
                        <input type="datetime-local" className="w-full bg-gray-50 rounded-lg p-2 text-sm" value={localEnd} onChange={e => setLocalEnd(e.target.value)} />
                    </div>
                    
                    <button onClick={handleSave} className="w-full bg-black text-white font-bold py-3 rounded-xl text-sm">保存</button>
                </div>
            </div>
        </div>
    );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ events, applications, onEventUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<JobEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();

  // --- Navigation ---
  const handleNext = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrev = () => setCurrentDate(subMonths(currentDate, 1));
  
  // --- Date Grid Generation ---
  const days = useMemo(() => {
    const startFn = startOfMonth;
    const endFn = endOfMonth;
    const rangeStart = startOfWeek(startFn(currentDate), { weekStartsOn: 1 });
    const rangeEnd = endOfWeek(endFn(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  }, [currentDate]);

  // --- Event Layout Algorithm (Slotting Logic) ---
  const eventSlots = useMemo(() => {
      const viewStart = days[0];
      const viewEnd = days[days.length - 1];

      const visibleEvents = events.filter(e => {
          const start = parseISO(e.start);
          const end = e.end ? parseISO(e.end) : start;
          return (start <= endOfDay(viewEnd) && end >= startOfDay(viewStart));
      });

      // Sort events: Earlier start first, then longer duration
      visibleEvents.sort((a, b) => {
          const startA = parseISO(a.start).getTime();
          const startB = parseISO(b.start).getTime();
          if (startA !== startB) return startA - startB;
          const durA = (a.end ? parseISO(a.end).getTime() : startA) - startA;
          const durB = (b.end ? parseISO(b.end).getTime() : startB) - startB;
          return durB - durA;
      });

      const slots = new Map<string, number>(); 
      const occupiedUntil = new Array(20).fill(0); 

      visibleEvents.forEach(e => {
          const start = parseISO(e.start).getTime();
          const end = e.end ? parseISO(e.end).getTime() : start;
          
          // Find first available row
          let rowIndex = 0;
          while (true) {
              if (occupiedUntil[rowIndex] < start) {
                  slots.set(e.id, rowIndex);
                  occupiedUntil[rowIndex] = end;
                  break;
              }
              rowIndex++;
          }
      });
      
      return { slots, visibleEvents };
  }, [events, days]);

  // --- Render Helpers ---
  const getEventsForDay = (day: Date) => {
      return eventSlots.visibleEvents.filter(e => {
          const start = parseISO(e.start);
          const end = e.end ? parseISO(e.end) : start;
          return isWithinInterval(day, { start: startOfDay(start), end: endOfDay(end) });
      });
  };

  // Urgent list (Next 48 hours)
  const urgentEvents = useMemo(() => {
      const now = new Date();
      return events.filter(e => {
          const start = parseISO(e.start);
          const diff = differenceInHours(start, now);
          return !e.isCompleted && diff >= -2 && diff < 48;
      }).sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
  }, [events]);

  // Selected Date List
  const selectedDayEvents = useMemo(() => {
      const list = getEventsForDay(selectedDate);
      return list.sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
  }, [selectedDate, eventSlots]);

  return (
    <div className="flex flex-col h-[calc(100dvh-160px)] animate-fade-in pb-4 bg-[#F2F2F7] gap-4">
      
      {/* --- Top Section: Agenda (Fixed Height, Scrollable) --- */}
      <div className="h-[35%] flex flex-col bg-white rounded-3xl shadow-ios overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  日程概览
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {isSameDay(selectedDate, today) ? '今天' : format(selectedDate, 'M月d日', { locale: zhCN })}
                  </span>
              </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
               {/* Urgent Alerts */}
              {urgentEvents.length > 0 && (
                  <div className="mb-2">
                      <div className="flex items-center gap-2 mb-2">
                          <AlertCircle size={14} className="text-[#FF3B30]" />
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">急需处理 (48h内)</h3>
                      </div>
                      <div className="space-y-2">
                          {urgentEvents.map(e => {
                              const app = applications.find(a => a.id === e.applicationId);
                              return (
                                  <div key={e.id} onClick={() => { setSelectedEvent(e); setIsModalOpen(true); }} className="bg-red-50 p-3 rounded-xl border border-red-100 flex justify-between items-center active:scale-[0.98] transition-transform cursor-pointer">
                                      <div>
                                          <div className="font-bold text-gray-900 text-sm">{app?.company || '未知公司'} - {e.title}</div>
                                          <div className="text-xs text-[#FF3B30] font-medium mt-0.5 flex items-center gap-1">
                                              <Clock size={10} />
                                              {format(parseISO(e.start), 'MM-dd HH:mm')} 截止
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}

              {/* Selected Day Agenda */}
              <div>
                  <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon size={14} className="text-apple-blue" />
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {format(selectedDate, 'M月d日', { locale: zhCN })} 安排
                      </h3>
                  </div>
                  <div className="space-y-2">
                      {selectedDayEvents.length === 0 ? (
                          <div className="text-center py-6 text-gray-300 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                              <p className="text-xs">当日无安排</p>
                          </div>
                      ) : (
                          selectedDayEvents.map(e => {
                              const app = applications.find(a => a.id === e.applicationId);
                              const styles = getEventStyles(e.type, !!e.isCompleted);
                              const start = parseISO(e.start);
                              const end = e.end ? parseISO(e.end) : start;
                              
                              return (
                                  <div key={e.id} onClick={() => { setSelectedEvent(e); setIsModalOpen(true); }} className="flex items-stretch gap-3 group cursor-pointer">
                                       <div className="flex flex-col items-end min-w-[45px] pt-1">
                                           <span className="text-sm font-bold text-gray-900">{format(start, 'HH:mm')}</span>
                                           <span className="text-[10px] text-gray-400">{e.end ? format(end, 'HH:mm') : '开始'}</span>
                                       </div>
                                       
                                       <div className={`flex-1 p-3 rounded-xl border ${styles.bg} ${styles.border} relative overflow-hidden active:scale-[0.99] transition-transform`}>
                                            <div className="pl-1">
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-sm font-bold ${styles.text}`}>{app?.company || '未知公司'}</span>
                                                    {e.isCompleted && <CheckCircle2 size={14} className="text-green-500" />}
                                                </div>
                                                <div className={`text-xs font-medium mt-0.5 opacity-80 ${styles.text}`}>{e.title}</div>
                                            </div>
                                       </div>
                                  </div>
                              );
                          })
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* --- Bottom Section: Month Grid (Remaining Height) --- */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-ios overflow-hidden min-h-0">
           {/* Month Nav Header */}
           <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-white shrink-0">
                <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={20} /></button>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {format(currentDate, 'yyyy年 M月', { locale: zhCN })}
                </h2>
                <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><ChevronRight size={20} /></button>
           </div>

           {/* Weekday Headers */}
           <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50 shrink-0">
                {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-gray-400">
                        {day}
                    </div>
                ))}
           </div>

           {/* Scrollable Grid */}
           <div className="flex-1 overflow-y-auto overscroll-contain relative">
               {/* Using simple grid with borders, removing gap to allow continuous bars */}
               <div className="grid grid-cols-7 bg-white border-b border-gray-200">
                    {days.map((day, i) => {
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isTodayDay = isSameDay(day, today);
                        const isSelected = isSameDay(day, selectedDate);
                        
                        const dayEvents = getEventsForDay(day);
                        dayEvents.sort((a, b) => (eventSlots.slots.get(a.id) || 0) - (eventSlots.slots.get(b.id) || 0));
                        
                        const maxSlot = Math.max(...dayEvents.map(e => eventSlots.slots.get(e.id) || 0), 0);
                        const renderSlots: (JobEvent | null)[] = [];
                        for(let s = 0; s <= (dayEvents.length > 0 ? maxSlot : -1); s++) {
                            renderSlots[s] = dayEvents.find(e => eventSlots.slots.get(e.id) === s) || null;
                        }
                        
                        const MAX_VISIBLE = 3; 

                        return (
                            <div 
                                key={day.toString()}
                                onClick={() => { setSelectedDate(day); if(!isCurrentMonth) setCurrentDate(day); }}
                                className={`
                                    relative min-h-[90px] flex flex-col transition-colors cursor-pointer border-r border-b border-gray-100
                                    ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : 'bg-white'}
                                    ${isSelected ? 'bg-blue-50/30' : ''}
                                `}
                            >
                                <div className="flex justify-center py-1.5">
                                    <span className={`
                                        text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full
                                        ${isTodayDay ? 'bg-[#FF3B30] text-white' : isSelected ? 'bg-black text-white' : 'text-gray-700'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col w-full relative pb-1">
                                    {renderSlots.slice(0, MAX_VISIBLE).map((event, idx) => {
                                        if (!event) return <div key={`spacer-${idx}`} className="h-5 w-full mb-[1px]" />;
                                        
                                        const app = applications.find(a => a.id === event.applicationId);
                                        const styles = getEventStyles(event.type, !!event.isCompleted);
                                        
                                        const start = parseISO(event.start);
                                        const end = event.end ? parseISO(event.end) : start;

                                        // Continuity Logic
                                        const isStartDay = isSameDay(day, start);
                                        const isEndDay = isSameDay(day, end);
                                        const dayOfWeek = getDay(day); // 0=Sun, 1=Mon
                                        const isStartOfWeek = dayOfWeek === 1;
                                        const isEndOfWeek = dayOfWeek === 0;

                                        // Is visual start/end in this row?
                                        const isVisualStart = isStartDay || isStartOfWeek;
                                        const isVisualEnd = isEndDay || isEndOfWeek;

                                        // Connection Logic (visual)
                                        const hasPrev = !isStartDay && !isStartOfWeek; 
                                        const hasNext = !isEndDay && !isEndOfWeek;

                                        return (
                                            <div 
                                                key={event.id}
                                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setIsModalOpen(true); }}
                                                className={`
                                                    h-5 flex items-center px-1.5 mb-[1px] relative cursor-pointer text-[10px]
                                                    ${styles.bg} ${styles.text} border-y ${styles.border}
                                                    ${hasPrev ? 'ml-[-1px] rounded-l-none border-l-0' : 'ml-1 rounded-l-md border-l'}
                                                    ${hasNext ? 'mr-[-1px] rounded-r-none border-r-0' : 'mr-1 rounded-r-md border-r'}
                                                    hover:brightness-95 transition-all
                                                `}
                                                style={{ zIndex: 1 }}
                                            >
                                                {isVisualStart && (
                                                    <span className="font-bold truncate w-full leading-none">
                                                        {app?.company || '未知'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {renderSlots.length > MAX_VISIBLE && (
                                        <div className="pl-1.5 text-[9px] text-gray-400 font-medium">
                                            +{renderSlots.length - MAX_VISIBLE}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
               </div>
           </div>
      </div>

      <SimpleEventModal 
          event={selectedEvent}
          applicationName={applications.find(a => a.id === selectedEvent?.applicationId)?.company || ''}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(updated) => { onEventUpdate(updated); setIsModalOpen(false); }}
      />
    </div>
  );
};
