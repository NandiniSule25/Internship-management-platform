const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('🧪 Running Phase 4 Task Allocation & Progress Tests');
  console.log('====================================================');

  try {
    const institution = await prisma.institution.findFirst({ where: { code: 'AIT' } });
    const mentor = await prisma.user.findFirst({ where: { email: 'mentor.test@ait.edu' } });
    const intern = await prisma.user.findFirst({ where: { email: 'intern.test@ait.edu' } });

    if (!mentor || !intern) throw new Error('Mentor or Intern not found.');

    const cohort = await prisma.internship.findFirst({
      where: { mentorId: mentor.id, internId: intern.id },
    });
    if (!cohort) throw new Error('Cohort not found.');

    // 1. Task Allocation by Mentor
    console.log('▶ Test 1: Allocating tasks with deadlines & priorities...');
    const task1 = await prisma.task.create({
      data: {
        title: 'Design PostgreSQL Schema & Migration Strategy',
        description: 'Define relational models with proper foreign keys, cascade rules, and UUID primary keys.',
        priority: 'HIGH',
        status: 'TODO',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        internshipId: cohort.id,
        creatorId: mentor.id,
        assigneeId: intern.id,
      },
    });
    console.log(`  ✅ Task allocated: "${task1.title}" (Priority: ${task1.priority}, Status: ${task1.status})`);

    const task2 = await prisma.task.create({
      data: {
        title: 'Implement JWT Role Guards & Auth Middleware',
        description: 'Secure all endpoints and restrict administrative actions to verified roles.',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        internshipId: cohort.id,
        creatorId: mentor.id,
        assigneeId: intern.id,
      },
    });
    console.log(`  ✅ Task allocated: "${task2.title}" (Priority: ${task2.priority})`);

    // 2. Query Tasks Scoped to Intern
    console.log('▶ Test 2: Intern retrieving allocated tasks...');
    const internTasks = await prisma.task.findMany({
      where: { assigneeId: intern.id },
      include: { creator: true, internship: true },
    });
    console.log(`  ✅ Intern successfully fetched ${internTasks.length} allocated tasks.`);
    if (internTasks.length < 2) throw new Error('Expected at least 2 tasks.');

    // 3. Status Transition
    console.log('▶ Test 3: Updating task status from TODO -> IN_PROGRESS...');
    const updatedTask = await prisma.task.update({
      where: { id: task1.id },
      data: { status: 'IN_PROGRESS' },
    });
    console.log(`  ✅ Task status transitioned to: ${updatedTask.status}`);

    // 4. Submitting Daily Progress Update
    console.log('▶ Test 4: Intern submitting work update note & deliverable link...');
    const progress = await prisma.progressUpdate.create({
      data: {
        taskId: task1.id,
        internId: intern.id,
        updateNote: 'Completed Prisma schema definitions, ran db push to Neon PostgreSQL, all 7 tables active.',
        workUrl: 'https://github.com/institution/repo/pull/12',
        hoursSpent: 4.5,
        statusAtUpdate: 'UNDER_REVIEW',
      },
    });
    console.log(`  ✅ Progress update logged: "${progress.updateNote.slice(0, 50)}..." (${progress.hoursSpent} hrs)`);

    // 5. Query Task Details with Timeline
    console.log('▶ Test 5: Mentor inspecting task progress history timeline...');
    const taskDetails = await prisma.task.findUnique({
      where: { id: task1.id },
      include: { progressUpdates: { include: { intern: true } } },
    });
    console.log(`  ✅ Task has ${taskDetails.progressUpdates.length} progress update(s) recorded in timeline.`);
    if (taskDetails.progressUpdates.length === 0) throw new Error('Progress update not linked!');

    console.log('====================================================');
    console.log('🎉 All Phase 4 Task & Progress Tests PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Phase 4 test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase4Tests();
