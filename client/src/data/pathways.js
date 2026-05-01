import { MODULES } from './modules';
import { ALL_COURSES } from './courses';

// 기초 과목 id → 추천 심화 모듈
export const BASIC_TO_ADV_MODS = {
  pc1:        ['H1', 'E12', 'O1', 'O2'],
  ic1:        ['E12', 'O1', 'O2'],
  oc1:        ['E11', 'H2', 'T1'],
  ac1:        ['E21', 'O2'],
  nano_basic: ['T1', 'H1', 'H2'],
};

// 심화 과목 id → 추천 심화 모듈
export const UPPER_TO_ADV_MODS = {
  energy_chem: ['H1'],
  ec_ana:      ['H1'],
  inorg_syn:   ['E12'],
  spec_ana:    ['E12'],
  energy_mod:  ['E12'],
  cat_des:     ['E12'],
  cat_lab:     ['O1'],
  pc_lab2:     ['O1'],
  adv_cap:     ['O1'],
  adv_sem:     ['O1'],
  oc3:         ['E11'],
  oc_syn:      ['E11'],
  oc_lab1:     ['E11'],
  oc_lab2:     ['E11'],
  nano_mat:    ['H2'],
  func_poly:   ['H2'],
  bio:         ['H2'],
  mol_spec:    ['T1'],
  nano_lab:    ['T1'],
  nano2:       ['T1'],
  cap1:        ['H3'],
  cap2:        ['H3'],
  ac_lab:      ['O2'],
  pc_lab1:     ['O2'],
  ic_lab1:     ['O2'],
  comp:        ['E21'],
};

// ── 트랙 정의 (PDF 트랙제 교육과정 기반) ───────────────────────────────
export const TRACKS = [
  {
    id: 'track1',
    name: 'Track 1. 정밀화학 & 의약합성',
    shortName: '정밀화학·의약합성',
    color: '#7C3AED',
    bg: '#F3EFFE',
    modules: ['R2', 'E11', 'T1', 'H2'],
    careers: ['제약회사 연구원', '화장품 연구원'],
    desc: '유기합성 및 고분자 소재 개발 전문가. 의약·화장품 원료 합성부터 기능성 소재 개발까지.',
  },
  {
    id: 'track2',
    name: 'Track 2. 나노 & 에너지 소재',
    shortName: '나노·에너지 소재',
    color: '#0369A1',
    bg: '#E0F2FE',
    modules: ['R1', 'R2', 'H1', 'O1', 'E12'],
    careers: ['배터리 소재 기업', '반도체 소재 기업'],
    desc: '에너지 및 나노 신소재 개발 엔지니어. 배터리·태양전지·반도체 소재 설계까지.',
  },
  {
    id: 'track3',
    name: 'Track 3. 분석 & 품질관리',
    shortName: '분석·품질관리',
    color: '#0F6E56',
    bg: '#E1F5EE',
    modules: ['R1', 'R2', 'E21', 'O2'],
    careers: ['기기분석 전문가', 'QC/QA 전문가'],
    desc: '정밀 화학 분석 및 품질 관리 전문가. 분광학·전기화학 기기 운용 및 품질 관리.',
  },
  {
    id: 'track4',
    name: 'Track 4. 융합화학 연구',
    shortName: '융합화학 연구',
    color: '#B45309',
    bg: '#FEF3C7',
    modules: ['R1', 'R2', 'E21', 'H3'],
    careers: ['대학원 진학', '국공립 연구소'],
    desc: '응용화학 융합 지식과 연구 역량을 갖춘 연구자. 대학원·국공립 연구소 진학.',
  },
];

// ── 공식 마이크로디그리 (PDF 기반, 과목 이수 조건) ───────────────────
// 이것이 학교 공식 마이크로디그리 프로그램
export const MICRO_DEGREES = [
  {
    id: 'mds_design',
    name: '에너지소재설계·분석 마이크로디그리',
    shortName: '에너지소재설계·분석',
    color: '#0369A1',
    bg: '#E0F2FE',
    // 수료 요건 (2027년 이후): 소재캡스톤디자인1·2 필수 + 나머지 과목 중 2개 이수
    requiredCourseIds: ['cap1', 'cap2'],
    electiveCourseIds: ['energy_mod', 'energy_chem'],
    // 융합에너지학과 이수 필요 과목 (우리 학과 외)
    crossDeptRequired: [
      { name: '나노계측론', dept: '융합에너지학과' },
      { name: '나노공정개론', dept: '융합에너지학과' },
    ],
    completionRule: '소재캡스톤디자인1·2 필수 + {에너지소재모델링, 에너지화학, 나노계측론, 나노공정개론} 중 2과목 이수 (2027년 이후)',
    // 매칭용 전체 과목 id (1개 이상 겹치면 관련 표시)
    allCourseIds: ['cap1', 'cap2', 'energy_mod', 'energy_chem', 'inorg_syn', 'cat_des', 'nano_mat', 'func_poly', 'nano_basic', 'oc_syn', 'adv_cap'],
    desc: '에너지·바이오 분야 심화 과목 + 소재캡스톤 공통 이수 (2027년 이후 적용)',
  },
  {
    id: 'mds_energy_nano',
    name: '에너지화학·나노융합 마이크로디그리',
    shortName: '에너지화학·나노융합',
    color: '#B45309',
    bg: '#FEF3C7',
    // 수료 요건: 4과목 모두 이수
    requiredCourseIds: ['energy_mod', 'ec_ana', 'nano_mat', 'energy_chem'],
    allCourseIds: ['energy_mod', 'ec_ana', 'nano_mat', 'energy_chem'],
    completionRule: '에너지소재모델링 · 기기분석:전기분석 · 기능성나노소재 · 에너지화학 4과목 이수 시 수여',
    desc: '에너지화학 및 나노 융합 4과목 이수 시 수여',
  },
];

// ── 모듈 기반 이수 과정 (모듈 조합, 공식 마이크로디그리와 별개) ─────
// 내부 경로 추천용. 화면에는 "이수 과정" 으로 표시
export const CERT_TRACKS = [
  {
    id: 'ct_nano_energy',
    name: '나노&에너지소재 이수 과정',
    color: '#0369A1', bg: '#E0F2FE',
    modules: ['H1', 'E12', 'O1'],
    credits: 31,
    desc: 'H1(에너지융합소재)+E12(첨단소재설계)+O1(첨단소재응용) 모듈 조합.',
    track: 'Track 2. 나노 & 에너지 소재 트랙',
    trackId: 'track2',
    fusionMajor: '에너지소재융합전공',
  },
  {
    id: 'ct_adv_mat',
    name: '첨단소재설계 이수 과정',
    color: '#534AB7', bg: '#EEEDFE',
    modules: ['E12', 'T1'],
    credits: 23,
    desc: 'E12(첨단소재설계)+T1(나노소재합성) 모듈 조합.',
    track: 'Track 2. 나노 & 에너지 소재 트랙',
    trackId: 'track2',
    fusionMajor: '에너지소재융합전공',
  },
  {
    id: 'ct_bio',
    name: '바이오화학융합 이수 과정',
    color: '#7C3AED', bg: '#F3EFFE',
    modules: ['H2', 'E11'],
    credits: 21,
    desc: 'H2(바이오화학융합)+E11(정밀화학합성) 모듈 조합.',
    track: 'Track 1. 정밀화학 & 의약합성 트랙',
    trackId: 'track1',
    fusionMajor: '제약바이오융합전공',
  },
  {
    id: 'ct_nano',
    name: '나노소재합성 이수 과정',
    color: '#185FA5', bg: '#E6F1FB',
    modules: ['T1', 'H2'],
    credits: 22,
    desc: 'T1(나노소재합성)+H2(바이오화학융합) 모듈 조합.',
    track: 'Track 1. 정밀화학 & 의약합성 트랙',
    trackId: 'track1',
    fusionMajor: '제약바이오융합전공',
  },
  {
    id: 'ct_synth',
    name: '정밀화학합성 이수 과정',
    color: '#7C3AED', bg: '#F3EFFE',
    modules: ['R2', 'E11'],
    credits: 22,
    desc: 'E11(정밀화학합성)+R2(물질구조이해) 모듈 조합.',
    track: 'Track 1. 정밀화학 & 의약합성 트랙',
    trackId: 'track1',
    fusionMajor: '제약바이오융합전공',
  },
  {
    id: 'ct_analysis',
    name: '분석·품질관리 이수 과정',
    color: '#0F6E56', bg: '#E1F5EE',
    modules: ['E21', 'O2'],
    credits: 15,
    desc: 'E21(분석기술직무)+O2(분석실무응용) 모듈 조합.',
    track: 'Track 3. 분석 & 품질관리 트랙',
    trackId: 'track3',
    fusionMajor: null,
  },
  {
    id: 'ct_research',
    name: '융합화학연구 이수 과정',
    color: '#B45309', bg: '#FEF3C7',
    modules: ['E21', 'H3'],
    credits: 17,
    desc: 'E21(분석기술직무)+H3(연구개발캡스톤) 모듈 조합.',
    track: 'Track 4. 융합화학 연구 트랙',
    trackId: 'track4',
    fusionMajor: null,
  },
];

/**
 * 선택된 기초·심화 과목 id 배열을 받아
 * { baseMods, advMods, allMods, certTracks, microDegrees, matchedTracks, roadmap } 계산
 */
export function computePathway(basicIds, upperIds, selectedTrackId = null, selectedCertId = null, ippCourseIds = new Set()) {
  // 1) 기초 모듈 (항상 R1, R2 포함)
  const baseModSet = new Set(['R1', 'R2']);
  basicIds.forEach(id => {
    const course = ALL_COURSES.find(c => c.id === id);
    if (course?.module) baseModSet.add(course.module);
  });
  if (basicIds.includes('nano_basic')) baseModSet.add('T1');
  if (basicIds.includes('ac1'))        baseModSet.add('E21');

  const baseMods = [...baseModSet].map(id => MODULES[id]).filter(Boolean);

  // 2) 심화 모듈
  const advModSet = new Set();
  basicIds.forEach(id => {
    (BASIC_TO_ADV_MODS[id] || []).forEach(m => advModSet.add(m));
  });
  upperIds.forEach(id => {
    (UPPER_TO_ADV_MODS[id] || []).forEach(m => advModSet.add(m));
    const course = ALL_COURSES.find(c => c.id === id);
    if (course?.module) advModSet.add(course.module);
  });
  baseMods.forEach(m => advModSet.delete(m.id));
  const advMods = [...advModSet].map(id => MODULES[id]).filter(Boolean);

  // 3) 전체 관련 모듈
  const allModIds = new Set([...baseModSet, ...advModSet]);
  const allMods = [...allModIds].map(id => MODULES[id]).filter(Boolean);

  // 4) 선택 과목 set
  const selectedCourseIds = new Set([...basicIds, ...upperIds]);

  // 5) 이수 과정(CERT_TRACKS) 추천 — 관련 모듈 1개 이상 겹치면
  const certTracks = CERT_TRACKS.filter(ct => {
    const overlap = ct.modules.filter(m => allModIds.has(m));
    return overlap.length >= 1;
  });

  // 6) 공식 마이크로디그리 매칭 — 관련 과목 1개 이상 겹치면
  const microDegrees = MICRO_DEGREES.filter(md => {
    const overlap = md.allCourseIds.filter(id => selectedCourseIds.has(id));
    return overlap.length >= 1;
  });

  // 7) 트랙 매칭 (모듈 절반 이상 겹치면 매칭)
  const matchedTracks = TRACKS.filter(track => {
    const overlap = track.modules.filter(m => allModIds.has(m));
    return overlap.length >= 2;
  }).sort((a, b) => {
    const aOverlap = a.modules.filter(m => allModIds.has(m)).length;
    const bOverlap = b.modules.filter(m => allModIds.has(m)).length;
    return bOverlap - aOverlap;
  });

  // 8) 로드맵 빌드 (선택된 목표에 맞게 포커싱)
  let roadmapModIds = allModIds;
  if (selectedTrackId || selectedCertId) {
    const focused = new Set(baseModSet);
    if (selectedTrackId) {
      TRACKS.find(t => t.id === selectedTrackId)?.modules.forEach(m => focused.add(m));
    }
    if (selectedCertId) {
      CERT_TRACKS.find(ct => ct.id === selectedCertId)?.modules.forEach(m => focused.add(m));
    }
    roadmapModIds = focused;
  }
  const roadmap = buildRoadmap(basicIds, upperIds, roadmapModIds, ippCourseIds);

  return { baseMods, advMods, allMods, certTracks, microDegrees, matchedTracks, roadmap };
}

/**
 * 로드맵 구조:
 * [{ semester, label, courses: [{ ...course, status }] }]
 * status: 'selected' | 'recommended' | 'module' | 'common' | 'required' | 'dim'
 */
function buildRoadmap(basicIds, upperIds, allModIds, ippCourseIds = new Set()) {
  const selectedIds = new Set([...basicIds, ...upperIds]);
  const commonIds   = new Set(ALL_COURSES.filter(c => c.type === 'common').map(c => c.id));

  const SEMESTERS = ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const LABELS = {
    Y1S1: '1학년 1학기', Y1S2: '1학년 2학기',
    Y2S1: '2학년 1학기', Y2S2: '2학년 2학기',
    Y3S1: '3학년 1학기', Y3S2: '3학년 2학기',
    Y4S1: '4학년 1학기', Y4S2: '4학년 2학기',
  };

  return SEMESTERS.map(sem => {
    const courses = ALL_COURSES
      .filter(c => {
        // IPP 경로: ippCourseIds에 속한 과목은 Y4S1로 이동 (cap1 등 자연 학기 무시)
        const effectiveSem = (ippCourseIds.size > 0 && ippCourseIds.has(c.id)) ? 'Y4S1' : c.semester;
        return effectiveSem === sem;
      })
      .map(c => {
        let status = 'dim';
        if (c.type === 'required')                     status = 'required';
        else if (selectedIds.has(c.id))                status = 'selected';
        else if (commonIds.has(c.id))                  status = 'common';
        else if (c.module && allModIds.has(c.module))  status = 'module';
        return { ...c, status };
      })
      .sort((a, b) => {
        const order = { selected: 0, common: 1, module: 2, required: 3, dim: 4 };
        return (order[a.status] ?? 5) - (order[b.status] ?? 5);
      });

    return { semester: sem, label: LABELS[sem], courses };
  });
}
