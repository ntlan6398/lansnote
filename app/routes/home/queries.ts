import { prisma } from "~/db/prisma";
import { supermemo, SuperMemoGrade } from "supermemo";
import dayjs from "dayjs";
function practice(term: any, grade: SuperMemoGrade) {
  const { interval, repetition, efactor } = supermemo(term, grade);
  const lastReview = dayjs(Date.now()).toISOString();
  const nextReview = dayjs(Date.now()).add(interval, "hour").toISOString();
  return { ...term, interval, repetition, efactor, lastReview, nextReview };
}

export async function addSubject(userId: string, name: string) {
  return prisma.subject.create({
    data: {
      name,
      Account: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
export async function addList(userId: string, name: string) {
  return prisma.list.create({
    data: {
      name,
      Account: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
export async function getNavData(userId: string) {
  const subjects = await prisma.subject.findMany({
    where: {
      accountId: userId,
    },
  });
  const lists = await prisma.list.findMany({
    where: {
      accountId: userId,
    },
  });
  return { subjects, lists };
}
export async function getHomeData(userId: string) {
  const subjects = await prisma.subject.findMany({
    where: {
      accountId: userId,
    },
  });
  console.log(subjects);
  const lists = await prisma.list.findMany({
    where: {
      accountId: userId,
    },
  });
  let lessons: any[] = [];
  if (subjects.length > 0) {
    lessons = await prisma.lesson.findMany({
      where: {
        subjectId: {
          in: subjects.map((subject) => subject.id),
        },
      },
    });
  }
  const terms = await prisma.term.findMany({
    where: {
      accountId: userId,
      nextReview: {
        lte: dayjs().toISOString(),
      },
    },
  });
  return { subjects, lists, lessons, terms };
}

export async function getLessons(userId: string) {
  const subjectIds = await prisma.subject.findMany({
    where: {
      accountId: userId,
    },
  });
  const lessons = await prisma.lesson.findMany({
    where: {
      subjectId: {
        in: subjectIds.map((subject) => subject.id),
      },
    },
  });
  return lessons;
}

export async function practiceTerm(term: any, grade: SuperMemoGrade) {
  const practicedTerm = practice(term, grade);
  const updatedTerm = await prisma.term.update({
    where: { id: term.id },
    data: practicedTerm,
  });
  return updatedTerm;
}

export async function deleteLesson(lessonId: string) {
  return prisma.lesson.delete({
    where: { id: lessonId },
  });
}
