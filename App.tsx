import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { ApplicationList } from './components/ApplicationList';
import { ApplicationForm } from './components/ApplicationForm';
import { Auth } from './components/Auth';
import { Application, JobEvent } from './types';
import { MOCK_INITIAL_DATA } from './constants';
import { supabase } from './services/supabase';
import { LogOut, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'applications'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | undefined>(undefined);

  // Check Auth Session
  useEffect(() => {
    if (!supabase) {
        setIsLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else {
          setApplications([]);
          setEvents([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (userId: string) => {
      setIsLoading(true);
      if(!supabase) return;

      // Fetch Apps
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Fetch Events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId);

      if (appsError || eventsError) {
          console.error('Error fetching data:', appsError || eventsError);
          setIsLoading(false);
          return;
      }

      // Initial Seed Logic: If DB is empty, seed with Constants data
      if ((!appsData || appsData.length === 0) && MOCK_INITIAL_DATA.length > 0) {
          console.log('Database empty. Seeding initial data...');
          await seedInitialData(userId);
          setIsLoading(false);
          return; 
      }

      // Map DB snake_case -> Frontend camelCase
      const formattedApps = (appsData || []).map((app: any) => ({
          ...app,
          applyDate: app.apply_date || app.applyDate, // Support both for safety
          companyType: app.company_type || app.companyType,
      }));

      setApplications(formattedApps as Application[]);
      
      const formattedEvents = (eventsData || []).map((e: any) => ({
          ...e,
          applicationId: e.application_id ?? e.applicationId,
          isCompleted: e.is_completed ?? e.isCompleted ?? false
      }));
      setEvents(formattedEvents as JobEvent[]);
      
      setIsLoading(false);
  };

  const seedInitialData = async (userId: string) => {
      if(!supabase) return;

      // Map Frontend camelCase -> DB snake_case for Insert
      const appsToInsert = MOCK_INITIAL_DATA.map(({ id, ...app }) => ({
          user_id: userId,
          company: app.company,
          position: app.position,
          apply_date: app.applyDate,
          industry: app.industry,
          company_type: app.companyType,
          status: app.status,
          note: app.note
      }));

      const { data, error } = await supabase
        .from('applications')
        .insert(appsToInsert)
        .select(); 
      
      if (error) {
          console.error("Seeding error:", JSON.stringify(error, null, 2));
          alert("初始化数据失败，请查看控制台错误详情。");
      } else if (data) {
          console.log("Seeding successful!", data.length, "records inserted.");
          // Map back for local state
          const mappedData = data.map((app: any) => ({
              ...app,
              applyDate: app.apply_date,
              companyType: app.company_type
          }));
          setApplications(mappedData as Application[]);
      }
  };

  const handleSaveApplication = async (appData: any, newEvents: JobEvent[]) => {
    if (!supabase || !session) return;
    const userId = session.user.id;

    // Prepare Payload (Map to snake_case)
    const appPayload = {
        user_id: userId,
        company: appData.company,
        position: appData.position,
        apply_date: appData.applyDate,
        status: appData.status,
        industry: appData.industry,
        company_type: appData.companyType,
        note: appData.note
    };

    // SAVE APPLICATION
    let savedAppId = editingApp?.id;
    let savedAppData = null;
    
    if (editingApp) {
        // Update
        const { data, error } = await supabase
            .from('applications')
            .update(appPayload)
            .eq('id', editingApp.id)
            .select();
        
        if (error) { 
            alert('保存失败: ' + error.message); 
            return; 
        }
        savedAppData = data[0];
    } else {
        // Insert
        const { data, error } = await supabase
            .from('applications')
            .insert([appPayload])
            .select();

        if (error || !data) { 
            alert('创建失败: ' + (error?.message || '未知错误')); 
            return; 
        }
        savedAppId = data[0].id;
        savedAppData = data[0];
    }

    // Update local applications state immediately
    if (savedAppData) {
        const mappedApp = {
            ...savedAppData,
            applyDate: savedAppData.apply_date,
            companyType: savedAppData.company_type
        };

        if (editingApp) {
            setApplications(prev => prev.map(a => a.id === editingApp.id ? mappedApp : a));
        } else {
            setApplications(prev => [mappedApp, ...prev]);
        }
    }

    // SAVE EVENTS
    if (savedAppId) {
        // 1. Delete existing events
        const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .eq('application_id', savedAppId);

        if (deleteError) {
             console.error("Delete events failed:", deleteError);
             // Try legacy deletion just in case
             await supabase.from('events').delete().eq('applicationId', savedAppId);
        }
        
        // 2. Insert new events
        if (newEvents.length > 0) {
            const eventsSnake = newEvents.map(e => ({
                user_id: userId,
                application_id: savedAppId,
                title: e.title,
                type: e.type,
                start: e.start,
                end: e.end ? e.end : null,
                is_completed: e.isCompleted || false
            }));
            
            const { data: savedEvents, error: eventError } = await supabase
                .from('events')
                .insert(eventsSnake)
                .select();

            if (eventError) {
                console.error("Event save error details:", eventError);
                const errorMessage = eventError.message || JSON.stringify(eventError);
                alert(`保存日程失败: ${errorMessage}`);
            } else if (savedEvents) {
                // Update local events state
                // Remove old events for this app
                const filteredEvents = events.filter(e => e.applicationId !== savedAppId);
                
                // Map new DB events to frontend
                const mappedNewEvents = savedEvents.map((e: any) => ({
                    ...e,
                    applicationId: e.application_id,
                    isCompleted: e.is_completed
                }));

                setEvents([...filteredEvents, ...mappedNewEvents]);
            }
        } else {
             // If no events, just remove old ones locally
             setEvents(prev => prev.filter(e => e.applicationId !== savedAppId));
        }
    }

    setIsFormOpen(false);
    setEditingApp(undefined);
  };

  const handleEventUpdate = async (updatedEvent: JobEvent) => {
      if (!supabase) return;
      
      const originalEvent = events.find(e => e.id === updatedEvent.id);

      // Optimistic update for UI
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));

      // Try update with snake_case
      const { error } = await supabase
        .from('events')
        .update({
            start: updatedEvent.start,
            end: updatedEvent.end ?? null,
            is_completed: updatedEvent.isCompleted ?? false
        })
        .eq('id', updatedEvent.id);

      if (error) {
          console.error("Event update failed:", error);
          alert(`更新失败: ${error.message || '请重试'}`);
          
          // Revert on error
          if (originalEvent) {
             setEvents(prev => prev.map(e => e.id === updatedEvent.id ? originalEvent : e));
          }
      }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('确定要删除这条投递记录吗？')) return;
    if (!supabase) return;

    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (!error) {
        setApplications(prev => prev.filter(a => a.id !== id));
        setEvents(prev => prev.filter(e => e.applicationId !== id)); 
    } else {
        alert("删除失败: " + error.message);
    }
  };

  const handleEditApplication = (app: Application) => {
    setEditingApp(app);
    setIsFormOpen(true);
  };

  const handleNewApplication = () => {
    setEditingApp(undefined);
    setIsFormOpen(true);
  };

  const handleLogout = async () => {
      await supabase?.auth.signOut();
  };

  if (!supabase || !session) {
      return <Auth />;
  }

  if (isLoading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-[#F2F2F7]">
              <Loader2 className="animate-spin text-gray-400" size={32} />
              <span className="ml-2 text-gray-500 text-sm font-medium">加载中...</span>
          </div>
      );
  }

  return (
    <>
        <Layout 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onNewApplication={handleNewApplication}
        >
            <div className="flex justify-end mb-2">
                <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
                    <LogOut size={12} /> 退出登录
                </button>
            </div>
            {activeTab === 'dashboard' && <Dashboard applications={applications} />}
            {activeTab === 'calendar' && (
                <CalendarView 
                    events={events} 
                    applications={applications}
                    onEventUpdate={handleEventUpdate}
                />
            )}
            {activeTab === 'applications' && (
                <ApplicationList 
                    applications={applications} 
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                    onNew={handleNewApplication}
                />
            )}
        </Layout>

        <ApplicationForm 
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSaveApplication}
            onDelete={handleDeleteApplication}
            initialData={editingApp}
            existingEvents={editingApp ? events.filter(e => e.applicationId === editingApp.id) : []}
        />
    </>
  );
};

export default App;