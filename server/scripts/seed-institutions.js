const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialInstitutions = [
  {
    name: 'Apex Institute of Technology',
    code: 'AIT',
    contactEmail: 'admin@ait.edu',
    phone: '+1 (555) 234-5678',
    address: '100 Innovation Way, Tech Park',
    website: 'https://ait.edu',
  },
  {
    name: 'Metropolitan State University',
    code: 'MSU',
    contactEmail: 'internships@metro-univ.edu',
    phone: '+1 (555) 876-5432',
    address: '450 University Ave, City Center',
    website: 'https://metro-univ.edu',
  },
  {
    name: 'CyberTech Polytechnic Institute',
    code: 'CPI',
    contactEmail: 'careers@cybertech.ac.in',
    phone: '+91 22 2576 0000',
    address: 'Knowledge Park, Silicon Corridor',
    website: 'https://cybertech.ac.in',
  },
];

async function seed() {
  console.log('🌱 Seeding initial institutions in PostgreSQL...');
  for (const inst of initialInstitutions) {
    const existing = await prisma.institution.findUnique({
      where: { code: inst.code },
    });
    if (!existing) {
      const created = await prisma.institution.create({ data: inst });
      console.log(`✅ Created institution: ${created.name} (${created.code})`);
    } else {
      console.log(`ℹ️ Institution already exists: ${existing.name} (${existing.code})`);
    }
  }
  console.log('🎉 Seeding completed!');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
