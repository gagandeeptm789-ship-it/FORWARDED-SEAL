import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { VerificationRecord, DocumentRecord, ModuleFailureDetails } from '../db/database.ts';

export async function generateVerificationReportPdf(
  report: VerificationRecord,
  registeredDoc?: Partial<DocumentRecord> | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.setTitle(`Verification Report - ${report.id}`);
  pdfDoc.setAuthor('The Forwarded Seal');
  pdfDoc.setSubject(`Document Verification Audit Certificate for ${report.id}`);
  pdfDoc.setCreator('The Forwarded Seal Authenticity Engine');

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const colors = {
    navyDark: rgb(0.04, 0.08, 0.16),
    slate900: rgb(0.08, 0.12, 0.2),
    slate700: rgb(0.25, 0.32, 0.42),
    slate500: rgb(0.45, 0.52, 0.62),
    slate300: rgb(0.78, 0.83, 0.89),
    slate200: rgb(0.88, 0.91, 0.95),
    slate100: rgb(0.95, 0.96, 0.98),
    white: rgb(1, 1, 1),
    emeraldDark: rgb(0.02, 0.45, 0.32),
    emeraldBg: rgb(0.92, 0.98, 0.94),
    emeraldBorder: rgb(0.5, 0.85, 0.65),
    roseDark: rgb(0.78, 0.1, 0.18),
    roseBg: rgb(0.99, 0.92, 0.94),
    roseBorder: rgb(0.95, 0.6, 0.65),
    amberDark: rgb(0.72, 0.42, 0.02),
    amberBg: rgb(0.99, 0.97, 0.9),
    amberBorder: rgb(0.94, 0.78, 0.45),
    tealPrimary: rgb(0.05, 0.58, 0.53)
  };

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const pages: PDFPage[] = [currentPage];

  const ensureSpace = (neededHeight: number): void => {
    if (y - neededHeight < margin + 35) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      pages.push(currentPage);
      y = pageHeight - margin - 20;
      drawMiniHeader();
    }
  };

  const drawMiniHeader = (): void => {
    currentPage.drawText('THE FORWARDED SEAL · AUDIT CERTIFICATE', {
      x: margin,
      y: pageHeight - 30,
      size: 8,
      font: fontBold,
      color: colors.slate500
    });
    currentPage.drawText(`REF: ${report.id}`, {
      x: pageWidth - margin - 110,
      y: pageHeight - 30,
      size: 8,
      font: fontMono,
      color: colors.slate500
    });
    currentPage.drawLine({
      start: { x: margin, y: pageHeight - 35 },
      end: { x: pageWidth - margin, y: pageHeight - 35 },
      thickness: 0.5,
      color: colors.slate200
    });
  };

  const wrapText = (text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] => {
    if (!text) return [];
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Header Box
  currentPage.drawRectangle({
    x: margin,
    y: y - 55,
    width: contentWidth,
    height: 55,
    color: colors.slate100,
    borderColor: colors.slate200,
    borderWidth: 1
  });

  currentPage.drawText('THE FORWARDED SEAL', {
    x: margin + 14,
    y: y - 22,
    size: 15,
    font: fontBold,
    color: colors.navyDark
  });

  currentPage.drawText('Official Digital Document Authentication & Forensic Audit Report', {
    x: margin + 14,
    y: y - 38,
    size: 8.5,
    font: fontRegular,
    color: colors.slate700
  });

  const dateStr = new Date(report.verifiedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  currentPage.drawText(`REPORT ID: ${report.id}`, {
    x: pageWidth - margin - 170,
    y: y - 22,
    size: 8.5,
    font: fontMono,
    color: colors.slate900
  });

  currentPage.drawText(`VERIFIED: ${dateStr}`, {
    x: pageWidth - margin - 170,
    y: y - 36,
    size: 7.5,
    font: fontRegular,
    color: colors.slate500
  });

  y -= 70;

  // Primary Verdict
  const isGenuine = report.finalClassification === 'GENUINE';
  const isSuspicious = report.finalClassification === 'SUSPICIOUS' || report.finalClassification === 'MODIFIED';
  const isUnverified = report.finalClassification === 'UNVERIFIED';

  const verdictHeadline = report.headline || (
    isGenuine
      ? 'VERIFIED AGAINST ALL SEVEN CHECKS'
      : isSuspicious
      ? 'NOT GENUINE / SUSPICIOUS'
      : isUnverified
      ? 'UNVERIFIED'
      : 'IRRELEVANT DOCUMENT'
  );

  const verdictBg = isGenuine ? colors.emeraldBg : isSuspicious ? colors.roseBg : colors.amberBg;
  const verdictBorder = isGenuine ? colors.emeraldBorder : isSuspicious ? colors.roseBorder : colors.amberBorder;
  const verdictTextCol = isGenuine ? colors.emeraldDark : isSuspicious ? colors.roseDark : colors.amberDark;

  const resultSentence = report.aiExplanation?.overallResult || (
    isGenuine
      ? 'The document appears genuine based on the checks performed. Its reference number, dates, text structure, and formatting are consistent with official records.'
      : isSuspicious
      ? 'The document contains confirmed inconsistencies, signature failures, or modifications compared to official institutional records.'
      : isUnverified
      ? 'The document could not be completely verified because one or more cryptographic or forensic checks were inconclusive or skipped.'
      : 'This file appears to be an unrelated document or image rather than an official institutional circular.'
  );

  const sentenceLines = wrapText(resultSentence, contentWidth - 28, fontRegular, 9);
  const bannerHeight = 36 + sentenceLines.length * 12;

  currentPage.drawRectangle({
    x: margin,
    y: y - bannerHeight,
    width: contentWidth,
    height: bannerHeight,
    color: verdictBg,
    borderColor: verdictBorder,
    borderWidth: 1.5
  });

  currentPage.drawText(verdictHeadline, {
    x: margin + 14,
    y: y - 18,
    size: 11,
    font: fontBold,
    color: verdictTextCol
  });

  sentenceLines.forEach((line, idx) => {
    currentPage.drawText(line, {
      x: margin + 14,
      y: y - 32 - idx * 12,
      size: 9,
      font: fontRegular,
      color: colors.slate900
    });
  });

  y -= bannerHeight + 14;

  // Metadata Grid
  currentPage.drawText('DOCUMENT REFERENCE & METADATA', {
    x: margin,
    y: y - 2,
    size: 8.5,
    font: fontBold,
    color: colors.slate700
  });

  y -= 10;

  const metaBoxHeight = 54;
  currentPage.drawRectangle({
    x: margin,
    y: y - metaBoxHeight,
    width: contentWidth,
    height: metaBoxHeight,
    color: colors.white,
    borderColor: colors.slate200,
    borderWidth: 1
  });

  const docTitle = registeredDoc?.title || report.aiExplanation?.documentDetails?.title || 'Notice Title Unindexed';
  const docOrg = registeredDoc?.issuingAuthority || report.aiExplanation?.documentDetails?.organization || 'Grand Metropolitan University';
  const docRef = registeredDoc?.referenceNumber || report.aiExplanation?.documentDetails?.referenceNumber || 'Not Detected';
  const docDate = registeredDoc?.issueDate || report.aiExplanation?.documentDetails?.issueDate || 'Not Specified';
  const docCategory = registeredDoc?.category || report.aiExplanation?.documentDetails?.category || 'Institutional Notice';

  currentPage.drawText('Document Title:', { x: margin + 12, y: y - 16, size: 7.5, font: fontBold, color: colors.slate500 });
  const titleLine = wrapText(docTitle, 220, fontBold, 8.5)[0] || docTitle;
  currentPage.drawText(titleLine, { x: margin + 12, y: y - 27, size: 8.5, font: fontBold, color: colors.slate900 });

  currentPage.drawText('Issuing Body:', { x: margin + 12, y: y - 40, size: 7.5, font: fontBold, color: colors.slate500 });
  currentPage.drawText(docOrg, { x: margin + 70, y: y - 40, size: 8, font: fontRegular, color: colors.slate900 });

  currentPage.drawText('Ref Number:', { x: margin + 260, y: y - 16, size: 7.5, font: fontBold, color: colors.slate500 });
  currentPage.drawText(docRef, { x: margin + 325, y: y - 16, size: 8, font: fontMono, color: colors.slate900 });

  currentPage.drawText('Issue Date:', { x: margin + 260, y: y - 28, size: 7.5, font: fontBold, color: colors.slate500 });
  currentPage.drawText(docDate, { x: margin + 325, y: y - 28, size: 8, font: fontRegular, color: colors.slate900 });

  currentPage.drawText('Category:', { x: margin + 260, y: y - 40, size: 7.5, font: fontBold, color: colors.slate500 });
  currentPage.drawText(docCategory, { x: margin + 325, y: y - 40, size: 8, font: fontRegular, color: colors.slate900 });

  y -= metaBoxHeight + 14;

  // Confirmed Failure Details
  const failureDetailsList: ModuleFailureDetails[] = report.failureDetailsList || [];

  if (failureDetailsList.length > 0) {
    ensureSpace(40);
    currentPage.drawText(`CONFIRMED INTEGRITY / AUTHENTICITY FAILURES (${failureDetailsList.length} MODULES FAILED)`, {
      x: margin,
      y: y - 2,
      size: 8.5,
      font: fontBold,
      color: colors.roseDark
    });
    y -= 12;

    for (const fail of failureDetailsList) {
      const whyLines = wrapText(fail.whySuspicious, contentWidth - 28, fontRegular, 8);
      const actionLines = wrapText(fail.recommendedAction, contentWidth - 28, fontRegular, 8);
      const cardHeight = 56 + (whyLines.length + actionLines.length) * 10;

      ensureSpace(cardHeight + 8);

      currentPage.drawRectangle({
        x: margin,
        y: y - cardHeight,
        width: contentWidth,
        height: cardHeight,
        color: colors.roseBg,
        borderColor: colors.roseBorder,
        borderWidth: 1
      });

      currentPage.drawText(`[FAIL] ${fail.moduleName}`, {
        x: margin + 12,
        y: y - 14,
        size: 9,
        font: fontBold,
        color: colors.roseDark
      });

      currentPage.drawText(`Expected: ${fail.expected}`, {
        x: margin + 12,
        y: y - 26,
        size: 8,
        font: fontRegular,
        color: colors.slate700
      });

      currentPage.drawText(`Detected: ${fail.detected}`, {
        x: margin + 12,
        y: y - 37,
        size: 8,
        font: fontBold,
        color: colors.roseDark
      });

      let subY = y - 48;
      whyLines.forEach(line => {
        currentPage.drawText(`Analysis: ${line}`, {
          x: margin + 12,
          y: subY,
          size: 7.5,
          font: fontRegular,
          color: colors.slate900
        });
        subY -= 9.5;
      });

      actionLines.forEach(line => {
        currentPage.drawText(`Action: ${line}`, {
          x: margin + 12,
          y: subY,
          size: 7.5,
          font: fontBold,
          color: colors.tealPrimary
        });
        subY -= 9.5;
      });

      y -= cardHeight + 8;
    }
  }

  // 7 Forensic Modules
  ensureSpace(40);
  currentPage.drawText('THE 7 FORENSIC MODULES AUDIT TRAIL', {
    x: margin,
    y: y - 2,
    size: 8.5,
    font: fontBold,
    color: colors.slate700
  });
  y -= 12;

  const modules = [
    { name: '1. Ed25519 Cryptographic Signature', check: report.checkResults?.cryptographic },
    { name: '2. SHA-256 Binary Integrity', check: report.checkResults?.fileIntegrity },
    { name: '3. QR Code Authentication Seal', check: report.checkResults?.qrVerification },
    { name: '4. Digital Watermark Carrier', check: report.checkResults?.watermarkVerification },
    { name: '5. OCR Semantic Comparison', check: report.checkResults?.ocrComparison },
    { name: '6. Image Pixel Forensics', check: report.checkResults?.imageForensics },
    { name: '7. Institutional Revocation Status', check: report.checkResults?.revocationStatus }
  ];

  for (const mod of modules) {
    const status = mod.check?.status || 'SKIPPED';
    const explanation = mod.check?.explanation || mod.check?.details || 'Check completed.';
    const expLines = wrapText(explanation, contentWidth - 110, fontRegular, 8);
    const rowHeight = Math.max(22, 14 + expLines.length * 9.5);

    ensureSpace(rowHeight + 3);

    const isFail = status === 'FAIL';
    const isPass = status === 'PASS';

    const rowBg = isFail ? colors.roseBg : isPass ? colors.white : colors.slate100;
    const rowBorder = isFail ? colors.roseBorder : colors.slate200;

    currentPage.drawRectangle({
      x: margin,
      y: y - rowHeight,
      width: contentWidth,
      height: rowHeight,
      color: rowBg,
      borderColor: rowBorder,
      borderWidth: 0.5
    });

    currentPage.drawText(mod.name, {
      x: margin + 8,
      y: y - 13,
      size: 8,
      font: fontBold,
      color: colors.slate900
    });

    const badgeText = status;
    const badgeColor = isPass ? colors.emeraldDark : isFail ? colors.roseDark : colors.amberDark;
    currentPage.drawText(`[${badgeText}]`, {
      x: margin + 210,
      y: y - 13,
      size: 7.5,
      font: fontBold,
      color: badgeColor
    });

    expLines.forEach((line, lIdx) => {
      currentPage.drawText(line, {
        x: margin + 280,
        y: y - 13 - lIdx * 9.5,
        size: 7.5,
        font: fontRegular,
        color: colors.slate700
      });
    });

    y -= rowHeight + 3;
  }

  y -= 8;

  // Advisory Box
  ensureSpace(70);
  const whatItMeans = report.aiExplanation?.whatItMeans || (
    isGenuine
      ? 'This notice corresponds to an authentic circular published by the institution. All seven cryptographic and forensic checks confirmed its validity without alteration.'
      : isSuspicious
      ? 'This document contains confirmed differences from official university records or has failed security checks. It may be altered, forged, or revoked. Do not rely on dates or instructions without direct verification.'
      : 'The authenticity of this document could not be established with certainty. Some verification checks could not run or returned inconclusive results. It cannot be treated as genuine.'
  );

  const meanLines = wrapText(whatItMeans, contentWidth - 20, fontRegular, 8);
  const advBoxHeight = 24 + meanLines.length * 10;

  currentPage.drawRectangle({
    x: margin,
    y: y - advBoxHeight,
    width: contentWidth,
    height: advBoxHeight,
    color: colors.slate100,
    borderColor: colors.slate200,
    borderWidth: 1
  });

  currentPage.drawText('FORENSIC ADVISORY & RECOMMENDATION', {
    x: margin + 10,
    y: y - 13,
    size: 8,
    font: fontBold,
    color: colors.slate700
  });

  meanLines.forEach((line, idx) => {
    currentPage.drawText(line, {
      x: margin + 10,
      y: y - 24 - idx * 10,
      size: 8,
      font: fontRegular,
      color: colors.slate900
    });
  });

  pages.forEach((page, pageIndex) => {
    page.drawLine({
      start: { x: margin, y: 32 },
      end: { x: pageWidth - margin, y: 32 },
      thickness: 0.5,
      color: colors.slate200
    });

    page.drawText('The Forwarded Seal · Strict Authenticity Engine · Tamper-Evident Forensic Audit Record', {
      x: margin,
      y: 22,
      size: 7,
      font: fontRegular,
      color: colors.slate500
    });

    page.drawText(`Page ${pageIndex + 1} of ${pages.length}`, {
      x: pageWidth - margin - 50,
      y: 22,
      size: 7,
      font: fontRegular,
      color: colors.slate500
    });
  });

  return await pdfDoc.save();
}
