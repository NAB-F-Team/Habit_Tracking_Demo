import React from 'react';
import { Target, Award, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useHabitTracker } from '../context/HabitContext';

export const GoalTracker = ({ onEditHabitClick }) => {
  const { habits, checkins, goals, getHabitStreaks } = useHabitTracker();

  // Find goal progress
  const getGoalProgress = (goal, habit) => {
    if (goal.targetType === 'Streak') {
      const streaks = getHabitStreaks(habit);
      return streaks.currentStreak;
    } else {
      // Sum of all completedCount in history
      const habitCheckins = checkins.filter(c => c.habitId === habit.id);
      return habitCheckins.reduce((sum, c) => sum + c.completedCount, 0);
    }
  };

  // Divide habits into those with and without goals
  const activeHabits = habits.filter(h => h.status !== 'Archived');
  const habitsWithGoals = [];
  const habitsWithoutGoals = [];

  activeHabits.forEach(habit => {
    const goal = goals.find(g => g.habitId === habit.id);
    if (goal) {
      habitsWithGoals.push({ habit, goal });
    } else {
      habitsWithoutGoals.push(habit);
    }
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mục Tiêu Dài Hạn</h1>
          <p className="page-subtitle">Theo dõi các cột mốc quan trọng và tiến độ hoàn thành các thói quen</p>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Left Column: List of Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 className="section-title">
              <Target size={18} style={{ color: 'var(--accent-primary)' }} />
              Tiến Độ Mục Tiêu Đang Thực Hiện ({habitsWithGoals.length})
            </h3>

            {habitsWithGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Chưa có thói quen nào thiết lập mục tiêu dài hạn. Hãy chỉnh sửa thói quen và bật mục tiêu dài hạn.
              </div>
            ) : (
              <div className="milestones-section">
                {habitsWithGoals.map(({ habit, goal }) => {
                  const progress = getGoalProgress(goal, habit);
                  const isAchieved = progress >= goal.targetValue;
                  const percent = Math.min(Math.round((progress / goal.targetValue) * 100), 100);
                  const unit = goal.targetType === 'Streak' ? 'ngày liên tiếp' : 'lần điểm danh';

                  return (
                    <div 
                      key={goal.id} 
                      className="goal-progress-card" 
                      style={{ 
                        background: 'rgba(255,255,255,0.01)', 
                        padding: '1.25rem', 
                        borderRadius: '12px', 
                        border: isAchieved ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--panel-border)' 
                      }}
                    >
                      <div className="goal-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="goal-habit-name" style={{ fontSize: '1rem' }}>{habit.name}</span>
                          {isAchieved && (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.25rem', 
                                background: 'rgba(16,185,129,0.1)', 
                                color: '#34d399', 
                                padding: '0.15rem 0.45rem', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 700 
                              }}
                            >
                              <Check size={12} strokeWidth={3} /> Đạt cột mốc
                            </span>
                          )}
                        </div>
                        <span className="goal-progress-text" style={{ fontWeight: 700, color: isAchieved ? '#34d399' : 'var(--text-secondary)' }}>
                          {progress} / {goal.targetValue} {unit} ({percent}%)
                        </span>
                      </div>

                      <div className="goal-progress-bar-bg" style={{ marginTop: '0.25rem' }}>
                        <div 
                          className={`goal-progress-bar-fill ${isAchieved ? 'complete' : ''}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <span>Loại mục tiêu: {goal.targetType === 'Streak' ? 'Chuỗi ngày' : 'Tổng số lần'}</span>
                        <span style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 600 }} onClick={() => onEditHabitClick(habit)}>
                          Thay đổi mục tiêu
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Habits without Goals (UX requirement) */}
        <div>
          <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-warning)' }}>
            <h3 className="section-title" style={{ color: 'var(--accent-warning)' }}>
              <ShieldAlert size={18} />
              Cảnh Báo Thiếu Mục Tiêu
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Đặt mục tiêu dài hạn giúp tăng 70% tỷ lệ bám sát thói quen. Các thói quen dưới đây chưa có cấu trúc mục tiêu cột mốc:
            </p>

            {habitsWithoutGoals.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600, padding: '0.5rem 0' }}>
                ✓ Tuyệt vời! Tất cả thói quen đang hoạt động đã được thiết lập mục tiêu dài hạn.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {habitsWithoutGoals.map(habit => (
                  <div 
                    key={habit.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: 'rgba(245,158,11,0.03)', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(245,158,11,0.1)' 
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{habit.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chưa có mục tiêu dài hạn</span>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
                      onClick={() => onEditHabitClick(habit)}
                    >
                      Thiết lập
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GoalTracker;
