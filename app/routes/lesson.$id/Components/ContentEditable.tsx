import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BiArrowFromLeft, BiArrowFromRight } from "react-icons/bi";
import { MdMoreHoriz } from "react-icons/md";
import {
  PiColumnsPlusLeft,
  PiColumnsPlusRight,
  PiRowsPlusBottom,
  PiRowsPlusTop,
} from "react-icons/pi";
export default function ContentEditable({ content = "" }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [col, setCol] = useState(6);
  const [separated, setSeparated] = useState(false);
  useEffect(() => {
    const editContainer = ref.current?.querySelector(".edit-container");
    const editors = editContainer?.querySelectorAll("div");
    if (editors && editors.length > 1) {
      const curCol = editors[0].style.gridColumnEnd;
      setCol(parseInt(curCol));
      setSeparated(true);
    }
    if (content && editContainer?.innerHTML) {
      editContainer.innerHTML = content;
    }
  }, []);
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };
  const [show, setShow] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleAddRow = (position: string) => {
    const container = document.createElement("div");
    const currentElement = ref.current?.parentElement;
    // Create React root and render component
    const root = createRoot(container);
    root.render(<ContentEditable content={""} />);
    // Insert before or after current element
    if (position === "top") {
      currentElement?.insertAdjacentElement("beforebegin", container);
    } else {
      currentElement?.insertAdjacentElement("afterend", container);
    }
  };

  const handleSplitColumns = (position: string) => {
    const EditContainer = ref.current?.querySelector(
      ".edit-container",
    ) as HTMLElement;
    let editors = EditContainer?.querySelectorAll("div");
    if (!editors || editors.length === 1) {
      const container = document.createElement("div");
      container.setAttribute("contentEditable", "true");
      container.setAttribute("onPaste", "handlePaste(event)");
      container.className =
        "focus:outline-none focus:ring focus:border-blue-500 rounded w-full max-w-full block break-words break-keep h-auto overflow-hidden px-10";
      // Insert new column before or after
      if (position === "left") {
        EditContainer?.insertAdjacentElement("afterbegin", container);
      } else {
        EditContainer?.insertAdjacentElement("beforeend", container);
      }
      editors = EditContainer.querySelectorAll("div");
      editors[0].style.gridColumnStart = "1";
      editors[0].style.gridColumnEnd = "7";
      editors[1].style.gridColumnStart = "7";
      editors[1].style.gridColumnEnd = "13";
    }
    setSeparated(true);
  };
  const handleResizeColumns = (position: string) => {
    const EditContainer = ref.current?.querySelector(".edit-container");
    const editors = EditContainer?.querySelectorAll("div");
    const currentCol = editors?.[0].style.gridColumnEnd || "6";
    let newCol;
    if (position === "left") {
      newCol = parseInt(currentCol) + 1;
    } else {
      newCol = parseInt(currentCol) - 1;
    }

    if (editors) {
      editors[0].style.gridColumnEnd = newCol.toString();
      editors[1].style.gridColumnStart = newCol.toString();
    }
    setCol(newCol);
  };
  useEffect(() => {
    function handleClickOutside(event) {
      // Handle dictionary popup
      if (
        (show || showMore) &&
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setShow(false);
        setShowMore(false);
      }
    }

    // Only add listener if either popup is shown
    if (show || showMore) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, showMore]);

  return (
    <div
      onKeyDown={(e) => {
        if (
          (e.key === "Backspace" || e.key === "Delete") &&
          ref.current?.innerText === "" &&
          ref?.current?.parentElement?.parentElement?.children?.length > 1
        ) {
          ref.current?.parentElement?.remove();
        }
      }}
      onFocus={() => {
        setShowMore(true);
      }}
      className={` flex flex-col items-center `}
      ref={ref}
    >
      <div
        onMouseEnter={() => {
          setShowMore(true);
        }}
        className="flex items-center gap-2 cursor-pointer text-gray-500 text-xl"
      >
        <PiRowsPlusTop
          className={show ? "" : "hidden"}
          onClick={() => handleAddRow("top")}
        />
        <PiColumnsPlusLeft
          className={show && !separated ? "" : "hidden"}
          onClick={() => handleSplitColumns("left")}
        />
        <BiArrowFromLeft
          className={show && separated && col < 12 ? "" : "hidden"}
          onClick={() => handleResizeColumns("left")}
        />
        <MdMoreHoriz
          className={showMore ? "" : "hidden"}
          onClick={() => setShow(!show)}
        />
        <BiArrowFromRight
          className={show && separated && col > 2 ? "" : "hidden"}
          onClick={() => handleResizeColumns("right")}
        />
        <PiColumnsPlusRight
          className={show && !separated ? "" : "hidden"}
          onClick={() => handleSplitColumns("right")}
        />
        <PiRowsPlusBottom
          className={show ? "" : "hidden"}
          onClick={() => handleAddRow("bottom")}
        />
      </div>
      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-1 sm:gap-2 w-full edit-container">
        <div
          contentEditable="true"
          onPaste={handlePaste}
          style={{ gridColumnStart: 1, gridColumnEnd: 13 }}
          className="focus:outline-none focus:ring focus:border-blue-500 rounded w-full max-w-full block break-words break-keep h-auto overflow-hidden px-2 sm:px-6 md:px-10 mb-2 sm:mb-0"
        ></div>
      </div>
    </div>
  );
}
