import React, { useEffect, useRef } from 'react';
import { useAnnotationStore } from '../store/useAnnotationStore';
import { StickyNote } from './StickyNote';
import { drawAnnotation } from './canvas/drawingUtils';
import { drawSelectionBox } from './canvas/selectionUtils';
import { useCanvasDrawing } from './canvas/useCanvasDrawing';

interface AnnotationCanvasProps {
  pageNumber: number;
  scale: number;
  width: number;
  height: number;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  pageNumber,
  scale,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    annotations,
    currentTool,
    selectedAnnotationId,
    currentStyle,
  } = useAnnotationStore();

  const {
    isDrawing,
    startPoint,
    currentPoints,
    stickyNote,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleStickyNoteSubmit,
    handleStickyNoteClose,
  } = useCanvasDrawing(pageNumber, scale);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Clear and resize canvas
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // Draw existing annotations
    const pageAnnotations = annotations
      .filter((a) => a.pageNumber === pageNumber)
      .forEach((annotation) => {
        drawAnnotation(ctx, annotation, scale);
        if (annotation.id === selectedAnnotationId) {
          drawSelectionBox(ctx, annotation, scale);
        }
      });
      
    // Draw current shape preview
    if (isDrawing && startPoint && currentPoints.length > 0) {
      const previewAnnotation: Annotation = {
        id: 'preview',
        type: currentTool,
        points: currentTool === 'freehand' ? currentPoints : [startPoint, currentPoints[currentPoints.length - 1]],
        style: currentStyle,
        pageNumber,
        timestamp: Date.now(),
        userId: 'current-user',
      };
      drawAnnotation(ctx, previewAnnotation, scale);
    }
  }, [annotations, pageNumber, scale, width, height]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-auto"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {stickyNote.visible && (
        <StickyNote
          x={stickyNote.x}
          y={stickyNote.y}
          type={stickyNote.type}
          color={currentStyle.color}
          onSubmit={handleStickyNoteSubmit}
          onClose={handleStickyNoteClose}
        />
      )}
    </>
  );
};