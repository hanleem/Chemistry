// semester: Y1S1/Y1S2=1학년, Y2S1/Y2S2=2학년
//           Y3S1/Y3S2=3학년, Y4S1=4학년1학기, Y4S2=4학년2학기(D학기제/IPP)
// type: 'required'=교양필수, 'common'=전체권장, 'major'=전공선택, 'cross'=타학과연계
// kind: 'theory'=이론, 'lab'=실습, 'mixed'=이론+실습
// isBasicChoice: Step1 기초과목 선택 대상
// isUpperChoice: Step3 심화과목 선택 대상
// ippRequired: true = IPP 필수 교과 (4학년 1학기 수강 필수)
// dSemester: true = D학기제 과목 (4학년 2학기 D학기제 패키지)

export const ALL_COURSES = [
  // ── 1학년 ──
  { id: 'gen_chem1', name: '일반화학1', semester: 'Y1S1', type: 'required', credit: 3, module: null, kind: 'theory' },
  { id: 'gen_lab1',  name: '화학실험1', semester: 'Y1S1', type: 'required', credit: 1, module: null, kind: 'lab' },
  { id: 'gen_chem2', name: '일반화학2', semester: 'Y1S2', type: 'required', credit: 3, module: null, kind: 'theory' },
  { id: 'gen_lab2',  name: '화학실험2', semester: 'Y1S2', type: 'required', credit: 1, module: null, kind: 'lab' },
  { id: 'seminar',   name: '화학에너지융합바이오전공탐색세미나', semester: 'Y1S2', type: 'major', credit: 1, module: 'R1', kind: 'mixed' },

  // ── 2학년 1학기 ──
  { id: 'pc1', name: '물리화학1', semester: 'Y2S1', type: 'common', credit: 3, module: 'R1', kind: 'theory', isBasicChoice: true,
    hint: '열역학·전기화학, 에너지 방향' },
  { id: 'ic1', name: '무기화학1', semester: 'Y2S1', type: 'common', credit: 3, module: 'R1', kind: 'theory', isBasicChoice: true,
    hint: '구조·결합·대칭성, 소재 방향' },
  { id: 'oc1', name: '유기화학1', semester: 'Y2S1', type: 'common', credit: 3, module: 'R1', kind: 'theory', isBasicChoice: true,
    hint: '작용기·반응성, 합성·바이오 방향' },
  { id: 'ac1', name: '분석화학1', semester: 'Y2S1', type: 'common', credit: 3, module: 'E21', kind: 'theory', isBasicChoice: true,
    hint: '정량분석·적정, 분석·품질관리 방향' },

  // ── 2학년 2학기 ──
  { id: 'pc2',  name: '물리화학2',     semester: 'Y2S2', type: 'common', credit: 3, module: 'R2',  kind: 'theory' },
  { id: 'ic2',  name: '무기화학2',     semester: 'Y2S2', type: 'common', credit: 3, module: 'R2',  kind: 'theory' },
  { id: 'oc2',  name: '유기화학2',     semester: 'Y2S2', type: 'common', credit: 3, module: 'R2',  kind: 'theory' },
  { id: 'ac2',  name: '분석화학2',     semester: 'Y2S2', type: 'common', credit: 3, module: 'E21', kind: 'theory' },
  { id: 'poly', name: '고분자화학기초', semester: 'Y2S2', type: 'major',  credit: 3, module: 'R2',  kind: 'theory',
    hint: '전학년 수강 가능, R2 모듈 기반' },
  { id: 'bio',  name: '생화학',        semester: 'Y2S2', type: 'major',  credit: 3, module: 'H2',  kind: 'theory',
    hint: '생체분자·효소, 바이오·제약 방향' },

  // ── 3학년 1학기 ──
  { id: 'nano_basic', name: '나노화학기초',   semester: 'Y3S1', type: 'common', credit: 3, module: 'T1',  kind: 'theory', isBasicChoice: true,
    hint: '나노재료 특성·응용, 나노·소재 방향' },
  { id: 'ic_lab1',    name: '무기화학실험1',  semester: 'Y3S1', type: 'major',  credit: 2, module: 'O2',  kind: 'lab',    isUpperChoice: true },
  { id: 'pc_lab1',    name: '물리화학실험1',  semester: 'Y3S1', type: 'major',  credit: 2, module: 'O2',  kind: 'lab',    isUpperChoice: true },
  { id: 'oc_lab1',    name: '유기화학실험1',  semester: 'Y3S1', type: 'major',  credit: 2, module: 'E11', kind: 'lab',    isUpperChoice: true },
  { id: 'nano_lab',   name: '나노화학실험',    semester: 'Y3S1', type: 'major',  credit: 2, module: 'T1',  kind: 'lab',    isUpperChoice: true },
  { id: 'inorg_syn',  name: '무기물및소재합성론', semester: 'Y3S1', type: 'major', credit: 3, module: 'E12', kind: 'theory', isUpperChoice: true },
  { id: 'oc3',        name: '유기화학3',       semester: 'Y3S1', type: 'major',  credit: 3, module: 'E11', kind: 'theory', isUpperChoice: true },
  // XX화학특수연구: 매 학기 강좌명 변경, 대학원 과목 학부학점 인정 (3학년 이상, 신청자)
  { id: 'chem_research', name: 'XX화학특수연구', semester: 'Y3S1', type: 'major', credit: 3, module: null, kind: 'theory', isUpperChoice: true,
    hint: '대학원 수업 학부학점 인정 (매학기 강좌명 변경). 조건: 직전 2학기 GPA 3.5+, 졸업학점 50%+ 이수, 3학년 이상 신청 가능' },

  // ── 3학년 2학기 ──
  { id: 'oc_syn',  name: '유기합성화학',             semester: 'Y3S2', type: 'major', credit: 3, module: 'E11', kind: 'theory', isUpperChoice: true },
  { id: 'cat_lab', name: '에너지소재/촉매실험',      semester: 'Y3S2', type: 'major', credit: 2, module: 'O1',  kind: 'lab',    isUpperChoice: true },
  { id: 'cap2',    name: '소재캡스톤디자인2',        semester: 'Y3S2', type: 'major', credit: 3, module: 'H3',  kind: 'lab',    isUpperChoice: true },
  { id: 'comp',    name: '컴퓨터화학',               semester: 'Y3S2', type: 'major', credit: 3, module: 'E21', kind: 'lab',    isUpperChoice: true },

  // ── 4학년 1학기 ──
  // IPP 필수 교과 (4과목, 취업 IPP 경로 필수 수강)
  { id: 'mol_spec',  name: '분자분광학과반응속도', semester: 'Y4S1', type: 'major', credit: 3, module: 'T1',  kind: 'theory', isUpperChoice: true, ippRequired: true,
    hint: 'IPP 필수 교과' },
  { id: 'cap1',      name: '소재캡스톤디자인1',    semester: 'Y3S1', type: 'major', credit: 3, module: 'H3',  kind: 'lab',    isUpperChoice: true, ippRequired: true,
    hint: 'IPP 필수 교과 (IPP 학생: 4학년 1학기 이수, 비IPP: 3학년 1학기 이수)' },
  { id: 'func_poly', name: '기능성고분자소재',     semester: 'Y4S1', type: 'major', credit: 3, module: 'H2',  kind: 'theory', isUpperChoice: true, ippRequired: true,
    hint: 'IPP 필수 교과' },
  { id: 'spec_ana',  name: '기기분석:분광학',      semester: 'Y4S1', type: 'major', credit: 3, module: 'E12', kind: 'theory', isUpperChoice: true, ippRequired: true,
    hint: 'IPP 필수 교과' },
  // 기타 4학년 1학기 과목
  { id: 'energy_chem', name: '에너지화학',    semester: 'Y4S1', type: 'major', credit: 3, module: 'H1',  kind: 'theory', isUpperChoice: true },
  { id: 'nano_mat',    name: '기능성나노소재', semester: 'Y4S1', type: 'major', credit: 3, module: 'H2',  kind: 'theory', isUpperChoice: true },
  { id: 'nano2',       name: '나노화학2',     semester: 'Y4S1', type: 'major', credit: 3, module: 'T1',  kind: 'theory', isUpperChoice: true },
  { id: 'oc_lab2',     name: '유기화학실험2', semester: 'Y4S1', type: 'major', credit: 2, module: 'E11', kind: 'lab',    isUpperChoice: true },
  { id: 'ac_lab',      name: '분석화학실험',  semester: 'Y4S1', type: 'major', credit: 2, module: 'O2',  kind: 'lab',    isUpperChoice: true },
  { id: 'pc_lab2',     name: '물리화학실험2', semester: 'Y4S1', type: 'major', credit: 2, module: 'O1',  kind: 'lab',    isUpperChoice: true },

  // ── 4학년 2학기 (D학기제 패키지 — 5과목 모두 수강) ──
  { id: 'adv_sem',    name: '첨단에너지소재세미나',     semester: 'Y4S2', type: 'major', credit: 2, module: 'O1',  kind: 'theory', isUpperChoice: true, dSemester: true },
  { id: 'ec_ana',     name: '기기분석:전기분석',        semester: 'Y4S2', type: 'major', credit: 3, module: 'H1',  kind: 'theory', isUpperChoice: true, dSemester: true },
  { id: 'cat_des',    name: '촉매소재디자인및작동원리', semester: 'Y4S2', type: 'major', credit: 3, module: 'E12', kind: 'theory', isUpperChoice: true, dSemester: true },
  { id: 'energy_mod', name: '에너지소재모델링',          semester: 'Y4S2', type: 'major', credit: 3, module: 'E12', kind: 'mixed',  isUpperChoice: true, dSemester: true },
  { id: 'adv_cap',    name: '고급화학실험설계캡스톤',   semester: 'Y4S2', type: 'major', credit: 4, module: 'O1',  kind: 'lab',    isUpperChoice: true, dSemester: true },
];

export const COURSE_BY_ID   = Object.fromEntries(ALL_COURSES.map(c => [c.id, c]));
export const COURSE_BY_NAME = Object.fromEntries(ALL_COURSES.map(c => [c.name, c]));

export const SEMESTER_LABELS = {
  Y1S1: '1학년 1학기', Y1S2: '1학년 2학기',
  Y2S1: '2학년 1학기', Y2S2: '2학년 2학기',
  Y3S1: '3학년 1학기', Y3S2: '3학년 2학기',
  Y4S1: '4학년 1학기', Y4S2: '4학년 2학기',
};

export const SEMESTER_ORDER = ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
