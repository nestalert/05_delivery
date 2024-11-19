import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (!process.argv[2]) {
  console.error("Please enter a username.");
  process.exit(1);
  }
  const username = process.argv[2];
  const user = await prisma.users.findFirst({
    where: {
      UNAME: username,
    },
  });

  if (user) {
    const fs = require('fs');
    fs.writeFileSync('query.json', JSON.stringify(user, null, 2));
    console.log(`User data:`);
    console.log(user);
  } else {
    console.log(`User ${username} does not exist.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });