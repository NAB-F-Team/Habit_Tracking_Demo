import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getTodayDateString, 
  formatDateString,
  parseDateString, 
  getDayOfWeek, 
  addDays, 
  isPastDate, 
  isToday 
} from '../utils/dateUtils';

const HabitContext = createContext();

const SCHEMA_VERSION = 1;

// Seed Mock Data
const MOCK_HABITS = [
  {
    id: 'h1',
    name: 'Thiền định 15 phút',
    category: 'Mindfulness',
    frequency: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
    targetPerDay: 1,
    priority: 'High',
    status: 'Active'
  },
  {
    id: 'h2',
    name: 'Uống 2L nước',
    category: 'Health',
    frequency: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
    targetPerDay: 4,
    priority: 'Medium',
    status: 'Active'
  },
  {
    id: 'h3',
    name: 'Học tiếng Anh',
    category: 'Study',
    frequency: { type: 'specific', days: [1, 3, 5] }, // Thứ 2, 4, 6
    targetPerDay: 1,
    priority: 'High',
    status: 'Active'
  },
  {
    id: 'h4',
    name: 'Viết Code Review',
    category: 'Work',
    frequency: { type: 'specific', days: [2, 4, 6] }, // Thứ 3, 5, 7
    targetPerDay: 1,
    priority: 'Medium',
    status: 'Active'
  },
  {
    id: 'h5',
    name: 'Đọc sách 30 phút',
    category: 'Other',
    frequency: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
    targetPerDay: 1,
    priority: 'Low',
    status: 'Paused'
  },
  {
    id: 'h6',
    name: 'Chạy bộ buổi sáng',
    category: 'Health',
    frequency: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
    targetPerDay: 1,
    priority: 'High',
    status: 'Active'
  }
];

const MOCK_GOALS = [
  { id: 'g1', habitId: 'h1', targetType: 'Streak', targetValue: 7 },
  { id: 'g2', habitId: 'h2', targetType: 'Total', targetValue: 20 },
  { id: 'g3', habitId: 'h3', targetType: 'Streak', targetValue: 10 },
  { id: 'g4', habitId: 'h4', targetType: 'Total', targetValue: 8 }
];

// Today is 2026-06-06 (Saturday)
const MOCK_CHECKINS = [
  // Thiền định completed 6 days straight (May 31 - June 5), today (June 6) not completed
  { id: 'c1_1', habitId: 'h1', date: '2026-05-31', completedCount: 1 },
  { id: 'c1_2', habitId: 'h1', date: '2026-06-01', completedCount: 1 },
  { id: 'c1_3', habitId: 'h1', date: '2026-06-02', completedCount: 1 },
  { id: 'c1_4', habitId: 'h1', date: '2026-06-03', completedCount: 1 },
  { id: 'c1_5', habitId: 'h1', date: '2026-06-04', completedCount: 1 },
  { id: 'c1_6', habitId: 'h1', date: '2026-06-05', completedCount: 1 },
  
  // Uống nước completed June 3, 4, 5. Today (June 6) is in progress (2/4)
  { id: 'c2_1', habitId: 'h2', date: '2026-06-03', completedCount: 4 },
  { id: 'c2_2', habitId: 'h2', date: '2026-06-04', completedCount: 4 },
  { id: 'c2_3', habitId: 'h2', date: '2026-06-05', completedCount: 4 },
  { id: 'c2_4', habitId: 'h2', date: '2026-06-06', completedCount: 2 },
  
  // Học tiếng Anh (2-4-6): June 1 (Mon), June 3 (Wed), June 5 (Fri) completed. 
  { id: 'c3_1', habitId: 'h3', date: '2026-06-01', completedCount: 1 },
  { id: 'c3_2', habitId: 'h3', date: '2026-06-03', completedCount: 1 },
  { id: 'c3_3', habitId: 'h3', date: '2026-06-05', completedCount: 1 },
  
  // Viết Code Review (3-5-7): June 2 (Tue), June 4 (Thu) completed. Today June 6 (Sat) not completed.
  { id: 'c4_1', habitId: 'h4', date: '2026-06-02', completedCount: 1 },
  { id: 'c4_2', habitId: 'h4', date: '2026-06-04', completedCount: 1 },
  
  // Chạy bộ (Daily): completed June 4, missed June 5, today not completed.
  { id: 'c6_1', habitId: 'h6', date: '2026-06-04', completedCount: 1 }
];

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [goals, setGoals] = useState([]);
  
  // Command Stack for Undo
  const [undoStack, setUndoStack] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize and Sync with LocalStorage
  useEffect(() => {
    const storedVersion = localStorage.getItem('schema_version');
    const storedHabits = localStorage.getItem('habits');
    const storedCheckins = localStorage.getItem('checkins');
    const storedGoals = localStorage.getItem('goals');

    if (
      storedVersion && 
      Number(storedVersion) === SCHEMA_VERSION && 
      storedHabits && 
      storedCheckins && 
      storedGoals
    ) {
      setHabits(JSON.parse(storedHabits));
      setCheckins(JSON.parse(storedCheckins));
      setGoals(JSON.parse(storedGoals));
    } else {
      // First boot or version mismatch: Seed defaults
      setHabits(MOCK_HABITS);
      setCheckins(MOCK_CHECKINS);
      setGoals(MOCK_GOALS);
      
      localStorage.setItem('schema_version', String(SCHEMA_VERSION));
      localStorage.setItem('habits', JSON.stringify(MOCK_HABITS));
      localStorage.setItem('checkins', JSON.stringify(MOCK_CHECKINS));
      localStorage.setItem('goals', JSON.stringify(MOCK_GOALS));
    }
  }, []);

  // Helper: Persist state changes
  const persist = (newHabits, newCheckins, newGoals) => {
    localStorage.setItem('habits', JSON.stringify(newHabits));
    localStorage.setItem('checkins', JSON.stringify(newCheckins));
    localStorage.setItem('goals', JSON.stringify(newGoals));
  };

  // Push snapshot to undo stack
  const saveUndoSnapshot = (description) => {
    setUndoStack(prev => [...prev.slice(-19), {
      checkins: JSON.parse(JSON.stringify(checkins)),
      description
    }]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const nextStack = [...undoStack];
    const snapshot = nextStack.pop();
    
    setCheckins(snapshot.checkins);
    persist(habits, snapshot.checkins, goals);
    setUndoStack(nextStack);
    
    showToast(`Đã hoàn tác: ${snapshot.description}`);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(current => current === message ? null : current);
    }, 4000);
  };

  // Check if a habit is scheduled on a given dateStr
  const isHabitScheduled = (habit, dateStr) => {
    if (!habit || habit.status === 'Archived') return false;
    if (habit.frequency.type === 'daily') return true;
    
    // For specific, check weekday index (0 = Sun, 1 = Mon...)
    const date = parseDateString(dateStr);
    if (!date) return false;
    return habit.frequency.days.includes(date.getDay());
  };

  // Core Streak Calculation Engine (Idempotent)
  const getHabitStreaks = (habit, checkinList = checkins) => {
    const habitCheckins = checkinList.filter(c => c.habitId === habit.id);
    const checkinMap = {};
    habitCheckins.forEach(c => {
      checkinMap[c.date] = c.completedCount;
    });

    const isScheduled = (dateStr) => {
      if (habit.frequency.type === 'daily') return true;
      const date = parseDateString(dateStr);
      return date ? habit.frequency.days.includes(date.getDay()) : false;
    };

    if (habitCheckins.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const todayStr = getTodayDateString();
    
    // Find the earliest record date to start calculation from
    const earliestStr = habitCheckins.reduce((min, c) => c.date < min ? c.date : min, todayStr);

    // Calculate CURRENT STREAK
    let currentStreak = 0;
    let checkDate = todayStr;
    const todayIsScheduled = isScheduled(todayStr);
    const todayCount = checkinMap[todayStr] || 0;
    const todayCompleted = todayCount >= habit.targetPerDay;

    if (todayIsScheduled) {
      if (todayCompleted) {
        currentStreak = 1;
        // Continue going backward
        let prevDate = addDays(todayStr, -1);
        while (prevDate >= earliestStr) {
          if (isScheduled(prevDate)) {
            const compCount = checkinMap[prevDate] || 0;
            if (compCount >= habit.targetPerDay) {
              currentStreak++;
            } else {
              break;
            }
          }
          prevDate = addDays(prevDate, -1);
        }
      } else {
        // Today is scheduled but not completed yet. Streak is still active 
        // if the last scheduled day before today was completed.
        let prevDate = addDays(todayStr, -1);
        let foundPreviousScheduled = false;
        let previousScheduledCompleted = false;

        while (prevDate >= earliestStr) {
          if (isScheduled(prevDate)) {
            foundPreviousScheduled = true;
            const compCount = checkinMap[prevDate] || 0;
            previousScheduledCompleted = compCount >= habit.targetPerDay;
            break;
          }
          prevDate = addDays(prevDate, -1);
        }

        if (foundPreviousScheduled && previousScheduledCompleted) {
          currentStreak = 0; // Today isn't completed yet
          let checkPrev = prevDate;
          while (checkPrev >= earliestStr) {
            if (isScheduled(checkPrev)) {
              const compCount = checkinMap[checkPrev] || 0;
              if (compCount >= habit.targetPerDay) {
                currentStreak++;
              } else {
                break;
              }
            }
            checkPrev = addDays(checkPrev, -1);
          }
        } else {
          currentStreak = 0;
        }
      }
    } else {
      // Today is NOT scheduled. Check from the last scheduled day before today.
      let prevDate = addDays(todayStr, -1);
      while (prevDate >= earliestStr && !isScheduled(prevDate)) {
        prevDate = addDays(prevDate, -1);
      }

      if (isScheduled(prevDate) && (checkinMap[prevDate] || 0) >= habit.targetPerDay) {
        currentStreak = 0;
        let checkPrev = prevDate;
        while (checkPrev >= earliestStr) {
          if (isScheduled(checkPrev)) {
            const compCount = checkinMap[checkPrev] || 0;
            if (compCount >= habit.targetPerDay) {
              currentStreak++;
            } else {
              break;
            }
          }
          checkPrev = addDays(checkPrev, -1);
        }
      } else {
        currentStreak = 0;
      }
    }

    // Calculate LONGEST STREAK
    let longestStreak = 0;
    let tempStreak = 0;
    let currentTestDate = earliestStr;

    while (currentTestDate <= todayStr) {
      if (isScheduled(currentTestDate)) {
        const compCount = checkinMap[currentTestDate] || 0;
        const isCompleted = compCount >= habit.targetPerDay;

        if (isCompleted) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else {
          // If it's today and not completed, don't reset the running streak 
          // yet (the user has until midnight to complete it).
          if (currentTestDate < todayStr) {
            tempStreak = 0;
          }
        }
      }
      currentTestDate = addDays(currentTestDate, 1);
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    return { currentStreak, longestStreak };
  };

  // Add Habit and optionally its Goal
  const addHabit = (habitData, goalData) => {
    // Generate UUID
    const habitId = 'habit_' + Math.random().toString(36).substr(2, 9);
    const newHabit = {
      id: habitId,
      name: habitData.name,
      category: habitData.category,
      frequency: habitData.frequency,
      targetPerDay: Number(habitData.targetPerDay),
      priority: habitData.priority,
      status: habitData.status || 'Active'
    };

    const nextHabits = [...habits, newHabit];
    let nextGoals = [...goals];

    if (goalData && goalData.targetValue > 0) {
      const goalId = 'goal_' + Math.random().toString(36).substr(2, 9);
      const newGoal = {
        id: goalId,
        habitId,
        targetType: goalData.targetType,
        targetValue: Number(goalData.targetValue)
      };
      nextGoals.push(newGoal);
    }

    setHabits(nextHabits);
    setGoals(nextGoals);
    persist(nextHabits, checkins, nextGoals);
    showToast(`Đã thêm thói quen mới: "${newHabit.name}"`);
  };

  // Update Habit details
  const updateHabit = (habitId, updatedFields, goalData) => {
    const nextHabits = habits.map(h => 
      h.id === habitId ? { ...h, ...updatedFields } : h
    );

    // Update goal
    let nextGoals = goals.filter(g => g.habitId !== habitId);
    if (goalData && goalData.targetValue > 0) {
      const goalId = 'goal_' + Math.random().toString(36).substr(2, 9);
      nextGoals.push({
        id: goalId,
        habitId,
        targetType: goalData.targetType,
        targetValue: Number(goalData.targetValue)
      });
    }

    setHabits(nextHabits);
    setGoals(nextGoals);
    persist(nextHabits, checkins, nextGoals);
    showToast(`Đã cập nhật thói quen "${updatedFields.name || ''}"`);
  };

  // Delete Habit and related items
  const deleteHabit = (habitId) => {
    const habitToDelete = habits.find(h => h.id === habitId);
    const name = habitToDelete ? habitToDelete.name : 'thói quen';

    const nextHabits = habits.filter(h => h.id !== habitId);
    const nextCheckins = checkins.filter(c => c.habitId !== habitId);
    const nextGoals = goals.filter(g => g.habitId !== habitId);

    setHabits(nextHabits);
    setCheckins(nextCheckins);
    setGoals(nextGoals);
    persist(nextHabits, nextCheckins, nextGoals);
    showToast(`Đã xóa thói quen: "${name}"`);
  };

  // Modify check-in completed count with strict guards
  const updateCheckinCount = (habitId, dateStr, count) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { success: false, error: 'Thói quen không tồn tại' };

    // Validations
    if (isPastDate(dateStr) && !isToday(dateStr)) {
      // Allowed but log is updated differently or prompts history access.
      // We will allow this function to execute, but UI should restrict normal checklist.
    }
    
    if (parseDateString(dateStr) > new Date(getTodayDateString())) {
      return { success: false, error: 'Lỗi: Không được điểm danh cho các ngày trong tương lai.' };
    }

    if (count < 0) {
      return { success: false, error: 'Lỗi: Số lượng hoàn thành không được là số âm.' };
    }

    if (count > habit.targetPerDay) {
      return { 
        success: false, 
        error: `Lỗi: Số lượng hoàn thành (${count}) vượt quá giới hạn mục tiêu hàng ngày (${habit.targetPerDay}).` 
      };
    }

    // Capture Undo Stack before updating state
    saveUndoSnapshot(`Điểm danh "${habit.name}" cho ngày ${dateStr}`);

    // Update check-in record
    const existingCheckinIdx = checkins.findIndex(c => c.habitId === habitId && c.date === dateStr);
    let nextCheckins = [...checkins];

    if (existingCheckinIdx >= 0) {
      if (count === 0) {
        // Remove check-in if set back to 0
        nextCheckins.splice(existingCheckinIdx, 1);
      } else {
        nextCheckins[existingCheckinIdx] = {
          ...nextCheckins[existingCheckinIdx],
          completedCount: count
        };
      }
    } else if (count > 0) {
      const checkinId = 'check_' + Math.random().toString(36).substr(2, 9);
      nextCheckins.push({
        id: checkinId,
        habitId,
        date: dateStr,
        completedCount: count
      });
    }

    setCheckins(nextCheckins);
    persist(habits, nextCheckins, goals);
    return { success: true };
  };

  // Check-in helper: increments or decrements
  const adjustCheckin = (habitId, dateStr, amount) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const existing = checkins.find(c => c.habitId === habitId && c.date === dateStr);
    const currentCount = existing ? existing.completedCount : 0;
    const nextCount = currentCount + amount;

    const result = updateCheckinCount(habitId, dateStr, nextCount);
    if (!result.success) {
      alert(result.error);
    }
  };

  // Hard Reset: Clears data and seeds defaults
  const hardReset = () => {
    localStorage.clear();
    setHabits(MOCK_HABITS);
    setCheckins(MOCK_CHECKINS);
    setGoals(MOCK_GOALS);
    setUndoStack([]);
    
    localStorage.setItem('schema_version', String(SCHEMA_VERSION));
    localStorage.setItem('habits', JSON.stringify(MOCK_HABITS));
    localStorage.setItem('checkins', JSON.stringify(MOCK_CHECKINS));
    localStorage.setItem('goals', JSON.stringify(MOCK_GOALS));

    showToast('Hệ thống đã khôi phục trạng thái ban đầu.');
  };

  // Get aggregated stats for today and dashboards
  const getOverallStats = () => {
    const todayStr = getTodayDateString();
    
    // Filter active habits scheduled for today
    const activeTodayHabits = habits.filter(h => 
      h.status === 'Active' && isHabitScheduled(h, todayStr)
    );

    const totalActiveCount = activeTodayHabits.length;
    
    // Count completed habits today
    let completedTodayCount = 0;
    activeTodayHabits.forEach(h => {
      const c = checkins.find(ch => ch.habitId === h.id && ch.date === todayStr);
      if (c && c.completedCount >= h.targetPerDay) {
        completedTodayCount++;
      }
    });

    const completionRate = totalActiveCount > 0 
      ? Math.round((completedTodayCount / totalActiveCount) * 100) 
      : 0;

    // "At Risk" calculation
    // Condition: Scheduled for today, Active, Status != Completed, System Time > 18:00
    const currentHour = new Date().getHours();
    const isPast18 = currentHour >= 18;
    
    let atRiskCount = 0;
    let atRiskHabits = [];

    if (isPast18) {
      activeTodayHabits.forEach(h => {
        const c = checkins.find(ch => ch.habitId === h.id && ch.date === todayStr);
        const completed = c ? c.completedCount >= h.targetPerDay : false;
        if (!completed) {
          atRiskCount++;
          atRiskHabits.push(h);
        }
      });
    }

    // Calculate missed habits in the past week
    // Any scheduled day before today with completedCount < targetPerDay
    // Let's inspect the last 7 days (excluding today)
    let missedCount = 0;
    const last7Days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = formatDateString(d);
      last7Days.push(dStr);
    }

    const missedDetails = [];
    habits.filter(h => h.status === 'Active').forEach(h => {
      last7Days.forEach(dateStr => {
        if (isHabitScheduled(h, dateStr)) {
          const c = checkins.find(ch => ch.habitId === h.id && ch.date === dateStr);
          const completed = c ? c.completedCount >= h.targetPerDay : false;
          if (!completed) {
            missedCount++;
            missedDetails.push({ habit: h, date: dateStr });
          }
        }
      });
    });

    return {
      completionRate,
      completedTodayCount,
      totalActiveCount,
      atRiskCount,
      atRiskHabits,
      missedCount,
      missedDetails
    };
  };

  return (
    <HabitContext.Provider value={{
      habits,
      checkins,
      goals,
      toastMessage,
      canUndo: undoStack.length > 0,
      addHabit,
      updateHabit,
      deleteHabit,
      updateCheckinCount,
      adjustCheckin,
      isHabitScheduled,
      getHabitStreaks,
      getOverallStats,
      hardReset,
      undo
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabitTracker = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabitTracker must be used within a HabitProvider');
  }
  return context;
};
