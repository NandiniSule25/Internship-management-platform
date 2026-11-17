const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignYukta() {
  const yukta = await prisma.user.findFirst({
    where: { email: 'awatiyukta@gmail.com' },
  });
  if (!yukta) {
    console.log('Yukta not found');
    return;
  }

  // Find Full-Stack cohort
  const cohort = await prisma.internship.findFirst({
    where: { title: { contains: 'Full-Stack' } },
  });

  if (cohort) {
    await prisma.internship.update({
      where: { id: cohort.id },
      data: { internId: yukta.id },
    });
    console.log(`Assigned Yukta Awati to cohort: "${cohort.title}"`);

    // Also assign any existing tasks in that cohort to Yukta
    await prisma.task.updateMany({
      where: { internshipId: cohort.id },
      data: { assigneeId: yukta.id },
    });
    console.log(`Updated tasks in "${cohort.title}" to assignee: Yukta Awati`);
  }
}

assignYukta()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
