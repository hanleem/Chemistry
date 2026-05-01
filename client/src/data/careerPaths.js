// 졸업학점: 128학점 총계
//   전공 63학점 + 자유선택 10학점 (+ 교양 등)
//   IPP: 15학점 인정 + 교양 3학점 인정 → 전공 49학점(Y4S1까지) 이수로 충족
//   에너지소재융합전공 공동이수: 융합에너지학과 교과 15학점 이수
//   제약바이오융합전공 공동이수: 식품영양 or 시스템바이오 교과 18학점 이수

// IPP 필수 교과 4과목 (모든 IPP 경로 공통, 4학년 1학기 필수 수강):
//   mol_spec(분자분광학과반응속도), cap1(소재캡스톤디자인1),
//   func_poly(기능성고분자소재), spec_ana(기기분석:분광학)

// D학기제 패키지 5과목 (모두 4학년 2학기에 수강):
//   adv_sem(첨단에너지소재세미나), ec_ana(기기분석:전기분석),
//   cat_des(촉매소재디자인및작동원리), energy_mod(에너지소재모델링),
//   adv_cap(고급화학실험설계캡스톤)

export const CAREER_PATHS = [
  {
    id: 'employment_energy',
    goal: 'employment',
    field: 'energy',
    label: '취업 · 에너지소재',
    goalLabel: '취업',
    fieldLabel: '에너지소재',
    programRec: 'IPP',
    fusionMajorRec: '에너지소재융합전공',
    fusionMajorDept: '융합에너지학과',
    fusionMajorCreditsReq: 15,
    creditTarget: 49,
    ippCredits: 15,
    recommendedBasicIds: ['pc1', 'ic1', 'ac1'],
    // 비캐스톤 실험 4개: ic_lab1, cat_lab, pc_lab1, pc_lab2
    // IPP 캐스톤: cap1만 (캐스톤디자인2 제외)
    recommendedUpperIds: [
      'energy_chem', 'ec_ana', 'spec_ana',
      'ic_lab1', 'cat_lab', 'pc_lab1', 'pc_lab2',   // 비캐스톤 실험 4개
      // IPP 필수 교과 (Y4S1 자동 배치) — cap1만
      'mol_spec', 'cap1', 'func_poly',
    ],
    color: '#EA580C',
    bg: '#FFF7ED',
    desc: '배터리·반도체 소재 기업 취업 목표. IPP 장기현장실습으로 실무 역량 강화.',
    // Y4S1: IPP 필수 4과목
    y4s1Courses: ['mol_spec', 'cap1', 'func_poly', 'spec_ana'],
    y4s2Type: 'IPP',
    fusionNote: '융합에너지학과 교과 15학점 이수 시 에너지소재융합전공 공동이수 가능 (Y3S1~Y4S1 중 협의)',
  },
  {
    id: 'employment_bio',
    goal: 'employment',
    field: 'bio',
    label: '취업 · 제약바이오',
    goalLabel: '취업',
    fieldLabel: '제약바이오',
    programRec: 'IPP',
    fusionMajorRec: '제약바이오융합전공',
    fusionMajorDept: '식품영양 또는 시스템바이오학과',
    fusionMajorCreditsReq: 18,
    creditTarget: 49,
    ippCredits: 15,
    recommendedBasicIds: ['oc1', 'nano_basic'],
    // 비캐스톤 실험 4개: oc_lab1, oc_lab2, nano_lab, ac_lab
    // IPP 캐스톤: cap1만 (캐스톤디자인 전체 제외)
    recommendedUpperIds: [
      'nano_mat', 'oc3', 'spec_ana', 'ec_ana',
      'oc_lab1', 'oc_lab2', 'nano_lab', 'ac_lab',
      // IPP 필수 교과
      'mol_spec', 'cap1', 'func_poly',
    ],
    color: '#7C3AED',
    bg: '#F3EFFE',
    desc: '제약·화장품·바이오 기업 취업 목표. IPP 장기현장실습으로 산업 현장 경험.',
    y4s1Courses: ['mol_spec', 'cap1', 'func_poly', 'spec_ana'],
    y4s2Type: 'IPP',
    fusionNote: '식품영양 또는 시스템바이오 교과 18학점 이수 시 제약바이오융합전공 공동이수 가능',
  },
  {
    id: 'grad_energy',
    goal: 'grad',
    field: 'energy',
    label: '대학원 · 에너지소재',
    goalLabel: '대학원',
    fieldLabel: '에너지소재',
    programRec: 'D학기제',
    fusionMajorRec: '에너지소재융합전공',
    fusionMajorDept: '융합에너지학과',
    fusionMajorCreditsReq: 15,
    creditTarget: 63,
    ippCredits: 0,
    recommendedBasicIds: ['pc1', 'ic1', 'ac1'],
    // 비캐스톤 실험 4개 + D학기제 5과목 (캐스톤 전체 제외)
    recommendedUpperIds: [
      'energy_chem', 'spec_ana',
      'ic_lab1', 'cat_lab', 'pc_lab1', 'pc_lab2',   // 비캐스톤 실험 4개 (캐스톤 전체 제외)
      // D학기제 5과목 (Y4S2 필수, 15학점)
      'energy_mod', 'adv_sem', 'cat_des', 'ec_ana', 'adv_cap',
    ],
    color: '#EA580C',
    bg: '#FFF7ED',
    desc: '에너지·나노소재 대학원 진학 목표. D학기제 연구집중학기로 연구역량 조기 확보.',
    // Y4S1: 에너지 연구 준비 과목
    y4s1Courses: ['spec_ana', 'energy_chem', 'pc_lab2', 'nano_mat'],
    y4s2Type: 'D학기제',
    // D학기제 패키지 — 모두 4학년 2학기에 수강
    dSemesterIds: ['adv_sem', 'ec_ana', 'cat_des', 'energy_mod', 'adv_cap'],
    fusionNote: '융합에너지학과 교과 15학점 이수 시 에너지소재융합전공 공동이수 가능 (Y3S1~Y4S1 중 협의)',
  },
  {
    id: 'grad_bio',
    goal: 'grad',
    field: 'bio',
    label: '대학원 · 제약바이오',
    goalLabel: '대학원',
    fieldLabel: '제약바이오',
    programRec: 'D학기제',
    fusionMajorRec: '제약바이오융합전공',
    fusionMajorDept: '식품영양 또는 시스템바이오학과',
    fusionMajorCreditsReq: 18,
    creditTarget: 63,
    ippCredits: 0,
    recommendedBasicIds: ['oc1', 'ac1'],
    // 비캐스톤 실험 4개: oc_lab1, oc_lab2, nano_lab, ac_lab
    // 비캡스톤 실험 4개 + D학기제 ec_ana 포함 (cap1/cap2 모두 제외)
    recommendedUpperIds: [
      'nano_mat', 'func_poly', 'oc3', 'spec_ana',
      'oc_lab1', 'oc_lab2', 'nano_lab', 'ac_lab',   // 비캐스톤 실험 4개 (캐스톤 전체 제외)
      // D학기제 5과목 (Y4S2 필수, 15학점)
      'adv_sem', 'ec_ana', 'cat_des', 'energy_mod', 'adv_cap',
    ],
    color: '#7C3AED',
    bg: '#F3EFFE',
    desc: '바이오·제약화학 대학원 진학 목표. D학기제 연구집중학기로 연구역량 조기 확보.',
    y4s1Courses: ['func_poly', 'nano_mat', 'oc_lab2'],
    y4s2Type: 'D학기제',
    dSemesterIds: ['adv_sem', 'ec_ana', 'cat_des', 'energy_mod', 'adv_cap'],
    fusionNote: '식품영양 또는 시스템바이오 교과 18학점 이수 시 제약바이오융합전공 공동이수 가능',
  },
];

export const CAREER_PATH_BY_ID = Object.fromEntries(CAREER_PATHS.map(p => [p.id, p]));
