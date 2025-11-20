import React, { useEffect, useState } from 'react';
import { Bell, Check, X, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface ReminderListProps {
  noteId: number;
}

export const ReminderList: React.FC<ReminderListProps> = ({ noteId }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const loadReminders = async () => {
    const items = await window.electronAPI.getReminders(noteId);
    setReminders(items);
  };

  useEffect(() => {
    loadReminders();
    // Poll for reminders every 5 seconds
    const interval = setInterval(loadReminders, 5000);
    return () => clearInterval(interval);
  }, [noteId]);

  if (reminders.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {reminders.map(reminder => (
        <div 
          key={reminder.id} 
          className="flex items-start gap-3 p-4 bg-white border border-zinc-200 rounded-xl shadow-sm ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-300"
        >
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Bell size={18} />
          </div>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-sm font-medium text-zinc-900 leading-tight">
              Suggested Reminder
            </h4>
            <p className="text-sm text-zinc-600 mt-1">
              {reminder.text}
            </p>
            {reminder.due_date && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500 font-medium">
                <Calendar size={12} />
                <span>{reminder.due_date}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
            <button 
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Accept"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
