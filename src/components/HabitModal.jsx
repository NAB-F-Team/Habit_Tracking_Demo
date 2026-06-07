import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useHabitTracker } from '../context/HabitContext';

export const HabitModal = ({ isOpen, onClose, habit = null }) => {
  const { addHabit, updateHabit, goals } = useHabitTracker();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Health');
  const [frequencyType, setFrequencyType] = useState('daily');
  const [frequencyDays, setFrequencyDays] = useState([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [targetPerDay, setTargetPerDay] = useState(1);
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Active');
  
  // Goal fields
  const [hasGoal, setHasGoal] = useState(false);
  const [goalType, setGoalType] = useState('Streak');
  const [goalValue, setGoalValue] = useState(10);
  
  const [error, setError] = useState(null);

  // Sync state if editing a habit
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setCategory(habit.category);
      setFrequencyType(habit.frequency.type);
      setFrequencyDays(habit.frequency.days);
      setTargetPerDay(habit.targetPerDay);
      setPriority(habit.priority);
      setStatus(habit.status);

      // Check if there is an existing goal
      const existingGoal = goals.find(g => g.habitId === habit.id);
      if (existingGoal) {
        setHasGoal(true);
        setGoalType(existingGoal.targetType);
        setGoalValue(existingGoal.targetValue);
      } else {
        setHasGoal(false);
        setGoalType('Streak');
        setGoalValue(10);
      }
    } else {
      // Clear fields for new habit
      setName('');
      setCategory('Health');
      setFrequencyType('daily');
      setFrequencyDays([1, 2, 3, 4, 5]);
      setTargetPerDay(1);
      setPriority('Medium');
      setStatus('Active');
      setHasGoal(false);
      setGoalType('Streak');
      setGoalValue(10);
    }
    setError(null);
  }, [habit, isOpen, goals]);

  if (!isOpen) return null;

  const toggleDay = (dayIndex) => {
    if (frequencyDays.includes(dayIndex)) {
      setFrequencyDays(frequencyDays.filter(d => d !== dayIndex));
    } else {
      setFrequencyDays([...frequencyDays, dayIndex].sort());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!name.trim()) {
      setError('Tên thói quen không được bỏ trống.');
      return;
    }

    if (frequencyType === 'specific' && frequencyDays.length === 0) {
      setError('Vui lòng chọn ít nhất một ngày thực hiện trong tuần.');
      return;
    }

    if (Number(targetPerDay) < 1) {
      setError('Mục tiêu mỗi ngày phải lớn hơn hoặc bằng 1.');
      return;
    }

    let goalData = null;
    if (hasGoal) {
      if (Number(goalValue) <= 0) {
        setError('Mục tiêu dài hạn phải lớn hơn 0.');
        return;
      }
      goalData = {
        targetType: goalType,
        targetValue: Number(goalValue)
      };
    }

    const habitData = {
      name: name.trim(),
      category,
      frequency: {
        type: frequencyType,
        days: frequencyType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : frequencyDays
      },
      targetPerDay: Number(targetPerDay),
      priority,
      status
    };

    if (habit) {
      updateHabit(habit.id, habitData, goalData);
    } else {
      addHabit(habitData, goalData);
    }

    onClose();
  };

  const weekdays = [
    { label: 'CN', index: 0 },
    { label: 'T2', index: 1 },
    { label: 'T3', index: 2 },
    { label: 'T4', index: 3 },
    { label: 'T5', index: 4 },
    { label: 'T6', index: 5 },
    { label: 'T7', index: 6 }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {habit ? 'Chỉnh Sửa Thói Quen' : 'Tạo Thói Quen Mới'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="history-alert" style={{ marginBottom: '1.25rem', borderColor: 'rgba(244,63,94,0.3)', color: '#fda4af', background: 'rgba(244,63,94,0.1)' }}>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Tên Thói Quen</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ví dụ: Thiền định, Chạy bộ, Đọc sách..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Danh Mục</label>
              <select 
                className="form-input form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Health">Sức khỏe (Health)</option>
                <option value="Mindfulness">Tâm trí (Mindfulness)</option>
                <option value="Study">Học tập (Study)</option>
                <option value="Work">Công việc (Work)</option>
                <option value="Other">Khác (Other)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Độ Ưu Tiên</label>
              <select 
                className="form-input form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">Cao (High)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="Low">Thấp (Low)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mục Tiêu/Ngày (Target)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1" 
                value={targetPerDay}
                onChange={(e) => setTargetPerDay(e.target.value)}
              />
            </div>

            {habit && (
              <div className="form-group">
                <label className="form-label">Vòng Đời (Status)</label>
                <select 
                  className="form-input form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Đang Hoạt Động (Active)</option>
                  <option value="Paused">Tạm Dừng (Paused)</option>
                  <option value="Archived">Lưu Trữ (Archived)</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tần Suất Điểm Danh</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input 
                  type="radio" 
                  name="frequencyType" 
                  value="daily" 
                  checked={frequencyType === 'daily'}
                  onChange={() => setFrequencyType('daily')}
                />
                Mỗi ngày
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input 
                  type="radio" 
                  name="frequencyType" 
                  value="specific" 
                  checked={frequencyType === 'specific'}
                  onChange={() => setFrequencyType('specific')}
                />
                Chọn ngày cụ thể
              </label>
            </div>

            {frequencyType === 'specific' && (
              <div className="weekday-selector">
                {weekdays.map(day => (
                  <div key={day.index}>
                    <input 
                      type="checkbox"
                      id={`day-${day.index}`}
                      className="weekday-checkbox"
                      checked={frequencyDays.includes(day.index)}
                      onChange={() => toggleDay(day.index)}
                    />
                    <label htmlFor={`day-${day.index}`} className="weekday-label">
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Thiết lập mục tiêu dài hạn (Milestone Goal)</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={hasGoal}
                  onChange={(e) => setHasGoal(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {hasGoal && (
              <div className="form-row" style={{ animation: 'slideIn 0.2s ease-out' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Loại Mục Tiêu</label>
                  <select 
                    className="form-input form-select"
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value)}
                  >
                    <option value="Streak">Chuỗi ngày liên tiếp (Streak)</option>
                    <option value="Total">Tổng số lần hoàn thành (Total)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Giá Trị Cần Đạt</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1"
                    value={goalValue}
                    onChange={(e) => setGoalValue(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              {habit ? 'Cập Nhật' : 'Tạo Thói Quen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default HabitModal;
