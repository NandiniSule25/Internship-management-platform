const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedStudentTasks() {
  const nandini = await prisma.user.findFirst({
    where: { email: 'nandinisule25@gmail.com' },
  });
  const mentor = await prisma.user.findFirst({
    where: { email: 'mentor.test@ait.edu' },
  });

  if (!nandini || !mentor) return;

  const cyberCohort = await prisma.internship.findFirst({
    where: { title: { contains: 'Cybersecurity' } },
  });

  if (cyberCohort) {
    const existingNandiniTasks = await prisma.task.findMany({
      where: { assigneeId: nandini.id },
    });

    if (existingNandiniTasks.length === 0) {
      await prisma.task.create({
        data: {
          title: 'OWASP Top 10 Vulnerability Assessment',
          description: 'Conduct static analysis and dynamic penetration testing on the authentication endpoints.',
          priority: 'HIGH',
          status: 'COMPLETED',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          internshipId: cyberCohort.id,
          creatorId: mentor.id,
          assigneeId: nandini.id,
        },
      });

      const t2 = await prisma.task.create({
        data: {
          title: 'Implement Rate Limiting & Threat Mitigation',
          description: 'Deploy Redis/Express rate-limiting guards to prevent brute force credential attacks.',
          priority: 'URGENT',
          status: 'UNDER_REVIEW',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          internshipId: cyberCohort.id,
          creatorId: mentor.id,
          assigneeId: nandini.id,
        },
      });

      // Add a progress update with proof for Nandini
      await prisma.progressUpdate.create({
        data: {
          taskId: t2.id,
          internId: nandini.id,
          updateNote: 'Rate limiter configured with 100 requests per 15 min window. Tested via k6 stress runner.',
          workUrl: 'https://github.com/security/pull/42',
          hoursSpent: 6.5,
          statusAtUpdate: 'UNDER_REVIEW',
        },
      });

      console.log('Created tasks and proof update for Nandini Sule');
    }
  }
}

seedStudentTasks()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
