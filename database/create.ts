import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const fileContent = fs.readFileSync('../user.json', 'utf-8').split('\r\n');

async function main() {
// Extract the information from the file content
const [username, temppass, email, address, role, bankToken] = fileContent;
const password = crypto.createHash('sha256').update(temppass).digest('hex');
// Create the user
const user = await prisma.users.create({
  data: {
    UNAME: username,
    PWD: password,
    EMAIL: email,
    ADDR: address,
    ROLE: role,
    BANK_TOKEN: bankToken,
  },
});

console.log('User created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });