import * as fs from 'fs';
const { PrismaClient } = require('@prisma/client');
import crypto from 'crypto';

const prisma = new PrismaClient();

async function updateUser() {
  // Read data from query.json
  const jsonData = fs.readFileSync('query.json', 'utf-8');
  const userData = JSON.parse(jsonData);
  const password = crypto.createHash('sha256').update(userData.PWD).digest('hex');

  // Update user using Prisma
  await prisma.users.update({
    where: { UID: userData.UID },
    data: {
      UNAME: userData.UNAME,
      PWD: password,
      EMAIL: userData.EMAIL,
      ADDR: userData.ADDR,
      ROLE: userData.ROLE,
      BANK_TOKEN: userData.BANK_TOKEN,
    },
  });

  console.log(`User with UID ${userData.UID} updated successfully!`);
}

updateUser()
  .catch((error) => {
    console.error('Error updating user:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });