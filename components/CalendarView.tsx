import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JobEvent, EventType, Application } from '../types';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS_CN } from '../constants';
import format from 'date-fns/format';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isSameMonth from 'date-fns/isSameMonth';
import isSameDay from 'date-fns/isSameDay';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import parseISO from 'date-fns/parseISO';
import isWithinInterval from 'date-fns/isWithinInterval';
import zhCN from 'date-fns/locale/zh-CN';

interface CalendarViewProps {
  events: JobEvent[];
  applications: Application[];
  onEventClick: (event: JobEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, applications, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const start = parseISO(event.start);
      const end = event.end ? parseISO(event.end) : start;
      return isSameDay(day, start) || (event.end && isWithinInterval(day, { start, end }));
    });
  };

  // Get upcoming events
  const upcomingEvents = useMemo(() => {
      return events
        .filter(e => {
             const end = e.end ? parseISO(e.end) : parseISO(e.start);
             return end >= new Date(new Date().setHours(0,0,0,0));
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5);
  }, [events]);

  return (
    <div className="h-full flex flex-col animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-6 pt-2">
        <h2 className="text-3xl font-bold text-gray-900">
            {format(currentDate, 'yyyy年 M月', { locale: zhCN })}
        </h2>
        <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full p-1 shadow-sm border border-gray-200/50">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                今天
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRight size={20} className="text-gray-600" />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-ios overflow-hidden flex flex-col h-[420px]">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
            {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-medium text-gray-400">
                    周{day}
                </div>
            ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
            {days.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, today);
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                    <div 
                        key={day.toString()} 
                        className={`
                            p-1 border-b border-r border-gray-50 relative flex flex-col items-center pt-2
                            ${!isCurrentMonth ? 'bg-gray-50/40 text-gray-300' : 'text-gray-900'}
                        `}
                    >
                        <span className={`
                            text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1
                            ${isToday ? 'bg-apple-red text-white shadow-md' : ''}
                        `}>
                            {format(day, 'd')}
                        </span>
                        
                        <div className="flex flex-col gap-1 w-full px-1">
                            {dayEvents.slice(0, 3).map((event) => (
                                <div
                                    key={event.id}
                                    className="h-1.5 w-full rounded-full opacity-90"
                                    style={{ backgroundColor: EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.Other }}
                                />
                            ))}
                            {dayEvents.length > 3 && (
                                <span className="text-[8px] text-gray-400 text-center leading-none">•••</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Event List for Upcoming */}
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">近期安排</h3>
        <div className="space-y-3">
            {upcomingEvents.map(event => {
                const app = applications.find(a => a.id === event.applicationId);
                const startDate = parseISO(event.start);
                const endDate = event.end ? parseISO(event.end) : null;
                const isRange = !!endDate;
                
                return (
                    <div 
                        key={event.id} 
                        onClick={() => onEventClick(event)}
                        className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="flex flex-col items-center pt-1">
                            <div 
                                className="w-1 h-8 rounded-full mb-1" 
                                style={{ backgroundColor: EVENT_TYPE_COLORS[event.type] }}
                            ></div>
                        </div>
                        
                        <div className="flex-1">
                            {/* Row 1: Company + Tag */}
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-gray-900 text-base truncate max-w-[200px]">
                                    {app?.company || '未知公司'}
                                </h4>
                                <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {event.title}
                                </span>
                            </div>
                            
                            {/* Row 2: Time */}
                            <div className="text-xs text-gray-500 font-medium">
                                {isRange ? (
                                    <span>
                                        {format(startDate, 'M月d日 HH:mm', { locale: zhCN })} 
                                        <span className="mx-1">-</span> 
                                        {isSameDay(startDate, endDate!) ? format(endDate!, 'HH:mm') : format(endDate!, 'M月d日 HH:mm')}
                                    </span>
                                ) : (
                                    <span>{format(startDate, 'M月d日 HH:mm', { locale: zhCN })}</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {upcomingEvents.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-4 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                    暂无近期安排，好好休息吧
                </div>
            )}
        </div>
      </div>
    </div>
  );
};