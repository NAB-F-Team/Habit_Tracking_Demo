import React from 'react';
import { Minus, Plus, Check, Flame, AlertCircle } from 'lucide-react';
import { useHabitTracker } from '../context/HabitContext';
import { getTodayDateString, getWeekdayName, getFriendlyDateText } from '../utils/dateUtils';

export const TodayChecklist = ({ onAddHabitClick, onNavigateToHistory }) => {
  const { 
    habits, 
    checkins, 
    isHabitScheduled, 
    adjustCheckin, 
    getHabitStreaks 
  } = useHabitTracker();

  const todayStr = getTodayDateString();
  const dayIndex = new Date().getDay();

  // Filter active habits scheduled for today
  const activeScheduledToday = habits.filter(h => 
    h.status === 'Active' && isHabitScheduled(h, todayStr)
  );

  const getCheckinCount = (habitId) => {
    const record = checkins.find(c => c.habitId === habitId && c.date === todayStr);
    return record ? record.completedCount : 0;
  };

  const getCategoryNameVi = (category) => {
    const map = {
      Health: 'Sức khỏe',
      Mindfulness: 'Tâm trí',
      Study: 'Học tập',
      Work: 'Công việc',
      Other: 'Khác'
    };
    return map[category] || category;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Điểm Danh Hôm Nay</h1>
          <p className="page-subtitle">
            {getFriendlyDateText(todayStr)} ({getWeekdayName(dayIndex)}) — Đăng ký tiến trình thực tế hàng ngày
          </p>
        </div>
      </div>

      {activeScheduledToday.length === 0 ? (
        <div className="glass-card empty-state">
          <AlertCircle size={40} className="empty-icon" />
          <h2 className="empty-title">Không Có Thói Quen Hôm Nay</h2>
          <p className="empty-desc">
            Không có thói quen hoạt động nào được lên lịch cho ngày hôm nay. Hãy tạo thêm thói quen hoặc thay đổi tần suất.
          </p>
          <button className="btn btn-primary" onClick={onAddHabitClick}>
            Thiết lập thói quen
          </button>
        </div>
      ) : (
        <div className="checklist-container">
          <div className="history-alert" style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc', marginBottom: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Quy tắc bảo vệ:</strong> Để duy trì tính nghiêm túc, bạn chỉ có thể điểm danh trực tiếp cho ngày hôm nay. Nếu muốn chỉnh sửa các ngày trong quá khứ, vui lòng truy cập vào phần <span style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }} onClick={onNavigateToHistory}>Lịch Sử & Nhật Ký</span>.
            </span>
          </div>

          {activeScheduledToday.map(habit => {
            const completedCount = getCheckinCount(habit.id);
            const target = habit.targetPerDay;
            const isCompleted = completedCount >= target;
            const streaks = getHabitStreaks(habit);
            const catClass = `cat-${habit.category.toLowerCase()}`;
            
            // Progress Bar Width
            const progressPercent = Math.min((completedCount / target) * 100, 100);

            return (
              <div 
                key={habit.id} 
                className="glass-card checklist-item" 
                style={{ 
                  borderColor: isCompleted ? 'rgba(16, 185, 129, 0.25)' : 'var(--panel-border)',
                  background: isCompleted ? 'rgba(16, 185, 129, 0.03)' : 'var(--panel-bg)'
                }}
              >
                <div className="habit-main-info">
                  <div className={`category-glow-dot ${catClass}`}></div>
                  <div className="habit-details">
                    <h3 className="habit-name" style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {habit.name}
                    </h3>
                    <div className="habit-meta">
                      <span>{getCategoryNameVi(habit.category)}</span>
                      <span>•</span>
                      <span className={`priority-badge prio-${habit.priority}`}>{habit.priority}</span>
                      <span>•</span>
                      <span style={{ color: isCompleted ? '#34d399' : 'var(--text-secondary)' }}>
                        {isCompleted ? 'Hoàn thành' : `Tiến độ: ${completedCount}/${target}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="checklist-controls">
                  {/* Current Streak badge */}
                  <div className="streak-chip">
                    <Flame size={14} fill={streaks.currentStreak > 0 ? '#f59e0b' : 'none'} />
                    <span>{streaks.currentStreak} ngày</span>
                  </div>

                  {/* Quantity adjustment buttons */}
                  <div className="count-adjuster">
                    <button 
                      className="adjust-btn" 
                      onClick={() => adjustCheckin(habit.id, todayStr, -1)}
                      disabled={completedCount === 0}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="count-display">
                      {completedCount} / {target}
                    </span>
                    <button 
                      className="adjust-btn" 
                      onClick={() => adjustCheckin(habit.id, todayStr, 1)}
                      disabled={completedCount >= target}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Status Indicator circle */}
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: isCompleted ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isCompleted ? '1px solid #10b981' : '1px solid var(--panel-border)',
                      color: isCompleted ? '#10b981' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>...</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default TodayChecklist;
