import { prisma } from "~/db/prisma";
import { supermemo, SuperMemoGrade } from "supermemo";
import dayjs from "dayjs";
function practice(term: any, grade: SuperMemoGrade) {
  const { interval, repetition, efactor } = supermemo(term, grade);
  const lastReview = dayjs(Date.now()).toISOString();
  const nextReview = dayjs(Date.now()).add(interval, "hour").toISOString();
  return { ...term, interval, repetition, efactor, lastReview, nextReview };
}
type PaginationOptions = {
  page: number;
  itemsPerPage: number;
};
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
export async function getTerms(
  listId: number,
  { page, itemsPerPage }: PaginationOptions,
) {
  const offset = (page - 1) * itemsPerPage;

  // Example SQL query (adjust according to your database)
  const terms = await prisma.term.findMany({
    where: { listId },
    skip: offset,
    take: itemsPerPage,
    orderBy: { term: "asc" },
  });

  const totalItems = await prisma.term.count({
    where: { listId },
  });

  return {
    terms,
    totalItems,
  };
}
export async function getActiveTermsbyUserId(userId: string) {
  return await prisma.term.findMany({
    where: {
      accountId: userId,
      nextReview: {
        lte: dayjs().toISOString(),
      },
    },
  });
}
export async function createTerm({
  term,
  type,
  definition,
  example,
  audio,
  phonetic,
  listId,
  accountId,
}: {
  term: string;
  type: string;
  definition: string;
  example: string;
  audio: string | null;
  phonetic: string | null;
  listId: string;
  accountId: string;
}) {
  return prisma.term.create({
    data: {
      term,
      type,
      definition,
      example,
      audio,
      phonetic,
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
  Object.keys(terms).forEach(async (key) => {
    const term = terms[key];
    const grade = grades[key];
    const practicedTerm = practice(term, grade);
    const updatedTerm = await prisma.term.update({
      where: { id: term.id },
      data: practicedTerm,
    });
  });
}
export async function practiceTerm(term: any, grade: SuperMemoGrade) {
  const practicedTerm = practice(term, grade);
  const updatedTerm = await prisma.term.update({
    where: { id: term.id },
    data: practicedTerm,
  });
  return updatedTerm;
}
export async function getList(id: number) {
  return await prisma.list.findUnique({
    where: { id },
  });
}

export async function deleteTerm(id: string) {
  return await prisma.term.delete({
    where: { id },
  });
}
