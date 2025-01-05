import { prisma } from "~/db/prisma";
export async function createLesson(accountId: string, today: string) {
  const defaultSubject = await prisma.subject.findFirst({
    where: {
      accountId: accountId,
    },
  });
  const subjectId = defaultSubject?.id;
  if (!subjectId) {
    throw new Error("Default subject not found");
  }
  return prisma.lesson.create({
    data: {
      title: "Untitled",
      content: "",
      comments: "",
      startDate: new Date(today),
      reviewDate: new Date(today),
      onTrack: 0,
      subjects: {
        connect: {
          id: subjectId,
        },
      },
    },
  });
}
export async function getLessonsbySubjectId(subjectId: number) {
  // TODO: Implement your database query
  // Should return subject details and related lessons
  return await prisma.lesson.findMany({
    where: { subjectId: subjectId },
  });
}
export async function getLessonById(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  // Convert comments to array if it's a single string
  const commentIds = lesson?.comments ? lesson?.comments?.split(",") : [];
  // Get terms that are referenced in lesson.comments
  const comments = await prisma.term.findMany({
    where: {
      id: {
        in: commentIds,
      },
    },
  });
  return { lesson, comments };
}
export async function getLessonsbyUserId(userId: string) {
  return await prisma.lesson.findMany({
    where: {
      subjects: {
        accountId: userId,
      },
    },
    include: {
      subjects: true,
    },
  });
}
export function updateLesson(lesson: any) {
  return prisma.lesson.update({
    where: { id: lesson.id },
    data: {
      title: lesson.title,
      content: lesson.content,
      comments: lesson.comments,
      startDate: lesson.startDate,
      reviewDate: lesson.reviewDate,
      onTrack: parseInt(lesson.onTrack),
      subjects: {
        connect: {
          id: parseInt(lesson.subjectId),
        },
      },
    },
  });
}
export function deleteLesson(lessonId: string) {
  return prisma.lesson.delete({
    where: { id: lessonId },
  });
}
