import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { ApplicationList } from './components/ApplicationList';
import { ApplicationForm } from './components/ApplicationForm';
import { Application, JobEvent, EventType, ApplicationStatus } from './types';
import { MOCK_INITIAL_DATA } from './constants';

const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'applications'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | undefined>(undefined);

  useEffect(() => {
    const savedApps = localStorage.getItem('career_track_apps');
    const savedEvents = localStorage.getItem('career_track_events');

    if (savedApps) {
        setApplications(JSON.parse(savedApps));
    } else {
        setApplications(MOCK_INITIAL_DATA);
    }

    if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('career_track_apps', JSON.stringify(applications));
    localStorage.setItem('career_track_events', JSON.stringify(events));
  }, [applications, events]);

  const handleSaveApplication = (appData: any, newEvents: JobEvent[]) => {
    if (editingApp) {
        // Update Application
        setApplications(prev => prev.map(a => a.id === editingApp.id ? { ...appData, id: editingApp.id } : a));
        
        // Update Events:
        // 1. Remove all events for this app from global state
        // 2. Add the new list from form (which contains kept old ones + new ones)
        // 3. Ensure applicationId is set correctly
        const updatedEvents = newEvents.map(e => ({ ...e, applicationId: editingApp.id }));
        
        setEvents(prev => [
            ...prev.filter(e => e.applicationId !== editingApp.id), // Keep other apps' events
            ...updatedEvents
        ]);

    } else {
        // New Application
        const newAppId = generateId();
        const newApp = { ...appData, id: newAppId };
        setApplications(prev => [newApp, ...prev]);
        
        // Create default "Applied" event if no specific events added, or just use added events
        let finalEvents = newEvents.map(e => ({ ...e, applicationId: newAppId }));
        
        setEvents(prev => [...prev, ...finalEvents]);
    }
    setIsFormOpen(false);
    setEditingApp(undefined);
  };

  const handleDeleteApplication = (id: string) => {
    if (confirm('确定要删除这条投递记录吗？')) {
        setApplications(prev => prev.filter(a => a.id !== id));
        setEvents(prev => prev.filter(e => e.applicationId !== id));
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

  return (
    <>
        <Layout 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onNewApplication={handleNewApplication}
        >
        {activeTab === 'dashboard' && <Dashboard applications={applications} />}
        {activeTab === 'calendar' && (
            <CalendarView 
                events={events} 
                applications={applications}
                onEventClick={(e) => {
                    // Find associated app to edit
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