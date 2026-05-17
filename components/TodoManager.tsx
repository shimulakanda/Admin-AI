
import React, { useState, useMemo } from 'react';
// Added missing ListChecks import
import { 
  CheckCircle2, Circle, Clock, Plus, X, Trash2, Edit, 
  Bell, BellOff, Calendar as CalendarIcon, Filter,
  Check, AlertCircle, Sparkles, ListChecks
} from 'lucide-react';
import { Todo, UserProfile } from '../types';
import CustomDateTimePicker from './CustomDateTimePicker';

interface TodoManagerProps {
  todos: Todo[];
  addTodo: (t: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
  user: UserProfile;
}

type ViewType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

const TodoManager: React.FC<TodoManagerProps> = ({ todos, addTodo, updateTodo, removeTodo, user }) => {
  const [view, setView] = useState<ViewType>('DAILY');
  const [showCreate, setShowCreate] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [reminder, setReminder] = useState(false);
  const [category, setCategory] = useState('General');

  const filteredTodos = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    return todos.filter(t => {
      const todoDate = new Date(t.dueDate);
      if (view === 'DAILY') {
        return todoDate >= startOfToday && todoDate <= endOfToday;
      }
      if (view === 'WEEKLY') {
        const nextWeek = new Date(now.getTime() + 7 * 86400000);
        return todoDate >= startOfToday && todoDate <= nextWeek;
      }
      if (view === 'MONTHLY') {
        return todoDate.getMonth() === now.getMonth() && todoDate.getFullYear() === now.getFullYear();
      }
      return true;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [todos, view]);

  const handleSave = () => {
    if (!title) return;
    const todoData = {
      title,
      description: desc,
      dueDate: date,
      priority,
      reminderEnabled: reminder,
      category,
      status: editingTodo ? editingTodo.status : 'PENDING' as const
    };

    if (editingTodo) {
      updateTodo(editingTodo.id, todoData);
    } else {
      addTodo({
        id: `todo-${Date.now()}`,
        ...todoData
      });
    }
    closeModal();
  };

  const openEdit = (t: Todo) => {
    setEditingTodo(t);
    setTitle(t.title);
    setDesc(t.description);
    setDate(t.dueDate);
    setPriority(t.priority);
    setReminder(t.reminderEnabled);
    setCategory(t.category);
    setShowCreate(true);
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditingTodo(null);
    setTitle(''); setDesc(''); setDate(new Date().toISOString());
    setPriority('MEDIUM'); setReminder(false); setCategory('General');
  };

  const toggleStatus = (t: Todo) => {
    updateTodo(t.id, { status: t.status === 'PENDING' ? 'COMPLETED' : 'PENDING' });
  };

  return (
    <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Protocol Checklist</h1>
          <p className="text-slate-500 font-medium italic">Administrative tasks and time-sensitive reminders</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white border border-slate-200 p-1 rounded-2xl flex shadow-sm">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(v => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center space-x-2 shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest"
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {filteredTodos.length > 0 ? filteredTodos.map(todo => (
          <div 
            key={todo.id} 
            className={`bg-white border-2 rounded-[32px] p-6 transition-all group flex items-start space-x-6 ${
              todo.status === 'COMPLETED' ? 'border-emerald-50 opacity-75' : 'border-slate-100 hover:border-indigo-100 hover:shadow-lg'
            }`}
          >
            <button 
              onClick={() => toggleStatus(todo)}
              className={`mt-1 transition-colors ${todo.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-200 hover:text-indigo-400'}`}
            >
              {todo.status === 'COMPLETED' ? <CheckCircle2 size={28} /> : <Circle size={28} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    todo.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' : 
                    todo.priority === 'MEDIUM' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {todo.priority} Priority
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{todo.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {todo.reminderEnabled && <Bell size={14} className="text-amber-500 animate-pulse" />}
                  <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Clock size={12} className="mr-1.5" />
                    {new Date(todo.dueDate).toLocaleDateString()} at {new Date(todo.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <h3 className={`text-lg font-black text-slate-900 mb-1 ${todo.status === 'COMPLETED' ? 'line-through opacity-50' : ''}`}>
                {todo.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{todo.description}</p>
            </div>

            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(todo)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all">
                <Edit size={18} />
              </button>
              <button onClick={() => removeTodo(todo.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 italic py-20 bg-white border-2 border-dashed border-slate-100 rounded-[40px]">
            <ListChecks size={64} className="mb-4 opacity-10" />
            <p className="text-sm font-black uppercase tracking-widest opacity-40">Clean registry. No tasks due for this view.</p>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-4xl p-10 animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {editingTodo ? 'Modify Protocol' : 'New Administrative Task'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={32} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title / Subject</label>
                  <input 
                    className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 bg-slate-50 text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. Verify Fall 2025 Retake List"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Urgency Index</label>
                    <select className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 bg-slate-50 text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                      <option value="LOW">Routine</option>
                      <option value="MEDIUM">Standard</option>
                      <option value="HIGH">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Domain</label>
                    <input className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 bg-slate-50 text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={category} onChange={(e) => setCategory(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                  <textarea rows={4} className="w-full border-2 border-slate-100 rounded-3xl px-6 py-4 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all" placeholder="Enter task specifics..." value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>

                <div className="flex items-center space-x-3 p-6 bg-amber-50 rounded-[32px] border border-amber-100">
                  <button 
                    onClick={() => setReminder(!reminder)}
                    className={`w-12 h-6 rounded-full transition-all relative ${reminder ? 'bg-amber-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${reminder ? 'left-7' : 'left-1'}`}></div>
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center">
                      <Bell size={12} className="mr-1.5" /> Reminder Protocol
                    </span>
                    <span className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter">Enable escalation and desktop notifications</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <CustomDateTimePicker
                  label="Deadline / Schedule"
                  value={date}
                  onChange={setDate}
                  showTime={true}
                />
              </div>
            </div>

            <div className="flex space-x-6 pt-10 border-t border-slate-50 mt-10">
              <button onClick={closeModal} className="flex-1 py-5 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] hover:text-slate-600 transition-colors">Discard changes</button>
              <button 
                onClick={handleSave}
                className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center space-x-3"
              >
                <Check size={18} />
                <span>{editingTodo ? 'Save Protocol' : 'Authorize Task'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoManager;
