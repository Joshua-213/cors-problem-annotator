import React, { useEffect } from "react";
import { ToolbarSection } from "./Toolbar/ToolbarSection";
import { ToolButton } from "./Toolbar/ToolButton";
import * as Icons from "lucide-react";
import {
  COLORS,
  LINE_WIDTHS,
  OPACITY_LEVELS,
  TOOLS,
  KEYBOARD_SHORTCUTS,
} from "../constants/toolbar";
import { useAnnotationStore } from "../store/useAnnotationStore";
import { AnnotationType, StampType } from "../types/annotation";
import { ShiftKeyIndicator } from "./ShiftKeyIndicator";
import { SelectionIndicator } from "./SelectionIndicator";
import { HelpCircle } from "lucide-react";
import { useKeyboardShortcutGuide } from "../hooks/useKeyboardShortcutGuide";

const stampTypes: StampType[] = ["approved", "rejected", "draft", "reviewed"];

export const Toolbar: React.FC<{ documentId: string }> = ({ documentId }) => {
  const {
    currentTool,
    currentStyle,
    setCurrentTool,
    setCurrentStyle,
    undo,
    redo,
    setCurrentDocument,
    clearSelection,
  } = useAnnotationStore();
  const { setIsShortcutGuideOpen } = useKeyboardShortcutGuide();

  useEffect(() => {
    if (documentId) {
      setCurrentDocument(documentId);
    }
  }, [documentId, setCurrentDocument]);

  const handleToolSelect = (tool: AnnotationType) => {
    setCurrentTool(tool);
    clearSelection();
  };

  const renderToolButtons = (tools: (typeof TOOLS)[keyof typeof TOOLS]) => (
    <div className="space-y-1">
      {tools.map(({ tool, icon, label, shortcut }) => (
        <ToolButton
          key={tool}
          tool={tool as AnnotationType}
          icon={React.createElement(Icons[icon as keyof typeof Icons], {
            size: 20,
          })}
          label={label}
          shortcut={shortcut}
          onClick={() => handleToolSelect(tool as AnnotationType)}
        />
      ))}
    </div>
  );

  const renderStampOptions = () => (
    <div className="flex flex-col gap-2 p-2">
      {stampTypes.map((type) => (
        <button
          key={type}
          onClick={() => {
            setCurrentTool("stamp");
            setCurrentStyle({ stampType: type });
          }}
          className={`flex items-center justify-center px-3 py-2 text-sm rounded ${
            currentTool === "stamp" && currentStyle.stampType === type
              ? "bg-blue-100"
              : "hover:bg-gray-100"
          }`}
        >
          <span className="text-red-600 font-bold">{type.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );

  const renderStyleSection = () => (
    <div className="space-y-4 p-2">
      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="grid grid-cols-8 gap-1.5">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setCurrentStyle({ color })}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                currentStyle.color === color
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Line Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line Width
        </label>
        <div className="flex gap-1.5">
          {LINE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => setCurrentStyle({ lineWidth: width })}
              className={`h-8 flex-1 flex items-center justify-center border rounded-md transition-colors ${
                currentStyle.lineWidth === width
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div
                className="bg-current rounded-full transition-all"
                style={{
                  width: Math.max(4, width * 2),
                  height: Math.max(4, width * 2),
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacity
        </label>
        <div className="flex gap-1.5">
          {OPACITY_LEVELS.map((opacity) => (
            <button
              key={opacity}
              onClick={() => setCurrentStyle({ opacity })}
              className={`h-8 flex-1 border rounded-md transition-colors ${
                currentStyle.opacity === opacity
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="w-full h-full rounded-md" style={{ opacity }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full ">
        <ToolbarSection title="Basic">
          {renderToolButtons(TOOLS.basic)}
        </ToolbarSection>

        <ToolbarSection title="Shapes">
          {renderToolButtons(TOOLS.shapes)}
        </ToolbarSection>

        <ToolbarSection title="Lines">
          {renderToolButtons(TOOLS.lines)}
        </ToolbarSection>

        <ToolbarSection title="Stamps" defaultExpanded>
          {renderStampOptions()}
        </ToolbarSection>

        <ToolbarSection title="Text & Notes">
          {renderToolButtons(TOOLS.text)}
        </ToolbarSection>

        <ToolbarSection title="Style">{renderStyleSection()}</ToolbarSection>

        <div className="mt-auto border-t border-gray-200 p-2 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={undo}
              className="flex-1 flex items-center justify-between gap-1 p-2 rounded hover:bg-gray-50"
              title={`Undo (${KEYBOARD_SHORTCUTS.actions.undo})`}
            >
              <div className="flex items-center gap-1">
                <Icons.Undo2 size={16} />
                <span className="text-sm">Undo</span>
              </div>
              <span className="text-xs text-gray-400">
                {KEYBOARD_SHORTCUTS.actions.undo}
              </span>
            </button>
            <button
              onClick={redo}
              className="flex-1 flex items-center justify-between gap-1 p-2 rounded hover:bg-gray-50"
              title={`Redo (${KEYBOARD_SHORTCUTS.actions.redo})`}
            >
              <div className="flex items-center gap-1">
                <Icons.Redo2 size={16} />
                <span className="text-sm">Redo</span>
              </div>
              <span className="text-xs text-gray-400">
                {KEYBOARD_SHORTCUTS.actions.redo}
              </span>
            </button>
          </div>
          <button
            onClick={() => setIsShortcutGuideOpen(true)}
            className="w-full flex items-center justify-between gap-1 p-2 rounded hover:bg-gray-50 text-gray-600 hover:text-gray-700"
            title="Show keyboard shortcuts (?)"
          >
            <div className="flex items-center gap-1">
              <HelpCircle size={16} />
              <span className="text-sm">Keyboard Shortcuts</span>
            </div>
            <span className="text-xs text-gray-400">?</span>
          </button>
        </div>
      </div>
      <ShiftKeyIndicator />
      <SelectionIndicator />
    </>
  );
};
