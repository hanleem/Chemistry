import { useEffect, useState } from 'react';
import { useSelectionStore } from './store/useSelectionStore';
import { useAuthStore } from './store/useAuthStore';
import { StepBar } from './components';
import Step0Career from './pages/Step0Career';
import Step1Basic from './pages/Step1Basic';
import { Step2BaseMod, Step3Upper, Step4AdvMod } from './pages/Steps2_3_4';
import Step5Roadmap from './pages/Step5Roadmap';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import { CAREER_PATH_BY_ID } from './data/careerPaths';
import { loadAdminOverrides } from './data/courseDescs';

const STEP_COMPONENTS = {
  0: Step0Career,
  1: Step1Basic,
  2: Step2BaseMod,
  3: Step3Upper,
  4: Step4AdvMod,
  5: Step5Roadmap,
};

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const { user, loading, init, logout } = useAuthStore();
  const { step, basicIds, upperIds, careerPathId, fetchRoadmaps, resetAll } = useSelectionStore();
  const Page = STEP_COMPONENTS[step] ?? Step0Career;

  // initial auth check
  useEffect(() => { init(); }, [init]);

  // when user logs in, load their roadmaps and the global course-desc overrides
  useEffect(() => {
    if (user) {
      fetchRoadmaps();
      loadAdminOverrides();
    } else {
      resetAll();
    }
  }, [user, fetchRoadmaps, resetAll]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 13, fontFamily: 'system-ui, sans-serif' }}>
        로딩 중…
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const pathNodes = [];
  if (careerPathId) {
    const cp = CAREER_PATH_BY_ID[careerPathId];
    if (cp) pathNodes.push({ text: cp.label, color: cp.color, bg: cp.bg });
  }
  if (basicIds.length > 0) {
    pathNodes.push({ text: `기초: ${basicIds.length}개 선택`, color: '#185FA5', bg: '#E6F1FB' });
  }
  if (upperIds.length > 0) {
    pathNodes.push({ text: `심화: ${upperIds.length}개 선택`, color: '#534AB7', bg: '#EEEDFE' });
  }

  if (adminOpen) return <AdminPage onClose={() => setAdminOpen(false)} />;

  return (
    <div style={{
      maxWidth: 600,
      margin: '0 auto',
      padding: '16px 14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>명지대학교</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
            화학나노학전공 이수 설계
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: '#888', marginRight: 4 }}>
            {user.name} ({user.student_id})
          </span>
          {user.role === 'admin' && (
            <button
              onClick={() => setAdminOpen(true)}
              style={{
                fontSize: 9, padding: '3px 8px', borderRadius: 4,
                background: 'transparent', border: '0.5px solid #ddd',
                color: '#bbb', cursor: 'pointer',
              }}
            >관리자</button>
          )}
          <button
            onClick={logout}
            style={{
              fontSize: 9, padding: '3px 8px', borderRadius: 4,
              background: 'transparent', border: '0.5px solid #ddd',
              color: '#bbb', cursor: 'pointer',
            }}
          >로그아웃</button>
        </div>
      </div>

      <StepBar current={step + 1} total={6} />

      {pathNodes.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
          padding: '6px 10px', background: '#f8f8f6',
          borderRadius: 6, marginBottom: 12,
          border: '0.5px solid #e0e0dc',
        }}>
          {pathNodes.map((n, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span style={{ color: '#ccc', fontSize: 10 }}>→</span>}
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 3,
                background: n.bg, color: n.color, fontWeight: 500,
              }}>{n.text}</span>
            </span>
          ))}
        </div>
      )}

      <Page />
    </div>
  );
}
