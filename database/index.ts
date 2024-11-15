import { PrismaClient } from '@prisma/client';
import { Role } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
  const kitchenStaff = await prisma.users.findMany({
    where: {
      ROLE: 'CUSTOMER'
    },
  });

  console.log(kitchenStaff);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });