export type Point = {
  x: number;
  y: number;
};

export type AnnotationType = 
  | 'freehand' 
  | 'rectangle' 
  | 'circle' 
  | 'line'
  | 'arrow' 
  | 'doubleArrow'
  | 'tick'
  | 'cross'
  | 'text'
  | 'stickyNote'
  | 'highlight';

export type AnnotationStyle = {
  color: string;
  lineWidth: number;
  opacity: number;
  circleDiameterMode?: boolean;
};

export interface Annotation {
  id: string;
  type: AnnotationType;
  points: Point[];
  style: AnnotationStyle;
  pageNumber: number;
  text?: string;
  timestamp: number;
  userId: string;
  selected?: boolean;
}