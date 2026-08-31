import type { User } from "@prisma/client";
import { prisma } from "./client.js";
import { customAlphabet } from "nanoid";

const codes = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export async function getOrCreateUser(input: {
  telegramId: string;
  telegramUsername?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  startPayload?: string | null;
}): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { telegramId: input.telegramId } });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        telegramUsername: input.telegramUsername ?? existing.telegramUsername,
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
        lastSeenAt: new Date(),
      },
    });
  }

  const user = await prisma.user.create({
    data: {
      telegramId: input.telegramId,
      telegramUsername: input.telegramUsername ?? undefined,
      firstName: input.firstName ?? undefined,
      lastName: input.lastName ?? undefined,
      referralCode: codes(),
    },
  });

  if (input.startPayload) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: input.startPayload } });
    if (referrer && referrer.id !== user.id) {
      await prisma.referral.create({
        data: { referrerUserId: referrer.id, referredUserId: user.id },
      });
    }
  }

  await prisma.auditLog.create({
    data: { userId: user.id, action: "USER_CREATED", metadata: { telegramId: input.telegramId } },
  });

  return user;
}

export async function requireActiveUser(telegramId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) throw new Error("Please tap /start first.");
  if (user.status !== "ACTIVE") throw new Error("This account is disabled.");
  return user;
}
