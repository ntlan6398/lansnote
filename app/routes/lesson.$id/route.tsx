import { redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { getAuthFromRequest } from "../../auth/auth";
import CommentPopup from "./Components/CommentPopup";
import ContentEditable from "./Components/ContentEditable";
import Dictionary, { lookupWord } from "./Components/Dictionary";
import OptionsBar from "./Components/OptionsBar";
import { createLesson, getLessonById, updateLesson } from "~/queries/lessons";
import {
  createTerm,
  findExistingTerms,
  updateTerm,
  updatePracticeTerms,
} from "~/queries/terms";
import { getSelection, highLightRange } from "./utils";
import dayjs from "dayjs";
import type { Lesson, List, Subject, Term } from "~/types";

interface LoaderData {
  lesson: Omit<Lesson, "startDate" | "reviewDate"> & {
    startDate: string;
    reviewDate: string;
  };
  comments: Term[];
  userId: string;
}

export const meta = () => {
  return [{ title: "Lesson" }];
};
const REVIEW_INTERVAL = [1, 3, 5, 10, 20, 40, 50];
export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const lessonId = params.id;
  let userId = await getAuthFromRequest(request);
  if (lessonId === "new" && userId) {
    const today = new URL(request.url).searchParams.get("today") as string;
    const lesson = await createLesson(userId, today);
    if (!lesson) {
      throw redirect("/home");
    }
    return redirect(`/lesson/${lesson.id}`, {
      headers: {
        "X-Remix-Reload-Document": "true",
      },
    });
  }
  const { lesson, comments } = await getLessonById(lessonId);
  if (!lesson) {
    throw redirect("/home");
  }
  return { lesson, comments, userId };
}
export async function action({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "update-lesson":
      const lessonData = Object.fromEntries(formData);
      const lesson = await updateLesson(lessonData);
      return { lesson };

    case "lookup-term":
      const word = formData.get("word") as string;
      const existingTerms = await findExistingTerms(word);
      return { existingTerms };

    case "create-term":
      const comment = JSON.parse(formData.get("comment") as string);
      const newTerm = await createTerm(comment);
      return { newTerm };

    case "update-term":
      const term = JSON.parse(formData.get("comment") as string);
      const updatedTerm = await updateTerm(term);
      return { updatedTerm };

    case "update-practice-terms":
      const terms = JSON.parse(formData.get("terms") as string);
      const grades = JSON.parse(formData.get("grades") as string);
      await updatePracticeTerms(terms, grades);
      return redirect(`/lesson/${params.id}`);

    default:
      return null;
  }
}

export default function Lesson() {
  const {
    lesson: initialLesson,
    comments: initialComments,
    userId,
  } = useLoaderData() as LoaderData;
  const [lesson, setLesson] = useState(initialLesson);
  const { subjects, lists } = useOutletContext() as {
    subjects: Subject[];
    lists: List[];
  };
  const fetcher = useFetcher();
  const [selectedText, setSelectedText] = useState("");
  const [showOptionsBar, setShowOptionsBar] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState<{
    top: number;
    left: number;
    bottom?: number;
  }>({
    top: 0,
    left: 0,
  });
  const [showDictionaryPopup, setShowDictionaryPopup] = useState(false);
  const [dictionaryData, setDictionaryData] = useState<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [comments, setComments] = useState<Record<string, Term>>(
    initialComments?.reduce((acc: Record<string, Term>, comment: Term) => {
      acc[comment.id] = comment;
      return acc;
    }, {}) ?? {},
  );
  const [termsGrade, setTermsGrade] = useState<Record<string, number>>(
    initialComments?.reduce((acc: Record<string, number>, comment: Term) => {
      acc[comment.id] = 5;
      return acc;
    }, {}) ?? {},
  );
  const [selectedSentence, setSelectedSentence] = useState("");
  const [activeComment, setActiveComment] = useState<Term>({
    id: "None",
    term: "",
    type: "others",
    definition: "",
    example: "",
    audio: null,
    phonetic: null,
    createdAt: "",
    lastReview: "",
    nextReview: "",
    efactor: 2.5,
    interval: 0,
    repetition: 0,
    accountId: userId,
    listId: lists[0].id,
  });
  const [lessonContent, setLessonContent] = useState(lesson?.content ?? "");
  const [existingTerms, setExistingTerms] = useState<Term[]>([]);
  const [isSavingTerm, setIsSavingTerm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "saving" | "saved" | "error" | null
  >(null);
  const [confirmReview, setConfirmReview] = useState(false);
  const [selectedSection, setSelectedSection] = useState(0);

  const onClickSection = (index: number) => {
    setSelectedSection(index);
    setConfirmReview(true);
  };

  const handleCommentClick = async () => {
    setShowCommentPopup(true);
    setShowOptionsBar(false);
    const selection = window.getSelection() as Selection;
    const range = selection.getRangeAt(0);
    const { leftPosition, topPosition, bottomPosition } =
      calculatePopupSize(range);
    setOptionsPosition({
      top: Math.max(10, topPosition), // Position above the selected text
      left: Math.max(10, leftPosition), // Ensure at least 10px from left edge
      bottom: bottomPosition ? Math.max(10, bottomPosition) : 0,
    });
    setActiveComment({
      ...activeComment,
      term: selectedText,
      type: "",
      definition: "",
      example: selectedSentence,
      listId: lists[0].id,
      id: "None",
      audio: null,
      phonetic: null,
    });

    const formData = new FormData();
    formData.append("intent", "lookup-term");
    formData.append("word", (dictionaryData?.word || selectedText) as string);
    const result = await fetcher.submit(formData, { method: "post" });
    return result;
  };
  const [rangeSelection, setRangeSelection] = useState<Range | null>(null);
  function handleTextSelection() {
    const { text, sentence } = getSelection();
    setSelectedSentence(sentence.trim());
    if (text) {
      const selection = window.getSelection() as Selection;
      const range = selection.getRangeAt(0);
      setRangeSelection(range);
      const rect = range.getBoundingClientRect();
      const optionsBarWidth = 400; // Approximate width of the options bar
      // Calculate left position ensuring the bar stays within viewport
      let leftPosition = rect.left;
      if (leftPosition + optionsBarWidth > window.innerWidth) {
        leftPosition = window.innerWidth - optionsBarWidth - 20; // 20px padding from right edge
      }
      setSelectedText(text);
      setOptionsPosition({
        top: rect.top - 40, // Position above the selected text
        left: Math.max(10, leftPosition), // Ensure at least 10px from left edge
      });
      setShowOptionsBar(true);
    } else {
      setShowOptionsBar(false);
    }
  }
  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingTerm(true);
    const formData = new FormData();
    if (activeComment.id === "None") {
      formData.append("intent", "create-term");
    } else {
      formData.append("intent", "update-term");
    }
    formData.append("comment", JSON.stringify(activeComment));
    try {
      fetcher.submit(formData, { method: "post" });
    } catch (error) {
      console.error("Failed to save term:", error);
    } finally {
      setIsSavingTerm(false);
    }
  };
  const handleAddCommentFromDefinition = (
    term: string,
    definition: any,
    partOfSpeech: string,
    audio: string,
    phonetic: string,
  ) => {
    setShowDictionaryPopup(false);
    setShowCommentPopup(true);
    setActiveComment({
      ...activeComment,
      listId: lists[0].id,
      term: term,
      definition: definition.definition,
      type: partOfSpeech,
      example: selectedSentence,
      audio: audio,
      phonetic: phonetic,
      id: "None",
    });
  };
  const handleDictionarySearch = async () => {
    try {
      // Use the lookupWord function we created
      const data = await lookupWord(selectedText);
      setDictionaryData(data);
    } catch (error) {
      console.error("Failed to fetch dictionary data:", error);
    }
    const { leftPosition, topPosition, bottomPosition } = calculatePopupSize(
      rangeSelection as Range,
    );
    setOptionsPosition({
      top: Math.max(10, topPosition),
      left: Math.max(10, leftPosition),
      bottom: bottomPosition ? Math.max(10, bottomPosition) : 0,
    });
    setShowCommentPopup(false);
    setShowOptionsBar(false);
    setShowDictionaryPopup(true);
  };
  function calculatePopupSize(range: Range | HTMLElement) {
    const rect = range.getBoundingClientRect();
    const commentPopupWidth = 400;
    const commentPopupHeight = 450;

    let leftPosition = rect.left;
    if (leftPosition + commentPopupWidth > window.innerWidth) {
      leftPosition = window.innerWidth - commentPopupWidth - 20;
    }

    let bottomPosition = 0;
    let topPosition = rect.bottom;

    if (topPosition + commentPopupHeight > window.innerHeight) {
      topPosition = 0;
      bottomPosition =
        window.innerHeight - rect.top + (rect.bottom - rect.top) / 2;
    }

    return { leftPosition, topPosition, bottomPosition };
  }
  const handleTermClick = (e: MouseEvent) => {
    const termElement = e.target as HTMLElement;
    if (termElement.hasAttribute("data-comment")) {
      const termId = termElement.getAttribute("data-term-id") as string;
      const comment = comments[termId];

      if (comment) {
        const { leftPosition, topPosition, bottomPosition } =
          calculatePopupSize(termElement);
        setActiveComment(comment);
        setOptionsPosition({
          top: Math.max(10, topPosition), // 10px gap below the term
          left: Math.max(10, leftPosition), // Ensure at least 10px from left edge
          bottom: bottomPosition ? Math.max(10, bottomPosition) : 0,
        });
        setTermsGrade((prev: Record<string, number>) => {
          const newTermsGrade = { ...prev };
          newTermsGrade[termId] = prev[termId] - 1 > 0 ? prev[termId] - 1 : 0;
          return newTermsGrade;
        });
        setShowCommentPopup(true);
        if (comment.audio) {
          new Audio(comment.audio).play();
        }
      }
    }
  };
  const handleOnTrackChange = (index: number) => {
    let newOnTrack: number;
    newOnTrack = index + 1;
    setLesson((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        onTrack: newOnTrack,
        reviewDate:
          dayjs().add(REVIEW_INTERVAL[index], "day").format("YYYY-MM-DD") +
          "T00:00:00.000Z",
      };
    });
    let grades = termsGrade;
    if (newOnTrack === 1) {
      grades = Object.keys(comments).reduce(
        (acc: Record<string, number>, commentId: string) => {
          acc[commentId] = 4;
          return acc;
        },
        {},
      );
    }
    const formData = new FormData();
    formData.append("intent", "update-practice-terms");
    formData.append("terms", JSON.stringify(comments));
    formData.append("grades", JSON.stringify(grades));
    fetcher.submit(formData, { method: "post" });
  };
  const [firstRender, setFirstRender] = useState(false);
  useEffect(() => {
    const lessonContainer = document.getElementById(
      "lesson-container",
    ) as HTMLElement;
    sessionStorage.setItem(
      "lessonContent",
      (lessonContainer?.innerHTML || "") as string,
    );
    if (lesson?.content) {
      lessonContainer.innerHTML = lesson.content;
      sessionStorage.setItem("lessonContent", lesson.content);
    }
    const contentContainer = lessonContainer.querySelector(
      "#content",
    ) as HTMLElement;
    const clonedContent = contentContainer.cloneNode(false) as HTMLElement;
    const children = contentContainer.children;
    for (const child of children) {
      let content = "";
      if (child.innerHTML) {
        content = child.querySelector(".edit-container")?.innerHTML as string;
      }
      const container = document.createElement("div");
      const root = createRoot(container);
      root.render(<ContentEditable content={content} />);
      clonedContent.appendChild(container);
    }
    contentContainer.remove();
    lessonContainer.appendChild(clonedContent);
    // Create a mutation observer
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const content = sessionStorage.getItem("lessonContent");
      if (content !== lessonContainer.innerHTML) {
        setLessonContent(lessonContainer.innerHTML);
        sessionStorage.setItem("lessonContent", lessonContainer.innerHTML);
      }
    });
    // Configure and start observing
    observer.observe(lessonContainer, {
      childList: true, // observe direct children
      subtree: true, // observe all descendants
      characterData: true, // observe text content changes
      attributes: true, // observe attribute changes
    });

    lessonContainer.addEventListener("click", handleTextSelection);
    setFirstRender(true);
    return () => {
      observer.disconnect();

      lessonContainer.removeEventListener("click", handleTextSelection);
    };
  }, []);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (firstRender) {
      timeout = setTimeout(() => {
        if (window.innerWidth < 640) {
          const editableElements = document.querySelectorAll(
            "[contentEditable=true]",
          );
          if (editableElements.length > 0) {
            editableElements.forEach((element) => {
              element.setAttribute("contentEditable", "false");
            });
          }
        } else {
          const editableElements = document.querySelectorAll(
            "[contentEditable=false]",
          );
          if (editableElements.length > 0) {
            editableElements.forEach((element) => {
              element.setAttribute("contentEditable", "true");
            });
          }
        }
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [firstRender]);
  useEffect(() => {
    const lessonContainer = document.getElementById(
      "lesson-container",
    ) as HTMLElement;
    lessonContainer.addEventListener("click", handleTermClick);
    return () => {
      lessonContainer.removeEventListener("click", handleTermClick);
    };
  }, [comments]);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const debounce = (func: () => Promise<void>, delay: number) => {
      clearTimeout(timeoutId);
      setSaveStatus("saving");
      timeoutId = setTimeout(async () => {
        try {
          await func();
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus(null), 2000);
        } catch (error) {
          setSaveStatus("error");
        }
      }, delay);
    };

    debounce(async () => {
      await fetcher.submit(
        {
          ...lesson,
          comments: Object.keys(comments),
          content: lessonContent,
          intent: "update-lesson",
        },
        { method: "post" },
      );
      await fetcher.data;
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [lesson, lessonContent]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Handle dictionary popup
      if (
        showDictionaryPopup &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowDictionaryPopup(false);
      }

      // Handle comment popup
      if (showCommentPopup) {
        const isClickOutsidePopup =
          popupRef.current && !popupRef.current.contains(event.target as Node);
        const isClickOutsideOptionsBar = !event.target?.closest(".options-bar");

        if (isClickOutsidePopup && isClickOutsideOptionsBar) {
          setShowCommentPopup(false);
          setSaveSuccess(false);
        }
      }
    }

    // Only add listener if either popup is shown
    if (showDictionaryPopup || showCommentPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDictionaryPopup, showCommentPopup]);
  const fetcherData = fetcher.data as {
    updatedTerm?: Term;
    newTerm?: Term;
    existingTerms?: Term[];
  };
  useEffect(() => {
    if (fetcherData?.updatedTerm) {
      setComments((prev: Record<string, Term>) => {
        const newComments = { ...prev };
        newComments[fetcherData.updatedTerm.id] = fetcherData.updatedTerm;
        return newComments;
      });
      setActiveComment(fetcherData.updatedTerm);
      setSaveSuccess(true);
      setTimeout(() => {
        setShowCommentPopup(false);
        setSaveSuccess(false);
      }, 1500);
    }
    if (fetcherData?.newTerm) {
      highLightRange(
        rangeSelection as Range,
        fetcherData?.newTerm?.id,
        selectedText,
        fetcherData?.newTerm?.type,
      );
      setActiveComment(fetcherData?.newTerm);
      setSaveSuccess(true);
      setComments((prev: Record<string, Term>) => {
        const newComments = { ...prev };
        if (fetcherData?.newTerm?.id) {
          newComments[fetcherData.newTerm.id] = fetcherData.newTerm;
        }
        return newComments;
      });
      setTermsGrade((prev: Record<string, number>) => {
        const newTermsGrade = { ...prev };
        if (fetcherData?.newTerm?.id) {
          newTermsGrade[fetcherData.newTerm.id] = 5;
        }
        return newTermsGrade;
      });
      setTimeout(() => {
        setShowCommentPopup(false);
        setSaveSuccess(false);
      }, 1500);
    }
    if ((fetcherData?.existingTerms ?? []).length > 0) {
      setExistingTerms(fetcherData?.existingTerms ?? []);
      setShowCommentPopup(false);
      setShowCommentPopup(true);
    }
  }, [fetcherData]);

  return (
    <div>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-8 mx-2 md:mx-4">
        <div className="col-span-1 md:col-span-8 my-2 md:my-4 p-2 md:p-4 flex flex-col gap-2 bg-blue-50 items-center">
          <textarea
            className="text-center text-xl md:text-2xl font-bold w-full max-w-full block break-words break-keep min-h-[60px] resize-none overflow-hidden px-2 bg-blue-50"
            id="title"
            placeholder="Untitled"
            rows={1}
            value={lesson?.title === "Untitled" ? "" : lesson?.title}
            onChange={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              setLesson((prev) => {
                if (!prev) return prev;
                return { ...prev, title: e.target.value as string };
              });
            }}
          />
          <div className="px-1 md:px-2 w-full flex flex-row items-center gap-4">
            <label className="w-24 font-bold md:w-32" htmlFor="subject">
              Subject
            </label>
            <select
              className="bg-blue-50 w-fit"
              id="subject"
              value={lesson?.subjectId}
              onChange={(e) => {
                setLesson((prev) => {
                  if (!prev) return prev;
                  return { ...prev, subjectId: parseInt(e.target.value) };
                });
              }}
            >
              {subjects.map((subject: Subject) => (
                <option value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div className="px-1 md:px-2 w-full flex flex-row items-center gap-4">
            <label className="w-24 font-bold md:w-32" htmlFor="startDate">
              Start Date
            </label>
            <input
              className="bg-blue-50"
              type="date"
              id="startDate"
              value={
                dayjs(lesson?.startDate)
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(e) => {
                if (lesson?.onTrack === 0) {
                  setLesson((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      startDate: new Date(e.target.value).toISOString(),
                      reviewDate: new Date(e.target.value).toISOString(),
                    };
                  });
                } else {
                  let totalDays = 0;
                  for (let i = 0; i < lesson?.onTrack; i++) {
                    totalDays += REVIEW_INTERVAL[i];
                  }
                  setLesson((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      startDate: new Date(e.target.value).toISOString(),
                      reviewDate: new Date(
                        new Date(e.target.value).setDate(
                          new Date(e.target.value).getDate() + totalDays,
                        ),
                      ).toISOString(),
                    };
                  });
                }
              }}
            />
          </div>
          <div className="px-1 md:px-2 w-full flex flex-row items-center gap-4">
            <label className="w-24 font-bold md:w-32" htmlFor="reviewDate">
              Next Review
            </label>
            <input
              disabled
              className="bg-blue-50 flex-1"
              type="date"
              id="reviewDate"
              value={dayjs(lesson.reviewDate).toISOString().split("T")[0]}
            />
          </div>
          <div className="w-full grid grid-cols-2 md:grid-cols-7 gap-1 md:gap-2 place-items-center">
            {Array.from({ length: 7 }, (_, index) => {
              return (
                <div key={index}>
                  <input
                    disabled={lesson.onTrack !== index}
                    onChange={() => onClickSection(index)}
                    type="checkbox"
                    readOnly
                    checked={lesson.onTrack > index}
                  />{" "}
                  Section {index + 1}
                </div>
              );
            })}
          </div>
          <div
            className="w-full flex flex-col gap-1 md:gap-2"
            id="lesson-container"
          >
            <div
              className="w-full border-b-2 border-blue-300 border-t-2"
              id="description"
            >
              <div className="px-2 font-bold"> Description </div>
              <div
                contentEditable="true"
                className="w-full max-w-full block break-words break-keep h-auto overflow-hidden px-10"
              ></div>
            </div>
            <div id="content" className="w-full gap-2 flex flex-col">
              <div>
                <ContentEditable />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showOptionsBar && (
        <OptionsBar
          optionsPosition={optionsPosition}
          setShowOptionsBar={setShowOptionsBar}
          handleCommentClick={handleCommentClick}
          handleDictionarySearch={handleDictionarySearch}
        />
      )}
      {showDictionaryPopup && (
        <Dictionary
          popupRef={popupRef}
          optionsPosition={optionsPosition}
          setShowDictionaryPopup={setShowDictionaryPopup}
          selectedText={selectedText}
          dictionaryData={dictionaryData}
          handleAddCommentFromDefinition={handleAddCommentFromDefinition}
        />
      )}
      {showCommentPopup && (
        <CommentPopup
          popupRef={popupRef}
          optionsPosition={optionsPosition}
          setShowCommentPopup={setShowCommentPopup}
          handleCommentSubmit={handleCommentSubmit}
          lists={lists}
          isSavingTerm={isSavingTerm}
          saveSuccess={saveSuccess}
          setActiveComment={setActiveComment}
          activeComment={activeComment}
          existingTerms={existingTerms}
          setComments={setComments}
          rangeSelection={rangeSelection}
          selectedText={selectedText}
          setTermsGrade={setTermsGrade}
          handleDictionarySearch={handleDictionarySearch}
        />
      )}
      {saveStatus && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md text-sm font-medium transition-opacity duration-300 ${
            saveStatus === "saving"
              ? "bg-blue-500 text-white"
              : saveStatus === "saved"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
            ? "Saved!"
            : "Error saving"}
        </div>
      )}
      {confirmReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#F9F7F7] p-4 md:p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Review</h3>
            <p className="mb-6">Have you reviewed the lesson carefully?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setConfirmReview(false)}
              >
                Continue reviewing
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  handleOnTrackChange(selectedSection);
                  setConfirmReview(false);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
