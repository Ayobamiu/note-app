import React, { useEffect, useState } from 'react';
import { Bell, Check, X, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface ReminderListProps {
  noteId: number;
}

export const ReminderList: React.FC<ReminderListProps> = ({ noteId }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReminders = async () => {
    const items = await window.electronAPI.getReminders(noteId);
    // Filter for pending reminders only
    setReminders(items.filter(r => r.status === 'pending'));
  };

  useEffect(() => {
    loadReminders();
    const interval = setInterval(loadReminders, 5000);
    return () => clearInterval(interval);
  }, [noteId]);

  const handleAction = async (id: number, status: 'accepted' | 'dismissed') => {
    setLoading(true);
    await window.electronAPI.updateReminderStatus(id, status);
    await loadReminders();
    setLoading(false);
  };

  if (reminders.length === 0) return null;

  const currentReminder = reminders[0];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg group hover:border-blue-200 transition-colors">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm text-blue-500 shrink-0">
            <Bell size={14} className="fill-current" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Suggestion • 1/{reminders.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-700 truncate">
              <span className="font-medium truncate">{currentReminder.text}</span>
              {currentReminder.due_date && (
                <span className="flex items-center gap-1 text-zinc-400 text-xs shrink-0">
                  <Calendar size={10} />
                  {currentReminder.due_date}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 pl-3 shrink-0">
          <button
            onClick={() => handleAction(currentReminder.id, 'dismissed')}
            disabled={loading}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => handleAction(currentReminder.id, 'accepted')}
            disabled={loading}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
            title="Accept"
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
