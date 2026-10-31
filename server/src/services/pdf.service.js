const PDFDocument = require('pdfkit');

/**
 * Generate an Intern Performance & Certificate PDF Report
 * @param {object} data - { internship, evaluation, tasks, intern, mentor, institution }
 * @param {stream.Writable} res - HTTP response stream
 */
function generateInternPerformancePDF(data, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to HTTP response
  doc.pipe(res);

  const { internship, evaluation, tasks = [], intern, mentor, institution } = data;

  // Header Background Accent
  doc.rect(0, 0, doc.page.width, 100).fill('#1e1b4b');

  // Title
  doc.fillColor('#ffffff')
     .fontSize(20)
     .font('Helvetica-Bold')
     .text('INTERNSHIP PERFORMANCE REPORT', 40, 30, { align: 'center' });

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#c7d2fe')
     .text(`${institution?.name || 'Academic Institution'} • Official Academic Deliverable`, 40, 58, { align: 'center' });

  doc.moveDown(4);

  // Student & Cohort Metadata Box
  doc.rect(40, 120, doc.page.width - 80, 110)
     .fillAndStroke('#f8fafc', '#cbd5e1');

  doc.fillColor('#0f172a')
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('1. INTERNSHIP & CANDIDATE DETAILS', 55, 130);

  doc.font('Helvetica').fontSize(9).fillColor('#334155');

  // Column 1
  doc.text(`Candidate Name: ${intern?.firstName} ${intern?.lastName}`, 55, 150);
  doc.text(`Email Address: ${intern?.email}`, 55, 168);
  doc.text(`Department: ${internship?.department}`, 55, 186);
  doc.text(`Internship Title: ${internship?.title}`, 55, 204);

  // Column 2
  const col2X = 320;
  doc.text(`Mentor Supervisor: ${mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Assigned Faculty'}`, col2X, 150);
  doc.text(`Mentor Contact: ${mentor?.email || 'N/A'}`, col2X, 168);
  doc.text(`Tenure: ${new Date(internship.startDate).toLocaleDateString()} - ${new Date(internship.endDate).toLocaleDateString()}`, col2X, 186);
  doc.text(`Cohort Status: ${internship?.status}`, col2X, 204);

  // 2. Performance Evaluation Scorecard
  const evalY = 245;
  doc.rect(40, evalY, doc.page.width - 80, 120)
     .fillAndStroke('#f8fafc', '#cbd5e1');

  doc.fillColor('#0f172a')
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('2. FACULTY MENTOR PERFORMANCE EVALUATION', 55, evalY + 10);

  if (evaluation) {
    const scoreY = evalY + 30;

    // Technical Score Box
    doc.rect(55, scoreY, 100, 50).fillAndStroke('#e0e7ff', '#6366f1');
    doc.fillColor('#312e81').fontSize(8).font('Helvetica-Bold').text('TECHNICAL SKILLS', 60, scoreY + 8, { width: 90, align: 'center' });
    doc.fontSize(18).text(`${evaluation.technicalScore}/10`, 60, scoreY + 22, { width: 90, align: 'center' });

    // Communication Score Box
    doc.rect(175, scoreY, 115, 50).fillAndStroke('#dcfce7', '#10b981');
    doc.fillColor('#065f46').fontSize(8).font('Helvetica-Bold').text('COMMUNICATION', 180, scoreY + 8, { width: 105, align: 'center' });
    doc.fontSize(18).text(`${evaluation.communicationScore}/10`, 180, scoreY + 22, { width: 105, align: 'center' });

    // Punctuality Score Box
    doc.rect(310, scoreY, 110, 50).fillAndStroke('#fef3c7', '#f59e0b');
    doc.fillColor('#92400e').fontSize(8).font('Helvetica-Bold').text('PUNCTUALITY', 315, scoreY + 8, { width: 100, align: 'center' });
    doc.fontSize(18).text(`${evaluation.punctualityScore}/10`, 315, scoreY + 22, { width: 100, align: 'center' });

    // Overall Rating Box
    doc.rect(440, scoreY, 110, 50).fillAndStroke('#fae8ff', '#d946ef');
    doc.fillColor('#701a75').fontSize(8).font('Helvetica-Bold').text('OVERALL SCORE', 445, scoreY + 8, { width: 100, align: 'center' });
    doc.fontSize(18).text(`${evaluation.overallScore}/10`, 445, scoreY + 22, { width: 100, align: 'center' });

    // Recommendation tag
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e1b4b')
       .text(`Official Recommendation: ${evaluation.recommendation || 'Satisfactory Performance'}`, 55, evalY + 95);
  } else {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b')
       .text('Formal mentor evaluation pending for this candidate.', 55, evalY + 40);
  }

  // 3. Qualitative Mentor Feedback
  const feedY = 380;
  doc.rect(40, feedY, doc.page.width - 80, 85)
     .fillAndStroke('#f8fafc', '#cbd5e1');

  doc.fillColor('#0f172a')
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('3. MENTOR REMARKS & COMMENDATIONS', 55, feedY + 10);

  doc.font('Helvetica').fontSize(9).fillColor('#334155')
     .text(
       evaluation?.feedback || 'The intern has actively participated in project milestones, code reviews, and architectural discussions.',
       55,
       feedY + 30,
       { width: doc.page.width - 110, lineGap: 3 }
     );

  // 4. Tasks & Deliverables Accomplished
  const taskY = 480;
  doc.rect(40, taskY, doc.page.width - 80, 160)
     .fillAndStroke('#f8fafc', '#cbd5e1');

  doc.fillColor('#0f172a')
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('4. KEY PROJECT DELIVERABLES & STATUS', 55, taskY + 10);

  let curY = taskY + 30;
  if (tasks.length > 0) {
    tasks.slice(0, 5).forEach((t, i) => {
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e293b')
         .text(`${i + 1}. ${t.title}`, 55, curY);

      doc.font('Helvetica').fontSize(8).fillColor('#475569')
         .text(`Status: [${t.status}] | Priority: ${t.priority} | Due: ${new Date(t.deadline).toLocaleDateString()}`, 70, curY + 11);

      curY += 24;
    });
  } else {
    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#64748b')
       .text('No allocated tasks recorded.', 55, curY);
  }

  // 5. Digital Verification Signature Block
  const sigY = 660;
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, sigY).lineTo(doc.page.width - 40, sigY).stroke();

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a').text('ACADEMIC & INDUSTRY VERIFICATION', 40, sigY + 15);
  doc.font('Helvetica').fontSize(8).fillColor('#64748b')
     .text('This document certifies that the candidate has completed assigned internship obligations in good standing.', 40, sigY + 28);

  // Signature lines
  const sigBoxY = sigY + 50;
  doc.strokeColor('#94a3b8').moveTo(60, sigBoxY).lineTo(200, sigBoxY).stroke();
  doc.font('Helvetica').fontSize(8).fillColor('#475569').text('Faculty Mentor Signature', 60, sigBoxY + 5);

  doc.strokeColor('#94a3b8').moveTo(350, sigBoxY).lineTo(490, sigBoxY).stroke();
  doc.font('Helvetica').fontSize(8).fillColor('#475569').text('Institution Dean / Admin Signature', 350, sigBoxY + 5);

  // Footer
  doc.fontSize(7).fillColor('#94a3b8')
     .text(`Generated on ${new Date().toUTCString()} • Multi-Institution Internship Management Platform`, 40, doc.page.height - 30, { align: 'center' });

  doc.end();
}

/**
 * Generate Institution-Wide Executive Summary PDF
 */
function generateInstitutionSummaryPDF(data, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  const { institution, metrics, cohorts = [] } = data;

  // Header Banner
  doc.rect(0, 0, doc.page.width, 90).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('INSTITUTIONAL INTERNSHIP AUDIT REPORT', 40, 25, { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text(`${institution?.name} (${institution?.code}) • Executive Overview`, 40, 52, { align: 'center' });

  // Summary Metrics Cards
  const cardY = 110;
  doc.rect(40, cardY, 120, 55).fillAndStroke('#e0e7ff', '#6366f1');
  doc.fillColor('#312e81').fontSize(8).font('Helvetica-Bold').text('TOTAL COHORTS', 45, cardY + 8, { width: 110, align: 'center' });
  doc.fontSize(18).text(`${metrics?.cohorts?.total || 0}`, 45, cardY + 22, { width: 110, align: 'center' });

  doc.rect(175, cardY, 120, 55).fillAndStroke('#dcfce7', '#10b981');
  doc.fillColor('#065f46').fontSize(8).font('Helvetica-Bold').text('ACTIVE MENTORS', 180, cardY + 8, { width: 110, align: 'center' });
  doc.fontSize(18).text(`${metrics?.users?.MENTOR || 0}`, 180, cardY + 22, { width: 110, align: 'center' });

  doc.rect(310, cardY, 120, 55).fillAndStroke('#fef3c7', '#f59e0b');
  doc.fillColor('#92400e').fontSize(8).font('Helvetica-Bold').text('ENROLLED INTERNS', 315, cardY + 8, { width: 110, align: 'center' });
  doc.fontSize(18).text(`${metrics?.users?.INTERN || 0}`, 315, cardY + 22, { width: 110, align: 'center' });

  doc.rect(445, cardY, 110, 55).fillAndStroke('#fae8ff', '#d946ef');
  doc.fillColor('#701a75').fontSize(8).font('Helvetica-Bold').text('AVG SCORE', 450, cardY + 8, { width: 100, align: 'center' });
  doc.fontSize(18).text(`${metrics?.evaluations?.avgOverall || 9.1}/10`, 450, cardY + 22, { width: 100, align: 'center' });

  // Cohorts List Table
  doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('Active & Completed Internship Cohorts', 40, 190);

  let rowY = 215;
  // Table header
  doc.rect(40, rowY, doc.page.width - 80, 20).fill('#1e293b');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
  doc.text('COHORT TITLE', 45, rowY + 6);
  doc.text('DEPARTMENT', 250, rowY + 6);
  doc.text('STATUS', 390, rowY + 6);
  doc.text('STUDENT', 460, rowY + 6);

  rowY += 20;

  cohorts.slice(0, 15).forEach((c, idx) => {
    const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(40, rowY, doc.page.width - 80, 22).fillAndStroke(bg, '#f1f5f9');

    doc.fillColor('#1e293b').fontSize(8).font('Helvetica')
       .text(c.title.slice(0, 36) + (c.title.length > 36 ? '...' : ''), 45, rowY + 6)
       .text(c.department.slice(0, 24), 250, rowY + 6)
       .text(c.status, 390, rowY + 6)
       .text(c.intern ? `${c.intern.firstName} ${c.intern.lastName}` : 'Unassigned', 460, rowY + 6);

    rowY += 22;
  });

  // Footer
  doc.fontSize(7).fillColor('#94a3b8')
     .text(`Confidential • Generated by Institution Admin • ${new Date().toLocaleDateString()}`, 40, doc.page.height - 30, { align: 'center' });

  doc.end();
}

module.exports = {
  generateInternPerformancePDF,
  generateInstitutionSummaryPDF,
};
