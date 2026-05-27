import { useState } from 'react';
import { useSelectionStore } from '../store/useSelectionStore';
import { MODULES } from '../data/modules';
import { TRACKS, CERT_TRACKS } from '../data/pathways';
import { CAREER_PATH_BY_ID } from '../data/careerPaths';
import { ALL_COURSES } from '../data/courses';
import { getCourseDesc } from '../data/courseDescs';
import { NavButtons } from '../components';

const KIND_LABEL = { theory: '이론', lab: '실습', mixed: '이론+실습' };
const KIND_COLOR = { theory: '#185FA5', lab: '#0F6E56', mixed: '#B45309' };
const KIND_BG    = { theory: '#E6F1FB', lab: '#E1F5EE', mixed: '#FEF3C7' };

const STATUS_STYLE = {
  selected: { borderWidth: 2.5, fontWeight: 700, showBadge: true,  opacity: 1 },
  common:   { borderWidth: 1.5, fontWeight: 500, showBadge: false, opacity: 1 },
  module:   { borderWidth: 1,   fontWeight: 400, showBadge: false, opacity: 0.85 },
  required: { borderWidth: 1,   fontWeight: 400, showBadge: false, opacity: 1 },
  dim:      { borderWidth: 1,   fontWeight: 400, showBadge: false, opacity: 0.3 },
};

function CourseTag({ course, onClick, isActive, isIppHighlight }) {
  const mod   = course.module ? MODULES[course.module] : null;
  const s     = STATUS_STYLE[course.status] ?? STATUS_STYLE.dim;
  const color       = course.status === 'required' ? '#888' : (mod?.color ?? '#888');
  const bg          = course.status === 'required' ? '#f5f5f3' : (mod?.bg ?? '#f5f5f3');
  const borderStyle = course.status === 'required' ? 'dashed' : 'solid';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '5px 8px', borderRadius: 6, fontSize: 11,
        border: `${s.borderWidth}px ${borderStyle} ${isIppHighlight ? '#0369A1' : color}`,
        background: isActive ? color : (isIppHighlight ? '#E0F2FE' : bg),
        color: isActive ? '#fff' : (isIppHighlight ? '#0369A1' : color),
        opacity: s.opacity,
        fontWeight: s.fontWeight,
        cursor: 'pointer',
        transition: 'all .12s',
        display: 'flex', alignItems: 'flex-start', gap: 4,
      }}
    >
      {s.showBadge && (
        <span style={{
          fontSize: 8, padding: '1px 4px', borderRadius: 2,
          background: isActive ? '#fff' : color, color: isActive ? color : '#fff',
          flexShrink: 0, marginTop: 1,
        }}>선택</span>
      )}
      {course.status === 'common' && (
        <span style={{
          fontSize: 8, padding: '1px 4px', borderRadius: 2,
          background: isActive ? '#fff' : color, color: isActive ? color : '#fff',
          flexShrink: 0, marginTop: 1, opacity: .8,
        }}>권장</span>
      )}
      {isIppHighlight && (
        <span style={{
          fontSize: 8, padding: '1px 4px', borderRadius: 2,
          background: '#0369A1', color: '#fff', flexShrink: 0, marginTop: 1,
        }}>IPP준비</span>
      )}
      <span style={{ lineHeight: 1.3 }}>
        {course.name}
        <span style={{ opacity: .55, fontSize: 9, marginLeft: 3 }}>
          {course.credit ? `${course.credit}학점` : ''}
        </span>
      </span>
      {course.kind && (
        <span style={{
          fontSize: 7, padding: '1px 4px', borderRadius: 2, flexShrink: 0, marginTop: 2,
          background: isActive ? '#fff4' : KIND_BG[course.kind],
          color: isActive ? '#fff' : KIND_COLOR[course.kind],
        }}>{KIND_LABEL[course.kind]}</span>
      )}
      {course.module && (
        <span style={{
          fontSize: 8, padding: '1px 4px', borderRadius: 2, flexShrink: 0, marginTop: 1, marginLeft: 'auto',
          background: isActive ? '#fff5' : color + '25', color: isActive ? '#fff' : color,
        }}>{course.module}</span>
      )}
    </div>
  );
}

function CoursePopover({ course, onClose }) {
  if (!course) return null;
  const mod = course.module ? MODULES[course.module] : null;
  const extra = getCourseDesc(course.id);
  const color = mod?.color ?? '#888';
  return (
    <div style={{
      background: '#fff', border: `1px solid ${color}40`,
      borderRadius: 10, padding: '12px 14px', marginTop: 10,
      boxShadow: '0 2px 12px rgba(0,0,0,.08)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          {mod && (
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: color, color: '#fff' }}>
              [{course.module}] {mod.name}
            </span>
          )}
          {course.status === 'selected' && <span style={{ fontSize: 9, color: '#534AB7', fontWeight: 700 }}>★ 선택</span>}
          {course.status === 'common'   && <span style={{ fontSize: 9, color: '#185FA5' }}>전체 권장</span>}
          {course.ippRequired && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 2, background: '#0369A1', color: '#fff' }}>IPP필수</span>}
          {course.dSemester  && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 2, background: '#534AB7', color: '#fff' }}>D학기제</span>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 13, flexShrink: 0 }}>✕</button>
      </div>

      {/* Course name + credit */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{course.name}</div>
        {course.credit && <span style={{ fontSize: 10, color: '#999' }}>{course.credit}학점</span>}
        {course.kind && (
          <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 2, background: color + '18', color }}>
            {course.kind === 'theory' ? '이론' : course.kind === 'lab' ? '실습' : '이론+실습'}
          </span>
        )}
      </div>

      {/* Keywords */}
      {extra?.keywords && extra.keywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 7 }}>
          {extra.keywords.map((kw, i) => (
            <span key={i} style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 10,
              background: color + '15', color,
              border: `0.5px solid ${color}35`,
            }}>{kw}</span>
          ))}
        </div>
      )}

      {/* Description */}
      {extra?.desc ? (
        <div style={{
          fontSize: 11, color: '#444', lineHeight: 1.75,
          background: '#f9f9f7', borderRadius: 6, padding: '7px 9px',
          marginBottom: extra?.related ? 5 : 0,
        }}>
          {extra.desc}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic', marginBottom: 4 }}>
          교과 설명이 준비 중입니다.
          {course.hint && <span style={{ color: '#888', fontStyle: 'normal' }}> · {course.hint}</span>}
        </div>
      )}

      {/* Related courses */}
      {extra?.related && (
        <div style={{ fontSize: 10, color: color, opacity: .75, marginTop: 4 }}>
          🔗 {extra.related}
        </div>
      )}

      {/* Module desc */}
      {mod && (
        <div style={{ fontSize: 10, color: '#888', marginTop: 6, paddingTop: 5, borderTop: `0.5px solid ${color}25` }}>
          {mod.name} 모듈 — {mod.desc}
        </div>
      )}
    </div>
  );
}

function SemesterBlock({ sem, activeCourse, onCourseClick, showDim, ippCourseIds }) {
  const filtered = showDim ? sem.courses : sem.courses.filter(c => c.status !== 'dim');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {filtered.map(c => (
        <CourseTag
          key={c.id}
          course={c}
          isActive={activeCourse?.id === c.id}
          onClick={() => onCourseClick(c)}
          isIppHighlight={ippCourseIds?.has(c.id)}
        />
      ))}
    </div>
  );
}

function CreditBadge({ courses, showDim }) {
  const list = showDim ? courses : courses.filter(c => c.status !== 'dim');
  const total = list.reduce((acc, c) => acc + (c.credit ?? 0), 0);
  if (total === 0) return null;
  const ok = total >= 12 && total <= 15;
  const over = total > 15;
  const color = ok ? '#0F6E56' : over ? '#B45309' : '#888';
  return (
    <span style={{ fontSize: 9, color, fontWeight: 600, marginLeft: 4 }}>
      ~{total}학점{over ? ' ▲' : ''}
    </span>
  );
}

// ── 마이크로디그리 신청방법 모달 ─────────────────────────────────────────
function MicroDegreeGuideModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px 12px',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg,#0369A1,#0284C7)',
          padding: '16px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: 9, color: '#BAE6FD', fontWeight: 600, letterSpacing: 1, marginBottom: 3 }}>
              명지대학교 화학나노학전공
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
              마이크로디그리 신청 안내
            </div>
            <div style={{ fontSize: 10, color: '#BAE6FD', marginTop: 3 }}>
              Micro-Degree Program
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, padding: '0 0 0 10px', opacity: .8 }}
          >✕</button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 마이크로디그리란? */}
          <div style={{ padding: '10px 13px', borderRadius: 8, background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', marginBottom: 5 }}>📌 마이크로디그리란?</div>
            <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.8 }}>
              특정 분야의 교과목을 집중 이수하면 학교에서 <strong>수료 인증서</strong>를 발급하는 제도입니다.
              졸업장과 별개로 전문 역량을 공식 인증받을 수 있으며, 취업·대학원 진학 시 경쟁력이 됩니다.
            </div>
          </div>

          {/* 개설 마이크로디그리 */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#333', marginBottom: 8 }}>🎓 개설 마이크로디그리 (2종)</div>

            {/* MD1 */}
            <div style={{ borderRadius: 8, border: '1.5px solid #0369A160', background: '#E0F2FE', padding: '10px 13px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: '#0369A1', color: '#fff', fontWeight: 700 }}>MD 1</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0369A1' }}>에너지소재설계·분석</span>
              </div>
              <div style={{ fontSize: 10, color: '#0C4A6E', lineHeight: 1.9 }}>
                <div><strong>필수 1과목:</strong> 소재캡스톤디자인1</div>
                <div><strong>선택 3과목 이수:</strong></div>
                <div style={{ paddingLeft: 12, color: '#1E40AF', lineHeight: 2 }}>
                  · 화학과: 소재캡스톤디자인2, 에너지소재모델링, 에너지화학,<br/>
                  &nbsp;&nbsp;첨단에너지소재세미나, 기기분석:전기분석<br/>
                  · 융합에너지학과: 나노계측론, 나노공정개론
                </div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>→ 합계 <strong style={{ color: '#0369A1' }}>12학점 이상</strong> 이수 시 수여</div>
              </div>
            </div>

            {/* MD2 */}
            <div style={{ borderRadius: 8, border: '1.5px solid #B4530960', background: '#FEF3C7', padding: '10px 13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: '#B45309', color: '#fff', fontWeight: 700 }}>MD 2</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>에너지화학·나노융합</span>
              </div>
              <div style={{ fontSize: 10, color: '#78350F', lineHeight: 1.9 }}>
                <div><strong>필수 4과목 전부 이수:</strong></div>
                <div style={{ paddingLeft: 12, color: '#92400E', lineHeight: 2 }}>
                  · 에너지소재모델링<br/>
                  · 기기분석:전기분석<br/>
                  · 기능성나노소재<br/>
                  · 에너지화학
                </div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>→ 위 4과목 <strong style={{ color: '#B45309' }}>전부 이수</strong> 시 수여</div>
              </div>
            </div>
          </div>

          {/* 신청 방법 */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#333', marginBottom: 8 }}>📋 신청 방법 및 절차</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { step: '01', title: '신청 시기', desc: '매 학기 초 수강신청 기간 전후 — 학사공지 확인' },
                { step: '02', title: '신청 방법', desc: '명지대 포털(MJ-portal) → 학생서비스 → 마이크로디그리 신청' },
                { step: '03', title: '이수 관리', desc: '신청 후 해당 교과목 수강 — 학기별 이수 현황 자동 반영' },
                { step: '04', title: '수료 확인', desc: '졸업 전 이수 요건 충족 시 수료 인증서 발급 신청' },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '8px 12px', borderRadius: 7, background: '#F9FAFB', border: '0.5px solid #E5E7EB',
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: '#fff',
                    background: '#0369A1', borderRadius: 4, padding: '2px 6px', flexShrink: 0, marginTop: 1,
                  }}>{step}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1F2937', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 혜택 */}
          <div style={{ padding: '10px 13px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0F6E56', marginBottom: 6 }}>✅ 이수 혜택</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                '마이크로디그리 수료 인증서 발급 (졸업 시)',
                '전문 역량 공식 인증 → 취업·대학원 자기소개서 활용',
                '연계 융합전공 공동이수 시 추가 학위 취득 가능',
                '로드맵 앱에서 이수 과목 선택 시 자동 달성 여부 표시',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, fontSize: 10, color: '#065F46', lineHeight: 1.6 }}>
                  <span style={{ color: '#0F6E56', fontWeight: 700, flexShrink: 0 }}>·</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 문의 */}
          <div style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', paddingTop: 4, borderTop: '0.5px solid #E5E7EB' }}>
            문의: 화학나노학전공 학과 사무실 · 담당 교수님
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Step5Roadmap() {
  const {
    result, setStep, reset,
    selectedTrackId, selectedMicroId,
    careerPathId,
    savedRoadmaps, saveRoadmap, loadRoadmap, deleteSavedRoadmap,
  } = useSelectionStore();
  const [activeCourse, setActiveCourse] = useState(null);
  const [showDim, setShowDim] = useState(false);
  const [microGuideOpen, setMicroGuideOpen] = useState(false);

  if (!result) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ color: '#888', fontSize: 13 }}>결과가 없어요. 처음부터 다시 시작해주세요.</p>
        <button onClick={reset} style={{
          marginTop: 12, padding: '8px 18px', borderRadius: 7,
          background: '#534AB7', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12,
        }}>처음부터</button>
      </div>
    );
  }

  const { roadmap, allMods, certTracks = [], microDegrees = [], matchedTracks = [] } = result;
  const careerPath = careerPathId ? CAREER_PATH_BY_ID[careerPathId] : null;

  // IPP Y4S1 준비 과목 set
  const ippY4S1Set = careerPath?.y4s2Type === 'IPP' && careerPath?.y4s1Courses
    ? new Set(careerPath.y4s1Courses) : null;

  // D학기제 패키지 과목 (dSemesterIds → 모두 Y4S2 수강)
  const dSemesterCourses = careerPath?.y4s2Type === 'D학기제' && careerPath?.dSemesterIds
    ? careerPath.dSemesterIds.map(id => ALL_COURSES.find(c => c.id === id)).filter(Boolean) : [];

  // 총 전공 이수 학점 (교양필수 제외)
  // IPP 경로는 Y4S2 = 인턴십이므로 과목 학점 제외
  const totalMajorCredits = roadmap
    .filter(s => !(careerPath?.y4s2Type === 'IPP' && s.semester === 'Y4S2'))
    .flatMap(s => s.courses)
    .filter(c => c.status !== 'dim' && c.type !== 'required')
    .reduce((acc, c) => acc + (c.credit ?? 0), 0);

  const handleCourseClick = (course) => setActiveCourse(activeCourse?.id === course.id ? null : course);
  const getSem = (key) => roadmap.find(s => s.semester === key);

  // 우측 교과목 카탈로그 (3·4학년 전체, 학년 구분 없음)
  const courseStatusMap = new Map(roadmap.flatMap(s => s.courses.map(c => [c.id, c.status])));
  const catalogCourses = ALL_COURSES
    .filter(c => c.isUpperChoice)
    .map(c => ({ ...c, status: courseStatusMap.get(c.id) ?? 'dim' }));
  const SEM_CATALOG = { Y3S1: '3-1', Y3S2: '3-2/4-2', Y4S1: '4-1', Y4S2: '4-2' };

  // 3학년 / 4학년 그룹
  const yearGroups = [
    { label: '3학년', color: '#534AB7', bg: '#EEEDFE', sems: ['Y3S1', 'Y3S2'] },
    { label: '4학년', color: '#0369A1', bg: '#E0F2FE', sems: ['Y4S1'] },
  ];

  return (
    <div>
      {microGuideOpen && <MicroDegreeGuideModal onClose={() => setMicroGuideOpen(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          맞춤 이수 로드맵
        </div>
        <button
          onClick={() => setMicroGuideOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 7,
            background: 'linear-gradient(135deg,#0369A1,#0284C7)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 700,
            boxShadow: '0 2px 8px rgba(3,105,161,0.35)',
          }}
        >
          <span>🎓</span>
          마이크로디그리 신청방법
        </button>
      </div>

      {/* 진로 방향 배너 */}
      {careerPath && (
        <div style={{
          marginBottom: 10, padding: '10px 14px', borderRadius: 8,
          background: careerPath.bg, border: `1.5px solid ${careerPath.color}60`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: careerPath.color, color: '#fff', flexShrink: 0 }}>진로 목표</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: careerPath.color }}>{careerPath.label}</span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, marginLeft: 'auto', background: careerPath.color + '20', color: careerPath.color, fontWeight: 600 }}>
              {careerPath.programRec} 추천
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {careerPath.fusionMajorRec && (
              <div style={{ fontSize: 10, color: careerPath.color }}>
                연계 융합전공: <strong>{careerPath.fusionMajorRec}</strong>
              </div>
            )}
            {careerPath.fusionNote && (
              <div style={{ fontSize: 10, color: careerPath.color, opacity: .8 }}>
                {careerPath.fusionNote}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 목표 트랙/마이크로디그리 배너 */}
      {(() => {
        const selTrack = selectedTrackId ? TRACKS.find(t => t.id === selectedTrackId) : null;
        const selMicro = selectedMicroId ? CERT_TRACKS.find(ct => ct.id === selectedMicroId) : null;
        if (!selTrack && !selMicro) {
          return matchedTracks.length > 0 ? (
            <div style={{ marginBottom: 12 }}>
              {matchedTracks.slice(0, 2).map((track, idx) => (
                <div key={track.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                  padding: '6px 10px', borderRadius: 7, marginBottom: 5,
                  background: track.bg, border: `${idx === 0 ? 1.5 : 1}px solid ${track.color}50`,
                }}>
                  {idx === 0 && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: track.color, color: '#fff', flexShrink: 0 }}>추천 트랙</span>}
                  <span style={{ fontSize: 12, fontWeight: 600, color: track.color }}>{track.shortName}</span>
                  <span style={{ fontSize: 10, color: track.color, opacity: .7, marginLeft: 'auto' }}>{track.careers[0]}</span>
                </div>
              ))}
            </div>
          ) : null;
        }
        return (
          <div style={{ marginBottom: 12 }}>
            {selTrack && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                background: selTrack.color + '18', border: `2px solid ${selTrack.color}`,
              }}>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: selTrack.color, color: '#fff', flexShrink: 0 }}>목표 트랙</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: selTrack.color }}>{selTrack.name}</span>
                <span style={{ fontSize: 10, color: selTrack.color, opacity: .75, marginLeft: 'auto' }}>{selTrack.careers.join(' · ')}</span>
              </div>
            )}
            {selMicro && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                padding: '8px 12px', borderRadius: 8,
                background: selMicro.color + '18', border: `2px solid ${selMicro.color}`,
              }}>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: selMicro.color, color: '#fff', flexShrink: 0 }}>목표 이수 과정</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: selMicro.color }}>{selMicro.name}</span>
                {selMicro.fusionMajor && <span style={{ fontSize: 10, color: selMicro.color, opacity: .75, marginLeft: 'auto' }}>→ {selMicro.fusionMajor}</span>}
              </div>
            )}
          </div>
        );
      })()}

      {/* 달성 혜택 요약 */}
      {(microDegrees.length > 0 || careerPath?.fusionMajorRec) && (
        <div style={{
          marginBottom: 12, padding: '10px 14px', borderRadius: 8,
          background: '#F8F9FA', border: '1px solid #E0E0DC',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
            이 로드맵으로 달성 가능한 혜택
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {microDegrees.slice(0, 3).map(md => (
              <div key={md.id} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 4,
                background: md.bg, border: `1px solid ${md.color}50`,
                fontSize: 10, color: md.color, fontWeight: 600,
              }}>
                <span style={{ fontSize: 8, padding: '0 3px', borderRadius: 2, background: md.color, color: '#fff' }}>마이크로디그리</span>
                {md.name.replace(' 마이크로디그리', '')} 이수
              </div>
            ))}
            {careerPath?.fusionMajorRec && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 4,
                background: careerPath.bg, border: `1px solid ${careerPath.color}50`,
                fontSize: 10, color: careerPath.color, fontWeight: 600,
              }}>
                <span style={{ fontSize: 8, padding: '0 3px', borderRadius: 2, background: careerPath.color, color: '#fff' }}>융합전공</span>
                {careerPath.fusionMajorRec} 공동이수
                <span style={{ fontSize: 8, opacity: .7 }}>({careerPath.fusionMajorDept} {careerPath.fusionMajorCreditsReq}학점)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 학점 요약 */}
      {(() => {
        const isIpp = careerPath?.y4s2Type === 'IPP';
        const target = careerPath?.creditTarget ?? 63;
        const ok = isIpp ? totalMajorCredits >= target - 5 : totalMajorCredits >= 55;
        const color = ok ? '#0F6E56' : '#534AB7';
        const bg    = ok ? '#E1F5EE' : '#EEEDFE';
        const border = ok ? '#0F6E5640' : '#534AB740';
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 500, background: bg, border: `0.5px solid ${border}`, color }}>
              전공 이수 <strong>{totalMajorCredits}학점</strong>
              {isIpp
                ? <span style={{ opacity: .7 }}> / 목표 전공 {target}학점 (Y4S1까지) + 자유선택 10학점 · IPP +{careerPath.ippCredits}학점</span>
                : <span style={{ opacity: .6 }}> / 목표 전공 {target}학점 + 자유선택 10학점</span>
              }
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 7, background: '#E6F1FB', border: '0.5px solid #185FA540', fontSize: 11, color: '#185FA5' }}>
              관련 모듈 <strong>{allMods.length}개</strong>
            </div>
          </div>
        );
      })()}

      {/* 범례 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {[
          { label: '선택 과목', color: '#534AB7', borderWidth: 2.5 },
          { label: '전체 권장', color: '#185FA5', borderWidth: 1.5 },
          { label: '모듈 권장', color: '#0F6E56', borderWidth: 1 },
          { label: '교양필수', color: '#888', dash: true },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#666' }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, border: `${l.borderWidth}px ${l.dash ? 'dashed' : 'solid'} ${l.color}`, background: l.color + '20' }} />
            {l.label}
          </div>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#888', cursor: 'pointer', marginLeft: 'auto' }}>
          <input type="checkbox" checked={showDim} onChange={e => setShowDim(e.target.checked)} style={{ width: 12, height: 12 }} />
          무관 과목 표시
        </label>
      </div>

      {/* 로드맵 */}
      <div>

      {/* 1학년 */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 6, paddingBottom: 3, borderBottom: '0.5px solid #e0e0dc' }}>
        1학년 — 공통 기초
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {['Y1S1', 'Y1S2'].map(key => {
          const sem = getSem(key);
          const filtered = showDim ? sem.courses : sem.courses.filter(c => c.status !== 'dim');
          return (
            <div key={key} style={{ borderRadius: 8, border: '0.5px solid #e0e0dc', overflow: 'hidden' }}>
              <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: '#f5f5f3', color: '#888', borderBottom: '0.5px solid #e0e0dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{sem.label}</span>
                <CreditBadge courses={filtered} showDim={showDim} />
              </div>
              <div style={{ padding: 8 }}>
                <SemesterBlock sem={{ ...sem, courses: filtered }} activeCourse={activeCourse} onCourseClick={handleCourseClick} showDim={showDim} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2학년 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#185FA5', marginBottom: 6, paddingBottom: 3, borderBottom: '0.5px solid #185FA540', display: 'flex', alignItems: 'center', gap: 6 }}>
          2학년
          <span style={{ fontSize: 9, color: '#888', fontWeight: 400 }}>5개 과목 전체 수강 권장</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['Y2S1', 'Y2S2'].map(key => {
            const sem = getSem(key);
            const filtered = showDim ? sem.courses : sem.courses.filter(c => c.status !== 'dim');
            return (
              <div key={key} style={{ borderRadius: 8, border: '0.5px solid #185FA540', overflow: 'hidden' }}>
                <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: '#E6F1FB', color: '#185FA5', borderBottom: '0.5px solid #185FA530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{sem.label}</span>
                  <CreditBadge courses={filtered} showDim={showDim} />
                </div>
                <div style={{ padding: 8 }}>
                  <SemesterBlock sem={{ ...sem, courses: filtered }} activeCourse={activeCourse} onCourseClick={handleCourseClick} showDim={showDim} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3학년 / 4학년 */}
      {yearGroups.map((group, groupIdx) => {
        const { label, color, bg, sems } = group;
        const isGradYear = groupIdx === 1; // 4학년
        return (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 6, paddingBottom: 3, borderBottom: `0.5px solid ${color}40`, display: 'flex', alignItems: 'center', gap: 6 }}>
              {label}
              <span style={{ fontSize: 9, color: '#888', fontWeight: 400 }}>목표: 12~15학점/학기</span>
              {isGradYear && careerPath?.y4s2Type === 'IPP' && (
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: '#0369A1', color: '#fff', fontWeight: 600, marginLeft: 'auto' }}>
                  2학기 = IPP 인턴십
                </span>
              )}
              {isGradYear && careerPath?.y4s2Type === 'D학기제' && (
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: '#534AB7', color: '#fff', fontWeight: 600, marginLeft: 'auto' }}>
                  2학기 = D학기제
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: isGradYear ? 0 : 8 }}>
              {sems.map(key => {
                const sem = getSem(key);
                const filtered = showDim ? sem.courses : sem.courses.filter(c => c.status !== 'dim');
                const isY4S1 = key === 'Y4S1';
                return (
                  <div key={key} style={{ borderRadius: 8, border: `0.5px solid ${color}40`, overflow: 'hidden' }}>
                    <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: bg, color, borderBottom: `0.5px solid ${color}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{sem.label}{isY4S1 && careerPath?.y4s2Type === 'IPP' ? ' (IPP 준비)' : ''}</span>
                      <CreditBadge courses={filtered} showDim={showDim} />
                    </div>
                    <div style={{ padding: 8 }}>
                      <SemesterBlock
                        sem={{ ...sem, courses: filtered }}
                        activeCourse={activeCourse}
                        onCourseClick={handleCourseClick}
                        showDim={showDim}
                        ippCourseIds={isY4S1 ? ippY4S1Set : null}
                      />
                    </div>
                  </div>
                );
              })}

              {/* 4학년 2학기 특별 블록 */}
              {isGradYear && careerPath?.y4s2Type === 'IPP' && (
                <div style={{ borderRadius: 8, border: '1.5px solid #0369A1', overflow: 'hidden' }}>
                  <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: '#0369A118', color: '#0369A1', borderBottom: '1px solid #0369A130', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>4학년 2학기</span>
                    <span style={{ fontSize: 9, background: '#0369A1', color: '#fff', padding: '1px 5px', borderRadius: 2 }}>IPP</span>
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', marginBottom: 4 }}>IPP 장기현장실습</div>
                    <div style={{ fontSize: 10, color: '#555', lineHeight: 1.7 }}>
                      산업체 6개월 장기 현장실습<br />
                      배터리·반도체·바이오 기업 현장 배치<br />
                      <span style={{ color: '#0369A1', fontWeight: 600 }}>취업 연계 + 실무 역량 집중 강화</span>
                    </div>
                  </div>
                </div>
              )}

              {isGradYear && careerPath?.y4s2Type === 'D학기제' && (
                <div style={{ borderRadius: 8, border: '1.5px solid #534AB7', overflow: 'hidden', background: '#FFFBEB' }}>
                  <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: '#534AB718', color: '#534AB7', borderBottom: '1px solid #534AB730', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>4학년 2학기</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 9, color: '#534AB7', fontWeight: 700 }}>
                        {dSemesterCourses.reduce((s, c) => s + (c.credit ?? 0), 0)}학점
                      </span>
                      <span style={{ fontSize: 9, background: '#534AB7', color: '#fff', padding: '1px 5px', borderRadius: 2 }}>D학기제</span>
                    </div>
                  </div>
                  <div style={{ padding: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#534AB7', marginBottom: 4 }}>연구집중학기 — 5과목 전체 수강</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 6 }}>
                      {dSemesterCourses.map(c => {
                        const mod = c.module ? MODULES[c.module] : null;
                        return (
                          <div key={c.id} onClick={() => handleCourseClick(c)} style={{
                            padding: '4px 8px', borderRadius: 5, fontSize: 10,
                            border: `1px solid ${mod?.color ?? '#534AB7'}60`,
                            background: activeCourse?.id === c.id ? (mod?.color ?? '#534AB7') : '#FFFBEB',
                            color: activeCourse?.id === c.id ? '#fff' : (mod?.color ?? '#534AB7'),
                            fontWeight: 500, cursor: 'pointer', transition: 'all .12s',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <span style={{ flex: 1 }}>{c.name}</span>
                            <span style={{ opacity: .7, flexShrink: 0 }}>{c.credit}학점</span>
                            {c.kind && <span style={{ fontSize: 8, padding: '0 3px', borderRadius: 2, flexShrink: 0, background: KIND_BG[c.kind], color: KIND_COLOR[c.kind] }}>{KIND_LABEL[c.kind]}</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 10, color: '#555', lineHeight: 1.6 }}>
                      지도교수 연구실 집중 연구<br />
                      <span style={{ color: '#534AB7', fontWeight: 600 }}>대학원 진학 연구역량 조기 확보</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Y4S2 기본 (진로 미선택) */}
              {isGradYear && !careerPath?.y4s2Type && (() => {
                const sem = getSem('Y4S2');
                const filtered = showDim ? sem.courses : sem.courses.filter(c => c.status !== 'dim');
                return filtered.length > 0 ? (
                  <div key="Y4S2" style={{ borderRadius: 8, border: `0.5px solid ${color}40`, overflow: 'hidden' }}>
                    <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: bg, color, borderBottom: `0.5px solid ${color}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>4학년 2학기</span>
                      <CreditBadge courses={filtered} showDim={showDim} />
                    </div>
                    <div style={{ padding: 8 }}>
                      <SemesterBlock sem={{ ...sem, courses: filtered }} activeCourse={activeCourse} onCourseClick={handleCourseClick} showDim={showDim} />
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* IPP/D학기제 상세 설명 — 4학년 뒤 */}
            {isGradYear && careerPath && (
              <div style={{
                marginTop: 10, padding: '10px 14px', borderRadius: 8,
                background: careerPath.bg, border: `1.5px solid ${careerPath.color}60`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: careerPath.color, color: '#fff', fontWeight: 700 }}>강력 추천</span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: careerPath.color }}>
                    {careerPath.programRec === 'IPP' ? 'IPP 장기현장실습' : 'D학기제 연구집중학기'}
                  </div>
                </div>
                {careerPath.programRec === 'IPP' ? (
                  <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7 }}>
                    4학년 1학기에 IPP 준비 4과목 이수 → 4학년 2학기에 산업체 6개월 현장실습<br />
                    취업 목표 학생에게 강력 추천! 실무 역량과 채용 네트워크 형성.
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7 }}>
                    4학년 2학기를 연구 집중 학기로 운영, 지도교수 연구실에서 연구 몰입.<br />
                    대학원 진학 목표 학생에게 강력 추천! 연구역량 조기 확보.
                  </div>
                )}
                {careerPath.fusionMajorRec && (
                  <div style={{ marginTop: 6, fontSize: 10, padding: '4px 8px', borderRadius: 4, background: careerPath.color + '15', color: careerPath.color, fontWeight: 600, display: 'inline-block' }}>
                    연계 융합전공: {careerPath.fusionMajorRec}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ─ 3·4학년 교과목 전체 (로드맵 하단) ─ */}
      <div style={{ marginTop: 20, borderTop: '0.5px solid #e0e0dc', paddingTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#534AB7', marginBottom: 8, paddingBottom: 4, borderBottom: '0.5px solid #534AB740' }}>
          3·4학년 교과목 전체
        </div>
        {activeCourse && (
          <div style={{ marginBottom: 8 }}>
            <CoursePopover course={activeCourse} onClose={() => setActiveCourse(null)} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 4 }}>
          {catalogCourses.map(c => {
            const mod = c.module ? MODULES[c.module] : null;
            const isActive = activeCourse?.id === c.id;
            const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.dim;
            const color = mod?.color ?? '#888';
            const bg = mod?.bg ?? '#f5f5f3';
            return (
              <div
                key={c.id}
                onClick={() => handleCourseClick(c)}
                style={{
                  padding: '4px 7px', borderRadius: 5, fontSize: 10,
                  border: `${s.borderWidth}px solid ${isActive ? color : color + '50'}`,
                  background: isActive ? color : bg,
                  color: isActive ? '#fff' : color,
                  opacity: s.opacity, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 3,
                  transition: 'all .12s',
                }}
              >
                {c.module && (
                  <span style={{
                    fontSize: 7, padding: '0 3px', borderRadius: 2, flexShrink: 0,
                    background: isActive ? '#fff3' : color + '22', color: isActive ? '#fff' : color,
                  }}>{c.module}</span>
                )}
                <span style={{ flex: 1, lineHeight: 1.35 }}>{c.name}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                  <span style={{ fontSize: 7, opacity: .6 }}>{c.id === 'cap1' ? '3-1/4-1' : SEM_CATALOG[c.semester]}</span>
                  {c.ippRequired && (
                    <span style={{ fontSize: 6, padding: '0 2px', borderRadius: 2, background: isActive ? '#fff3' : '#0369A1', color: '#fff' }}>IPP</span>
                  )}
                  {c.dSemester && (
                    <span style={{ fontSize: 6, padding: '0 2px', borderRadius: 2, background: isActive ? '#fff3' : '#534AB7', color: '#fff' }}>D</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      </div>

      {/* 마이크로디그리 + 융합전공 상세 */}
      {(microDegrees.length > 0 || careerPath?.fusionMajorRec) && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0F6E56', marginTop: 16, marginBottom: 8, paddingBottom: 3, borderBottom: '0.5px solid #0F6E5640' }}>
            달성 가능 마이크로디그리 및 융합전공
          </div>
          {microDegrees.map(md => (
            <div key={md.id} style={{
              padding: '8px 10px', borderRadius: 7,
              border: `1px solid ${md.color}50`, background: md.bg, marginBottom: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                <div style={{ fontSize: 10, padding: '1px 7px', borderRadius: 3, background: md.color, color: '#fff', flexShrink: 0 }}>마이크로디그리</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: md.color }}>{md.name}</div>
              </div>
              {md.completionRule && (
                <div style={{ fontSize: 10, color: md.color, opacity: .8, marginBottom: 4, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  수료 요건: {md.completionRule}
                </div>
              )}
            </div>
          ))}
          {careerPath?.fusionMajorRec && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              padding: '7px 10px', borderRadius: 7,
              border: `1px solid ${careerPath.color}50`, background: careerPath.bg, marginBottom: 5,
            }}>
              <div style={{ fontSize: 10, padding: '1px 7px', borderRadius: 3, background: careerPath.color, color: '#fff', flexShrink: 0 }}>융합전공 공동이수</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: careerPath.color }}>{careerPath.fusionMajorRec}</div>
              <div style={{ fontSize: 10, color: careerPath.color, opacity: .7, marginLeft: 'auto' }}>
                {careerPath.fusionMajorDept} {careerPath.fusionMajorCreditsReq}학점 이수 필요
              </div>
            </div>
          )}
        </>
      )}

      {/* 로드맵 저장 */}
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #e0e0dc' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>이수 로드맵 저장</div>

        {savedRoadmaps.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            {savedRoadmaps.map(entry => {
              const cp = entry.careerPathId ? CAREER_PATH_BY_ID[entry.careerPathId] : null;
              const dt = new Date(entry.savedAt);
              const dateStr = `${dt.getMonth() + 1}/${dt.getDate()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
              return (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 10px', borderRadius: 7, marginBottom: 5,
                  border: `1px solid ${cp?.color ?? '#888'}40`, background: cp?.bg ?? '#f8f8f6',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: cp?.color ?? '#333' }}>{entry.label}</div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>{cp ? cp.label : '진로 미선택'} · {dateStr}</div>
                  </div>
                  <button onClick={() => loadRoadmap(entry)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: cp?.color ?? '#534AB7', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}>불러오기</button>
                  <button onClick={() => deleteSavedRoadmap(entry.id).catch(err => alert('삭제 실패: ' + (err.message || '서버 오류')))} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'transparent', color: '#999', border: '0.5px solid #ccc', cursor: 'pointer', flexShrink: 0 }}>삭제</button>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => saveRoadmap().catch(err => alert('저장 실패: ' + (err.message || '서버 오류')))}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 7, fontSize: 12, fontWeight: 600,
            border: '1.5px dashed #534AB7', background: 'transparent', color: '#534AB7', cursor: 'pointer',
          }}
        >
          + 현재 로드맵 저장 ({savedRoadmaps.length}개 저장됨)
        </button>
      </div>

      <NavButtons
        onBack={() => setStep(4)}
        onNext={reset}
        nextLabel="처음부터 다시"
        backLabel="← 이전"
      />
    </div>
  );
}
