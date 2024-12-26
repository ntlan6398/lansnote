import { prisma } from "~/db/prisma";

export async function getLessons(subjectId: number) {
  // TODO: Implement your database query
  // Should return subject details and related lessons
  return await prisma.lesson.findMany({
    where: { subjectId: subjectId },
  });
}
export async function deleteLesson(lessonId: string) {
  return await prisma.lesson.delete({
    where: { id: lessonId },
  });
}
