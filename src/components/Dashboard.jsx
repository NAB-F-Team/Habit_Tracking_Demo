import React, { useEffect, useRef, useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Flame, 
  Calendar, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Plus 
} from 'lucide-react';
import { useHabitTracker } from '../context/HabitContext';
import { getFriendlyDateText, getTodayDateString } from '../utils/dateUtils';

// Self-contained Canvas Confetti Renderer
const ConfettiCanvas = ({ trigger }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#a855f7'];
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 5 + 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
      }

      update() {
        this.x += this.x > canvas.width || this.x < 0 ? -this.speedX : this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        
        // Draw little squares or circles
        if (Math.random() > 0.5) {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 150 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let active = false;
      particles.forEach((p) => {
        p.update();
        p.draw();
        if (p.y < canvas.height) {
          active = true;
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trigger]);

  if (!trigger) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="confetti-canvas" 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }}
    />
  );
};

export const Dashboard = ({ onAddHabitClick, onNavigateToToday }) => {
  const { habits, getOverallStats, getHabitStreaks } = useHabitTracker();
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);

  const stats = getOverallStats();
  const { completionRate, totalActiveCount, completedTodayCount, atRiskCount, atRiskHabits, missedCount, missedDetails } = stats;

  // Track max streak across all habits
  let maxActiveStreak = 0;
  habits.filter(h => h.status === 'Active').forEach(h => {
    const { currentStreak } = getHabitStreaks(h);
    if (currentStreak > maxActiveStreak) {
      maxActiveStreak = currentStreak;
    }
  });

  // Confetti trigger logic
  useEffect(() => {
    if (completionRate === 100 && totalActiveCount > 0 && !hasCelebratedToday) {
      setTriggerConfetti(true);
      setHasCelebratedToday(true);
      
      // Auto turn off trigger after animation ends (e.g. 5 seconds)
      const timer = setTimeout(() => {
        setTriggerConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (completionRate < 100) {
      setHasCelebratedToday(false);
      setTriggerConfetti(false);
    }
  }, [completionRate, totalActiveCount, hasCelebratedToday]);

  // Determine nudge content
  const renderNudgeCard = () => {
    if (totalActiveCount === 0) return null;

    if (completionRate === 100) {
      return (
        <div className="nudge-banner" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.05))', borderColor: 'rgba(16,185,129,0.3)' }}>
          <Award size={24} className="nudge-icon" style={{ color: '#10b981' }} />
          <div className="nudge-content">
            <h4>Tuyệt vời! Đã hoàn thành 100% mục tiêu</h4>
            <p>Bạn đã hoàn thành toàn bộ thói quen cần thiết ngày hôm nay! Hãy tiếp tục duy trì đà kỷ luật xuất sắc này.</p>
          </div>
        </div>
      );
    }

    if (completionRate >= 80) {
      return (
        <div className="nudge-banner" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.05))', borderColor: 'rgba(99,102,241,0.3)' }}>
          <Sparkles size={24} className="nudge-icon" style={{ color: '#818cf8' }} />
          <div className="nudge-content">
            <h4>Bảo vệ chuỗi thói quen của bạn!</h4>
            <p>Bạn đã đi được 4/5 quãng đường (<strong>{completionRate}%</strong>), một chút nỗ lực nữa để bảo vệ chuỗi thói quen!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="nudge-banner">
        <TrendingUp size={24} className="nudge-icon" />
        <div className="nudge-content">
          <h4>Duy trì kỷ luật cá nhân</h4>
          <p>Hôm nay bạn đã hoàn thành <strong>{completedTodayCount}/{totalActiveCount}</strong> thói quen. Hãy dành ít phút để hoàn tất và củng cố thói quen tốt nhé!</p>
        </div>
      </div>
    );
  };

  // Render empty state
  if (habits.length === 0) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Chào Mừng Bạn Đến Với Habit Tracker Pro</h1>
            <p className="page-subtitle">Hệ thống xử lý dữ liệu hành vi & tối ưu hiệu suất bản thân</p>
          </div>
        </div>
        <div className="glass-card empty-state" style={{ marginTop: '2rem' }}>
          <div className="brand-icon" style={{ width: '60px', height: '60px', borderRadius: '15px', marginBottom: '1.5rem' }}>
            <Award size={30} style={{ color: 'white' }} />
          </div>
          <h2 className="empty-title">Dashboard Đang Trống</h2>
          <p className="empty-desc">
            Không tìm thấy thói quen nào trong tài khoản. Hãy bắt đầu xây dựng lộ trình thay đổi hành vi ngay bây giờ!
          </p>
          <button className="btn btn-primary" onClick={onAddHabitClick}>
            <Plus size={16} /> Bắt đầu thói quen đầu tiên của bạn
          </button>
        </div>
      </div>
    );
  }

  // Calculate stroke dasharray for SVG Progress Ring
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div>
      <ConfettiCanvas trigger={triggerConfetti} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Behavioral Dashboard</h1>
          <p className="page-subtitle">Chỉ số dữ liệu hành vi ngày {getFriendlyDateText(getTodayDateString())}</p>
        </div>
        <button className="btn btn-primary" onClick={onAddHabitClick}>
          <Plus size={16} /> Thêm Thói Quen
        </button>
      </div>

      {/* Statistics Panels */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="progress-ring-container">
            <svg className="circular-chart" viewBox="0 0 42 42">
              <circle className="circle-bg" cx="21" cy="21" r={radius} />
              <circle 
                className={`circle ${completionRate === 100 ? 'circle-completed' : 'circle-incomplete'}`}
                cx="21" 
                cy="21" 
                r={radius} 
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 21 21)"
              />
            </svg>
            <div className="percentage-overlay" style={{ color: completionRate === 100 ? '#10b981' : '#f8fafc' }}>
              {completionRate}%
            </div>
          </div>
          <div className="stat-info">
            <span className="stat-value">{completedTodayCount}/{totalActiveCount}</span>
            <span className="stat-label">Hoàn Thành Hôm Nay</span>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderLeft: atRiskCount > 0 ? '3px solid var(--accent-danger)' : '1px solid var(--panel-border)' }}>
          <div className="stat-icon-wrapper" style={{ background: atRiskCount > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.03)', color: atRiskCount > 0 ? '#f43f5e' : 'var(--text-secondary)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: atRiskCount > 0 ? '#f43f5e' : '#f8fafc' }}>{atRiskCount}</span>
            <span className="stat-label">Thói Quen Nguy Cơ Bị Đứt Chuỗi</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>
            <Flame size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: '#fbbf24' }}>{maxActiveStreak} ngày</span>
            <span className="stat-label">Chuỗi Dài Nhất Hiện Tại</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{missedCount} lần</span>
            <span className="stat-label">Bỏ Lỡ Trong 7 Ngày</span>
          </div>
        </div>
      </div>

      {/* Nudge Banner */}
      {renderNudgeCard()}

      <div className="dashboard-layout">
        {/* Left column: today summary / warnings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* At Risk details */}
          {atRiskCount > 0 && (
            <div className="glass-card at-risk-card" style={{ borderLeftColor: 'var(--accent-danger)' }}>
              <div className="at-risk-header">
                <AlertTriangle size={18} />
                <span>CHÚ Ý: Nguy Cơ Đứt Chuỗi Hôm Nay (Sau 18:00)</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Các thói quen hoạt động sau đây được lên lịch ngày hôm nay nhưng chưa được đánh dấu hoàn thành. Hãy thực hiện trước 00:00!
              </p>
              <div className="at-risk-section">
                {atRiskHabits.map(h => {
                  const streaks = getHabitStreaks(h);
                  return (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(244,63,94,0.04)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.1)' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{h.name}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="priority-badge prio-High" style={{ fontSize: '0.6rem' }}>{h.priority}</span>
                        <div className="streak-chip" style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem' }}>
                          <Flame size={12} />
                          <span>{streaks.currentStreak} ngày</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={onNavigateToToday}
              >
                Tới bảng điểm danh
              </button>
            </div>
          )}

          {/* Missed Details */}
          {missedCount > 0 && (
            <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-warning)' }}>
              <div className="at-risk-header" style={{ color: 'var(--accent-warning)' }}>
                <CheckCircle size={18} style={{ color: 'var(--accent-warning)' }} />
                <span>Nhật Ký Bỏ Lỡ Trong Tuần Qua</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginTop: '0.75rem' }}>
                {missedDetails.slice(0, 5).map((detail, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{detail.habit.name}</span>
                    <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>Bỏ lỡ ({getFriendlyDateText(detail.date)})</span>
                  </div>
                ))}
                {missedDetails.length > 5 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    và {missedDetails.length - 5} lần bỏ lỡ khác...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Intro Tip */}
          <div className="glass-card">
            <h3 className="section-title">
              <Sparkles size={18} style={{ color: '#818cf8' }} />
              Hướng dẫn Behavioral Data Engine
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <p>
                <strong>1. Chuỗi Thói Quen (Streaks):</strong> Được tính toán hoàn toàn động (On-The-Fly) từ dữ liệu điểm danh. Nếu thói quen chỉ làm vào ngày cụ thể, chuỗi sẽ bỏ qua các ngày không được xếp lịch, giúp đảm bảo chỉ số phản ánh đúng tính kỷ luật.
              </p>
              <p>
                <strong>2. Toàn Vẹn Tham Chiếu:</strong> Mọi hoạt động chỉnh sửa điểm danh của quá khứ chỉ được thao tác tại mục <strong>Lịch Sử & Nhật Ký</strong>. Ở màn hình điểm danh hàng ngày, bạn chỉ được chỉnh sửa ngày hiện tại nhằm đảm bảo tính nghiêm túc.
              </p>
              <p>
                <strong>3. Hoàn Tác (Undo):</strong> Khi lỡ bấm nhầm điểm danh, bạn có thể bấm <strong>Hoàn tác</strong> ở thanh thông báo dưới góc phải màn hình trong vòng 4 giây để hồi phục trạng thái cũ.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: general habit tracking status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 className="section-title">Danh Mục Đang Theo Dõi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Health', 'Mindfulness', 'Study', 'Work', 'Other'].map(cat => {
                const count = habits.filter(h => h.category === cat && h.status === 'Active').length;
                if (count === 0) return null;
                
                let catClass = `cat-${cat.toLowerCase()}`;
                let label = cat === 'Health' ? 'Sức khỏe' :
                            cat === 'Mindfulness' ? 'Tâm trí' :
                            cat === 'Study' ? 'Học tập' :
                            cat === 'Work' ? 'Công việc' : 'Khác';

                return (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`category-glow-dot ${catClass}`}></div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
                    </div>
                    <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {count} thói quen
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
