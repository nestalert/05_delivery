import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];

  if (!username) {
    console.error('Please provide a username to delete.');
    process.exit(1);
  }

  const user = await prisma.users.findFirst({
    where: {
      UNAME: username,
    },
  });

  if (!user) {
    console.error(`User with username '${username}' not found.`);
    process.exit(1);
  }

  const confirmation = await confirmDeletion(username);

  if (confirmation) {
    await prisma.users.delete({
      where: {
        UID: user.UID,
        UNAME: user.UNAME,
      },
    });

    console.log(`User '${username}' deleted successfully.`);
  }
}

async function confirmDeletion(username: string) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    return new Promise<boolean>((resolve) => {
      readline.question(`Are you sure you want to delete user '${username}'? (y/n): `, (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});