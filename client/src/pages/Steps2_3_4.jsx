import { useState } from 'react';
import { MODULES } from '../data/modules';
import { ALL_COURSES } from '../data/courses';
import { BASIC_TO_ADV_MODS, UPPER_TO_ADV_MODS, CERT_TRACKS, MICRO_DEGREES, TRACKS } from '../data/pathways';
import { CAREER_PATH_BY_ID } from '../data/careerPaths';
import { useSelectionStore } from '../store/useSelectionStore';
import { ModuleChip, ModuleDetail, NavButtons } from '../components';

const SEM_LABEL = {
  Y3S1: '3-1', Y3S2: '3-2/4-2', Y4S1: '4-1', Y4S2: '4-2',
};
const SEM_COLOR = {
  Y3S1: '#534AB7', Y3S2: '#0F6E56', Y4S1: '#0369A1', Y4S2: '#B45309',
};

// ── Step2BaseMod ──────────────────────────────────────────────────────────────
export function Step2BaseMod() {
  const { basicIds, setStep } = useSelectionStore();
  const [activeMod, setActiveMod] = useState(null);

  const baseModIds = new Set(['R1', 'R2']);
  basicIds.forEach(id => {
    const course = ALL_COURSES.find(c => c.id === id);
    if (course?.module) baseModIds.add(course.module);
  });

  const baseMods = [...baseModIds].map(id => MODULES[id]).filter(Boolean);

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
        선택 과목의 기초 모듈 (파란색)
      </div>
      <div style={{
        fontSize: 11, color: '#666', lineHeight: 1.6,
        padding: '8px 10px', background: '#E6F1FB',
        borderRadius: 7, border: '0.5px solid #185FA540', marginBottom: 12,
      }}>
        파란색 기초 모듈은 어떤 경로를 가더라도 이수 권장이에요.
        모듈 칩을 클릭하면 구성 교과목을 확인할 수 있어요.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {baseMods.map(mod => (
          <ModuleChip
            key={mod.id}
            mod={mod}
            active={activeMod?.id === mod.id}
            onClick={() => setActiveMod(activeMod?.id === mod.id ? null : mod)}
          />
        ))}
      </div>

      {activeMod && (
        <ModuleDetail mod={activeMod} onClose={() => setActiveMod(null)} />
      )}

      <NavButtons
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        nextLabel="3·4학년 과목 선택하기 →"
      />
    </div>
  );
}

// ── Step3Upper ────────────────────────────────────────────────────────────────
export function Step3Upper() {
  const { upperIds, toggleUpper, setStep, careerPathId } = useSelectionStore();
  const maxReached = upperIds.length >= 2;
  const careerPath = careerPathId ? CAREER_PATH_BY_ID[careerPathId] : null;

  const UPPER_DISPLAY_ORDER = [
    'ec_ana', 'spec_ana', 'cat_des', 'inorg_syn', 'energy_chem', 'mol_spec', 'energy_mod', 'adv_sem',
    'comp', 'nano_mat', 'func_poly', 'nano2', 'oc3', 'oc_syn',
    'cat_lab', 'ic_lab1', 'pc_lab1', 'pc_lab2', 'ac_lab', 'nano_lab', 'oc_lab1', 'oc_lab2',
    'cap1', 'cap2', 'adv_cap', 'chem_research',
  ];
  const upperCourses = [...ALL_COURSES.filter(c => c.isUpperChoice)].sort((a, b) => {
    const ai = UPPER_DISPLAY_ORDER.indexOf(a.id);
    const bi = UPPER_DISPLAY_ORDER.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // 추천 경로 총 학점 계산
  const recIds = careerPath?.recommendedUpperIds ?? [];
  const recCredits = recIds.reduce((sum, id) => {
    const c = ALL_COURSES.find(x => x.id === id);
    return sum + (c?.credit ?? 0);
  }, 0);
  // 비캡스톤 실험 과목 수 계산 (검증용)
  const recLabCount = recIds.filter(id => {
    const c = ALL_COURSES.find(x => x.id === id);
    return c?.kind === 'lab' && id !== 'cap1' && id !== 'cap2' && id !== 'adv_cap';
  }).length;

  const renderItem = (course) => {
    const mod = course.module ? MODULES[course.module] : null;
    const sel = upperIds.includes(course.id);
    const dimmed = !sel && maxReached;
    const isRecommended = careerPath?.recommendedUpperIds?.includes(course.id);
    const semColor = SEM_COLOR[course.semester] ?? '#888';
    const semLabel = course.id === 'cap1' ? '3-1/4-1' : (SEM_LABEL[course.semester] ?? '');
    return (
      <div
        key={course.id}
        onClick={() => !dimmed && toggleUpper(course.id)}
        style={{
          padding: '6px 9px', borderRadius: 6, fontSize: 11,
          border: `${sel ? 2 : 1}px solid`,
          borderColor: sel
            ? (mod?.color ?? '#888')
            : isRecommended
              ? (mod?.color ?? '#888')
              : (mod?.color ?? '#888') + '40',
          background: isRecommended && !sel
            ? (mod?.bg ?? '#f5f5f3')
            : (sel ? (mod?.bg ?? '#f5f5f3') : '#fafaf8'),
          color: mod?.color ?? '#888',
          cursor: dimmed ? 'not-allowed' : 'pointer',
          opacity: dimmed ? 0.4 : 1,
          fontWeight: sel ? 600 : isRecommended ? 500 : 400,
          transition: 'all .12s',
          display: 'flex', alignItems: 'flex-start', gap: 5,
        }}
      >
        {/* 모듈 배지 */}
        <span style={{
          fontSize: 9, padding: '1px 5px', borderRadius: 2,
          background: mod?.color ?? '#888', color: '#fff', flexShrink: 0, marginTop: 1,
        }}>{course.module ?? '—'}</span>

        <span style={{ lineHeight: 1.35, flex: 1 }}>
          {course.name}
          {course.hint && (
            <span style={{ display: 'block', fontSize: 9, opacity: .5, fontStyle: 'italic' }}>
              {course.hint}
            </span>
          )}
          <span style={{ fontSize: 9, opacity: .6 }}>{course.credit}학점</span>
          {course.kind && (
            <span style={{
              marginLeft: 4, fontSize: 8, padding: '0px 4px', borderRadius: 2,
              background: course.kind === 'lab' ? '#E1F5EE' : course.kind === 'mixed' ? '#FEF3C7' : '#E6F1FB',
              color: course.kind === 'lab' ? '#0F6E56' : course.kind === 'mixed' ? '#B45309' : '#185FA5',
            }}>
              {course.kind === 'theory' ? '이론' : course.kind === 'lab' ? '실습' : '이론+실습'}
            </span>
          )}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
          {/* 학기 배지 */}
          <span style={{
            fontSize: 8, padding: '1px 4px', borderRadius: 2,
            background: semColor + '20', color: semColor, fontWeight: 600,
          }}>{semLabel}</span>

          {/* IPP 필수 표시 */}
          {course.ippRequired && (
            <span style={{
              fontSize: 7, padding: '1px 4px', borderRadius: 2,
              background: '#0369A1', color: '#fff',
            }}>IPP필수</span>
          )}

          {/* 추천 배지 */}
          {isRecommended && careerPath && (
            <span style={{
              fontSize: 8, padding: '1px 5px', borderRadius: 2,
              background: careerPath.color, color: '#fff', fontWeight: 600,
            }}>추천</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
        심화 과목 1~2개 선택 (3·4학년)
      </div>
      {careerPath && (
        <div style={{
          fontSize: 11, color: careerPath.color, lineHeight: 1.5, marginBottom: 6,
          padding: '8px 10px', background: careerPath.bg,
          borderRadius: 7, border: `0.5px solid ${careerPath.color}50`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
            <strong>{careerPath.label}</strong> 방향 추천 과목에{' '}
            <span style={{ background: careerPath.color, color: '#fff', padding: '0 4px', borderRadius: 2, fontSize: 9 }}>추천</span>{' '}
            표시가 있어요.
          </div>
          {recCredits > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 4,
                background: careerPath.color, color: '#fff', fontWeight: 700,
              }}>추천 과목 총 {recCredits}학점</span>
              {careerPath.y4s2Type === 'IPP' && (
                <span style={{ fontSize: 10, color: careerPath.color, opacity: .8 }}>
                  + IPP 현장실습 {careerPath.ippCredits}학점 인정 → 총 {recCredits + careerPath.ippCredits}학점
                </span>
              )}
              {careerPath.y4s2Type === 'D학기제' && (
                <span style={{ fontSize: 10, color: careerPath.color, opacity: .8 }}>
                  (D학기제 15학점 포함) · 목표 전공 {careerPath.creditTarget}학점 + 자유선택 10학점
                </span>
              )}
            </div>
          )}
        </div>
      )}
      <div style={{
        fontSize: 11, color: '#666', lineHeight: 1.6, marginBottom: 8,
        padding: '8px 10px', background: '#EEEDFE',
        borderRadius: 7, border: '0.5px solid #534AB740',
      }}>
        과목 우측에 수강 학기(예: 3-1=3학년1학기, 4-1=4학년1학기)가 표시돼요.
        관심 과목 <strong>1~2개</strong>를 골라보세요.
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#534AB7', marginBottom: 10 }}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: '#534AB7', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
        }}>{upperIds.length}</span>
        / 2개 선택됨
      </div>

      {/* 학기 범례 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {Object.entries(SEM_LABEL).map(([key, label]) => (
          <span key={key} style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 3,
            background: SEM_COLOR[key] + '18', color: SEM_COLOR[key], fontWeight: 600,
            border: `0.5px solid ${SEM_COLOR[key]}40`,
          }}>{label} = {key === 'Y3S1' ? '3학년 1학기' : key === 'Y3S2' ? '3·4학년 2학기' : key === 'Y4S1' ? '4학년 1학기' : '4학년 2학기(D학기제)'}</span>
        ))}
      </div>

      {/* 전체 과목 — 학년 구분 없이 flat 표시 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 5, marginBottom: 16 }}>
        {upperCourses.map(renderItem)}
      </div>

      <NavButtons
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        nextDisabled={upperIds.length < 1}
        nextLabel="진로 목표 설정 →"
      />
    </div>
  );
}

// ── Step4AdvMod ───────────────────────────────────────────────────────────────
export function Step4AdvMod() {
  const {
    basicIds, upperIds, setStep, compute,
    selectedTrackId, setSelectedTrack,
    selectedMicroId, setSelectedMicro,
  } = useSelectionStore();
  const [activeMod, setActiveMod] = useState(null);
  const [openCert, setOpenCert] = useState(null);

  const baseModSet = new Set(['R1', 'R2']);
  const advModSet  = new Set();

  basicIds.forEach(id => {
    const c = ALL_COURSES.find(x => x.id === id);
    if (c?.module) baseModSet.add(c.module);
    (BASIC_TO_ADV_MODS[id] || []).forEach(m => advModSet.add(m));
  });
  if (basicIds.includes('nano_basic')) baseModSet.add('T1');
  if (basicIds.includes('ac1'))        baseModSet.add('E21');

  upperIds.forEach(id => {
    const c = ALL_COURSES.find(x => x.id === id);
    if (c?.module) advModSet.add(c.module);
    (UPPER_TO_ADV_MODS[id] || []).forEach(m => advModSet.add(m));
  });
  baseModSet.forEach(m => advModSet.delete(m));

  const allModIds = new Set([...baseModSet, ...advModSet]);
  const advMods   = [...advModSet].map(id => MODULES[id]).filter(Boolean);
  const selectedCourseIds = new Set([...basicIds, ...upperIds]);

  return (
    <div>
      {/* 추천 심화 모듈 */}
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        추천 심화 모듈
      </div>
      {advMods.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {advMods.map(mod => (
              <ModuleChip
                key={mod.id}
                mod={mod}
                active={activeMod?.id === mod.id}
                onClick={() => setActiveMod(activeMod?.id === mod.id ? null : mod)}
              />
            ))}
          </div>
          {activeMod && <ModuleDetail mod={activeMod} onClose={() => setActiveMod(null)} />}
        </>
      ) : (
        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>
          과목을 더 선택하면 심화 모듈이 나타나요.
        </div>
      )}

      {/* ── 진로 트랙 선택 ── */}
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 18, marginBottom: 6 }}>
        진로 트랙 선택
      </div>
      <div style={{
        fontSize: 11, color: '#666', lineHeight: 1.6, marginBottom: 10,
        padding: '8px 10px', background: '#f8f8f6',
        borderRadius: 7, border: '0.5px solid #e0e0dc',
      }}>
        원하는 트랙을 <strong>하나 선택</strong>하면 해당 트랙에 최적화된 로드맵이 제시돼요.
      </div>
      {TRACKS.map((track) => {
        const overlap    = track.modules.filter(m => allModIds.has(m)).length;
        const isMatched  = overlap >= 2;
        const isSelected = selectedTrackId === track.id;
        return (
          <div
            key={track.id}
            onClick={() => setSelectedTrack(track.id)}
            style={{
              borderRadius: 10, padding: '10px 14px', marginBottom: 8,
              border: `${isSelected ? 2.5 : 1}px solid ${track.color}${isSelected ? '' : isMatched ? '80' : '35'}`,
              background: isSelected ? track.color + '18' : track.bg,
              opacity: isMatched ? 1 : 0.72,
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              {isSelected && (
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: track.color, color: '#fff' }}>선택됨</span>
              )}
              {!isSelected && isMatched && (
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: track.color + '25', color: track.color }}>매칭</span>
              )}
              <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 600, color: track.color }}>
                {track.name}
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 10, color: track.color, opacity: .7 }}>
                {overlap}/{track.modules.length} 모듈
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 6, lineHeight: 1.5 }}>{track.desc}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
              {track.modules.map(mid => {
                const m = MODULES[mid];
                const matched = allModIds.has(mid);
                return m ? (
                  <span key={mid} style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 3,
                    background: matched ? track.color : '#fff',
                    color: matched ? '#fff' : track.color,
                    border: `0.5px solid ${track.color}50`,
                    fontWeight: matched ? 600 : 400,
                  }}>[{mid}] {m.name}</span>
                ) : null;
              })}
            </div>
            <div style={{ fontSize: 10, color: track.color, opacity: .75 }}>
              {track.careers.join(' · ')}
            </div>
          </div>
        );
      })}

      {/* ── 이수 과정 선택 (모듈 기반 내부 경로) ── */}
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 18, marginBottom: 6 }}>
        이수 과정 선택
      </div>
      <div style={{
        fontSize: 11, color: '#666', lineHeight: 1.6, marginBottom: 10,
        padding: '8px 10px', background: '#f8f8f6',
        borderRadius: 7, border: '0.5px solid #e0e0dc',
      }}>
        달성 목표 이수 과정을 <strong>목표 설정</strong>하면 필요 과목이 로드맵에 강조 표시돼요.
        <br/>
        <span style={{ fontSize: 10, color: '#999' }}>※ 모듈 기반 내부 이수 과정. 공식 마이크로디그리와 별도.</span>
      </div>
      {CERT_TRACKS.map(ct => {
        const overlap      = ct.modules.filter(m => allModIds.has(m)).length;
        const isAchievable = overlap >= 1;
        const isOpen       = openCert === ct.id;
        const isSelected   = selectedMicroId === ct.id;
        const ctCourses    = ALL_COURSES.filter(c => c.module && ct.modules.includes(c.module) && c.isUpperChoice);
        return (
          <div key={ct.id} style={{
            borderRadius: 10, padding: '10px 14px', marginBottom: 8,
            border: `${isSelected ? 2.5 : 1.5}px solid ${ct.color}${isSelected ? '' : isAchievable ? '80' : '35'}`,
            background: isSelected ? ct.color + '18' : ct.bg,
            opacity: isAchievable ? 1 : 0.65,
            transition: 'all .15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div onClick={() => setOpenCert(isOpen ? null : ct.id)} style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: ct.color, color: '#fff' }}>
                    이수 과정
                  </span>
                  {isSelected && <span style={{ fontSize: 10, color: ct.color, fontWeight: 700 }}>목표됨</span>}
                  {!isSelected && isAchievable && (
                    <span style={{ fontSize: 10, color: ct.color, opacity: .7 }}>{overlap}/{ct.modules.length} 모듈</span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: ct.color }}>{ct.name}</div>
                <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5, marginTop: 3 }}>{ct.desc}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, paddingTop: 2 }}>
                <button
                  onClick={() => setSelectedMicro(ct.id)}
                  style={{
                    fontSize: 10, padding: '3px 10px', borderRadius: 5,
                    background: isSelected ? ct.color : 'transparent',
                    color: isSelected ? '#fff' : ct.color,
                    border: `1px solid ${ct.color}`,
                    cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1.6,
                  }}
                >{isSelected ? '목표됨' : '목표 설정'}</button>
                <span
                  onClick={() => setOpenCert(isOpen ? null : ct.id)}
                  style={{ fontSize: 11, color: ct.color, opacity: .6, cursor: 'pointer', padding: '2px 0' }}
                >{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 10, borderTop: `0.5px solid ${ct.color}30`, paddingTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: ct.color, marginBottom: 5 }}>
                  관련 과목 (약 {ct.credits}학점)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                  {ctCourses.map(c => (
                    <span key={c.id} style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 3,
                      border: `0.5px solid ${ct.color}50`,
                      background: '#fff9', color: ct.color,
                    }}>
                      {c.name}<span style={{ opacity: .6, marginLeft: 2 }}>{c.credit}학점</span>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 4 }}>
                  {ct.modules.map(mid => {
                    const m = MODULES[mid];
                    return m ? (
                      <span key={mid} style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 3,
                        border: `0.5px solid ${ct.color}50`, background: '#fff9', color: ct.color,
                      }}>[{mid}] {m.name}</span>
                    ) : null;
                  })}
                </div>
                {ct.fusionMajor && (
                  <div style={{ fontSize: 10, color: ct.color, opacity: .8, marginBottom: 2 }}>
                    연계 융합전공: <strong>{ct.fusionMajor}</strong>
                  </div>
                )}
                <div style={{ fontSize: 10, color: ct.color, opacity: .7 }}>{ct.track}</div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── 공식 마이크로디그리 안내 (참고 정보) ── */}
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 18, marginBottom: 6, color: '#1a1a1a' }}>
        공식 마이크로디그리 프로그램
      </div>
      <div style={{
        fontSize: 11, color: '#666', lineHeight: 1.6, marginBottom: 10,
        padding: '8px 10px', background: '#f8f8f6',
        borderRadius: 7, border: '0.5px solid #e0e0dc',
      }}>
        학교 공식 마이크로디그리 프로그램입니다. 관련 과목을 이수하면 취득 가능해요.
      </div>
      {MICRO_DEGREES.map(md => {
        const myOverlap = md.allCourseIds.filter(id => selectedCourseIds.has(id)).length;
        return (
          <div key={md.id} style={{
            borderRadius: 10, padding: '10px 14px', marginBottom: 8,
            border: `1.5px solid ${md.color}60`,
            background: md.bg,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: md.color, color: '#fff' }}>
                마이크로디그리
              </span>
              {myOverlap > 0 && (
                <span style={{ fontSize: 10, color: md.color, fontWeight: 600 }}>
                  관련 {myOverlap}과목 선택됨
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: md.color, marginBottom: 4 }}>{md.name}</div>
            {md.completionRule && (
              <div style={{ fontSize: 10, color: md.color, opacity: .85, marginBottom: 4, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                수료 요건: {md.completionRule}
              </div>
            )}
            {md.desc && <div style={{ fontSize: 10, color: '#666', lineHeight: 1.5 }}>{md.desc}</div>}
          </div>
        );
      })}

      {(selectedTrackId || selectedMicroId) && (
        <div style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 7,
          background: '#EEEDFE', border: '1px solid #534AB740',
          fontSize: 11, color: '#534AB7',
        }}>
          <strong>로드맵 목표:</strong>
          {selectedTrackId && (
            <span> {TRACKS.find(t => t.id === selectedTrackId)?.shortName}</span>
          )}
          {selectedTrackId && selectedMicroId && <span style={{ opacity: .5 }}> · </span>}
          {selectedMicroId && (
            <span> {CERT_TRACKS.find(ct => ct.id === selectedMicroId)?.name}</span>
          )}
        </div>
      )}

      <NavButtons
        onBack={() => setStep(3)}
        onNext={() => { compute(); setStep(5); }}
        nextLabel="이수 로드맵 보기 →"
      />
    </div>
  );
}
