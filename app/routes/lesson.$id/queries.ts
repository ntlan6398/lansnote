import { prisma } from "~/db/prisma";
import { supermemo, SuperMemoGrade } from "supermemo";
import dayjs from "dayjs";
function practice(term: any, grade: SuperMemoGrade) {
  const { interval, repetition, efactor } = supermemo(term, grade);
  const lastReview = dayjs(Date.now()).toISOString();
  const nextReview = dayjs(Date.now()).add(interval, "day").toISOString();
  return { ...term, interval, repetition, efactor, lastReview, nextReview };
}
export const defaultSubjectId = async (accountId: string) => {
  const defaultSubject = await prisma.subject.findFirst({
    where: {
      accountId: accountId,
    },
  });
  return defaultSubject?.id;
};
export async function createNewLesson(accountId: string, today: string) {
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
export async function getLesson(lessonId: string) {
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
export function updateLesson(lesson: any) {
  return prisma.lesson.update({
    where: { id: lesson.id },
    data: {
      title: lesson.title,
      content: lesson.content,
      comments: lesson.comments,
      startDate: new Date(lesson.startDate),
      reviewDate: new Date(lesson.reviewDate),
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
export async function findExistingTerms(word: string) {
  return prisma.term.findMany({
    where: {
      term: {
        equals: word,
        mode: "insensitive", // Case insensitive search
      },
    },
  });
}
export async function createTerm({
  term,
  type,
  definition,
  example,
  status,
  listId,
  accountId,
}: {
  term: string;
  type: string;
  definition: string;
  example: string;
  status: string;
  listId: string;
  accountId: string;
}) {
  return prisma.term.create({
    data: {
      term,
      type,
      definition,
      example,
      status,
      Account: {
        connect: {
          id: accountId,
        },
      },
      List: {
        connect: {
          id: parseInt(listId),
        },
      },
    },
  });
}
export async function updateTerm(term: any) {
  return prisma.term.update({
    where: { id: term.id },
    data: term,
  });
}
export async function updatePracticeTerms(terms: any, grades: any) {
  Object.keys(terms).forEach((key) => {
    const term = terms[key];
    const grade = grades[key];
    const updatedTerm = practice(term, grade);
    return prisma.term.update({
      where: { id: term.id },
      data: updatedTerm,
    });
  });
}
