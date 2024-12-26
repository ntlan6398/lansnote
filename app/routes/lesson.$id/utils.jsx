function checkEndingPunctuation(character) {
  if (character === "." || character === "!" || character === "?") {
    return true;
  }
  return false;
}
function getPartOfSentenceFromEnd(text) {
  let start = -1;
  let stop = true;
  do {
    const char = text.at(start);
    if (char === undefined) {
      break;
    }
    stop = checkEndingPunctuation(char);
    start--;
  } while (!stop);
  if (stop) {
    return start + 2 < 0 ? text.slice(start + 2) : "";
  }
  return text;
}
function getPartOfSentenceFromStart(text) {
  let start = 0;
  let stop = true;
  do {
    const char = text[start];
    if (char === undefined) {
      break;
    }
    stop = checkEndingPunctuation(char);
    start++;
  } while (!stop);
  return text.slice(0, start);
}

function isInAParagraph(text, startOffset) {
  const before = text.slice(0, startOffset);
  const after = text.slice(startOffset);
  if (/[.!?]/.test(after)) {
    if (/[.!?]/.test(before)) {
      return true;
    } else {
      if (/[A-Z]/.test(before.trim()[0])) {
        return true;
      }
    }
  }
  return false;
}
export function getSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  const range = selection.getRangeAt(0);
  const getStartOffset = (element, parentElement, startOffset, rangeText) => {
    const textNodes = [];
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );
    const parentWalk = document.createTreeWalker(
      parentElement,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );
    const childNode = walk.nextNode();
    let node;
    let index = 0;
    let trueNode;
    while ((node = parentWalk.nextNode())) {
      textNodes.push(node);
      if (element === parentElement) {
        if (node.textContent === rangeText) {
          trueNode = index;
        }
      } else {
        if (node === childNode) {
          trueNode = index;
        }
      }
      index++;
    }
    for (let i = 0; i < trueNode; i++) {
      startOffset += textNodes[i].textContent.length;
    }
    return startOffset;
  };
  const getSentence = (container, startOffset) => {
    const text = container.textContent;
    const before = text.substring(0, startOffset);
    const after = text.substring(startOffset);
    const beforePart = getPartOfSentenceFromEnd(before, startOffset);
    const afterPart = getPartOfSentenceFromStart(after, startOffset);
    return beforePart + afterPart;
  };
  const rangeText = range.startContainer.textContent;

  let startOffset = range.startOffset;

  const container = range.startContainer.parentElement;
  // Get all text nodes in the container
  let paragraph = range.startContainer.parentElement;
  if (paragraph === container) {
    startOffset = getStartOffset(container, paragraph, startOffset, rangeText);
  }
  let continuing = true;
  while (!isInAParagraph(paragraph.textContent, startOffset) && continuing) {
    if (paragraph.parentElement.getAttribute("id") === "content") {
      continuing = false;
    } else {
      paragraph = paragraph.parentElement;
      startOffset = getStartOffset(
        container,
        paragraph,
        startOffset,
        rangeText,
      );
    }
  }
  const sentence = getSentence(paragraph, startOffset);
  return { text, sentence };
}
export const highLightRange = (range, id, text) => {
  const span = document.createElement("span");
  span.className =
    "bg-yellow-200 cursor-pointer transition-colors hover:bg-yellow-300";
  span.setAttribute("data-comment", "true");
  span.setAttribute("data-term-id", id);
  span.textContent = text;
  range.deleteContents();
  range.insertNode(span);
};
