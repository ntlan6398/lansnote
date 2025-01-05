import { useState } from "react";
import FlashCard from "./FlashCard";
import {
  IoChevronForwardCircleSharp,
  IoChevronBackCircle,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useFetcher } from "@remix-run/react";
import { SuperMemoGrade } from "supermemo";
import { Term } from "~/types";

export default function TermDisplay({ terms }: { terms: Term[] }) {
  const [currentTerm, setCurrentTerm] = useState(0);
  const [key, setKey] = useState(0);
  const [direction, setDirection] = useState(0);
  const [practiced, setPracticed] = useState(1);
  const [practicedTerms, setPracticedTerms] = useState(terms);
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeNext = () => {
    setDirection(1);
    setCurrentTerm(currentTerm === terms.length - 1 ? 0 : currentTerm + 1);
    setKey(key + 1);
  };

  const swipePrev = () => {
    setDirection(-1);
    setCurrentTerm(currentTerm === 0 ? terms.length - 1 : currentTerm - 1);
    setKey(key + 1);
  };
  const fetcher = useFetcher();
  const grades: SuperMemoGrade[] = [0, 1, 2, 3, 4, 5];
  const gradeIcons = ["😔", "🙁", "😑", "🙂", "😀", "😁"];
  const [currentGrade, setCurrentGrade] = useState(6);
  const [mode, setMode] = useState("practice");

  const [isGrading, setIsGrading] = useState(false);
  const handleGradeClick = (grade: number) => {
    if (practicedTerms.length === 0) {
      return;
    }
    setIsGrading(true);
    setCurrentGrade(grade);
    if (practicedTerms[0].audio) {
      new Audio(practicedTerms[0].audio).play();
    }
    fetcher.submit(
      {
        intent: "practice-term",
        term: JSON.stringify(practicedTerms[0]),
        grade: grade,
      },
      { method: "post" },
    );
    setTimeout(async () => {
      practicedTerms.shift();
      setCurrentGrade(6);
      setDirection(1);
      setKey(key + 1);
      setPracticed(practiced + 1);
      setPracticedTerms(practicedTerms);
      setIsGrading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-12 gap-4 md:gap-8 text-[#112D4E]">
      <div className="flex items-center justify-center gap-4 md:gap-8 w-full mb-2">
        <button
          className={`button w-36 md:w-48 bg-[#112D4E] text-[#F9F7F7] font-bold py-2 px-2 md:px-4 
            rounded-lg cursor-pointer select-none
            active:translate-y-2
            active:border-b-[0px]
            transition-all duration-150 ${
              mode === "study"
                ? "bg-opacity-70 translate-y-2"
                : "shadow-[0_10px_0_0_#112D4E,0_15px_0_0_#1b70f841]"
            }
            border-b-[1px] border-blue-400`}
          onClick={() => setMode("study")}
        >
          {mode === "study" ? "Studying" : "Study"}
        </button>
        <button
          className={`button w-36 md:w-48 bg-[#112D4E] text-[#F9F7F7] font-bold py-2 px-2 md:px-4 
            rounded-lg cursor-pointer select-none
            active:translate-y-2
            active:border-b-[0px]
            transition-all duration-150 ${
              mode === "practice"
                ? "bg-opacity-70 translate-y-2"
                : "shadow-[0_10px_0_0_#112D4E,0_15px_0_0_#1b70f841]"
            }
            border-b-[1px] border-blue-400`}
          onClick={() => {
            setMode("practice");
            setCurrentTerm(0);
          }}
        >
          {mode === "practice" ? "Practicing" : "Practice"}
        </button>
      </div>
      <AnimatePresence mode="wait">
        {mode === "practice" && (
          <motion.div
            className="flex flex-col items-center justify-center gap-2 w-full "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            <div className="text-lg text-[#F9F7F7]"> Grade of memory</div>
            <div className="flex items-center justify-center gap-8">
              {grades.map((grade) => (
                <div
                  className={`w-8 h-8 flex items-center justify-center relative  ${
                    currentGrade !== 6 ? "pointer-events-none" : ""
                  } `}
                  onClick={() => handleGradeClick(grade)}
                >
                  <AnimatePresence initial={false}>
                    {grade !== currentGrade ? (
                      <motion.div
                        className={` absolute bg-[#DBE2EF] button  flex items-center justify-center w-full h-full rounded-lg cursor-pointer select-none
                        active:translate-y-2 active:[box-shadow:0_0px_0_0_#DBE2EF,0_0px_0_0_#1b70f841]
                        active:border-b-[0px] transition-all duration-150 [box-shadow:0_4px_0_0_#DBE2EF,0_5px_0_0_#1b70f841]
                        border-b-[1px] border-blue-400 text-[#112D4E]`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        key="box"
                      >
                        {grade}
                      </motion.div>
                    ) : (
                      <span className="text-2xl">{gradeIcons[grade]}</span>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-4 md:gap-8 w-full">
        {mode === "study" && (
          <IoChevronBackCircle
            className="text-4xl md:text-5xl cursor-pointer hover:opacity-70"
            onClick={swipePrev}
          />
        )}
        <div className="w-full md:w-1/2 h-[24rem] md:h-[32rem] flex items-center justify-center relative">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={key}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
              }}
              className="w-full absolute"
            >
              {mode === "practice" && (
                <FlashCard term={practicedTerms[0]} isGrading={isGrading} />
              )}
              {mode === "study" && (
                <FlashCard term={terms[currentTerm]} isGrading={isGrading} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {mode === "study" && (
          <IoChevronForwardCircleSharp
            className="text-4xl md:text-5xl cursor-pointer hover:opacity-70"
            onClick={swipeNext}
          />
        )}
      </div>
      {mode === "study" && (
        <div className="flex items-center justify-center gap-8 w-full">
          <div className="text-lg text-[#F9F7F7]">
            {terms.length === 0 ? 0 : currentTerm + 1} / {terms.length}
          </div>
        </div>
      )}
    </div>
  );
}
