import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { SuperMemoGrade } from "supermemo";
import { requireAuthCookie } from "~/auth/auth";
import LessonBoard from "./components/LesonBoard";
import TermDisplay from "./components/TermDisplay";
import { deleteLesson, getHomeData, practiceTerm } from "./queries";
import dayjs from "dayjs";
export const meta = () => {
  return [{ title: "Home" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  let userId = await requireAuthCookie(request);
  let { subjects, lists, lessons, terms } = await getHomeData(userId);
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

  return { subjects, lists, lessons: lessonData, terms };
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
  const { subjects, lists, lessons, terms } = useLoaderData<typeof loader>();
  const now = dayjs().format("YYYY-MM-DD");
  const classifiedLessons = lessons.reduce(
    (acc: any, lesson) => {
      const review = lesson.reviewDate.split("T")[0];

      const diff = Math.ceil(
        (new Date(now).getTime() - new Date(review).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (diff === 0) {
        console.log(review);
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
  console.log(classifiedLessons);
  const [activeTab, setActiveTab] = useState("lessons");

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
    <div className="h-full flex flex-col items-center justify-center">
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
          onClick={() => setActiveTab("lessons")}
        >
          Lessons
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg  font-bold ${
            activeTab === "terms"
              ? "bg-[#3F72AF] text-white w-1/2"
              : "bg-[#DBE2EF] text-[#3F72AF] w-1/3"
          }`}
          onClick={() => setActiveTab("terms")}
        >
          Terms
        </button>
      </div>
      <div className="w-full min-h-screen bg-[#3F72AF] rounded-t-lg">
        {activeTab === "lessons" && <LessonBoard lessonCards={lessonCards} />}
        {activeTab === "terms" && <TermDisplay terms={terms} />}
      </div>
    </div>
  );
}
