import crypto from "crypto";

import { prisma } from "~/db/prisma";

export async function accountExists(email: string) {
  let account = await prisma.account.findUnique({
    where: { email: email },
    select: { id: true },
  });

  return Boolean(account);
}

export async function createAccount(email: string, password: string) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");
  const account = await prisma.account.create({
    data: {
      email: email,
      Password: { create: { hash, salt } },
    },
  });
  await prisma.list.create({
    data: {
      name: "Default",
      accountId: account.id,
    },
  });
  await prisma.subject.create({
    data: {
      name: "Default",
      accountId: account.id,
    },
  });
  return account;
}
