import { api } from '../api/client';

// Module-level cache of admin overrides — loaded once on app init via loadAdminOverrides()
let _overrides = {};

// PDF(교과설명.pdf)에서 추출한 정적 교과 설명
export const STATIC_COURSE_DESCS = {
  pc1: {
    keywords: ['열역학 (Thermodynamics: Enthalpy, Entropy)', '물리적/화학적 평형 (Physical & Chemical Equilibrium)', '화학 포텐셜 (Chemical Potential)', '전기화학 (Electrochemistry)'],
    desc: '용융, 증발과 같은 물리적 변화와 전기화학을 포함한 화학적 변화에 대한 평형 상태를 열역학적으로 설명하며, 자발적인 변화의 원리를 학습합니다.',
  },
  pc2: {
    keywords: ['양자론 (Quantum Theory)', '원자 및 분자의 구조 (Atomic & Molecular Structure)', '미시적 성질 (Microscopic Properties)'],
    desc: '미시세계의 원리를 통해 물질의 물리적, 화학적 성질을 이해하기 위해 양자역학적 관점에서 원자와 분자를 다룹니다.',
    related: '물리화학1 선수강 권장',
  },
  ic1: {
    keywords: ['화학결합론 (Chemical Bonding: Ionic & Covalent)', '분자 대칭성 및 군론 (Molecular Symmetry & Group Theory)', '고체화합물 (Solid-state Materials)', '반도체재료 (Semiconductor)'],
    desc: '원자와 분자의 구조 및 결합 원리를 군론과 대칭성을 이용하여 논리적으로 고찰하고 고체화합물의 성질에 대해 학습합니다.',
  },
  ic2: {
    keywords: ['배위화학 (Coordination Chemistry)', '물성 변화 분석 (Material Properties Analysis)', '무기물의 합성 및 성능 이해 (Synthesis & Performance Characterization of Inorganic Materials)'],
    desc: '배위 화합물 및 다양한 무기물의 기본 개념을 이해하고, 이를 통해 물질의 물성 변화를 논리적으로 탐구하고 분석하는 능력을 배양합니다.',
    related: '무기화학1 선수강 권장',
  },
  oc1: {
    keywords: ['오비탈 이론 (Orbital Theory)', '구조와 반응성 (Structure & Reactivity)', '작용기 특성 (Functional Groups)'],
    desc: '유기화학의 기초인 구조와 반응성의 관계를 오비탈 이론으로 이해하고, 다양한 작용기의 물리·화학적 특성을 학습합니다.',
  },
  oc2: {
    keywords: ['유기반응 메커니즘 (Reaction Mechanisms)', '탄소-탄소 결합 형성 (C-C Bond Formation)', '유기합성 (Organic Synthesis)'],
    desc: '유기화학1의 연장선에서 다양한 유기반응의 종류와 상세 메커니즘을 알아보고, 탄소 결합 형성을 통한 복잡한 유기 반응 활용법을 고찰합니다.',
    related: '유기화학1 선수강 권장',
  },
  oc3: {
    keywords: ['카르보닐 화합물 (Ketones & Aldehydes)', '카르복실산 및 유도체 (Acids & Esters)', '아민 (Amines)'],
    desc: '케톤, 알데히드, 에스테르, 아민 등 심화 작용기의 특성과 반응 메커니즘을 상세히 다루며 고난도 탄소 결합 형성 방법을 학습합니다.',
    related: '유기화학1, 2 선수강 권장',
  },
  ac1: {
    keywords: ['화학평형 (Chemical Equilibrium)', '산염기 적정 (Acid-Base Titration)', '고전분석화학 (Classical Analytical Chemistry)'],
    desc: '물질의 양과 농도 등 화학의 기본 지식을 제공하며, 화학적 평형에 기반한 적정법 등 고전적인 분석 기술을 소개합니다.',
  },
  ac2: {
    keywords: ['전기화학분석법 (Electrochemical Analysis)', '분광분석법 (Spectroscopic Analysis)', '크로마토그래피 (Chromatography)'],
    desc: '현대 분석화학의 핵심인 전기화학 및 분광분석법, 그리고 혼합물 분리를 위한 크로마토그래피 이론 및 기술을 다룹니다.',
    related: '분석화학1 선수강 권장',
  },
  poly: {
    keywords: ['고분자 구조와 합성 (Polymer Structure & Synthesis)', '열적·기계적 특성 (Thermal & Mechanical Properties)', '첨단 고분자 소재 (Advanced Polymer Materials)'],
    desc: '고분자의 기본 원리와 물성 분석법을 학습하며, 의료용·반도체용 고분자 등 첨단 소재 사례를 통해 응용 분야별 소재 설계 역량을 기릅니다.',
  },
  nano_basic: {
    keywords: ['나노재료 화학적 특성', '반도체 응용', '첨단 산업 활용'],
    desc: '나노 크기에서 나타나는 물질의 독특한 화학적·물리적 특성을 이해합니다. 반도체 및 첨단 소재 산업에서 나노 재료가 활용되는 실제 사례와 원리를 공부합니다.',
  },
  ic_lab1: {
    keywords: ['금 나노 소재 합성법', '배위화합물 리간드 치환반응 (Ligand substitution reaction)', '배터리 소재 합성 (Synthesis of LFP)', '배터리 박막 제작 및 성능측정 (Film fabrication & Coin-cell Measurement)'],
    desc: '나노 소재 합성, 배위화합물 리간드 치환, LFP 배터리 소재 합성 및 코인셀 성능 측정 등 무기화학 실험 기술을 실습합니다.',
    related: '무기화학1',
  },
  inorg_syn: {
    keywords: ['유기전이금속 화합물', '촉매 응용성', '금속-리간드 결합'],
    desc: '금속과 유기 리간드의 결합을 갖는 유기금속 화합물의 합성법과 그 응용을 학습합니다. 무기 화합물이 촉매나 에너지 소재로서 가지는 특성과 반응 메커니즘을 상세히 고찰합니다.',
  },
  oc_syn: {
    keywords: ['탄소-탄소 결합 형성법', '입체 선택적 합성', '천연물 전합성'],
    desc: '탄소-탄소 결합 형성법을 중심으로 입체 선택적인 합성 경로를 설계하는 방법을 학습합니다. 의약품이나 천연물 합성에 필요한 현대적 유기합성 기술을 심도 있게 다룹니다.',
  },
  cat_lab: {
    keywords: ['공침법 (Co-Precipitation for NCM)', '수열반응 (Hydrothermal reaction)', '페로브스카이트 발광소재 합성법 (Synthesis of CsPbBr3 Nanocrystal)', '배위화합물 리간드 치환반응 (Ligand substitution reaction of metal complex)'],
    desc: '공침법, 수열반응, 페로브스카이트 합성 등 에너지 및 촉매 소재의 실험적 합성 기법을 실습합니다.',
    related: '무기화학1',
  },
  comp: {
    keywords: ['소프트웨어 활용 능력', '프로그래밍 언어', '화학 정보 수집'],
    desc: '화학 소프트웨어를 활용하여 분자 구조를 모델링하고 성질을 예측하는 기초를 다집니다. 파이썬 등 프로그래밍 언어를 배우고 화학 정보를 수집·분석하는 능력을 배양합니다.',
  },
  mol_spec: {
    keywords: ['분자 회전 및 진동 스펙트럼 (Rotational & Vibrational Spectra)', '전자 전이 (Electronic Transitions)', '반응속도 이론 (Rate Laws & Reaction Kinetics)', '충돌 이론 및 전이 상태 이론 (Collision & Transition State Theory)'],
    desc: '분자의 회전·진동·전자 전이 스펙트럼을 통해 구조를 분석하고, 반응속도론의 충돌 이론 및 전이 상태 이론을 학습합니다.',
    related: '물리화학2 선수강 권장',
  },
  cap1: {
    keywords: ['팀 프로젝트 (Team Project)', '소재 설계 및 시뮬레이션 (Material Design & Simulation)', '문제 해결 역량 (Problem Solving)'],
    desc: '산업 현장의 요구를 바탕으로 아이디어 도출부터 실험 분석, 결과 보고까지 전 과정을 수행하며, AI 기반 설계 및 데이터 분석 등 종합적인 설계 역량을 강화합니다.',
  },
  cap2: {
    keywords: ['팀 프로젝트 (Team Project)', '소재 설계 및 시뮬레이션 (Material Design & Simulation)', '문제 해결 역량 (Problem Solving)'],
    desc: '산업 현장의 요구를 바탕으로 아이디어 도출부터 실험 분석, 결과 보고까지 전 과정을 수행하며, AI 기반 설계 및 데이터 분석 등 종합적인 설계 역량을 강화합니다.',
  },
  adv_sem: {
    keywords: ['최신 연구 동향 (Recent Research Trends)', '배터리 및 수전해 (Batteries & Water Electrolysis)', '논문 해석 및 보고 (Paper Analysis & Reporting)'],
    desc: '전문가 강의를 통해 배터리, 연료전지, 태양전지 등 첨단 에너지 소재 분야의 최신 이슈를 학습하고 관련 연구 역량을 강화합니다.',
  },
  ec_ana: {
    keywords: ['전기분석법 (Electroanalytical methods)', '전기화학 셀 (Electrochemical cell)', '분석화학 (Analytical Chemistry)', '산화환원 반응 (Redox reaction)'],
    desc: '전기화학 셀의 원리와 다양한 전기분석 기법을 학습합니다. 산화환원 반응을 분석화학적으로 응용하는 현대 기기분석 기술을 다룹니다.',
  },
  cat_des: {
    keywords: ['유기금속 화합물 (Organometallic Compounds)', '치환/삽입/첨가 반응 (Substitution, Insertion, Addition Reactions)', '합성 및 응용 (Synthesis and Application)'],
    desc: '금속과 유기 리간드의 결합을 가진 유기금속 화합물의 일반적 특성을 이해하고, 다양한 반응 메커니즘을 통해 합성법과 에너지 소재로의 응용성을 학습합니다.',
  },
  energy_chem: {
    keywords: ['에너지 소재 합성법 (Synthesis and Processing of Functional Materials)', '태양전지 작동원리 및 분석 (Working Principle and Analysis of Solar Cells)', '수소에너지 소재 분석 (Material Analysis for Hydrogen Energy)', '배터리 소재 분석 (Material Analysis for Battery Applications)'],
    desc: '에너지 소재의 합성법을 이해하고, 태양전지·수소·배터리 등 핵심 에너지 소재의 작동 원리와 분석 방법을 학습합니다.',
    related: '무기화학1, 촉매소재디자인및작동원리 선수강 권장',
  },
  energy_mod: {
    keywords: ['에너지 소재 시뮬레이션 (Energy Materials Simulation)', '밀도범함수이론 기초 (Intro to DFT)', '고전 분자동역학 시뮬레이션 (Classical Molecular Dynamics)', '계산 기반 설계 전략 (Computational Design Strategy)'],
    desc: '밀도범함수이론(DFT)과 분자동역학을 기반으로 에너지 소재를 시뮬레이션하고, 계산 기반 소재 설계 전략을 습득합니다.',
    related: '물리화학2 선수강 권장',
  },
  func_poly: {
    keywords: ['고분자 합성 개념', '환경 및 생체 고분자', '기능성 설계'],
    desc: '특정 기능을 수행하도록 설계된 고분자의 합성 개념을 배웁니다. 환경 대응 고분자나 생체 고분자 등 최신 기능성 소재의 특징과 활용 방안을 다룹니다.',
  },
  nano_mat: {
    keywords: ['나노재료 합성 및 성질', '입자 배열 조절', '나노 바이오 응용'],
    desc: '나노 입자의 배열을 조절하여 구현되는 기능성 재료를 학습합니다. 나노 재료의 합성법과 이를 바이오 및 물리적 장치에 응용하는 기술을 이해합니다.',
  },
};

// Fetch admin overrides from server. Call once when app boots (or after login).
export async function loadAdminOverrides() {
  try {
    const { overrides } = await api.listCourseDescs();
    _overrides = overrides ?? {};
  } catch {
    _overrides = {};
  }
}

export function getCourseDesc(courseId) {
  if (_overrides[courseId]) return _overrides[courseId];
  return STATIC_COURSE_DESCS[courseId] ?? null;
}

export async function saveAdminDesc(courseId, data) {
  await api.saveCourseDesc(courseId, data);
  _overrides = { ..._overrides, [courseId]: data };
}

export async function deleteAdminDesc(courseId) {
  await api.deleteCourseDesc(courseId);
  const next = { ..._overrides };
  delete next[courseId];
  _overrides = next;
}

export function getAllAdminOverrides() {
  return { ..._overrides };
}
