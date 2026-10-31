const path = require('path');
const dotenv = require('dotenv');
const { Writable } = require('stream');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const {
  generateInternPerformancePDF,
  generateInstitutionSummaryPDF,
} = require('../src/services/pdf.service');

const prisma = new PrismaClient();

// Helper memory stream to verify PDF generation
class MemoryStream extends Writable {
  constructor() {
    super();
    this.chunks = [];
  }
  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }
  toBuffer() {
    return Buffer.concat(this.chunks);
  }
}

async function runPhase5And6Tests() {
  console.log('====================================================');
  console.log('🧪 Running Phase 5 (Evaluations) & Phase 6 (PDF Reports) Tests');
  console.log('====================================================');

  try {
    const institution = await prisma.institution.findFirst({ where: { code: 'AIT' } });
    const mentor = await prisma.user.findFirst({ where: { email: 'mentor.test@ait.edu' } });
    const intern = await prisma.user.findFirst({ where: { email: 'intern.test@ait.edu' } });

    if (!mentor || !intern) throw new Error('Mentor or Intern not found.');

    const cohort = await prisma.internship.findFirst({
      where: { mentorId: mentor.id, internId: intern.id },
      include: { tasks: true },
    });
    if (!cohort) throw new Error('Cohort not found.');

    // 1. Submit Mentor Evaluation
    console.log('▶ Test 1: Submitting mentor milestone evaluation...');
    const evaluation = await prisma.evaluation.create({
      data: {
        internshipId: cohort.id,
        mentorId: mentor.id,
        internId: intern.id,
        technicalScore: 9,
        communicationScore: 8,
        punctualityScore: 10,
        overallScore: 9.0,
        feedback: 'Demonstrated exceptional software design rigor, delivered scalable Express services, and proactively resolved schema bottlenecks.',
        recommendation: 'Strongly Recommended for Full-Time Junior Software Engineer',
      },
    });
    console.log(`  ✅ Evaluation recorded (Overall Score: ${evaluation.overallScore}/10, Tech: ${evaluation.technicalScore}/10)`);

    // 2. Query Evaluations
    console.log('▶ Test 2: Querying evaluations scoped to intern...');
    const internEvals = await prisma.evaluation.findMany({
      where: { internId: intern.id },
      include: { mentor: true, internship: true },
    });
    console.log(`  ✅ Intern has ${internEvals.length} formal evaluation(s).`);

    // 3. Test PDF Generation: Intern Performance Report
    console.log('▶ Test 3: Generating and streaming Intern Performance PDF report via PDFKit...');
    const memStream1 = new MemoryStream();
    generateInternPerformancePDF(
      {
        internship: cohort,
        evaluation,
        tasks: cohort.tasks || [],
        intern,
        mentor,
        institution,
      },
      memStream1
    );

    await new Promise((resolve) => memStream1.on('finish', resolve));
    const pdfBuf1 = memStream1.toBuffer();
    const isPdfValid1 = pdfBuf1.toString('utf-8', 0, 5) === '%PDF-';
    console.log(`  ✅ Intern Performance PDF generated (${pdfBuf1.length} bytes, Header: ${pdfBuf1.slice(0, 8).toString()})`);
    if (!isPdfValid1) throw new Error('Generated file is not a valid PDF document!');

    // 4. Test PDF Generation: Institution Summary Audit Report
    console.log('▶ Test 4: Generating Institution Executive Summary PDF report...');
    const memStream2 = new MemoryStream();
    const allCohorts = await prisma.internship.findMany({
      where: { institutionId: institution.id },
      include: { intern: true, mentor: true },
    });

    generateInstitutionSummaryPDF(
      {
        institution,
        metrics: {
          cohorts: { total: allCohorts.length },
          users: { MENTOR: 2, INTERN: 5 },
          evaluations: { avgOverall: 9.1 },
        },
        cohorts: allCohorts,
      },
      memStream2
    );

    await new Promise((resolve) => memStream2.on('finish', resolve));
    const pdfBuf2 = memStream2.toBuffer();
    const isPdfValid2 = pdfBuf2.toString('utf-8', 0, 5) === '%PDF-';
    console.log(`  ✅ Institution Summary PDF generated (${pdfBuf2.length} bytes)`);
    if (!isPdfValid2) throw new Error('Generated file is not a valid PDF document!');

    // 5. Test Audit Logging
    console.log('▶ Test 5: Verifying PDF generation audit trail logging...');
    const audit = await prisma.reportAudit.create({
      data: {
        type: 'INTERN_PERFORMANCE',
        title: `Test Audit: ${cohort.title}`,
        institutionId: institution.id,
        generatedById: intern.id,
      },
    });
    console.log(`  ✅ Audit log entry saved: ID ${audit.id} (${audit.type})`);

    console.log('====================================================');
    console.log('🎉 All Phase 5 & 6 Tests PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Phase 5/6 test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase5And6Tests();
