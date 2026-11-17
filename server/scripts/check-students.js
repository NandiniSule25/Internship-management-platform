const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndSeedStudents() {
  const institution = await prisma.institution.findFirst({ where: { code: 'AIT' } });
  if (!institution) {
    console.log('No AIT institution');
    return;
  }

  const mentor = await prisma.user.findFirst({
    where: { email: 'mentor.test@ait.edu' },
  });

  if (!mentor) {
    console.log('No mentor found');
    return;
  }

  // Find all interns in AIT
  const interns = await prisma.user.findMany({
    where: { institutionId: institution.id, role: 'INTERN' },
  });
  console.log(`Found ${interns.length} interns in AIT:`, interns.map(i => ({ name: `${i.firstName} ${i.lastName}`, email: i.email })));

  // Find all cohorts mentored by this mentor
  const cohorts = await prisma.internship.findMany({
    where: { mentorId: mentor.id },
    include: {
      intern: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { tasks: true, evaluations: true } },
    },
  });

  console.log(`Mentor ${mentor.firstName} ${mentor.lastName} mentors ${cohorts.length} cohorts:`);
  cohorts.forEach(c => {
    console.log(` - Cohort: "${c.title}" | Intern: ${c.intern ? `${c.intern.firstName} ${c.intern.lastName} (${c.intern.email})` : 'None'}`);
  });
}

checkAndSeedStudents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
