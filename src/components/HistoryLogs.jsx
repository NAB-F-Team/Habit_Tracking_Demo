import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Check, 
  Minus, 
  Plus,
  Flame,
  Calendar
} from 'lucide-react';
import { useHabitTracker } from '../context/HabitContext';
import { 
  getTodayDateString, 
  formatDateString, 
  parseDateString, 
  addDays, 
  getFriendlyDateText, 
  getWeekdayName,
  isFutureDate
} from '../utils/dateUtils';

export const HistoryLogs = () => {
  const { 
    habits, 
    checkins, 
    isHabitScheduled, 
    updateCheckinCount, 
    getHabitStreaks 
  } = useHabitTracker();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(addDays(todayStr, -1)); // Default to yesterday
  const [errorMessage, setErrorMessage] = useState(null);

  // Generate 7 days centered around selectedDate for the sliding date picker
  const getDateChips = () => {
    const chips = [];
    for (let i = -3; i <= 3; i++) {
      const dStr = addDays(selectedDate, i);
      if (!isFutureDate(dStr)) {
        chips.push(dStr);
      }
    }
    return chips;
  };

  const dateChips = getDateChips();

  // Find habits scheduled for the selectedDate
  const scheduledHabits = habits.filter(h => 
    h.status !== 'Archived' && isHabitScheduled(h, selectedDate)
  );

  const getCheckinCount = (habitId) => {
    const record = checkins.find(c => c.habitId === habitId && c.date === selectedDate);
    return record ? record.completedCount : 0;
  };

  const handleAdjustCount = (habitId, currentCount, amount, targetPerDay) => {
    setErrorMessage(null);
    const nextCount = currentCount + amount;
    
    const result = updateCheckinCount(habitId, selectedDate, nextCount);
    if (!result.success) {
      setErrorMessage(result.error);
    }
  };

  const handleDirectInput = (habitId, val, targetPerDay) => {
    setErrorMessage(null);
    const count = val === '' ? 0 : Number(val);
    
    const result = updateCheckinCount(habitId, selectedDate, count);
    if (!result.success) {
      setErrorMessage(result.error);
    }
  };

  const navigateDays = (amount) => {
    setErrorMessage(null);
    const nextDate = addDays(selectedDate, amount);
    if (!isFutureDate(nextDate)) {
      setSelectedDate(nextDate);
    }
  };

  return (
    <div className="history-section">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lịch Sử & Nhật Ký</h1>
          <p className="page-subtitle">Kiểm tra lịch sử điểm danh và bổ sung ghi chép các ngày trước</p>
        </div>
      </div>

      {/* Security alert warning */}
      <div className="history-alert">
        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
        <div>
          <strong style={{ color: '#fbbf24' }}>Cảnh báo bảo mật nghiệp vụ:</strong> Việc chỉnh sửa dữ liệu điểm danh trong quá khứ sẽ trực tiếp làm thay đổi hoặc ngắt quãng các chỉ số <strong>Chuỗi Ngày Liên Tiếp (Streaks)</strong> và <strong>Tiến Độ Mục Tiêu</strong>. Vui lòng ghi chép trung thực với tiến trình thực tế.
        </div>
      </div>

      {errorMessage && (
        <div className="history-alert" style={{ background: 'rgba(244,63,94,0.1)', borderColor: 'rgba(244,63,94,0.3)', color: '#fda4af' }}>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Date Sliding Selector */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div className="date-navigator">
          <button 
            className="icon-btn" 
            onClick={() => navigateDays(-1)}
            title="Ngày trước đó"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="current-nav-date">
            <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {getFriendlyDateText(selectedDate)}
            </span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {getWeekdayName(parseDateString(selectedDate).getDay())}
            </div>
          </div>

          <button 
            className="icon-btn" 
            onClick={() => navigateDays(1)}
            disabled={isFutureDate(addDays(selectedDate, 1))}
            title="Ngày tiếp theo"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Sliding timeline chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {dateChips.map(dateStr => {
            const isSelected = dateStr === selectedDate;
            const parsed = parseDateString(dateStr);
            const wName = getWeekdayName(parsed.getDay(), true);
            const dayNum = parsed.getDate();
            
            // Check completed percentage for this date to show mini dot indicator
            const dayHabits = habits.filter(h => h.status !== 'Archived' && isHabitScheduled(h, dateStr));
            let completedCount = 0;
            dayHabits.forEach(h => {
              const c = checkins.find(ch => ch.habitId === h.id && ch.date === dateStr);
              if (c && c.completedCount >= h.targetPerDay) completedCount++;
            });
            const rate = dayHabits.length > 0 ? (completedCount / dayHabits.length) : 0;
            const isDayCompleted = rate === 1 && dayHabits.length > 0;

            return (
              <button
                key={dateStr}
                onClick={() => { setErrorMessage(null); setSelectedDate(dateStr); }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--panel-border)',
                  background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#818cf8' : 'var(--text-secondary)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  minWidth: '55px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{wName}</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.15rem' }}>{dayNum}</span>
                {dayHabits.length > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '4px', 
                    width: '5px', 
                    height: '5px', 
                    borderRadius: '50%', 
                    background: isDayCompleted ? '#10b981' : rate > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Habits list for selectedDate */}
      <div className="glass-card">
        <div className="history-card-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
            Danh Sách Thói Quen Lịch Trình ({scheduledHabits.length})
          </h3>
        </div>

        {scheduledHabits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Không có thói quen nào được lên lịch cho ngày này.
          </div>
        ) : (
          <div>
            {scheduledHabits.map(habit => {
              const currentCount = getCheckinCount(habit.id);
              const target = habit.targetPerDay;
              const isCompleted = currentCount >= target;
              const streaks = getHabitStreaks(habit);

              return (
                <div key={habit.id} className="history-log-row">
                  <div>
                    <span style={{ fontWeight: 700, color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {habit.name}
                    </span>
                    <div className="habit-meta" style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
                      <span className={`priority-badge prio-${habit.priority}`} style={{ fontSize: '0.6rem' }}>{habit.priority}</span>
                      <span>Mục tiêu ngày: {target} lần</span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    
                    {/* Display active streak dynamically */}
                    <div className="streak-chip" style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }}>
                      <Flame size={12} />
                      <span>{streaks.currentStreak} ngày</span>
                    </div>

                    <div className="history-edit-box">
                      <button
                        className="adjust-btn"
                        style={{ border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}
                        onClick={() => handleAdjustCount(habit.id, currentCount, -1, target)}
                        disabled={currentCount === 0}
                      >
                        <Minus size={12} />
                      </button>

                      <input 
                        type="number"
                        min="0"
                        max={target}
                        className="form-input"
                        style={{ width: '55px', textAlign: 'center', padding: '0.35rem', fontSize: '0.85rem', height: '30px' }}
                        value={currentCount}
                        onChange={(e) => handleDirectInput(habit.id, e.target.value, target)}
                      />

                      <button
                        className="adjust-btn"
                        style={{ border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}
                        onClick={() => handleAdjustCount(habit.id, currentCount, 1, target)}
                        disabled={currentCount >= target}
                      >
                        <Plus size={12} />
                      </button>

                      <div 
                        style={{ 
                          width: '26px', 
                          height: '26px', 
                          borderRadius: '50%', 
                          background: isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                          border: isCompleted ? '1px solid #10b981' : '1px solid var(--panel-border)',
                          color: isCompleted ? '#10b981' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isCompleted ? <Check size={14} strokeWidth={3} /> : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default HistoryLogs;
