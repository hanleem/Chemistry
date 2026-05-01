import { useState, useCallback } from 'react';
import { ALL_COURSES, SEMESTER_LABELS } from '../data/courses';
import { STATIC_COURSE_DESCS, getCourseDesc, saveAdminDesc, deleteAdminDesc, getAllAdminOverrides } from '../data/courseDescs';

const BTN = {
  base: { border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11, padding: '4px 10px', fontWeight: 600 },
  primary: { background: '#534AB7', color: '#fff' },
  ghost: { background: 'transparent', color: '#888', border: '0.5px solid #ccc' },
  danger: { background: 'transparent', color: '#DC2626', border: '0.5px solid #DC262640' },
};

const semOrder = ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];

export default function AdminPage({ onClose }) {
  const [overrides, setOverrides] = useState(getAllAdminOverrides);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ desc: '', keywords: '', related: '' });
  const [search, setSearch] = useState('');
  const [filterMissing, setFilterMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshOverrides = () => setOverrides(getAllAdminOverrides());

  const startEdit = useCallback((course) => {
    const existing = getCourseDesc(course.id);
    setEditData({
      desc: existing?.desc ?? '',
      keywords: (existing?.keywords ?? []).join('\n'),
      related: existing?.related ?? '',
    });
    setEditingId(course.id);
  }, []);

  const save = async (courseId) => {
    const keywords = editData.keywords.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      await saveAdminDesc(courseId, {
        desc: editData.desc.trim(),
        keywords,
        ...(editData.related.trim() ? { related: editData.related.trim() } : {}),
      });
      refreshOverrides();
      setEditingId(null);
    } catch (err) {
      alert('저장 실패: ' + (err.message || '서버 오류'));
    }
  };

  const reset = async (courseId) => {
    try {
      await deleteAdminDesc(courseId);
      refreshOverrides();
    } catch (err) {
      alert('초기화 실패: ' + (err.message || '서버 오류'));
    }
  };

  const exportJSON = () => {
    const merged = {};
    ALL_COURSES.forEach(c => {
      const d = getCourseDesc(c.id);
      if (d) merged[c.id] = d;
    });
    navigator.clipboard.writeText(JSON.stringify(merged, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = ALL_COURSES.filter(c => {
    if (search && !c.name.includes(search)) return false;
    if (filterMissing && getCourseDesc(c.id)) return false;
    return true;
  });

  const grouped = semOrder.reduce((acc, sem) => {
    const list = filtered.filter(c => c.semester === sem);
    if (list.length) acc[sem] = list;
    return acc;
  }, {});

  const totalMissing = ALL_COURSES.filter(c => !getCourseDesc(c.id)).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#fff', zIndex: 1000,
      display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        padding: '12px 16px', borderBottom: '1px solid #e0e0dc',
        background: '#fafaf8', flexShrink: 0,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>교과 설명 관리자</div>
        <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#FEF3C7', color: '#B45309', fontWeight: 600 }}>
          설명 없음 {totalMissing}개
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <button onClick={exportJSON} style={{ ...BTN.base, ...BTN.ghost }}>
            {copied ? '✓ 복사됨' : 'JSON 내보내기'}
          </button>
          <button onClick={onClose} style={{ ...BTN.base, ...BTN.primary }}>닫기</button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
        padding: '8px 16px', borderBottom: '0.5px solid #e0e0dc', flexShrink: 0,
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="과목명 검색..."
          style={{
            flex: 1, minWidth: 140, padding: '5px 10px', borderRadius: 6,
            border: '1px solid #ddd', fontSize: 12, outline: 'none',
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={filterMissing}
            onChange={e => setFilterMissing(e.target.checked)}
            style={{ width: 13, height: 13 }}
          />
          설명 없는 과목만
        </label>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {Object.entries(grouped).map(([sem, courses]) => (
          <div key={sem} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 8,
              paddingBottom: 4, borderBottom: '0.5px solid #e0e0dc',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {SEMESTER_LABELS[sem]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {courses.map(course => {
                const staticData = STATIC_COURSE_DESCS[course.id];
                const adminData = overrides[course.id];
                const current = adminData ?? staticData;
                const isEditing = editingId === course.id;

                return (
                  <div key={course.id} style={{
                    borderRadius: 8,
                    border: isEditing
                      ? '1.5px solid #534AB7'
                      : adminData
                        ? '1px solid #F59E0B60'
                        : current
                          ? '0.5px solid #e0e0dc'
                          : '1px dashed #FCA5A5',
                    background: isEditing ? '#EEEDFE' : adminData ? '#FFFBEB' : '#fff',
                    overflow: 'hidden',
                  }}>
                    {/* Course header row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                      padding: '7px 10px',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{course.name}</span>
                      <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 2, background: '#f0f0ec', color: '#888' }}>
                        {course.id}
                      </span>
                      {course.module && (
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 2, background: '#E6F1FB', color: '#185FA5' }}>
                          {course.module}
                        </span>
                      )}
                      {adminData && (
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 2, background: '#FEF3C7', color: '#B45309', fontWeight: 700 }}>
                          ● 수정됨
                        </span>
                      )}
                      {!current && (
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 2, background: '#FEE2E2', color: '#DC2626', fontWeight: 700 }}>
                          ● 설명 없음
                        </span>
                      )}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                        {!isEditing && (
                          <button onClick={() => startEdit(course)} style={{ ...BTN.base, ...BTN.ghost }}>
                            {current ? '편집' : '+ 작성'}
                          </button>
                        )}
                        {adminData && !isEditing && (
                          <button onClick={() => reset(course.id)} style={{ ...BTN.base, ...BTN.danger }}>초기화</button>
                        )}
                      </div>
                    </div>

                    {/* Current desc preview (not editing) */}
                    {!isEditing && current && (
                      <div style={{ padding: '0 10px 8px', borderTop: '0.5px solid #f0f0ec' }}>
                        {current.keywords && current.keywords.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 6, marginBottom: 4 }}>
                            {current.keywords.map((kw, i) => (
                              <span key={i} style={{
                                fontSize: 9, padding: '1px 6px', borderRadius: 10,
                                background: '#f0f0ec', color: '#555',
                              }}>{kw}</span>
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6, marginTop: 3 }}>{current.desc}</div>
                        {current.related && (
                          <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>연계: {current.related}</div>
                        )}
                        {adminData && staticData && (
                          <div style={{ fontSize: 9, color: '#B45309', marginTop: 4 }}>
                            ↑ 관리자 수정본 · 초기화하면 PDF 원본으로 복원됩니다
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edit form */}
                    {isEditing && (
                      <div style={{ padding: '8px 10px 10px', borderTop: '1px solid #534AB730' }}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#534AB7', marginBottom: 3 }}>교과 개요</div>
                          <textarea
                            value={editData.desc}
                            onChange={e => setEditData(p => ({ ...p, desc: e.target.value }))}
                            rows={3}
                            placeholder="교과 설명을 입력하세요..."
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '6px 8px', borderRadius: 5, fontSize: 11,
                              border: '1px solid #534AB740', outline: 'none',
                              resize: 'vertical', lineHeight: 1.6,
                              fontFamily: 'system-ui, sans-serif',
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#534AB7', marginBottom: 3 }}>
                            핵심 키워드 <span style={{ fontWeight: 400, color: '#999' }}>(한 줄에 하나)</span>
                          </div>
                          <textarea
                            value={editData.keywords}
                            onChange={e => setEditData(p => ({ ...p, keywords: e.target.value }))}
                            rows={3}
                            placeholder={'열역학 (Thermodynamics)\n화학평형 (Chemical Equilibrium)'}
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '6px 8px', borderRadius: 5, fontSize: 11,
                              border: '1px solid #534AB740', outline: 'none',
                              resize: 'vertical', lineHeight: 1.6,
                              fontFamily: 'system-ui, sans-serif',
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#534AB7', marginBottom: 3 }}>
                            연계 과목 <span style={{ fontWeight: 400, color: '#999' }}>(선수과목 등, 선택)</span>
                          </div>
                          <input
                            value={editData.related}
                            onChange={e => setEditData(p => ({ ...p, related: e.target.value }))}
                            placeholder="예: 물리화학1 선수강 권장"
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '5px 8px', borderRadius: 5, fontSize: 11,
                              border: '1px solid #534AB740', outline: 'none',
                              fontFamily: 'system-ui, sans-serif',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => save(course.id)} style={{ ...BTN.base, ...BTN.primary }}>저장</button>
                          <button onClick={() => setEditingId(null)} style={{ ...BTN.base, ...BTN.ghost }}>취소</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 40 }}>
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
