import React from "react";
import {
  Pencil,
  MousePointer,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  ArrowRightLeft,
  Type,
  Highlighter,
  Check,
  X as XIcon,
  Undo2,
  Redo2,
  Download,
  Upload,
  StickyNote as StickyNoteIcon,
} from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { useAnnotationStore } from "../store/useAnnotationStore";
import { AnnotationType } from "../types/annotation";

const tools: { type: AnnotationType; icon: React.ReactNode; label: string }[] =
  [
    { type: "select", icon: <MousePointer size={20} />, label: "Select" },
    { type: "freehand", icon: <Pencil size={20} />, label: "Freehand" },
    { type: "rectangle", icon: <Square size={20} />, label: "Rectangle" },
    { type: "circle", icon: <Circle size={20} />, label: "Circle" },
    { type: "line", icon: <Minus size={20} />, label: "Line" },
    { type: "arrow", icon: <ArrowUpRight size={20} />, label: "Arrow" },
    {
      type: "doubleArrow",
      icon: <ArrowRightLeft size={20} />,
      label: "Double Arrow",
    },
    { type: "tick", icon: <Check size={20} />, label: "Tick" },
    { type: "cross", icon: <XIcon size={20} />, label: "Cross" },
    { type: "text", icon: <Type size={20} />, label: "Text" },
    {
      type: "stickyNote",
      icon: <StickyNoteIcon size={20} />,
      label: "Sticky Note",
    },
    { type: "highlight", icon: <Highlighter size={20} />, label: "Highlight" },
  ];

export const Toolbar: React.FC = () => {
  const {
    currentTool,
    currentStyle,
    setCurrentTool,
    setCurrentStyle,
    undo,
    redo,
    annotations,
  } = useAnnotationStore();

  const handleExport = () => {
    const data = JSON.stringify(annotations);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotations.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const annotations = JSON.parse(e.target?.result as string);
        useAnnotationStore.getState().importAnnotations(annotations);
      } catch (error) {
        console.error("Failed to import annotations:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border-r">
      <div className="space-y-2">
        {tools.map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => setCurrentTool(type)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded ${
              currentTool === type
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            title={label}
          >
            {icon}
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Color</label>
          <ColorPicker
            color={currentStyle.color}
            onChange={(color) => setCurrentStyle({ color })}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["#FF0000", "#00FF00", "#0000FF", "#000000"].map((color) => (
            <button
              key={color}
              onClick={() => setCurrentStyle({ color })}
              className="flex items-center justify-center"
              title={color}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  currentStyle.color === color
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line Width
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={currentStyle.lineWidth}
          onChange={(e) =>
            setCurrentStyle({ lineWidth: parseInt(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacity
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={currentStyle.opacity * 100}
          onChange={(e) =>
            setCurrentStyle({ opacity: parseInt(e.target.value) / 100 })
          }
          className="w-full"
        />
      </div>

      {currentTool === "circle" && (
        <div className="border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentStyle.circleDiameterMode}
              onChange={(e) =>
                setCurrentStyle({ circleDiameterMode: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Draw circle by diameter
            </span>
          </label>
        </div>
      )}

      <div className="border-t pt-4 space-y-2">
        <button
          onClick={undo}
          className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
        >
          <Undo2 size={20} />
          <span className="text-sm">Undo</span>
        </button>
        <button
          onClick={redo}
          className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
        >
          <Redo2 size={20} />
          <span className="text-sm">Redo</span>
        </button>
      </div>

      <div className="border-t pt-4 space-y-2">
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
        >
          <Download size={20} />
          <span className="text-sm">Export Annotations</span>
        </button>
        <label className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">
          <Upload size={20} />
          <span className="text-sm">Import Annotations</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
