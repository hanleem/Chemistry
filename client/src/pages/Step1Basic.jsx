import { ALL_COURSES } from '../data/courses';
import { useSelectionStore } from '../store/useSelectionStore';
import { CourseCard, NavButtons } from '../components';
import { CAREER_PATH_BY_ID } from '../data/careerPaths';

const BASIC_IDS = ['pc1', 'ic1', 'oc1', 'ac1', 'nano_basic'];

export default function Step1Basic() {
  const { basicIds, toggleBasic, setStep, careerPathId } = useSelectionStore();
  const maxReached = basicIds.length >= 2;
  const careerPath = careerPathId ? CAREER_PATH_BY_ID[careerPathId] : null;

  const basicCourses = BASIC_IDS.map(id => ALL_COURSES.find(c => c.id === id)).filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
          관심 있는 기초 과목 2개를 선택해주세요
        </div>
        {careerPath && (
          <div style={{
            fontSize: 11, color: careerPath.color, lineHeight: 1.5,
            padding: '6px 10px', background: careerPath.bg,
            borderRadius: 7, border: `0.5px solid ${careerPath.color}50`,
            marginBottom: 6,
          }}>
            <strong>{careerPath.label}</strong> 방향에서{' '}
            <span style={{
              background: careerPath.color, color: '#fff',
              padding: '0 4px', borderRadius: 2, fontSize: 10,
            }}>추천</span>{' '}
            표시 과목을 참고하세요.
          </div>
        )}
        <div style={{
          fontSize: 11, color: '#666', lineHeight: 1.6,
          padding: '8px 10px', background: '#E6F1FB',
          borderRadius: 7, border: '0.5px solid #185FA540',
        }}>
          5개 과목 모두 수강 권장이에요. 가장 흥미롭거나 잘 맞는 과목{' '}
          <strong>2개</strong>를 골라 경로를 추천받으세요.
        </div>
      </div>

      <div style={{
        fontSize: 11, fontWeight: 600, color: '#534AB7', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          display: 'inline-block', width: 20, height: 20, borderRadius: '50%',
          background: '#534AB7', color: '#fff',
          textAlign: 'center', lineHeight: '20px', fontSize: 10,
        }}>{basicIds.length}</span>
        / 2개 선택됨
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 8, marginBottom: 16,
      }}>
        {basicCourses.map(course => {
          const isRecommended = careerPath?.recommendedBasicIds?.includes(course.id);
          return (
            <div key={course.id} style={{ position: 'relative' }}>
              {isRecommended && (
                <div style={{
                  position: 'absolute', top: -7, left: 8, zIndex: 1,
                  fontSize: 9, padding: '1px 6px', borderRadius: 2,
                  background: careerPath.color, color: '#fff', fontWeight: 600,
                  pointerEvents: 'none',
                }}>추천</div>
              )}
              <CourseCard
                course={course}
                selected={basicIds.includes(course.id)}
                onClick={() => toggleBasic(course.id)}
                maxReached={maxReached && !basicIds.includes(course.id)}
              />
            </div>
          );
        })}
      </div>

      <NavButtons
        onBack={() => setStep(0)}
        onNext={() => setStep(2)}
        nextDisabled={basicIds.length < 1}
        nextLabel="기초 모듈 확인하기 →"
      />
    </div>
  );
}
