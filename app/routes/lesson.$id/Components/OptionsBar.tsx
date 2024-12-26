import { MdFormatColorText, MdHighlight } from "react-icons/md";
import {
  FiBold,
  FiItalic,
  FiMessageSquare,
  FiSearch,
  FiUnderline,
} from "react-icons/fi";
import { useEffect, useState } from "react";

const TEXT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
  { name: "Purple", value: "#800080" },
  { name: "Orange", value: "#FFA500" },
  { name: "Brown", value: "#A52A2A" },
  { name: "Navy", value: "#000080" },
  { name: "Teal", value: "#008080" },
  { name: "Maroon", value: "#800000" },
];

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFFF00" },
  { name: "Lime", value: "#CCFF00" },
  { name: "Cyan", value: "#00FFFF" },
  { name: "Pink", value: "#FFB6C1" },
  { name: "Lavender", value: "#E6E6FA" },
  { name: "Orange", value: "#FFE5B4" },
  { name: "Light Green", value: "#90EE90" },
  { name: "Light Blue", value: "#ADD8E6" },
  { name: "Peach", value: "#FFDAB9" },
  { name: "Mint", value: "#98FF98" },
];

export default function OptionsBar({
  optionsBarRef,
  optionsPosition,
  setShowOptionsBar,
  handleCommentClick,
  handleDictionarySearch,
}: {
  optionsBarRef: React.RefObject<HTMLDivElement>;
  optionsPosition: { top: number; left: number };
  setShowOptionsBar: (show: boolean) => void;
  handleCommentClick: () => void;
  handleDictionarySearch: () => void;
}) {
  const [showTextFormatMenu, setShowTextFormatMenu] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] =
    useState(false);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (event.target && !(event.target as HTMLElement).closest("button")) {
        setShowTextFormatMenu(false);
        setShowTextColorPicker(false);
        setShowHighlightColorPicker(false);
      }
    }
    if (showTextColorPicker || showHighlightColorPicker || showTextFormatMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTextColorPicker, showHighlightColorPicker, showTextFormatMenu]);
  const applyFormatting = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value ?? undefined);
    setShowOptionsBar(false);
  };

  const applyFontSize = (size: string) => {
    document.execCommand("fontSize", false, "7"); // First set a base size
    const selection = window.getSelection();
    const span: HTMLElement = selection?.focusNode
      ?.parentElement as HTMLElement;

    // Map sizes to Tailwind classes
    const sizeClasses: Record<string, string> = {
      xl: "text-2xl font-bold",
      large: "text-xl font-bold",
      medium: "text-md font-bold",
      normal: "text-base",
    };

    if (span.tagName.toLowerCase() === "font") {
      span.removeAttribute("size");
      span.className = sizeClasses[size];
    }
    setShowOptionsBar(false);
  };
  return (
    <div
      ref={optionsBarRef}
      className="fixed z-50 bg-white shadow-lg rounded-lg flex gap-3 options-bar"
      style={{
        top: `${optionsPosition.top}px`,
        left: `${optionsPosition.left}px`,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => {
              setShowTextFormatMenu(!showTextFormatMenu);
              setShowTextColorPicker(false);
              setShowHighlightColorPicker(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-1"
            title="Text format"
          >
            <span className="font-bold">A</span>
          </button>
          {showTextFormatMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-2 w-[200px] z-50">
              <button
                onClick={() => applyFontSize("xl")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-2xl font-bold">Title</span>
              </button>
              <button
                onClick={() => applyFontSize("large")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-xl font-bold">Heading</span>
              </button>
              <button
                onClick={() => applyFontSize("medium")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-lg font-bold">Subheading</span>
              </button>
              <button
                onClick={() => applyFontSize("normal")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-base">Body</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowTextColorPicker(!showTextColorPicker);
              setShowHighlightColorPicker(false);
              setShowTextFormatMenu(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Text Color"
          >
            <MdFormatColorText className="w-4 h-4" />
          </button>
          {showTextColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-2 grid grid-cols-10 gap-1 w-[200px]">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    applyFormatting("foreColor", color.value);
                    setShowTextColorPicker(false);
                  }}
                  className="w-4 h-4 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowHighlightColorPicker(!showHighlightColorPicker);
              setShowTextColorPicker(false);
              setShowTextFormatMenu(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Highlight"
          >
            <MdHighlight className="w-4 h-4" />
          </button>
          {showHighlightColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-2 grid grid-cols-10 gap-1 w-[200px]">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    applyFormatting("hiliteColor", color.value);
                    setShowHighlightColorPicker(false);
                  }}
                  className="w-4 h-4 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px bg-gray-200 mx-1"></div>

        <button
          onClick={() => applyFormatting("bold")}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Bold"
        >
          <FiBold className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormatting("italic")}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Italic"
        >
          <FiItalic className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormatting("underline")}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Underline"
        >
          <FiUnderline className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-200 mx-1"></div>

        <button
          onClick={handleCommentClick}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Add comment"
        >
          <FiMessageSquare className="w-4 h-4" />
        </button>
        <button
          onClick={handleDictionarySearch}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Search in Dictionary"
        >
          <FiSearch className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
