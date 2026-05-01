const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  logout:   ()     => request('/auth/logout',   { method: 'POST' }),
  me:       ()     => request('/auth/me'),

  // roadmaps (per-user)
  listRoadmaps:   ()     => request('/roadmaps'),
  createRoadmap:  (body) => request('/roadmaps', { method: 'POST', body: JSON.stringify(body) }),
  deleteRoadmap:  (id)   => request(`/roadmaps/${id}`, { method: 'DELETE' }),

  // course descriptions (admin overrides — global)
  listCourseDescs: ()                 => request('/course-descs'),
  saveCourseDesc:  (courseId, body)   => request(`/course-descs/${courseId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCourseDesc:(courseId)         => request(`/course-descs/${courseId}`, { method: 'DELETE' }),
};
