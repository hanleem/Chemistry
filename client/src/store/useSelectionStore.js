import { create } from 'zustand';
import { computePathway } from '../data/pathways';
import { CAREER_PATH_BY_ID } from '../data/careerPaths';
import { api } from '../api/client';

export const useSelectionStore = create((set, get) => ({
  step: 0,
  careerPathId: null,
  basicIds: [],
  upperIds: [],
  result: null,
  activeMod: null,
  selectedTrackId: null,
  selectedMicroId: null,
  savedRoadmaps: [],
  loadingRoadmaps: false,

  setStep: (step) => set({ step }),
  setCareerPath: (id) => set({ careerPathId: id }),

  toggleBasic: (id) => {
    const { basicIds } = get();
    if (basicIds.includes(id)) {
      set({ basicIds: basicIds.filter(x => x !== id) });
    } else if (basicIds.length < 2) {
      set({ basicIds: [...basicIds, id] });
    }
  },

  toggleUpper: (id) => {
    const { upperIds } = get();
    if (upperIds.includes(id)) {
      set({ upperIds: upperIds.filter(x => x !== id) });
    } else if (upperIds.length < 2) {
      set({ upperIds: [...upperIds, id] });
    }
  },

  setSelectedTrack: (id) => set(s => ({ selectedTrackId: s.selectedTrackId === id ? null : id })),
  setSelectedMicro:  (id) => set(s => ({ selectedMicroId:  s.selectedMicroId  === id ? null : id })),

  compute: () => {
    const { basicIds, upperIds, selectedTrackId, selectedMicroId, careerPathId } = get();
    const careerPath = careerPathId ? CAREER_PATH_BY_ID[careerPathId] : null;
    const ippCourseIds = (careerPath?.y4s2Type === 'IPP' && careerPath?.y4s1Courses)
      ? new Set(careerPath.y4s1Courses) : new Set();
    const result = computePathway(basicIds, upperIds, selectedTrackId, selectedMicroId, ippCourseIds);
    set({ result });
  },

  setActiveMod: (mod) => set({ activeMod: mod }),

  fetchRoadmaps: async () => {
    set({ loadingRoadmaps: true });
    try {
      const { roadmaps } = await api.listRoadmaps();
      set({ savedRoadmaps: roadmaps, loadingRoadmaps: false });
    } catch {
      set({ savedRoadmaps: [], loadingRoadmaps: false });
    }
  },

  saveRoadmap: async () => {
    const { savedRoadmaps, careerPathId, basicIds, upperIds, selectedTrackId, selectedMicroId } = get();
    const label = `저장_${savedRoadmaps.length + 1}`;
    const payload = {
      careerPathId,
      basicIds: [...basicIds],
      upperIds: [...upperIds],
      selectedTrackId,
      selectedMicroId,
    };
    const { roadmap } = await api.createRoadmap({ label, payload });
    set({ savedRoadmaps: [...savedRoadmaps, roadmap] });
  },

  loadRoadmap: (entry) => {
    set({
      careerPathId: entry.careerPathId,
      basicIds: entry.basicIds,
      upperIds: entry.upperIds,
      selectedTrackId: entry.selectedTrackId,
      selectedMicroId: entry.selectedMicroId,
      step: 5,
    });
    get().compute();
  },

  deleteSavedRoadmap: async (id) => {
    await api.deleteRoadmap(id);
    set({ savedRoadmaps: get().savedRoadmaps.filter(r => r.id !== id) });
  },

  reset: () => set({
    step: 0, careerPathId: null, basicIds: [], upperIds: [], result: null,
    activeMod: null, selectedTrackId: null, selectedMicroId: null,
  }),

  resetAll: () => set({
    step: 0, careerPathId: null, basicIds: [], upperIds: [], result: null,
    activeMod: null, selectedTrackId: null, selectedMicroId: null,
    savedRoadmaps: [],
  }),
}));
