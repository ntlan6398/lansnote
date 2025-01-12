import { useState, useEffect } from "react";
import { highLightRange } from "../utils";
import { FiSearch } from "react-icons/fi";
import type { List, Term } from "~/types";

export default function CommentPopup({
  popupRef,
  optionsPosition,
  setShowCommentPopup,
  handleCommentSubmit,
  lists = [],
  isSavingTerm,
  saveSuccess,
  setActiveComment,
  activeComment,
  existingTerms = [],
  setComments,
  rangeSelection,
  selectedText,
  setTermsGrade,
  handleDictionarySearch,
}: {
  popupRef: React.RefObject<HTMLDivElement>;
  optionsPosition: { top: number; left: number; bottom?: number };
  setShowCommentPopup: (show: boolean) => void;
  handleCommentSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  lists: List[];
  isSavingTerm: boolean;
  saveSuccess: boolean;
  setActiveComment: (comment: Term) => void;
  activeComment: Term;
  existingTerms?: Term[];
  setComments: React.Dispatch<React.SetStateAction<Record<string, Term>>>;
  rangeSelection: Range;
  selectedText: string;
  setTermsGrade: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleDictionarySearch: () => void;
}) {
  let styleTop = {
    top: `${optionsPosition?.top}px`,
    left: `${optionsPosition?.left}px`,
    width: "300px",
  };

  let styleBottom = {
    bottom: `${optionsPosition?.bottom}px`,
    left: `${optionsPosition?.left}px`,
    width: "300px",
  };
  const [showDefinitions, setShowDefinitions] = useState(false);

  const handleDefinitionClick = (term: Term) => {
    setActiveComment(term);
    setComments((prev: Record<string, Term>) => {
      const newComments = { ...prev };
      newComments[term.id] = term;
      return newComments;
    });
    setTermsGrade((prev: Record<string, number>) => {
      const newTermsGrade = { ...prev };
      if (prev[term.id]) {
        newTermsGrade[term.id] = prev[term.id] - 1 > 0 ? prev[term.id] - 1 : 0;
      } else {
        newTermsGrade[term.id] = 5;
      }
      return newTermsGrade;
    });
    setShowDefinitions(false);
    highLightRange(rangeSelection, term.id, selectedText, term.type);
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white shadow-xl rounded-md p-4"
      style={optionsPosition?.bottom ? styleBottom : styleTop}
    >
      <form className="space-y-1" onSubmit={handleCommentSubmit}>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">Term</label>
            <select
              name="partOfSpeech"
              className="text-sm p-1 border rounded-md"
              required
              value={activeComment.type}
              onChange={(e) =>
                setActiveComment({ ...activeComment, type: e.target.value })
              }
            >
              <option value="others" selected={activeComment.type === "others"}>
                Others
              </option>
              <option value="noun" selected={activeComment.type === "noun"}>
                Noun
              </option>
              <option value="verb" selected={activeComment.type === "verb"}>
                Verb
              </option>
              <option
                value="adjective"
                selected={activeComment.type === "adjective"}
              >
                Adjective
              </option>
              <option value="adverb" selected={activeComment.type === "adverb"}>
                Adverb
              </option>
              <option value="idiom" selected={activeComment.type === "idiom"}>
                Idiom
              </option>
              <option value="phrase" selected={activeComment.type === "phrase"}>
                Phrase
              </option>
            </select>
          </div>
          <input
            className="text-sm bg-gray-50 p-2 rounded w-full"
            value={activeComment.term}
            onChange={(e) =>
              setActiveComment({ ...activeComment, term: e.target.value })
            }
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
            Definition
            {/* <button
              onClick={handleDictionarySearch}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Search in Dictionary"
            >
              <FiSearch className="w-4 h-4" />
            </button> */}
          </label>
          <textarea
            name="definition"
            className="w-full p-2 border rounded-md text-sm"
            rows={2}
            required
            placeholder={
              existingTerms?.length > 0 &&
              existingTerms?.[0]?.term === activeComment.term
                ? "Click to see existing definitions..."
                : "Add a definition..."
            }
            value={activeComment.definition}
            onChange={(e) =>
              setActiveComment({ ...activeComment, definition: e.target.value })
            }
            onClick={() =>
              existingTerms?.length > 0 &&
              existingTerms?.[0]?.term === activeComment.term &&
              setShowDefinitions(!showDefinitions)
            }
          />

          {/* Definitions Dropdown */}
          {showDefinitions && existingTerms?.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {existingTerms.map((term, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                  onClick={() => {
                    handleDefinitionClick(term);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {term.definition}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {term.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Example
          </label>
          <textarea
            name="example"
            className="w-full p-2 border rounded-md text-sm"
            rows={2}
            placeholder="Loading example..."
            value={activeComment.example}
            onChange={(e) =>
              setActiveComment({ ...activeComment, example: e.target.value })
            }
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="block  text-sm font-medium text-gray-700 mb-1">
            Add to List
          </label>
          <select
            name="list"
            className=" p-1 border rounded-md text-sm"
            required
            value={activeComment.listId}
            onChange={(e) =>
              setActiveComment({ ...activeComment, listId: e.target.value })
            }
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-center">
          <label className="block  text-sm font-medium text-gray-700 mb-1">
            Audio
          </label>
          <input
            name="audio"
            type="text"
            placeholder="Add audio url..."
            className=" p-1 rounded-md text-sm bg-gray-50"
            value={activeComment.audio}
            onChange={(e) =>
              setActiveComment({ ...activeComment, audio: e.target.value })
            }
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="block  text-sm font-medium text-gray-700 mb-1">
            Phonetic
          </label>
          <input
            name="phonetic"
            type="text"
            placeholder="Add phonetic..."
            className=" p-1 bg-gray-50 rounded-md text-sm"
            value={activeComment.phonetic}
            onChange={(e) =>
              setActiveComment({ ...activeComment, phonetic: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {activeComment.id && activeComment.id !== "None" && (
            <button
              type="button"
              onClick={() => {
                const highlightElement = document.querySelector(
                  `[data-term-id="${activeComment.id}"]`,
                );

                setComments((prev: Record<string, Term>) => {
                  const newComments = { ...prev };
                  delete newComments[activeComment.id];
                  return newComments;
                });
                setTermsGrade((prev: Record<string, number>) => {
                  const newTermsGrade = { ...prev };
                  delete newTermsGrade[activeComment.id];
                  return newTermsGrade;
                });
                if (highlightElement) {
                  const textContent = highlightElement.textContent;
                  highlightElement.replaceWith(textContent || "");
                }
                setShowCommentPopup(false);
              }}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800"
              disabled={isSavingTerm}
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2
                  ${
                    saveSuccess
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } 
                  text-white`}
            disabled={isSavingTerm || saveSuccess}
          >
            {isSavingTerm ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved!
              </>
            ) : activeComment.id === "None" ? (
              "Create"
            ) : (
              "Update"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
