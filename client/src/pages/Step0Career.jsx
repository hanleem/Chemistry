import { CAREER_PATHS } from '../data/careerPaths';
import { useSelectionStore } from '../store/useSelectionStore';
import { NavButtons } from '../components';

export default function Step0Career() {
  const { careerPathId, setCareerPath, setStep } = useSelectionStore();

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          진로 방향을 선택해주세요
        </div>
        <div style={{
          fontSize: 11, color: '#666', lineHeight: 1.6,
          padding: '8px 10px', background: '#f8f8f6',
          borderRadius: 7, border: '0.5px solid #e0e0dc',
        }}>
          목표에 맞는 과목과 특별 프로그램(IPP · D학기제)을 맞춤 추천해드려요.
          언제든 돌아와서 바꿀 수 있어요.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {CAREER_PATHS.map(path => {
          const isSelected = careerPathId === path.id;
          return (
            <div
              key={path.id}
              onClick={() => setCareerPath(path.id)}
              style={{
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                border: `${isSelected ? 2.5 : 1}px solid ${path.color}${isSelected ? '' : '60'}`,
                background: isSelected ? path.color + '20' : path.bg,
                transition: 'all .15s',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              {isSelected && (
                <div style={{
                  fontSize: 9, marginBottom: 5, padding: '1px 6px', borderRadius: 2,
                  background: path.color, color: '#fff', display: 'inline-block',
                }}>선택됨</div>
              )}
              <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 2, fontWeight: 600,
                  background: path.goal === 'employment' ? '#0369A115' : '#7C3AED15',
                  color: path.goal === 'employment' ? '#0369A1' : '#7C3AED',
                }}>
                  {path.goalLabel}
                </span>
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 2, fontWeight: 600,
                  background: path.color + '15', color: path.color,
                }}>
                  {path.fieldLabel}
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: path.color, marginBottom: 5 }}>
                {path.label}
              </div>
              <div style={{ fontSize: 10, color: '#555', lineHeight: 1.5, marginBottom: 8 }}>
                {path.desc}
              </div>
              <div style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 4,
                background: path.color + '15', color: path.color, fontWeight: 600,
                display: 'inline-block',
              }}>
                추천 프로그램: {path.programRec}
              </div>
            </div>
          );
        })}
      </div>

      <NavButtons
        onNext={() => setStep(1)}
        nextDisabled={!careerPathId}
        nextLabel="기초 과목 선택 →"
      />
    </div>
  );
}
