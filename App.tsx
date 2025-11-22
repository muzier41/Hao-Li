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

const generateId = () => Math.random().toString(36).substring(2, 9);

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

      // Initial Seed Logic: If DB is empty, seed with Constants data (Migration)
      if ((!appsData || appsData.length === 0) && MOCK_INITIAL_DATA.length > 0) {
          console.log('Seeding initial data...');
          await seedInitialData(userId);
          setIsLoading(false);
          return; // Seed function calls fetchData again or sets state
      }

      // Transform data if needed (Supabase returns dates as strings, which matches our interface)
      setApplications(appsData as Application[]);
      setEvents(eventsData as JobEvent[]);
      setIsLoading(false);
  };

  const seedInitialData = async (userId: string) => {
      if(!supabase) return;

      // Prepare MOCK data for insertion
      // 1. Insert Applications
      const appsToInsert = MOCK_INITIAL_DATA.map(app => ({
          id: app.id, // Keep ID to link events if we had mock events
          user_id: userId,
          company: app.company,
          position: app.position,
          apply_date: app.applyDate, // Map to snake_case for DB if needed, but let's assume mapped in constants or we adjust keys
          // Actually, let's adjust the object to match snake_case DB columns usually, 
          // BUT to keep it simple, I will assume we used camelCase in DB columns or map them here.
          // Let's map to the interface keys which we will use as DB columns for simplicity in this context,
          // OR better: Clean map.
          industry: app.industry,
          company_type: app.companyType,
          status: app.status,
          note: app.note,
          created_at: new Date().toISOString()
      }));
      
      // Since MOCK_INITIAL_DATA uses camelCase keys and we want to insert them.
      // I will define the DB columns to match camelCase in the SQL script to avoid mapping headaches in JS.
      // Correction: SQL standards usually prefer snake_case. I will map them here.
      
      const mappedApps = MOCK_INITIAL_DATA.map(app => ({
          id: app.id,
          user_id: userId,
          company: app.company,
          position: app.position,
          applyDate: app.applyDate,
          industry: app.industry,
          companyType: app.companyType,
          status: app.status,
          note: app.note
      }));

      // We don't have events in MOCK_INITIAL_DATA constants for now, but if we did:
      // const mappedEvents = ...

      const { error } = await supabase.from('applications').insert(mappedApps);
      
      if (!error) {
          setApplications(mappedApps as Application[]);
          // Generate some default events from the status? (Optional, skipping for now to keep clean)
      } else {
          console.error("Seeding error", error);
      }
  };

  const handleSaveApplication = async (appData: any, newEvents: JobEvent[]) => {
    if (!supabase || !session) return;
    const userId = session.user.id;

    // SAVE APPLICATION
    let savedAppId = editingApp?.id;
    
    if (editingApp) {
        // Update
        const { error } = await supabase
            .from('applications')
            .update({
                company: appData.company,
                position: appData.position,
                applyDate: appData.applyDate,
                status: appData.status,
                industry: appData.industry,
                companyType: appData.companyType,
                note: appData.note
            })
            .eq('id', editingApp.id);
        
        if (error) { alert('保存失败'); return; }
        
        setApplications(prev => prev.map(a => a.id === editingApp.id ? { ...appData, id: editingApp.id, user_id: userId } : a));

    } else {
        // Insert
        // Use a real UUID if possible, or let Supabase generate it. 
        // Since we need the ID for events immediately, we can generate one or let DB return it.
        // Let's use random string for simplicity compatible with existing logic, OR better: let Supabase return it.
        const { data, error } = await supabase
            .from('applications')
            .insert([{
                user_id: userId,
                company: appData.company,
                position: appData.position,
                applyDate: appData.applyDate,
                status: appData.status,
                industry: appData.industry,
                companyType: appData.companyType,
                note: appData.note
            }])
            .select();

        if (error || !data) { alert('创建失败'); return; }
        savedAppId = data[0].id;
        
        const newApp = { ...data[0] } as Application; // valid enough
        setApplications(prev => [newApp, ...prev]);
    }

    // SAVE EVENTS
    // Strategy: Delete all events for this app and recreate active ones (simplest sync)
    if (savedAppId) {
        // 1. Delete existing
        await supabase.from('events').delete().eq('applicationId', savedAppId);
        
        // 2. Insert new
        if (newEvents.length > 0) {
            const eventsToInsert = newEvents.map(e => ({
                user_id: userId,
                applicationId: savedAppId,
                title: e.title,
                type: e.type,
                start: e.start,
                end: e.end
            }));
            
            const { data: savedEvents, error: eventError } = await supabase.from('events').insert(eventsToInsert).select();
            if (eventError) console.error(eventError);

            // Update Local State
            if (savedEvents) {
                setEvents(prev => [
                    ...prev.filter(e => e.applicationId !== savedAppId),
                    ...(savedEvents as JobEvent[])
                ]);
            }
        } else {
             setEvents(prev => prev.filter(e => e.applicationId !== savedAppId));
        }
    }

    setIsFormOpen(false);
    setEditingApp(undefined);
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('确定要删除这条投递记录吗？')) return;
    if (!supabase) return;

    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (!error) {
        setApplications(prev => prev.filter(a => a.id !== id));
        setEvents(prev => prev.filter(e => e.applicationId !== id)); // Cascading delete usually handled by DB, but updating local state here
    } else {
        alert("删除失败");
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
                    onEventClick={(e) => {
                        const app = applications.find(a => a.id === e.applicationId);
                        if (app) handleEditApplication(app);
                    }} 
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