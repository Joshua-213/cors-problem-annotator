import { create } from 'zustand';
import { Annotation, AnnotationType, AnnotationStyle } from '../types/annotation';

interface AnnotationState {
  annotations: Annotation[];
  currentTool: AnnotationType;
  currentStyle: AnnotationStyle;
  history: Annotation[][];
  historyIndex: number;
  selectedAnnotationId: string | null;
  setCurrentTool: (tool: AnnotationType) => void;
  setCurrentStyle: (style: Partial<AnnotationStyle>) => void;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  setSelectedAnnotation: (id: string | null) => void;
  moveAnnotation: (id: string, dx: number, dy: number) => void;
  undo: () => void;
  redo: () => void;
  importAnnotations: (annotations: Annotation[]) => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  currentTool: 'freehand',
  currentStyle: {
    color: '#FF0000',
    lineWidth: 2,
    opacity: 1,
    circleDiameterMode: false,
  },
  history: [[]],
  historyIndex: 0,
  selectedAnnotationId: null,

  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  setCurrentStyle: (style) => set((state) => ({
    currentStyle: { ...state.currentStyle, ...style },
  })),

  setSelectedAnnotation: (id) => set({ selectedAnnotationId: id }),

  moveAnnotation: (id, dx, dy) => set((state) => {
    const newAnnotations = state.annotations.map((annotation) => {
      if (annotation.id === id) {
        return {
          ...annotation,
          points: annotation.points.map((point) => ({
            x: point.x + dx,
            y: point.y + dy,
          })),
        };
      }
      return annotation;
    });

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newAnnotations);

    return {
      annotations: newAnnotations,
      history: newHistory,
      historyIndex: state.historyIndex + 1,
    };
  }),

  addAnnotation: (annotation) => set((state) => {
    const newAnnotations = [...state.annotations, annotation];
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newAnnotations);
    return {
      annotations: newAnnotations,
      history: newHistory,
      historyIndex: state.historyIndex + 1,
    };
  }),

  removeAnnotation: (id) => set((state) => {
    const newAnnotations = state.annotations.filter((a) => a.id !== id);
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newAnnotations);
    return {
      annotations: newAnnotations,
      history: newHistory,
      historyIndex: state.historyIndex + 1,
    };
  }),

  updateAnnotation: (id, updates) => set((state) => {
    const newAnnotations = state.annotations.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newAnnotations);
    return {
      annotations: newAnnotations,
      history: newHistory,
      historyIndex: state.historyIndex + 1,
    };
  }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      return {
        annotations: state.history[state.historyIndex - 1],
        historyIndex: state.historyIndex - 1,
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      return {
        annotations: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1,
      };
    }
    return state;
  }),

  importAnnotations: (annotations) => set({
    annotations,
    history: [annotations],
    historyIndex: 0,
  }),
}));