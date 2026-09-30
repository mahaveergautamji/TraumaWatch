import jsPDF from 'jspdf';
import { SurvivorProfile, RiskAnalysis } from '../types';

/**
 * Generates a clean, clinical-grade multi-page/single-page PDF summary report
 * of a survivor's 28-day distress trajectory and clinical case notes.
 */
export function generateSurvivorPdfReport(
  profile: SurvivorProfile,
  analysis: RiskAnalysis
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Bar
  doc.setFillColor(15, 118, 110); // Teal 700 (#0f766e)
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TraumaWatch · Clinical Trajectory Summary Report', margin, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Smart India Hackathon Prototype · Confidential Clinical Review · Zero PII', margin, 47);

  // Export Date / Timestamp on right
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - margin, 38, { align: 'right' });

  let y = 80;

  // Case Overview Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, y, contentWidth, 75, 6, 6, 'FD');

  // Case Identifier & Badges
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`Case Identifier: ${profile.id}`, margin + 14, y + 22);

  // Status Badge
  const isHigh = analysis.tier === 'High';
  const isMod = analysis.tier === 'Moderate';
  const badgeColor = isHigh ? [225, 29, 72] : isMod ? [217, 119, 6] : [13, 148, 136];
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(margin + 175, y + 10, 85, 16, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${analysis.tier.toUpperCase()} PRIORITY`, margin + 217, y + 21, { align: 'center' });

  if (analysis.isRapidDeterioration) {
    doc.setFillColor(190, 18, 60);
    doc.roundedRect(margin + 268, y + 10, 125, 16, 4, 4, 'F');
    doc.text('RAPID DETERIORATION', margin + 330, y + 21, { align: 'center' });
  }

  // Case Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Cohort / Context: ${profile.contextTag}`, margin + 14, y + 42);
  doc.text(`Assigned Counsellor: ${profile.assignedCounsellor}`, margin + 14, y + 56);
  doc.text(
    `Review Status: ${profile.isReviewed ? 'Reviewed by Clinician' : 'Pending Review'}  |  Escalation: ${
      profile.isEscalated ? 'Active Flag' : 'None'
    }`,
    margin + 14,
    y + 68
  );

  y += 90;

  // Algorithmic Trajectory Breakdown Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Algorithmic Trajectory Evaluation & Baselines', margin, y);
  y += 12;

  // 4 metric cards
  const cardW = (contentWidth - 18) / 4;
  const metrics = [
    { label: 'Risk Score', val: `${analysis.riskScore}/100`, sub: `${analysis.tier} Priority` },
    { label: 'Personal Baseline', val: `${analysis.baselineMean.toFixed(1)}/20`, sub: 'Days 1-7 Mean' },
    {
      label: 'Early Warning',
      val: `${analysis.earlyWarning ? analysis.earlyWarning.spikeProbability + '%' : 'N/A'}`,
      sub: analysis.earlyWarning?.isTriggered ? `${analysis.earlyWarning.warningLevel} Spike Risk` : 'Nominal Risk',
    },
    {
      label: '7-Day Delta (Slope)',
      val: `${analysis.rateOfChange > 0 ? '+' : ''}${analysis.rateOfChange}`,
      sub: analysis.isRapidDeterioration ? 'Acute Slope' : 'Stable Rate',
    },
  ];

  metrics.forEach((m, idx) => {
    const cardX = margin + idx * (cardW + 6);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, y, cardW, 46, 4, 4, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cardX + 8, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, cardX + 8, y + 29);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(m.sub, cardX + 8, y + 40);
  });

  y += 56;

  // Clinical Justification
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 30, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('CLINICAL JUSTIFICATION (WHY FLAGGED):', margin + 10, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const splitWhy = doc.splitTextToSize(analysis.whyFlaggedSummary, contentWidth - 20);
  doc.text(splitWhy, margin + 10, y + 22);

  y += 38;

  // Baseline Calibration vs Current Insights Box
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(254, 240, 138); // amber-200
  doc.roundedRect(margin, y, contentWidth, 36, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(161, 98, 7); // amber-700
  doc.text('BASELINE DIVERGENCE & METRIC INSIGHTS:', margin + 10, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  let insightLine = `Overall: ${analysis.insights.overallNarrative}`;
  if (analysis.insights.mostDeteriorated) {
    insightLine += ` | Deteriorated: ${analysis.insights.mostDeteriorated.label} (+${analysis.insights.mostDeteriorated.delta})`;
  }
  if (analysis.insights.mostImproved) {
    insightLine += ` | Improved: ${analysis.insights.mostImproved.label} (${analysis.insights.mostImproved.delta})`;
  }
  const splitInsight = doc.splitTextToSize(insightLine, contentWidth - 20);
  doc.text(splitInsight, margin + 10, y + 22);

  y += 44;

  // 2. 28-Day Longitudinal Progression (ASCII/Vector Chart in PDF)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. 28-Day Distress Progression Chart (Personal Baseline vs. Actuals)', margin, y);
  y += 12;

  const chartH = 95;
  const chartW = contentWidth;
  const maxScore = 20;

  // Draw chart border & background
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, chartW, chartH, 4, 4, 'FD');

  // Baseline Shading for Days 1-7
  const baselineZoneW = (6 / 27) * (chartW - 50);
  doc.setFillColor(240, 253, 250);
  doc.rect(margin + 40, y + 6, baselineZoneW, chartH - 24, 'F');

  // Y axis grid lines
  const yVals = [0, 5, 10, 15, 20];
  yVals.forEach((val) => {
    const gridY = y + chartH - 18 - (val / maxScore) * (chartH - 24);
    doc.setDrawColor(241, 245, 249);
    doc.line(margin + 36, gridY, margin + chartW - 10, gridY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`${val}`, margin + 30, gridY + 2.5, { align: 'right' });
  });

  // Baseline reference dashed line
  const baseLineY = y + chartH - 18 - (analysis.baselineMean / maxScore) * (chartH - 24);
  doc.setDrawColor(13, 148, 136);
  doc.setLineDashPattern([3, 2], 0);
  doc.line(margin + 40, baseLineY, margin + chartW - 10, baseLineY);
  doc.setLineDashPattern([], 0); // reset

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(13, 148, 136);
  doc.text(`Baseline (${analysis.baselineMean.toFixed(1)})`, margin + chartW - 12, baseLineY - 3, {
    align: 'right',
  });

  // Draw trajectory line points
  const points: { x: number; y: number }[] = profile.history.map((entry, idx) => {
    const px = margin + 40 + (idx / (profile.history.length - 1)) * (chartW - 55);
    const total = entry.mood + entry.sleep + entry.tension + entry.withdrawal + entry.intrusions;
    const py = y + chartH - 18 - (total / maxScore) * (chartH - 24);
    return { x: px, y: py };
  });

  // Plot line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.5);
  for (let i = 0; i < points.length - 1; i++) {
    doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }

  // Draw point circles
  points.forEach((pt, idx) => {
    const isToday = idx === points.length - 1;
    doc.setFillColor(isToday ? 225 : 255, isToday ? 29 : 255, isToday ? 72 : 255);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.circle(pt.x, pt.y, isToday ? 2.5 : 1.5, 'FD');
  });

  // X Axis Day labels
  [0, 7, 14, 21, 27].forEach((idx) => {
    if (points[idx]) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`D${idx + 1}`, points[idx].x, y + chartH - 6, { align: 'center' });
    }
  });

  y += chartH + 16;

  // 3. Explainable Risk Attribution (SHAP Decomposition)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Explainable Signal Attribution (SHAP-Style Factor Drivers)', margin, y);
  y += 12;

  analysis.contributions.forEach((contrib) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(contrib.label, margin, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const deltaStr = contrib.deltaVsBaseline > 0 ? `+${contrib.deltaVsBaseline}` : `${contrib.deltaVsBaseline}`;
    doc.text(`(${deltaStr} vs baseline)`, margin + 140, y + 8);

    // Attribution percentage bar
    const barX = margin + 210;
    const maxBarW = 160;
    const barW = (contrib.contributionPct / 100) * maxBarW;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(barX, y, maxBarW, 10, 2, 2, 'F');

    const barColor = contrib.contributionPct >= 30 ? [225, 29, 72] : contrib.contributionPct >= 20 ? [217, 119, 6] : [13, 148, 136];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(barX, y, Math.max(4, barW), 10, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${contrib.contributionPct}%`, barX + maxBarW + 8, y + 8);

    // Clinical insight text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(contrib.clinicalInsight, margin, y + 20);

    y += 26;
  });

  y += 6;

  // 4. Clinical Case Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Multidisciplinary Case Notes & Triage Actions', margin, y);
  y += 12;

  if (profile.clinicalNotes.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No clinical notes recorded yet for this profile.', margin, y + 10);
    y += 20;
  } else {
    profile.clinicalNotes.slice(0, 3).forEach((note) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 38, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`${note.author} · [${note.category.toUpperCase()}]`, margin + 8, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(note.timestamp, margin + contentWidth - 10, y + 12, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const splitContent = doc.splitTextToSize(note.content, contentWidth - 16);
      doc.text(splitContent, margin + 8, y + 24);

      y += 44;
    });
  }

  // Footer Disclaimers
  const footerY = pageHeight - 34;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'TraumaWatch: AI flags priority. A trained counsellor always makes final decisions. Not a diagnostic tool.',
    margin,
    footerY
  );
  doc.text(`Page 1 of 1 · ID: ${profile.id}`, pageWidth - margin, footerY, { align: 'right' });

  // Save the PDF
  const filename = `TraumaWatch_Report_${profile.id}_${dateStr.replace(/[\s,]+/g, '_')}.pdf`;
  doc.save(filename);
}
