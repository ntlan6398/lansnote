import {
  ActionFunctionArgs,
  DataFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { getAuthFromRequest } from "../../auth/auth";
// import { deleteLesson, getLessons } from "./queries";
import { getLessonsbySubjectId, deleteLesson } from "~/queries/lessons";
import { FaRegFileLines } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import dayjs from "dayjs";
import { useState } from "react";
export const meta = () => {
  return [{ title: "Subject" }];
};
export async function loader({ request, params }: DataFunctionArgs) {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return redirect("/login");
  }

  const subjectId = parseInt(params.id as string);
  const lessons = await getLessonsbySubjectId(subjectId);
  if (!lessons) {
    throw new Error("Subject not found");
  }

  return { lessons };
}

const truncateText = (text: string, maxLength = 20) => {
  if (!text) return "Untitled";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const lessonId = formData.get("lessonId");
  await deleteLesson(lessonId as string);
  return redirect(`/subject/${params.id}`);
}
export default function Subject() {
  const { lessons } = useLoaderData();
  const now = dayjs().format("YYYY-MM-DD");
  const [today, setToday] = useState(now);
  const fetcher = useFetcher();
  const handleDelete = (lessonId: string) => {
    fetcher.submit(
      { lessonId },
      {
        method: "post",
      },
    );
  };
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {lessons?.map((lesson) => (
            <div key={lesson.id} className="relative group">
              <Link
                to={`/lesson/${lesson.id}`}
                className="group flex flex-col items-center p-4  hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="relative mb-2  z-[1]">
                  <FaRegFileLines className="w-12 h-12 text-navy-600 group-hover:text-navy-700" />
                </div>
                <span
                  className="text-center text-sm text-gray-700 group-hover:text-gray-900 relative z-[2]"
                  title={lesson.title || "Untitled"}
                >
                  {truncateText(lesson.title)}
                </span>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    window.confirm(
                      "Are you sure you want to delete this lesson?",
                    )
                  ) {
                    handleDelete(lesson.id);
                  }
                }}
                className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 -translate-y-2 translate-x-2 z-[3]"
                title="Delete lesson"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add New Lesson Button */}
          <Link
            to={`/lesson/new?today=${today}`}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors relative z-[1]"
            onClick={() => {
              const now = dayjs().format("YYYY-MM-DD");
              setToday(now);
            }}
          >
            <div className="mb-2 z-[1]">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-600 relative z-[2]">
              New Lesson
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
