import React, { useState } from 'react';
import { HabitProvider, useHabitTracker } from './context/HabitContext';
import { Dashboard } from './components/Dashboard';
import { TodayChecklist } from './components/TodayChecklist';
import { HabitManager } from './components/HabitManager';
import { HistoryLogs } from './components/HistoryLogs';
import { GoalTracker } from './components/GoalTracker';
import { HabitModal } from './components/HabitModal';

import { 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  History, 
  Target, 
  RotateCcw,
  Sparkles,
  Undo2
} from 'lucide-react';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const { toastMessage, canUndo, undo, hardReset } = useHabitTracker();

  const handleOpenAddModal = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleHardReset = () => {
    if (window.confirm('Cảnh báo bảo mật: Hành động này sẽ xóa toàn bộ thói quen và lịch sử điểm danh của bạn, khôi phục lại dữ liệu mẫu ban đầu. Bạn có đồng ý?')) {
      hardReset();
    }
  };

  // Render the current selected panel
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            onAddHabitClick={handleOpenAddModal} 
            onNavigateToToday={() => setActiveTab('today')}
          />
        );
      case 'today':
        return (
          <TodayChecklist 
            onAddHabitClick={handleOpenAddModal}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        );
      case 'manage':
        return <HabitManager onEditHabitClick={handleOpenEditModal} />;
      case 'history':
        return <HistoryLogs />;
      case 'goals':
        return <GoalTracker onEditHabitClick={handleOpenEditModal} />;
      default:
        return <Dashboard onAddHabitClick={handleOpenAddModal} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={20} color="white" />
          </div>
          <span className="brand-name">HabitTracker Pro</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            <CheckSquare size={18} />
            <span>Điểm Danh</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Settings size={18} />
            <span>Quản Lý</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            <span>Nhật Ký Lịch Sử</span>
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            <Target size={18} />
            <span>Mục Tiêu</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="reset-btn" onClick={handleHardReset}>
            <RotateCcw size={14} />
            <span>Tải Lại Dữ Liệu Mẫu</span>
          </button>
        </div>
      </aside>

      {/* Main content display area */}
      <main className="content-area">
        {renderContent()}
      </main>

      {/* Habit Create/Edit Modal */}
      <HabitModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }} 
        habit={editingHabit}
      />

      {/* Global Toast Alert with Undo Trigger */}
      {toastMessage && (
        <div className="toast">
          <span>{toastMessage}</span>
          {canUndo && (
            <span className="undo-link" onClick={undo} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Undo2 size={14} />
              Hoàn tác
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
};

export default App;
