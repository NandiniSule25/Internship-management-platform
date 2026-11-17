const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTasksPerStudent() {
  const tasks = await prisma.task.findMany({
    include: {
      assignee: { select: { firstName: true, lastName: true, email: true } },
      internship: { select: { title: true } },
    },
  });

  console.log(`Total tasks in DB: ${tasks.length}`);
  tasks.forEach((t) => {
    console.log(`Task: "${t.title}" | Status: ${t.status} | Assignee: ${t.assignee ? t.assignee.firstName + ' ' + t.assignee.lastName : 'None'} | Cohort: "${t.internship?.title}"`);
  });
}

checkTasksPerStudent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
