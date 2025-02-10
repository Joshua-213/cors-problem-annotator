import React from "react";
import { useAnnotationStore } from "../../store/useAnnotationStore";
import { AnnotationType } from "../../types/annotation";

interface ToolButtonProps {
  tool: AnnotationType;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  tool,
  icon,
  label,
  shortcut,
  onClick,
}) => {
  const { currentTool, setCurrentTool } = useAnnotationStore();

  return (
    <button
      onClick={() => {
        setCurrentTool(tool);
        onClick?.();
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-md w-full transition-colors ${
        currentTool === tool
          ? "bg-blue-50 text-blue-600"
          : "text-gray-700 hover:bg-gray-50"
      }`}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <div className="flex-1 flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {shortcut && <span className="text-xs text-gray-400">{shortcut}</span>}
    </button>
  );
};
