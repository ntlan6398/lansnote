import { prisma } from "~/db/prisma";
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
export async function getListById(id: number) {
  return await prisma.list.findUnique({
    where: { id },
  });
}
export async function getListsByUserId(userId: string) {
  return await prisma.list.findMany({
    where: {
      accountId: userId,
    },
  });
}
