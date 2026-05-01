// ── StepBar.jsx ──
export function StepBar({ current, total = 5 }) {
  const labels = ['진로 선택', '기초 선택', '기초 모듈', '심화 선택', '심화 모듈', '이수 로드맵'];
  return (
    <div style={{ marginBottom: 16 }}>
      {/* 진행 바 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < current - 1
                ? '#185FA5'
                : i === current - 1
                  ? '#534AB7'
                  : '#e0e0dc',
              transition: 'background .25s',
            }}
          />
        ))}
      </div>
      {/* 라벨 */}
      <div style={{ display: 'flex', gap: 4 }}>
        {labels.map((label, i) => (
          <div
            key={i}
            style={{
              flex: 1, textAlign: 'center', fontSize: 10,
              color: i === current - 1
                ? '#534AB7'
                : i < current - 1
                  ? '#185FA5'
                  : '#aaa',
              fontWeight: i === current - 1 ? 600 : 400,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CourseCard.jsx ──
import { MODULES } from '../data/modules';
const KIND_LABEL = { theory: '이론', lab: '실습', mixed: '이론+실습' };
const KIND_COLOR = { theory: '#185FA5', lab: '#0F6E56', mixed: '#B45309' };
const KIND_BG    = { theory: '#E6F1FB80', lab: '#E1F5EE80', mixed: '#FEF3C780' };

export function CourseCard({ course, selected, onClick, maxReached }) {
  const mod = course.module ? MODULES[course.module] : null;
  const color  = mod?.color  ?? '#888';
  const bg     = mod?.bg     ?? '#f5f5f3';
  const dimmed = !selected && maxReached;

  return (
    <div
      onClick={!dimmed ? onClick : undefined}
      style={{
        padding: '10px 12px', borderRadius: 10,
        border: `${selected ? 2.5 : 1}px solid`,
        borderColor: selected ? color : color + '50',
        background: selected ? bg : bg + 'aa',
        color,
        cursor: dimmed ? 'not-allowed' : 'pointer',
        opacity: dimmed ? 0.4 : 1,
        transform: selected ? 'translateY(-2px)' : 'none',
        transition: 'all .15s',
        position: 'relative',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: 6, right: 8,
          width: 18, height: 18, borderRadius: '50%',
          background: color, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
        }}>✓</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{course.name}</div>
        {course.kind && (
          <span style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 3, flexShrink: 0,
            background: KIND_BG[course.kind], color: KIND_COLOR[course.kind],
          }}>{KIND_LABEL[course.kind]}</span>
        )}
      </div>
      {course.hint && (
        <div style={{ fontSize: 10, opacity: .7, fontStyle: 'italic' }}>{course.hint}</div>
      )}
      {mod && (
        <div style={{
          display: 'inline-block', marginTop: 5,
          fontSize: 9, padding: '1px 6px', borderRadius: 3,
          background: color, color: '#fff',
        }}>
          [{course.module}] {mod.name}
        </div>
      )}
    </div>
  );
}

// ── ModuleChip.jsx ──
export function ModuleChip({ mod, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 14,
        border: `${active ? 2.5 : 1.5}px solid ${mod.color}`,
        background: mod.bg, color: mod.color,
        fontSize: 11, fontWeight: 600,
        cursor: 'pointer',
        transform: active ? 'translateY(-1px)' : 'none',
        transition: 'all .12s',
      }}
    >
      [{mod.id}] {mod.name}
    </button>
  );
}

// ── ModuleDetail.jsx ──
export function ModuleDetail({ mod, onClose }) {
  if (!mod) return null;
  return (
    <div style={{
      borderRadius: 10, padding: '12px 14px',
      border: `1px solid ${mod.color}60`,
      background: mod.bg,
      marginTop: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 3,
            background: mod.color, color: '#fff', marginRight: 6,
          }}>
            [{mod.id}] {mod.type === 'U' ? '기초' : mod.type === 'M' ? '창출' : '활용'}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: mod.color }}>{mod.name}</span>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: '#888', padding: '0 4px',
        }}>✕</button>
      </div>
      <p style={{ fontSize: 11, color: '#555', lineHeight: 1.6, marginBottom: 8 }}>{mod.desc}</p>
      <div style={{ fontSize: 11, color: mod.color, fontWeight: 600, marginBottom: 4 }}>
        구성 교과목 ({mod.credits}학점)
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {mod.courses.map(c => (
          <span key={c} style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 3,
            border: `0.5px solid ${mod.color}50`,
            background: '#fff9', color: mod.color,
          }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

// ── NavButtons.jsx ──
export function NavButtons({ onBack, onNext, nextLabel = '다음 →', nextDisabled = false, backLabel = '← 이전' }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      {onBack && (
        <button onClick={onBack} style={{
          padding: '8px 18px', borderRadius: 7, fontSize: 12, fontWeight: 500,
          border: '0.5px solid #ccc', background: '#f5f5f3', color: '#333',
          cursor: 'pointer',
        }}>{backLabel}</button>
      )}
      <button onClick={onNext} disabled={nextDisabled} style={{
        padding: '8px 18px', borderRadius: 7, fontSize: 12, fontWeight: 600,
        border: 'none', background: nextDisabled ? '#ccc' : '#534AB7', color: '#fff',
        cursor: nextDisabled ? 'not-allowed' : 'pointer',
        transition: 'background .15s',
      }}>{nextLabel}</button>
    </div>
  );
}
