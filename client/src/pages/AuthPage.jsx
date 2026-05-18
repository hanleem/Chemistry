import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { login, register } = useAuthStore();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(studentId.trim(), password);
      } else {
        if (!name.trim()) throw new Error('이름을 입력하세요.');
        if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.');
        await register(studentId.trim(), name.trim(), password);
      }
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: 360, margin: '60px auto', padding: '0 20px 40px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>

      {/* ── 바로가기 버튼 2개 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => window.open('/fair/', '_blank')}
          style={quickBtnStyle('#0d2137', 'linear-gradient(135deg,#0d2137,#1a3a5c)')}
        >
          <span style={{ fontSize: 20 }}>🔬</span>
          <span>
            <div style={{ fontWeight: 700, fontSize: 13 }}>화학과 연구실 박람회</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>연구실 소개 · 홈페이지 · 동영상 QR</div>
          </span>
        </button>
        <button
          onClick={() => alert('컴퓨터 예약 시스템 준비 중입니다.')}
          style={quickBtnStyle('#185FA5', 'linear-gradient(135deg,#185FA5,#1d7ec2)')}
        >
          <span style={{ fontSize: 20 }}>💻</span>
          <span>
            <div style={{ fontWeight: 700, fontSize: 13 }}>컴퓨터 예약 시스템</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>실습실 좌석 예약하기</div>
          </span>
        </button>
      </div>

      {/* ── 로그인 카드 ── */}
    <div style={{
      padding: '24px 20px',
      background: '#fff', borderRadius: 10, border: '0.5px solid #e0e0dc',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>명지대학교</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
          화학나노학전공 이수 설계
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => { setMode('login'); setError(null); }}
          style={tabStyle(mode === 'login')}
        >로그인</button>
        <button
          type="button"
          onClick={() => { setMode('register'); setError(null); }}
          style={tabStyle(mode === 'register')}
        >회원가입</button>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Field label="학번" value={studentId} onChange={setStudentId} placeholder="예: 60201234" autoFocus />
        {mode === 'register' && (
          <Field label="이름" value={name} onChange={setName} placeholder="홍길동" />
        )}
        <Field label="비밀번호" value={password} onChange={setPassword} type="password" placeholder={mode === 'register' ? '6자 이상' : ''} />
        {error && (
          <div style={{ fontSize: 11, color: '#DC2626', padding: '6px 8px', background: '#FEE2E2', borderRadius: 5 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting || !studentId || !password || (mode === 'register' && !name)}
          style={{
            marginTop: 4, padding: '10px 0', borderRadius: 6,
            border: 'none', background: '#534AB7', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? '처리 중…' : mode === 'login' ? '로그인' : '가입하고 시작하기'}
        </button>
      </form>
    </div>  {/* 로그인 카드 닫기 */}
    </div>  {/* 전체 래퍼 닫기 */}
  );
}

function quickBtnStyle(color, background) {
  return {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px', borderRadius: 10, border: 'none',
    background, color: '#fff', cursor: 'pointer',
    textAlign: 'left', width: '100%',
    boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  };
}

function Field({ label, value, onChange, type = 'text', placeholder, autoFocus }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          padding: '8px 10px', borderRadius: 5, border: '1px solid #ddd',
          fontSize: 12, outline: 'none', fontFamily: 'inherit',
        }}
      />
    </label>
  );
}

function tabStyle(active) {
  return {
    flex: 1, padding: '8px 0', borderRadius: 6, cursor: 'pointer',
    fontSize: 12, fontWeight: 600,
    border: active ? '1.5px solid #534AB7' : '0.5px solid #ddd',
    background: active ? '#EEEDFE' : 'transparent',
    color: active ? '#534AB7' : '#888',
  };
}
