import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NoticeModal({ onClose }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [notices, setNotices] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [form, setForm] = useState({ title: '', content: '', link_url: '' });
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterData, setPosterData] = useState(null);
  const [posterType, setPosterType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const fileInputRef = useRef(null);

  // 공유 메뉴 (null = 닫힘, notice.id = 해당 공지 메뉴 열림)
  const [shareMenuId, setShareMenuId] = useState(null);
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => { fetchNotices(); }, []);

  async function fetchNotices() {
    setLoadingList(true);
    setListError(null);
    try {
      const { notices } = await api.listNotices();
      setNotices(notices);
    } catch (e) {
      setListError('공지사항을 불러오지 못했습니다.');
    } finally {
      setLoadingList(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPosterPreview(dataUrl);
    setPosterData(dataUrl);
    setPosterType(file.type);
  }

  function clearPoster() {
    setPosterPreview(null);
    setPosterData(null);
    setPosterType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await api.createNotice({
        title: form.title,
        content: form.content,
        link_url: form.link_url,
        poster_data: posterData,
        poster_type: posterType,
      });
      setForm({ title: '', content: '', link_url: '' });
      clearPoster();
      await fetchNotices();
    } catch (e) {
      setFormError(e.message || '등록 실패');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
      await api.deleteNotice(id);
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      alert('삭제 실패: ' + (e.message || '서버 오류'));
    }
  }

  // ── 공유 헬퍼 ──────────────────────────────────────────────
  async function handleShare(notice) {
    const appUrl = window.location.origin;
    const shareUrl = notice.link_url || appUrl;
    const shareText = [
      notice.title,
      notice.content ? notice.content.slice(0, 120) + (notice.content.length > 120 ? '…' : '') : '',
    ].filter(Boolean).join('\n');

    // 모바일: Web Share API → 카카오톡·문자·이메일 등 앱 선택창
    if (navigator.share) {
      try {
        await navigator.share({ title: notice.title, text: shareText, url: shareUrl });
      } catch (_) { /* 사용자가 취소 */ }
      return;
    }
    // 데스크탑: 폴백 메뉴 표시
    setShareMenuId(prev => (prev === notice.id ? null : notice.id));
    setCopyDone(false);
  }

  function makeMailtoLink(notice) {
    const appUrl = window.location.origin;
    const subject = encodeURIComponent(`[공지] ${notice.title}`);
    const body = encodeURIComponent(
      [notice.title, notice.content || '', notice.link_url || appUrl].filter(Boolean).join('\n\n')
    );
    return `mailto:?subject=${subject}&body=${body}`;
  }

  async function copyLink(notice) {
    const url = notice.link_url || window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      setCopyDone(true);
      setTimeout(() => { setCopyDone(false); setShareMenuId(null); }, 1500);
    } catch (_) {
      window.prompt('아래 주소를 복사하세요 (Ctrl+C)', url);
    }
  }
  // ────────────────────────────────────────────────────────────

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '24px 16px 40px', zIndex: 2000, overflowY: 'auto',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520,
        boxShadow: '0 10px 50px rgba(0,0,0,0.22)', overflow: 'hidden',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px 12px',
          borderBottom: '0.5px solid #e0e0dc',
          background: '#FFFBEB',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>📢</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>공지사항</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>화학나노학전공</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: '#aaa', lineHeight: 1, padding: '2px 4px',
            }}
          >✕</button>
        </div>

        <div style={{ padding: '14px 18px 20px' }}>
          {/* 관리자 등록 폼 */}
          {isAdmin && (
            <form onSubmit={handleSubmit} style={{
              background: '#FFFBEB', border: '1.5px solid #F59E0B60',
              borderRadius: 10, padding: '14px 16px', marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#B45309', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ fontSize: 13 }}>✏️</span> 공지사항 등록 (관리자)
              </div>

              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="제목 *"
                required
                style={inputStyle}
              />
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="내용 (선택)"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
              <input
                value={form.link_url}
                onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                placeholder="관련 사이트 주소 (https://...)"
                type="url"
                style={inputStyle}
              />

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 5 }}>포스터 이미지 (선택)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{
                    display: 'inline-block', fontSize: 11, padding: '5px 12px',
                    borderRadius: 5, background: '#F59E0B', color: '#fff',
                    cursor: 'pointer', fontWeight: 600,
                  }}>
                    이미지 선택
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {posterPreview && (
                    <button type="button" onClick={clearPoster} style={{
                      fontSize: 10, padding: '4px 8px', borderRadius: 4,
                      background: 'transparent', border: '0.5px solid #ddd',
                      color: '#888', cursor: 'pointer',
                    }}>제거</button>
                  )}
                </div>
                {posterPreview && (
                  <img
                    src={posterPreview}
                    alt="미리보기"
                    style={{
                      marginTop: 8, width: '100%', maxHeight: 200,
                      objectFit: 'contain', borderRadius: 6,
                      border: '0.5px solid #e0e0dc', background: '#f9f9f7',
                    }}
                  />
                )}
              </div>

              {formError && (
                <div style={{ fontSize: 11, color: '#DC2626', marginBottom: 8 }}>{formError}</div>
              )}
              <button
                type="submit"
                disabled={submitting || !form.title.trim()}
                style={{
                  width: '100%', padding: '9px 0', borderRadius: 6,
                  background: submitting ? '#ddd' : '#F59E0B',
                  color: '#fff', border: 'none',
                  fontSize: 12, fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                }}
              >{submitting ? '등록 중…' : '📌 공지사항 등록'}</button>
            </form>
          )}

          {/* 공지 목록 */}
          {loadingList ? (
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, padding: '30px 0' }}>
              불러오는 중…
            </div>
          ) : listError ? (
            <div style={{ textAlign: 'center', color: '#DC2626', fontSize: 12, padding: '20px 0' }}>{listError}</div>
          ) : notices.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#bbb', fontSize: 13, padding: '40px 0' }}>
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notices.map(n => (
                <div key={n.id} style={{
                  border: '1px solid #e0e0dc', borderRadius: 10, overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  {n.poster_data && (
                    <img
                      src={n.poster_data}
                      alt="포스터"
                      style={{
                        width: '100%', display: 'block',
                        maxHeight: 340, objectFit: 'contain',
                        background: '#f5f5f3',
                      }}
                    />
                  )}
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 5 }}>
                      {n.title}
                    </div>
                    {n.content && (
                      <div style={{
                        fontSize: 12, color: '#555', lineHeight: 1.7,
                        marginBottom: 8, whiteSpace: 'pre-line',
                      }}>{n.content}</div>
                    )}
                    {n.link_url && (
                      <a
                        href={n.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, color: '#185FA5', fontWeight: 600,
                          padding: '5px 12px', borderRadius: 5,
                          border: '1px solid #185FA540', background: '#E6F1FB',
                          textDecoration: 'none', marginBottom: 6,
                        }}
                      >
                        🔗 관련 사이트 바로가기
                      </a>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: '#bbb' }}>{formatDate(n.created_at)}</span>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {/* 공유 버튼 */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => handleShare(n)}
                            style={{
                              fontSize: 10, padding: '2px 10px', borderRadius: 4,
                              background: 'transparent', border: '0.5px solid #b3c6e0',
                              color: '#185FA5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                            }}
                          >
                            <span style={{ fontSize: 11 }}>🔗</span> 공유
                          </button>
                          {/* 데스크탑 폴백 메뉴 */}
                          {shareMenuId === n.id && (
                            <div style={{
                              position: 'absolute', right: 0, bottom: '110%',
                              background: '#fff', border: '1px solid #e0e0dc',
                              borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                              padding: '8px', zIndex: 3000, minWidth: 160,
                            }}>
                              <div style={{ fontSize: 10, color: '#888', marginBottom: 6, fontWeight: 600 }}>공유하기</div>
                              {/* 카카오톡: 모바일에서는 Web Share API가 처리. 데스크탑은 카카오 앱으로 복사 안내 */}
                              <a
                                href={makeMailtoLink(n)}
                                style={shareItemStyle}
                              >
                                <span>📧</span> 이메일로 보내기
                              </a>
                              <button
                                onClick={() => copyLink(n)}
                                style={{ ...shareItemStyle, border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                              >
                                {copyDone ? <><span>✅</span> 복사됨!</> : <><span>📋</span> 링크 복사</>}
                              </button>
                              <button
                                onClick={() => setShareMenuId(null)}
                                style={{
                                  width: '100%', marginTop: 4, padding: '4px 0',
                                  fontSize: 10, color: '#aaa', background: 'none',
                                  border: 'none', cursor: 'pointer', textAlign: 'center',
                                }}
                              >닫기</button>
                            </div>
                          )}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(n.id)}
                            style={{
                              fontSize: 10, padding: '2px 10px', borderRadius: 4,
                              background: 'transparent', border: '0.5px solid #f0a0a0',
                              color: '#DC2626', cursor: 'pointer',
                            }}
                          >삭제</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 6,
  border: '1px solid #e0e0dc', fontSize: 12, marginBottom: 7,
  fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
};

const shareItemStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '6px 10px', borderRadius: 5, fontSize: 11, color: '#333',
  background: '#f8f8f6', textDecoration: 'none',
  marginBottom: 4,
};
