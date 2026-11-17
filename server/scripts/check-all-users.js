const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsersAndCohorts() {
  const users = await prisma.user.findMany({
    include: {
      institution: { select: { name: true, code: true } },
      mentoredInternships: {
        include: {
          intern: { select: { firstName: true, lastName: true, email: true } },
        },
      },
      internships: true,
    },
  });

  console.log(`Total users: ${users.length}`);
  users.forEach((u) => {
    console.log(`User: ${u.firstName} ${u.lastName} | Role: ${u.role} | Email: ${u.email} | Institution: ${u.institution?.code}`);
    if (u.role === 'MENTOR') {
      console.log(`  Mentored cohorts (${u.mentoredInternships.length}):`);
      u.mentoredInternships.forEach((c) => {
        console.log(`    - "${c.title}" | Intern: ${c.intern ? `${c.intern.firstName} ${c.intern.lastName} (${c.intern.email})` : 'None'}`);
      });
    }
  });
}

checkAllUsersAndCohorts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
