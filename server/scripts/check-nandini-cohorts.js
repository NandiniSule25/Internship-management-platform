const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNandiniCohorts() {
  const mentor = await prisma.user.findFirst({
    where: { email: '2ke23cs077@kleit.ac.in' },
    include: {
      mentoredInternships: true,
    },
  });

  console.log('Mentored cohorts:');
  mentor.mentoredInternships.forEach(c => {
    console.log(`- ID: ${c.id} | Title: "${c.title}" | Status: ${c.status} | InternID: ${c.internId}`);
  });
}

checkNandiniCohorts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
