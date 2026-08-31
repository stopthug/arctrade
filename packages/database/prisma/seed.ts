import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ARC_CHAIN_ID = 5042002;

const tokens = [
  {
    chainId: ARC_CHAIN_ID,
    address: "0x3600000000000000000000000000000000000000",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    verified: true,
  },
  {
    chainId: ARC_CHAIN_ID,
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    symbol: "EURC",
    name: "EURC",
    decimals: 6,
    verified: true,
  },
  {
    chainId: ARC_CHAIN_ID,
    address: "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF",
    symbol: "cirBTC",
    name: "Circle Wrapped Bitcoin",
    decimals: 8,
    verified: true,
  },
];

async function main() {
  for (const token of tokens) {
    await prisma.token.upsert({
      where: { chainId_address: { chainId: token.chainId, address: token.address } },
      create: token,
      update: { symbol: token.symbol, name: token.name, decimals: token.decimals, verified: true },
    });
  }

  await prisma.feeConfig.upsert({
    where: { id: "default" },
    create: { id: "default", tradingFeeBps: 5, withdrawalFeeBps: 0, referralRewardBps: 0 },
    update: {},
  });

  await prisma.trendingRule.upsert({
    where: { id: "default" },
    create: { id: "default", metric: "volume", windowHours: 24 },
    update: {},
  });

  const demo = await prisma.user.upsert({
    where: { telegramId: "0" },
    create: {
      telegramId: "0",
      telegramUsername: "seed_demo",
      firstName: "Demo",
      lastName: "User",
      referralCode: "DEMO0001",
      status: "DISABLED",
    },
    update: {},
  });

  await prisma.wallet.upsert({
    where: { userId_network: { userId: demo.id, network: "arc-testnet" } },
    create: {
      userId: demo.id,
      address: "0x0000000000000000000000000000000000000001",
      provider: "EXTERNAL",
      network: "arc-testnet",
      status: "DISABLED",
    },
    update: {},
  });

  console.log("Seeded verified tokens, fee config, and a disabled demo user (no private keys).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
