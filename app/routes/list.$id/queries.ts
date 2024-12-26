import { prisma } from "~/db/prisma";
type PaginationOptions = {
  page: number;
  itemsPerPage: number;
};
export async function getList(id: number) {
  return await prisma.list.findUnique({
    where: { id },
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
  return await prisma.term.update({
    where: { id: term.id },
    data: term,
  });
}

export async function deleteTerm(id: string) {
  return await prisma.term.delete({
    where: { id },
  });
}
