import { Link, useFetcher } from "@remix-run/react";

export default function LessonBoard({ lessonCards }: { lessonCards: any[] }) {
  const fetcher = useFetcher();
  const deleteLesson = (lessonId: string) => {
    const formData = new FormData();
    formData.append("intent", "delete-lesson");
    formData.append("lessonId", lessonId);
    fetcher.submit(formData, {
      method: "POST",
    });
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-4 md:p-8">
      {lessonCards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg p-4 min-h-[400px] md:min-h-screen"
          style={{ backgroundColor: "#DBE2EF" }}
        >
          <h2 className="font-bold text-lg" style={{ color: "#112D4E" }}>
            {card.title}
          </h2>
          <div className="text-2xl font-bold mb-4" style={{ color: "#3F72AF" }}>
            {card.count}
          </div>
          <div className="space-y-2 text-left">
            {card.lessons.map((lesson: any) => {
              return (
                <Link
                  key={lesson.id}
                  to={`/lesson/${lesson.id}`}
                  className="block p-2 bg-[#F9F7F7] rounded hover:bg-gray-50 relative group"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        window.confirm(
                          "Are you sure you want to delete this lesson?",
                        )
                      ) {
                        deleteLesson(lesson.id);
                      }
                    }}
                    className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                  <div className="font-medium">{lesson.title}</div>
                  <div className="text-sm text-gray-500">{lesson.subject}</div>
                  {lesson.onTrack > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <input type="checkbox" readOnly checked />
                      Section {lesson.onTrack}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
