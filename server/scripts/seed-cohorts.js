const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCohorts() {
  console.log('🌱 Seeding initial internship cohorts into PostgreSQL...');

  const institution = await prisma.institution.findFirst({
    where: { code: 'AIT' },
  });

  if (!institution) {
    console.error('❌ Institution AIT not found. Run seed:institutions first.');
    process.exit(1);
  }

  // Find mentor and intern
  const mentor = await prisma.user.findFirst({
    where: { email: 'mentor.test@ait.edu' },
  });

  const intern = await prisma.user.findFirst({
    where: { email: 'intern.test@ait.edu' },
  });

  if (!mentor || !intern) {
    console.error('❌ Sample mentor or intern not found. Run test:auth first.');
    process.exit(1);
  }

  const cohorts = [
    {
      title: 'Cloud Infrastructure & DevOps Internship',
      description: 'Hands-on enterprise cloud architecture, Docker containerization, CI/CD pipelines, and PostgreSQL database cluster optimization.',
      department: 'Computer Science & Engineering',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-15'),
      status: 'ACTIVE',
      institutionId: institution.id,
      mentorId: mentor.id,
      internId: intern.id,
    },
    {
      title: 'Full-Stack Web Development & Microservices',
      description: 'Design and implementation of React frontend and Node.js RESTful API services with JWT role-based authentication.',
      department: 'Software Engineering',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      status: 'ACTIVE',
      institutionId: institution.id,
      mentorId: mentor.id,
      internId: intern.id,
    },
    {
      title: 'Cybersecurity Threat Modeling & Penetration Testing',
      description: 'Security auditing, OWASP Top 10 mitigation, secure token validation, and automated vulnerability scanning.',
      department: 'Information Security',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-31'),
      status: 'COMPLETED',
      institutionId: institution.id,
      mentorId: mentor.id,
      internId: intern.id,
    },
  ];

  for (const c of cohorts) {
    const existing = await prisma.internship.findFirst({
      where: { title: c.title, institutionId: c.institutionId },
    });

    if (!existing) {
      const created = await prisma.internship.create({ data: c });
      console.log(`✅ Created cohort: "${created.title}" [${created.status}]`);
    } else {
      console.log(`ℹ️ Cohort already exists: "${existing.title}"`);
    }
  }

  console.log('🎉 Cohorts seeding completed!');
  await prisma.$disconnect();
}

seedCohorts().catch((err) => {
  console.error('Seed cohorts error:', err);
  process.exit(1);
});
