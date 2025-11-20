import React, { useEffect, useState } from 'react';

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
    // Poll for reminders every 5 seconds (simple way to catch background AI results)
    const interval = setInterval(loadReminders, 5000);
    return () => clearInterval(interval);
  }, [noteId]);

  if (reminders.length === 0) return null;

  return (
    <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Suggested Reminders
      </h4>
      <div className="space-y-2">
        {reminders.map(reminder => (
          <div key={reminder.id} className="flex items-start justify-between bg-white p-2 rounded border border-blue-100 shadow-sm">
            <div>
              <p className="text-sm text-gray-800">{reminder.text}</p>
              {reminder.due_date && (
                <p className="text-xs text-blue-600 mt-1">Due: {reminder.due_date}</p>
              )}
            </div>
            {/* Actions could go here (Accept/Dismiss) - for MVP just showing them */}
          </div>
        ))}
      </div>
    </div>
  );
};
