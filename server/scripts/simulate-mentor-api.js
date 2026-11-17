const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateMentorApi() {
  const mentor = await prisma.user.findFirst({
    where: { email: '2ke23cs077@kleit.ac.in' },
  });

  if (!mentor) {
    console.log('Mentor 2ke23cs077@kleit.ac.in not found');
    return;
  }

  console.log('Mentor found:', mentor.id, mentor.firstName, mentor.lastName, mentor.role);

  // Simulating /api/internships
  const internships = await prisma.internship.findMany({
    where: {
      institutionId: mentor.institutionId,
      mentorId: mentor.id,
    },
    include: {
      institution: { select: { id: true, name: true, code: true } },
      mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
      intern: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { tasks: true, evaluations: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Internships for ${mentor.email}: ${internships.length}`);
  internships.forEach((i) => {
    console.log(`- Cohort: "${i.title}" | Intern:`, i.intern);
  });

  // Simulating /api/tasks
  const tasks = await prisma.task.findMany({
    where: {
      internship: { institutionId: mentor.institutionId },
      OR: [
        { creatorId: mentor.id },
        { internship: { mentorId: mentor.id } },
      ],
    },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
      internship: { select: { id: true, title: true, department: true } },
      progressUpdates: true,
    },
  });

  console.log(`Tasks for ${mentor.email}: ${tasks.length}`);
  tasks.forEach((t) => {
    console.log(`- Task: "${t.title}" | Assignee:`, t.assignee?.firstName, t.assignee?.lastName);
  });
}

simulateMentorApi()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
