import React from 'react';
import { LayoutList, Calendar, PieChart, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'applications' | 'calendar' | 'dashboard';
  onTabChange: (tab: 'applications' | 'calendar' | 'dashboard') => void;
  onNewApplication: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onNewApplication }) => {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#F2F2F7] text-gray-900 font-sans overflow-hidden pt-safe">
      
      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth pb-24">
        <div className="p-4 md:p-6 max-w-3xl mx-auto min-h-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar - Apple Style Glassmorphism */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel z-40 pb-safe">
        <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Entry / List Tab */}
          <button
            onClick={() => onTabChange('applications')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 w-16 ${
              activeTab === 'applications' ? 'text-apple-blue transform scale-105' : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <LayoutList size={24} strokeWidth={activeTab === 'applications' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">投递</span>
          </button>

          {/* Calendar Tab */}
          <button
            onClick={() => onTabChange('calendar')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 w-16 ${
              activeTab === 'calendar' ? 'text-apple-red transform scale-105' : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <Calendar size={24} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">日历</span>
          </button>

          {/* Dashboard Tab */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 w-16 ${
              activeTab === 'dashboard' ? 'text-apple-purple transform scale-105' : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <PieChart size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">看板</span>
          </button>

        </div>
      </nav>
      
      {/* Safe Area Spacing for iPhone home indicator */}
      <div className="h-6 bg-transparent fixed bottom-0 w-full pointer-events-none z-50"></div>
    </div>
  );
};