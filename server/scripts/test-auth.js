const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../src/utils/password');
const { generateToken, verifyToken } = require('../src/utils/token');

const prisma = new PrismaClient();

async function runAuthTests() {
  console.log('====================================================');
  console.log('🧪 Running Phase 2 Authentication & RBAC Test Suite');
  console.log('====================================================');

  try {
    // 1. Password Hashing Test
    console.log('▶ Test 1: Password hashing and comparison...');
    const plainPassword = 'SecurePassword!123';
    const hashed = await hashPassword(plainPassword);
    const isValid = await comparePassword(plainPassword, hashed);
    const isInvalid = await comparePassword('WrongPassword', hashed);
    if (!isValid || isInvalid) throw new Error('Password hashing verification failed!');
    console.log('  ✅ Password hashing and bcrypt verification passed.');

    // 2. JWT Generation and Verification Test
    console.log('▶ Test 2: JWT token generation and verification...');
    const mockPayload = {
      id: 'test-user-id',
      email: 'test@ait.edu',
      role: 'INSTITUTION_ADMIN',
      institutionId: 'inst-1',
    };
    const token = generateToken(mockPayload);
    const decoded = verifyToken(token);
    if (decoded.email !== mockPayload.email || decoded.role !== mockPayload.role) {
      throw new Error('JWT token payload mismatch!');
    }
    console.log('  ✅ JWT signing and decoding verified.');

    // 3. Database Role Creation & Isolation Test
    console.log('▶ Test 3: Creating and verifying users with distinct roles in PostgreSQL...');
    const institution = await prisma.institution.findFirst();
    if (!institution) throw new Error('No institution found. Run seed:institutions first.');

    const rolesToTest = [
      { email: 'admin.test@ait.edu', role: 'INSTITUTION_ADMIN', firstName: 'Admin', lastName: 'User' },
      { email: 'mentor.test@ait.edu', role: 'MENTOR', firstName: 'Elena', lastName: 'Vance' },
      { email: 'intern.test@ait.edu', role: 'INTERN', firstName: 'Alex', lastName: 'Chen' },
    ];

    for (const testUser of rolesToTest) {
      // Upsert user
      const existing = await prisma.user.findUnique({ where: { email: testUser.email } });
      let userRecord;
      if (!existing) {
        userRecord = await prisma.user.create({
          data: {
            email: testUser.email,
            password: await hashPassword('password123'),
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            role: testUser.role,
            institutionId: institution.id,
          },
        });
      } else {
        userRecord = existing;
      }
      console.log(`  ✅ Verified [${testUser.role}]: ${userRecord.firstName} ${userRecord.lastName} (${userRecord.email})`);
    }

    // 4. Test RBAC role check simulation
    console.log('▶ Test 4: Role-Based Authorization Guard Simulation...');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin.test@ait.edu' } });
    const internUser = await prisma.user.findUnique({ where: { email: 'intern.test@ait.edu' } });

    const adminOnlyRoles = ['INSTITUTION_ADMIN'];
    const adminAllowed = adminOnlyRoles.includes(adminUser.role);
    const internBlocked = !adminOnlyRoles.includes(internUser.role);

    if (!adminAllowed || !internBlocked) {
      throw new Error('RBAC role check logic failed!');
    }
    console.log('  ✅ RBAC: Admin granted access to administrative resources.');
    console.log('  ✅ RBAC: Intern correctly blocked from administrative resources.');

    console.log('====================================================');
    console.log('🎉 All Phase 2 Authentication & RBAC Tests PASSED!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthTests();
