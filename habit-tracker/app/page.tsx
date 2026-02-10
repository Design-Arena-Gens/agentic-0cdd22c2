'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Flame, Bell } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  completedDates: string[];
  reminderTime?: string;
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#3b82f6');
  const [showAddForm, setShowAddForm] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  useEffect(() => {
    const stored = localStorage.getItem('habits');
    if (stored) {
      setHabits(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      color: newHabitColor,
      createdAt: getTodayString(),
      completedDates: [],
      reminderTime: reminderTime,
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitColor('#3b82f6');
    setShowAddForm(false);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleHabitToday = (id: string) => {
    const today = getTodayString();
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const completed = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: completed
            ? habit.completedDates.filter(d => d !== today)
            : [...habit.completedDates, today]
        };
      }
      return habit;
    }));
  };

  const calculateStreak = (habit: Habit): number => {
    if (habit.completedDates.length === 0) return 0;

    const sortedDates = [...habit.completedDates].sort().reverse();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let streak = 0;
    let currentDate = new Date(today);

    // Check if completed today or yesterday
    const lastCompleted = new Date(sortedDates[0]);
    const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0;

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      const checkDate = new Date(currentDate);
      checkDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);

      if (checkDate.getTime() === compareDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const isCompletedToday = (habit: Habit): boolean => {
    return habit.completedDates.includes(getTodayString());
  };

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
          <p className="text-slate-400">Build better habits, one day at a time</p>
        </div>

        {/* Today's Date */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-medium">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Add Habit Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl p-4 mb-6 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add New Habit
          </button>
        )}

        {/* Add Habit Form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 space-y-4">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Habit name (e.g., Exercise, Read, Meditate)"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Choose Color</label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewHabitColor(color)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      newHabitColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={addHabit}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 font-semibold transition-all"
              >
                Add Habit
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No habits yet. Add your first habit to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map(habit => {
              const streak = calculateStreak(habit);
              const completed = isCompletedToday(habit);

              return (
                <div
                  key={habit.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <h3 className="text-lg font-semibold">{habit.name}</h3>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {streak > 0 && (
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="w-5 h-5" />
                        <span className="font-bold text-lg">{streak}</span>
                        <span className="text-sm">day{streak !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {habit.reminderTime && (
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Bell className="w-4 h-4" />
                        <span>{habit.reminderTime}</span>
                      </div>
                    )}
                    <div className="text-slate-400 text-sm ml-auto">
                      {habit.completedDates.length} total
                    </div>
                  </div>

                  <button
                    onClick={() => toggleHabitToday(habit.id)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      completed
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {completed ? '✓ Completed Today' : 'Mark as Complete'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>Track your progress and build lasting habits</p>
        </div>
      </div>
    </div>
  );
}
