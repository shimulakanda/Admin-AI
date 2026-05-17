
import React, { useState, useEffect } from 'react';
import { 
  FileCheck, Clock, Calendar, Layers, 
  Settings2, Eye, EyeOff, MoveUp, MoveDown, Check, RotateCcw,
  ListChecks, Bell, Sparkles
} from 'lucide-react';
import { UniDocument, Ticket, Meeting, UserProfile, Status, Todo } from '../types';

interface DashboardProps {
  documents: UniDocument[];
  tickets: Ticket[];
  meetings: Meeting[];
  todos?: Todo[];
  user: UserProfile;
}

type WidgetId = 'totalTasks' | 'completedTasks' | 'pendingTasks' | 'totalMeetings' | 'activeTodos' | 'summaryBanner';

const Dashboard: React.FC<DashboardProps> = ({ documents, tickets, meetings, todos = [], user }) => {
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>([
    'totalTasks', 'completedTasks', 'pendingTasks', 'totalMeetings', 'activeTodos', 'summaryBanner'
  ]);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetId, boolean>>({
    totalTasks: true,
    completedTasks: true,
    pendingTasks: true,
    totalMeetings: true,
    activeTodos: true,
    summaryBanner: true
  });

  useEffect(() => {
    const savedOrder = localStorage.getItem(`dashboard_order_${user.id}`);
    const savedVisibility = localStorage.getItem(`dashboard_visibility_${user.id}`);
    if (savedOrder) setWidgetOrder(JSON.parse(savedOrder));
    if (savedVisibility) setVisibleWidgets(JSON.parse(savedVisibility));
  }, [user.id]);

  const saveSettings = (newOrder: WidgetId[], newVisibility: Record<WidgetId, boolean>) => {
    localStorage.setItem(`dashboard_order_${user.id}`, JSON.stringify(newOrder));
    localStorage.setItem(`dashboard_visibility_${user.id}`, JSON.stringify(newVisibility));
  };

  const toggleVisibility = (id: WidgetId) => {
    const newVisibility = { ...visibleWidgets, [id]: !visibleWidgets[id] };
    setVisibleWidgets(newVisibility);
    saveSettings(widgetOrder, newVisibility);
  };

  const moveWidget = (id: WidgetId, direction: 'up' | 'down') => {
    const index = widgetOrder.indexOf(id);
    if (direction === 'up' && index > 0) {
      const newOrder = [...widgetOrder];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setWidgetOrder(newOrder);
      saveSettings(newOrder, visibleWidgets);
    } else if (direction === 'down' && index < widgetOrder.length - 1) {
      const newOrder = [...widgetOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setWidgetOrder(newOrder);
      saveSettings(newOrder, visibleWidgets);
    }
  };

  const resetDashboard = () => {
    const defaultOrder: WidgetId[] = ['totalTasks', 'completedTasks', 'pendingTasks', 'totalMeetings', 'activeTodos', 'summaryBanner'];
    const defaultVisibility = {
      totalTasks: true, completedTasks: true, pendingTasks: true, totalMeetings: true, activeTodos: true, summaryBanner: true
    };
    setWidgetOrder(defaultOrder);
    setVisibleWidgets(defaultVisibility);
    saveSettings(defaultOrder, defaultVisibility);
  };

  const totalTasksCount = documents.length + tickets.length + todos.length;
  const completedTasksCount = [
    ...documents.filter(d => d.status === Status.APPROVED || d.status === Status.ARCHIVED),
    ...tickets.filter(t => t.status === Status.APPROVED || t.status === Status.ARCHIVED),
    ...todos.filter(todo => todo.status === 'COMPLETED')
  ].length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;
  const activeTodosCount = todos.filter(t => t.status === 'PENDING').length;
  const reminderCount = todos.filter(t => t.status === 'PENDING' && t.reminderEnabled).length;

  const getWidgetData = (id: WidgetId) => {
    switch (id) {
      case 'totalTasks': return { title: "Total Records", value: totalTasksCount, icon: Layers, color: "bg-diu-blue", light: "bg-diu-blue/5 dark:bg-diu-blue/10" };
      case 'completedTasks': return { title: "Finalized Archives", value: completedTasksCount, icon: FileCheck, color: "bg-diu-green", light: "bg-diu-green/5 dark:bg-diu-green/10" };
      case 'pendingTasks': return { title: "Pending Protocol", value: pendingTasksCount, icon: Clock, color: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-500/10" };
      case 'totalMeetings': return { title: "Scheduled Meetings", value: meetings.length, icon: Calendar, color: "bg-diu-blue", light: "bg-diu-blue/5 dark:bg-diu-blue/10" };
      case 'activeTodos': return { title: "Active Tasks", value: activeTodosCount, icon: ListChecks, color: "bg-diu-green", light: "bg-diu-green/5 dark:bg-diu-green/10" };
      default: return null;
    }
  };

  const StatCard: React.FC<{ id: WidgetId }> = ({ id }) => {
    const data = getWidgetData(id);
    if (!data) return null;
    const { title, value, icon: Icon, color, light } = data;
    
    return (
      <div className={`bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all group flex flex-col justify-between min-h-[160px] relative hover:shadow-xl hover:translate-y-[-4px] ${isCustomizeMode ? 'opacity-50 ring-2 ring-diu-blue/10' : ''}`}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
          <div className={`p-3 rounded-2xl ${light} group-hover:${color} group-hover:text-white transition-all`}>
            <Icon size={20} className={isCustomizeMode ? 'text-slate-300 dark:text-slate-600' : 'text-diu-blue dark:text-diu-green group-hover:text-white'} />
          </div>
        </div>
        <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-4 tracking-tighter">{value}</h3>
      </div>
    );
  };

  const SummaryBanner: React.FC = () => (
    <div className={`bg-diu-blue dark:bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden border dark:border-slate-800 ${isCustomizeMode ? 'opacity-50' : ''}`}>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-diu-green">
            <Sparkles size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Admin Intelligence</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-none">Management Snapshot</h2>
          <p className="text-blue-100 dark:text-slate-400 font-medium max-w-md">You have {pendingTasksCount} administrative items requiring attention in {user.department}.</p>
        </div>
        {reminderCount > 0 && (
          <div className="bg-white/10 dark:bg-slate-800/80 backdrop-blur-xl px-8 py-5 rounded-[32px] border border-white/20 dark:border-slate-700 flex items-center space-x-4 shadow-2xl">
            <div className="p-3 bg-diu-green text-white rounded-2xl animate-pulse">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 dark:text-slate-500 leading-none mb-1.5">Action Alerts</p>
              <p className="text-xl font-black">{reminderCount} Active Reminders</p>
            </div>
          </div>
        )}
      </div>
      <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-diu-green rounded-full blur-[120px] opacity-10"></div>
    </div >
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-fade-in transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">Admin Dashboard</h1>
          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 font-bold text-sm">
            <span className="text-diu-blue dark:text-diu-green uppercase text-[10px] font-black tracking-widest bg-diu-blue/5 dark:bg-diu-green/10 px-3 py-1 rounded-full border border-diu-blue/10 dark:border-diu-green/20">Authorized Access</span>
            <p>Welcome back, {user.name}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCustomizeMode(!isCustomizeMode)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95 ${
            isCustomizeMode ? 'bg-diu-green text-white shadow-diu-green/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-diu-blue dark:hover:border-diu-green'
          }`}
        >
          {isCustomizeMode ? <><Check size={16} /><span>Confirm Layout</span></> : <><Settings2 size={16} /><span>Configure</span></>}
        </button>
      </div>

      {isCustomizeMode && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Dashboard Layout</h3>
            <button 
              onClick={resetDashboard}
              className="text-[10px] font-black text-diu-blue dark:text-diu-green uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-xl transition-all"
            >
              <RotateCcw size={14} className="inline mr-2" /> Restore Default
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetOrder.map((id, index) => {
              const data = getWidgetData(id);
              const label = data ? data.title : "Information Banner";
              const isVisible = visibleWidgets[id];
              
              return (
                <div key={id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => toggleVisibility(id)} className={`p-2.5 rounded-xl transition-all ${isVisible ? 'bg-diu-blue text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <span className={`text-xs font-black uppercase tracking-widest ${isVisible ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600 italic line-through'}`}>{label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => moveWidget(id, 'up')} disabled={index === 0} className="p-2 text-slate-400 hover:text-diu-blue dark:hover:text-diu-green disabled:opacity-20 transition-colors"><MoveUp size={16} /></button>
                    <button onClick={() => moveWidget(id, 'down')} disabled={index === widgetOrder.length - 1} className="p-2 text-slate-400 hover:text-diu-blue dark:hover:text-diu-green disabled:opacity-20 transition-colors"><MoveDown size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {widgetOrder.filter(id => id !== 'summaryBanner').map(id => {
            if (!visibleWidgets[id]) return null;
            return <StatCard key={id} id={id} />;
          })}
        </div>

        {visibleWidgets['summaryBanner'] && widgetOrder.includes('summaryBanner') && (
          <div className="animate-fade-in">
            <SummaryBanner />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
