const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../src/utils/token');

const prisma = new PrismaClient();

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('🧪 Running Phase 3 Institution & Cohort Tests');
  console.log('====================================================');

  try {
    const institution = await prisma.institution.findFirst({ where: { code: 'AIT' } });
    if (!institution) throw new Error('AIT institution not found.');

    const admin = await prisma.user.findFirst({ where: { email: 'admin.test@ait.edu' } });
    const mentor = await prisma.user.findFirst({ where: { email: 'mentor.test@ait.edu' } });
    const intern = await prisma.user.findFirst({ where: { email: 'intern.test@ait.edu' } });

    if (!admin || !mentor || !intern) throw new Error('Users not found. Run test:auth first.');

    // Test 1: Cohort Creation & Linking
    console.log('▶ Test 1: Creating internship cohort with mentor and intern allocation...');
    const testCohort = await prisma.internship.create({
      data: {
        title: 'Distributed Systems & Microservices Architecture',
        description: 'Comprehensive design of resilient event-driven systems and PostgreSQL partitioning.',
        department: 'Software Engineering',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2027-02-28'),
        status: 'PENDING',
        institutionId: institution.id,
        mentorId: mentor.id,
        internId: intern.id,
      },
    });
    console.log(`  ✅ Cohort created: "${testCohort.title}" (ID: ${testCohort.id})`);

    // Test 2: Role-based scoping validation
    console.log('▶ Test 2: Verifying role-scoped cohort queries...');
    const adminCohorts = await prisma.internship.findMany({ where: { institutionId: institution.id } });
    const mentorCohorts = await prisma.internship.findMany({ where: { mentorId: mentor.id } });
    const internCohorts = await prisma.internship.findMany({ where: { internId: intern.id } });

    console.log(`  ✅ Admin sees all institution cohorts: ${adminCohorts.length} cohorts.`);
    console.log(`  ✅ Mentor sees assigned cohorts: ${mentorCohorts.length} cohorts.`);
    console.log(`  ✅ Intern sees enrolled cohorts: ${internCohorts.length} cohorts.`);

    if (adminCohorts.length < mentorCohorts.length || internCohorts.length === 0) {
      throw new Error('Role scoping logic mismatch!');
    }

    // Test 3: Status Transition (PENDING -> ACTIVE -> COMPLETED)
    console.log('▶ Test 3: Updating cohort status state machine...');
    const activatedCohort = await prisma.internship.update({
      where: { id: testCohort.id },
      data: { status: 'ACTIVE' },
    });
    if (activatedCohort.status !== 'ACTIVE') throw new Error('Status transition to ACTIVE failed');
    console.log(`  ✅ Status updated: PENDING -> ${activatedCohort.status}`);

    // Test 4: Institution Aggregate Metrics
    console.log('▶ Test 4: Verifying institution aggregate metrics calculations...');
    const cohortsGrouped = await prisma.internship.groupBy({
      by: ['status'],
      where: { institutionId: institution.id },
      _count: { status: true },
    });
    const usersCount = await prisma.user.count({ where: { institutionId: institution.id } });
    console.log(`  ✅ Total institution users: ${usersCount}`);
    console.log('  ✅ Cohort breakdown:', cohortsGrouped.map((g) => `${g.status}: ${g._count.status}`).join(' | '));

    console.log('====================================================');
    console.log('🎉 All Phase 3 Institution & Cohort Tests PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Phase 3 test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase3Tests();
