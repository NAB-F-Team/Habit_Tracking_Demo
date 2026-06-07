import React, { useState } from 'react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Play, 
  Pause, 
  Archive, 
  RotateCcw, 
  Flame, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useHabitTracker } from '../context/HabitContext';
import { getWeekdayName } from '../utils/dateUtils';

export const HabitManager = ({ onEditHabitClick }) => {
  const { habits, getHabitStreaks, updateHabit, deleteHabit } = useHabitTracker();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [prioFilter, setPrioFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active'); // Default to showing Active habits

  // Helper to get vietnamese frequency text
  const getFrequencyText = (freq) => {
    if (freq.type === 'daily') return 'Mỗi ngày';
    
    // Sort days to ensure consistency
    const sortedDays = [...freq.days].sort();
    if (sortedDays.length === 7) return 'Mỗi ngày';
    
    const dayLabels = sortedDays.map(d => getWeekdayName(d, true));
    return `Ngày cụ thể: ${dayLabels.join(', ')}`;
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

  const togglePauseResume = (habit) => {
    const nextStatus = habit.status === 'Paused' ? 'Active' : 'Paused';
    updateHabit(habit.id, { name: habit.name, status: nextStatus });
  };

  const toggleArchive = (habit) => {
    const nextStatus = habit.status === 'Archived' ? 'Active' : 'Archived';
    updateHabit(habit.id, { name: habit.name, status: nextStatus });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thói quen này? Mọi lịch sử điểm danh liên quan cũng sẽ bị xóa vĩnh viễn.')) {
      deleteHabit(id);
    }
  };

  // Filtering Logic
  const filteredHabits = habits.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = catFilter === 'All' || h.category === catFilter;
    const matchesPriority = prioFilter === 'All' || h.priority === prioFilter;
    const matchesStatus = statusFilter === 'All' || h.status === statusFilter;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Lý Thói Quen</h1>
          <p className="page-subtitle">Xem toàn bộ thiết lập thói quen, tùy chỉnh trạng thái vòng đời và mục tiêu</p>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Tìm thói quen..." 
              className="form-input search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="form-input form-select" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="All">Tất cả danh mục</option>
            <option value="Health">Sức khỏe</option>
            <option value="Mindfulness">Tâm trí</option>
            <option value="Study">Học tập</option>
            <option value="Work">Công việc</option>
            <option value="Other">Khác</option>
          </select>

          <select 
            className="form-input form-select" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={prioFilter}
            onChange={(e) => setPrioFilter(e.target.value)}
          >
            <option value="All">Tất cả độ ưu tiên</option>
            <option value="High">Độ ưu tiên Cao</option>
            <option value="Medium">Độ ưu tiên Trung bình</option>
            <option value="Low">Độ ưu tiên Thấp</option>
          </select>

          <select 
            className="form-input form-select" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Đang hoạt động</option>
            <option value="Paused">Tạm dừng</option>
            <option value="Archived">Đã lưu trữ</option>
          </select>
        </div>
      </div>

      {/* List of habits */}
      {filteredHabits.length === 0 ? (
        <div className="glass-card empty-state">
          <Search size={40} className="empty-icon" />
          <h2 className="empty-title">Không Tìm Thấy Kết Quả</h2>
          <p className="empty-desc">
            Không tìm thấy thói quen nào khớp với bộ lọc hiện tại. Hãy thử điều chỉnh từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="habits-grid">
          {filteredHabits.map(habit => {
            const streaks = getHabitStreaks(habit);
            const catClass = `cat-${habit.category.toLowerCase()}`;
            
            // Badge style for status
            let statusText = 'Hoạt động';
            let statusStyle = { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' };
            
            if (habit.status === 'Paused') {
              statusText = 'Tạm dừng';
              statusStyle = { background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' };
            } else if (habit.status === 'Archived') {
              statusText = 'Đã lưu trữ';
              statusStyle = { background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' };
            }

            return (
              <div 
                key={habit.id} 
                className="glass-card manager-card"
                style={{ 
                  opacity: habit.status !== 'Active' ? 0.7 : 1,
                  borderLeft: `4px solid var(--cat-${habit.category.toLowerCase()})`
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{habit.name}</span>
                    <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, ...statusStyle }}>
                      {statusText}
                    </span>
                  </div>
                  
                  <div className="habit-meta" style={{ flexWrap: 'wrap' }}>
                    <span>{getCategoryNameVi(habit.category)}</span>
                    <span>•</span>
                    <span className={`priority-badge prio-${habit.priority}`}>{habit.priority}</span>
                    <span>•</span>
                    <span>{getFrequencyText(habit.frequency)}</span>
                    <span>•</span>
                    <span>Mục tiêu ngày: {habit.targetPerDay} lần</span>
                  </div>

                  {/* Streaks indices */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Flame size={14} style={{ color: '#f59e0b' }} />
                      <span>Chuỗi hiện tại: <strong>{streaks.currentStreak} ngày</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Sparkles size={14} style={{ color: '#a855f7' }} />
                      <span>Chuỗi kỷ lục: <strong>{streaks.longestStreak} ngày</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="manager-actions">
                  {/* Pause / Play button */}
                  {habit.status !== 'Archived' && (
                    <button 
                      className="icon-btn" 
                      title={habit.status === 'Paused' ? 'Tiếp tục thói quen' : 'Tạm dừng thói quen'}
                      onClick={() => togglePauseResume(habit)}
                    >
                      {habit.status === 'Paused' ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                  )}

                  {/* Archive / Unarchive button */}
                  <button 
                    className="icon-btn" 
                    title={habit.status === 'Archived' ? 'Kích hoạt lại' : 'Lưu trữ thói quen (Lịch sử vẫn giữ)'}
                    onClick={() => toggleArchive(habit)}
                  >
                    {habit.status === 'Archived' ? <RotateCcw size={16} /> : <Archive size={16} />}
                  </button>

                  {/* Edit button */}
                  <button 
                    className="icon-btn" 
                    title="Chỉnh sửa chi tiết"
                    onClick={() => onEditHabitClick(habit)}
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Delete button */}
                  <button 
                    className="icon-btn icon-btn-danger" 
                    title="Xóa vĩnh viễn"
                    onClick={() => handleDelete(habit.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default HabitManager;
