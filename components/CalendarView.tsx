import React, { useState, useMemo, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Clock, CheckCircle2, Circle, X, AlertCircle } from 'lucide-react';
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
    addWeeks,
    subWeeks,
    parseISO, 
    isWithinInterval,
    differenceInHours,
    addDays,
    differenceInCalendarDays,
    startOfDay,
    endOfDay,
    isBefore,
    isAfter
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CalendarViewProps {
  events: JobEvent[];
  applications: Application[];
  onEventUpdate: (event: JobEvent) => void;
}

// --- Helper for colors based on the reference image style ---
const getEventStyles = (type: EventType, isCompleted: boolean) => {
    if (isCompleted) return {
        bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-400', stripe: 'bg-gray-300'
    };

    switch (type) {
        case EventType.Interview: // Blue/Pinkish in ref? Let's map to Reference "Red/Pink" style for high priority or Interview
            return { bg: 'bg-[#FFEBEE]', border: 'border-[#FF3B30]', text: 'text-[#C62828]', stripe: 'bg-[#FF3B30]' }; 
        case EventType.TestOrAI: // Yellowish in ref
            return { bg: 'bg-[#FFF8E1]', border: 'border-[#FFB300]', text: 'text-[#F57F17]', stripe: 'bg-[#FFB300]' };
        case EventType.Other: // Greenish in ref
            return { bg: 'bg-[#E8F5E9]', border: 'border-[#43A047]', text: 'text-[#2E7D32]', stripe: 'bg-[#43A047]' };
        default:
            return { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', stripe: 'bg-blue-500' };
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
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week'); 
  const [selectedEvent, setSelectedEvent] = useState<JobEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Touch handling
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const today = new Date();

  // --- Navigation ---
  const handleNext = () => setViewMode('week') ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addMonths(currentDate, 1));
  const handlePrev = () => setViewMode('week') ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(subMonths(currentDate, 1));
  
  const onTouchStart = (e: React.TouchEvent) => { touchEnd.current = null; touchStart.current = e.targetTouches[0].clientY; };
  const onTouchMove = (e: React.TouchEvent) => { touchEnd.current = e.targetTouches[0].clientY; };
  const onTouchEnd = () => {
      if (!touchStart.current || !touchEnd.current) return;
      const distance = touchStart.current - touchEnd.current;
      if (Math.abs(distance) > 50) { // Vertical swipe to switch views? Or horizontal?
          // Keep simple for now, vertical swipe could toggle month/week but might conflict with scroll
      }
  };

  // --- Date Grid Generation ---
  const days = useMemo(() => {
    const startFn = viewMode === 'month' ? startOfMonth : startOfWeek;
    const endFn = viewMode === 'month' ? endOfMonth : endOfWeek;
    const rangeStart = startOfWeek(startFn(currentDate), { weekStartsOn: 1 });
    const rangeEnd = endOfWeek(endFn(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  }, [currentDate, viewMode]);

  // --- Event Layout Algorithm (The "Tetris" / Slotting Logic) ---
  // We assign a "row index" to each event so they align horizontally across days
  const eventSlots = useMemo(() => {
      const viewStart = days[0];
      const viewEnd = days[days.length - 1];

      // 1. Filter events relevant to this view
      const visibleEvents = events.filter(e => {
          const start = parseISO(e.start);
          const end = e.end ? parseISO(e.end) : start;
          return (start <= endOfDay(viewEnd) && end >= startOfDay(viewStart));
      });

      // 2. Sort events: Earlier start first, then Longer duration first
      visibleEvents.sort((a, b) => {
          const startA = parseISO(a.start).getTime();
          const startB = parseISO(b.start).getTime();
          if (startA !== startB) return startA - startB;
          
          const durA = (a.end ? parseISO(a.end).getTime() : startA) - startA;
          const durB = (b.end ? parseISO(b.end).getTime() : startB) - startB;
          return durB - durA; // Descending duration
      });

      // 3. Assign Rows
      const slots = new Map<string, number>(); // eventId -> rowIndex
      const occupiedUntil = new Array(20).fill(0); // rowIndex -> timestamp(end)

      visibleEvents.forEach(e => {
          const start = parseISO(e.start).getTime();
          const end = e.end ? parseISO(e.end).getTime() : start;
          
          // Find first available row
          let rowIndex = 0;
          while (true) {
              // Check if this row is free for this event's timeframe
              // Simple greedy: valid if row's last event ended before this one starts
              // Note: This simple check works because we sorted by start time.
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

  // Urgent list for the bottom panel
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
    <div className="flex flex-col h-full animate-fade-in pb-24 bg-[#F2F2F7]">
      
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-2 px-2 shrink-0 bg-[#F2F2F7] z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsModalOpen(false)}>
             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {format(currentDate, 'yyyy年 M月', { locale: zhCN })}
             </h2>
             <ChevronDown size={20} className="text-gray-400" />
        </div>
        <div className="flex bg-gray-200/80 p-0.5 rounded-lg">
             <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>周</button>
             <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>月</button>
        </div>
      </div>

      {/* Top Panel: Agenda & Urgent (Now above Calendar) */}
      <div className="flex-1 px-4 pt-2 overflow-y-auto pb-4">
          
          {/* Urgent Alerts */}
          {urgentEvents.length > 0 && (
              <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={14} className="text-[#FF3B30]" />
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">急需处理</h3>
                  </div>
                  <div className="space-y-2">
                      {urgentEvents.map(e => {
                          const app = applications.find(a => a.id === e.applicationId);
                          return (
                              <div key={e.id} onClick={() => { setSelectedEvent(e); setIsModalOpen(true); }} className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-[#FF3B30] flex justify-between items-center active:scale-[0.98] transition-transform">
                                  <div>
                                      <div className="font-bold text-gray-900 text-sm">{app?.company} - {e.title}</div>
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
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  {isSameDay(selectedDate, today) ? '今天' : format(selectedDate, 'M月d日', { locale: zhCN })}
                  <span className="text-sm font-normal text-gray-400">{format(selectedDate, 'EEEE', { locale: zhCN })}</span>
              </h3>
              
              <div className="space-y-3">
                  {selectedDayEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                          <CalendarIcon size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-xs">暂无安排</p>
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
                                   
                                   <div className={`flex-1 p-3 rounded-xl border ${styles.bg} ${styles.border} bg-opacity-50 border-opacity-30 mb-2 relative overflow-hidden active:scale-[0.99] transition-transform`}>
                                        {/* Color Stripe */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.stripe}`}></div>
                                        
                                        <div className="pl-2">
                                            <div className="flex justify-between items-start">
                                                <span className={`text-sm font-bold ${styles.text}`}>{app?.company}</span>
                                                {e.isCompleted && <CheckCircle2 size={14} className="text-green-500" />}
                                            </div>
                                            <div className={`text-xs font-medium mt-0.5 opacity-80 ${styles.text}`}>{e.title}</div>
                                            {differenceInCalendarDays(end, start) > 0 && (
                                                <div className="mt-1 text-[10px] bg-white/50 px-1.5 py-0.5 rounded inline-block">
                                                    持续至 {format(end, 'MM-dd')}
                                                </div>
                                            )}
                                        </div>
                                   </div>
                              </div>
                          );
                      })
                  )}
              </div>
          </div>
      </div>

      {/* Calendar Grid Container (Now at Bottom) */}
      <div className="bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-gray-200 overflow-hidden shrink-0 z-10 relative">
           {/* Weekday Headers */}
           <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-gray-500">
                        {day}
                    </div>
                ))}
           </div>

           {/* Days Grid */}
           <div className="grid grid-cols-7 bg-gray-200 gap-px">
                {days.map((day, i) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDay = isSameDay(day, today);
                    const isSelected = isSameDay(day, selectedDate);
                    
                    // Events on this day
                    const dayEvents = getEventsForDay(day);
                    // Sort by assigned slot index to ensure vertical alignment
                    dayEvents.sort((a, b) => (eventSlots.slots.get(a.id) || 0) - (eventSlots.slots.get(b.id) || 0));
                    
                    // Calculate max slots to render spacers
                    const maxSlot = Math.max(...dayEvents.map(e => eventSlots.slots.get(e.id) || 0), 0);
                    
                    // Create render array with holes
                    const renderSlots: (JobEvent | null)[] = [];
                    for(let s = 0; s <= (dayEvents.length > 0 ? maxSlot : -1); s++) {
                        renderSlots[s] = dayEvents.find(e => eventSlots.slots.get(e.id) === s) || null;
                    }
                    
                    // Limit visual rows (e.g. max 3 visible rows + 1 "+more")
                    const MAX_VISIBLE = 4;

                    return (
                        <div 
                            key={day.toString()}
                            onClick={() => { setSelectedDate(day); if(!isCurrentMonth) setCurrentDate(day); }}
                            className={`
                                relative min-h-[85px] bg-white flex flex-col p-1 transition-colors cursor-pointer
                                ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''}
                                ${isSelected ? 'bg-blue-50/30' : ''}
                            `}
                        >
                            {/* Date Header */}
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-[9px] font-medium opacity-60">
                                    {i < 7 && format(day, 'EEE', {locale: zhCN})} {/* Show weekday only on first row if needed, or just decorative */}
                                </span>
                                <span className={`
                                    text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
                                    ${isTodayDay ? 'bg-[#FF3B30] text-white' : isSelected ? 'bg-black text-white' : 'text-gray-900'}
                                `}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Events Stack */}
                            <div className="flex-1 flex flex-col gap-[2px] w-full relative">
                                {renderSlots.slice(0, MAX_VISIBLE).map((event, idx) => {
                                    if (!event) return <div key={`spacer-${idx}`} className="h-5 w-full" />; // Spacer to keep alignment

                                    const app = applications.find(a => a.id === event.applicationId);
                                    const styles = getEventStyles(event.type, !!event.isCompleted);
                                    
                                    const start = parseISO(event.start);
                                    const end = event.end ? parseISO(event.end) : start;
                                    
                                    // Visual Merging Logic
                                    const isStart = isSameDay(day, start);
                                    const isEnd = isSameDay(day, end);
                                    const isMiddle = !isStart && !isEnd;

                                    return (
                                        <div 
                                            key={event.id}
                                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setIsModalOpen(true); }}
                                            className={`
                                                h-5 text-[9px] flex items-center relative overflow-hidden cursor-pointer transition-opacity hover:opacity-80
                                                ${styles.bg} ${styles.text}
                                                ${isStart ? 'rounded-l-[4px] border-l-[3px]' : 'rounded-l-none -ml-[5px] border-l-0'} 
                                                ${isEnd ? 'rounded-r-[4px]' : 'rounded-r-none -mr-[5px]'}
                                                ${styles.border}
                                            `}
                                            style={{ 
                                                zIndex: 10,
                                                width: isEnd && !isStart ? 'calc(100% + 5px)' : isMiddle ? 'calc(100% + 10px)' : '100%' 
                                            }}
                                        >
                                            {/* Text only shown on start day or if it's the first day of the week (optional, simplified here) */}
                                            {(isStart || isSameDay(day, days[0])) && (
                                                <span className="pl-1 truncate font-bold leading-tight block w-full">
                                                    {app?.company}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Overflow indicator */}
                                {renderSlots.length > MAX_VISIBLE && (
                                    <div className="text-[9px] text-gray-400 font-medium pl-1">
                                        +{renderSlots.length - MAX_VISIBLE} 更多
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
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