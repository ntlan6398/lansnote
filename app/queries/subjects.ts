import { prisma } from "~/db/prisma";
export const defaultSubjectId = async (accountId: string) => {
  const defaultSubject = await prisma.subject.findFirst({
    where: {
      accountId: accountId,
    },
  });
  return defaultSubject?.id;
};
export async function getSubjectsByUserId(userId: string) {
  return await prisma.subject.findMany({
    where: {
      accountId: userId,
    },
  });
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
