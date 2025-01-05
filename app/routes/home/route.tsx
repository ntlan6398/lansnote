import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { SuperMemoGrade } from "supermemo";
import { requireAuthCookie } from "~/auth/auth";
import LessonBoard from "./components/LesonBoard";
import TermDisplay from "./components/TermDisplay";
import { getLessonsbyUserId, deleteLesson } from "~/queries/lessons";
import { getSubjectsByUserId } from "~/queries/subjects";
import { getActiveTermsbyUserId, practiceTerm } from "~/queries/terms";
import dayjs from "dayjs";
import { Lesson, LessonData, ClassifiedLessons } from "~/types";

interface SerializedLessonData extends Omit<LessonData, "reviewDate"> {
  reviewDate: string;
}

export const meta = () => {
  return [{ title: "Home" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  let userId = await requireAuthCookie(request);
  let subjects = await getSubjectsByUserId(userId);
  let lessons = await getLessonsbyUserId(userId);
  let terms = await getActiveTermsbyUserId(userId);

  const subjectIds = subjects.reduce<Record<number, string>>((acc, subject) => {
    acc[subject.id] = subject.name;
    return acc;
  }, {});

  const lessonData = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    subject: subjectIds[lesson.subjectId],
    reviewDate: lesson.reviewDate,
    onTrack: lesson.onTrack,
  }));

  return { lessons: lessonData, terms };
}

export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "practice-term":
      const term = JSON.parse(formData.get("term") as string);
      const grade = parseInt(formData.get("grade") as string);
      const practicedTerm = await practiceTerm(term, grade as SuperMemoGrade);
      return { practicedTerm };
    case "delete-lesson":
      const lessonId = formData.get("lessonId") as string;
      await deleteLesson(lessonId);
      return { deleted: lessonId };
    default:
      return null;
  }
}

export default function Projects() {
  const { lessons, terms } = useLoaderData<typeof loader>();
  const today = dayjs().format("YYYY-MM-DD");
  const [activeTab, setActiveTab] = useState("lessons");

  useEffect(() => {
    const currentTab = sessionStorage.getItem("currentTab");
    if (currentTab) {
      setActiveTab(currentTab);
    }
  }, []);

  const classifiedLessons = lessons.reduce<ClassifiedLessons>(
    (acc: ClassifiedLessons, lesson: SerializedLessonData) => {
      const review = lesson.reviewDate.split("T")[0];
      const diff = dayjs(today).diff(review, "day");
      if (diff === 0) {
        acc.today.push(lesson);
      } else if (diff === 1) {
        acc.yesterday.push(lesson);
      } else if (diff === -1) {
        acc.tomorrow.push(lesson);
      } else if (diff > 1 && diff < 30) {
        acc.lastThirtyDays.push(lesson);
      } else if (-30 < diff && diff < -1) {
        acc.nextThirtyDays.push(lesson);
      }
      return acc;
    },
    {
      lastThirtyDays: [],
      yesterday: [],
      today: [],
      tomorrow: [],
      nextThirtyDays: [],
    },
  );

  const lessonCards = [
    {
      title: "Last 30 Days",
      count: classifiedLessons.lastThirtyDays.length,
      lessons: classifiedLessons.lastThirtyDays,
    },
    {
      title: "Yesterday",
      count: classifiedLessons.yesterday.length,
      lessons: classifiedLessons.yesterday,
    },
    {
      title: "Today",
      count: classifiedLessons.today.length,
      lessons: classifiedLessons.today,
    },
    {
      title: "Tomorrow",
      count: classifiedLessons.tomorrow.length,
      lessons: classifiedLessons.tomorrow,
    },
    {
      title: "Next 30 Days",
      count: classifiedLessons.nextThirtyDays.length,
      lessons: classifiedLessons.nextThirtyDays,
    },
  ];

  return (
    <div className="h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold my-8 text-[#112D4E]">
        What is waiting for you?
      </h1>
      <div className="flex justify-center gap-8 w-full">
        <button
          className={`px-4 py-2 rounded-t-lg  font-bold ${
            activeTab === "lessons"
              ? "bg-[#3F72AF] text-white w-1/2"
              : "bg-[#DBE2EF] text-[#3F72AF] w-1/3"
          }`}
          onClick={() => {
            setActiveTab("lessons");
            sessionStorage.setItem("currentTab", "lessons");
          }}
        >
          Lessons
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg  font-bold ${
            activeTab === "terms"
              ? "bg-[#3F72AF] text-white w-1/2"
              : "bg-[#DBE2EF] text-[#3F72AF] w-1/3"
          }`}
          onClick={() => {
            setActiveTab("terms");
            sessionStorage.setItem("currentTab", "terms");
          }}
        >
          Terms
        </button>
      </div>
      <div className="w-full h-full bg-[#3F72AF] rounded-t-lg overflow-auto">
        {activeTab === "lessons" && <LessonBoard lessonCards={lessonCards} />}
        {activeTab === "terms" && <TermDisplay terms={terms} />}
      </div>
    </div>
  );
}
