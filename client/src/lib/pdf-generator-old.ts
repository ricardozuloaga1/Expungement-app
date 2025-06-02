import jsPDF from 'jspdf';
import type { EligibilityResult, User } from "@shared/schema";

function generateExecutiveSummary(result: EligibilityResult): string {
  if (result.automaticExpungement) {
    return "Based on the information you provided, you appear to be eligible for automatic expungement of your marijuana-related conviction under New York's Marihuana Regulation and Taxation Act (MRTA), enacted in 2021. Your conviction may have already been automatically expunged by the state, though verification with the court is recommended to obtain proper documentation.";
  } else if (result.petitionBasedSealing) {
    return "Based on your responses, you may be eligible for petition-based record sealing under New York Criminal Procedure Law § 160.59. This process requires filing a formal petition with the court and obtaining judicial approval, but offers significant benefits in limiting public access to your criminal record.";
  } else {
    return "Based on the information provided, you do not currently appear to qualify for automatic expungement or sealing under existing New York State laws. However, your eligibility may change over time as waiting periods are satisfied or new legislation is enacted. We recommend periodic reassessment of your status.";
  }
}

function generateStatutoryBasis(result: EligibilityResult, questionnaireData?: any): string {
  let basis = "";

  if (result.automaticExpungement) {
    basis = `Your marijuana-related conviction qualifies for automatic expungement under the Marihuana Regulation and Taxation Act (MRTA), specifically codified in New York Criminal Procedure Law § 160.50(3)(k). This provision mandates automatic expungement of convictions for unlawful possession of marihuana under Penal Law § 221.05, § 221.10, § 221.15, § 221.35, and § 221.40 that occurred prior to March 31, 2021.

The MRTA became effective on March 31, 2021, and required automatic expungement without the need for individual petitions or court appearances. Under CPL § 160.50(3)(k), qualifying records are automatically sealed and treated as if the arrest or conviction never occurred.`;
  } else if (result.petitionBasedSealing) {
    basis = `Your case appears to meet the criteria for petition-based sealing under New York Criminal Procedure Law § 160.59. This statute allows individuals to petition for sealing of criminal records where: (1) the individual has no more than two eligible convictions, (2) at least ten years have passed since the individual's last conviction or release from incarceration (whichever is later), and (3) the individual has no pending criminal charges.

CPL § 160.59 excludes certain serious offenses including sex offenses under Article 130 of the Penal Law and violent felony offenses as defined in CPL § 70.02. The statute provides discretionary relief, meaning the court will consider factors including the nature of the offense, the applicant's rehabilitation, and public safety considerations.`;
  } else {
    basis = `Based on current New York State law, your conviction does not qualify for automatic relief under the MRTA (CPL § 160.50(3)(k)) or the Clean Slate Act (CPL § 160.58). You may not currently meet the eligibility criteria for petition-based sealing under CPL § 160.59, which requires specific timing and conviction history requirements.

Future eligibility may be possible under the Clean Slate Act, which will automatically seal certain eligible convictions beginning November 16, 2024, provided waiting periods are satisfied and no disqualifying convictions exist.`;
  }

  return basis;
}

function generateFactualAnalysis(result: EligibilityResult, questionnaireData?: any): string {
  if (!questionnaireData) {
    return "Analysis based on assessment responses provided during eligibility questionnaire.";
  }

  let analysis = "Based on the information you provided during the assessment:\n\n";

  if (questionnaireData.convictionState) {
    analysis += `• Conviction Jurisdiction: ${questionnaireData.convictionState === 'ny' ? 'New York State' : questionnaireData.convictionState}\n`;
  }

  if (questionnaireData.offenseTypes) {
    const offenseTypes = Array.isArray(questionnaireData.offenseTypes) ? questionnaireData.offenseTypes : [questionnaireData.offenseTypes];
    analysis += `• Type of Conviction(s): ${offenseTypes.join(', ')}\n`;
  }

  if (questionnaireData.convictionYear) {
    analysis += `• Year of Conviction: ${questionnaireData.convictionYear}\n`;
  }

  if (questionnaireData.convictionLevel) {
    analysis += `• Conviction Level: ${questionnaireData.convictionLevel}\n`;
  }

  if (questionnaireData.otherConvictions) {
    analysis += `• Additional Convictions: ${questionnaireData.otherConvictions === 'no' ? 'None reported' : 'Yes'}\n`;
  }

  analysis += `\nConclusion: ${result.automaticExpungement ? 
    'This conviction profile matches the criteria for automatic expungement under MRTA.' :
    result.petitionBasedSealing ? 
    'This conviction profile appears eligible for petition-based sealing relief.' :
    'This conviction profile does not currently qualify for available relief mechanisms.'
  }`;

  return analysis;
}

function generateNextSteps(result: EligibilityResult): string {
  if (result.automaticExpungement) {
    return `1. REQUEST VERIFICATION: Contact the court clerk's office where you were convicted to confirm your record has been expunged and request documentation.

2. OBTAIN RAP SHEET: Request an updated criminal history record (RAP sheet) from the New York State Division of Criminal Justice Services to verify the expungement is reflected in state records.

3. BACKGROUND CHECK GUIDANCE: For employment or housing applications, you may legally answer "no" to questions about criminal convictions for expunged offenses.

4. LEGAL ASSISTANCE: If you encounter issues with the expungement not being properly reflected in records, consider consulting with an attorney who specializes in criminal record relief.`;
  } else if (result.petitionBasedSealing) {
    return `1. GATHER DOCUMENTATION: Collect all court documents related to your conviction(s), proof of sentence completion, and evidence of rehabilitation.

2. COMPLETE PETITION FORMS: Obtain and complete the required petition forms for record sealing from the court where you were convicted.

3. LEGAL ASSISTANCE RECOMMENDED: Given the discretionary nature of petition-based sealing, consider consulting with an attorney to strengthen your petition and improve chances of success.

4. FILE PETITION: Submit your completed petition with all supporting documentation to the appropriate court and pay any required filing fees.

5. COURT HEARING: Be prepared to attend a court hearing where a judge will consider your petition and any opposition from the prosecution.`;
  } else {
    return `1. MONITOR ELIGIBILITY: Check back periodically as your eligibility may change when waiting periods are satisfied or new laws are enacted.

2. CLEAN SLATE ACT: If you have eligible convictions, automatic sealing may begin on November 16, 2024, under the Clean Slate Act. Monitor your record status after this date.

3. MAINTAIN CLEAN RECORD: Avoid new convictions to preserve future eligibility for relief programs.

4. LEGAL CONSULTATION: Consider consulting with a criminal defense attorney to explore any alternative relief options specific to your circumstances.

5. STAY INFORMED: Keep informed about changes to New York expungement and sealing laws that may expand eligibility in the future.`;
  }
}

export function generatePDFReport(result: EligibilityResult, user: User, questionnaireData?: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Generate unique report ID
  const reportId = `NYR-${Date.now().toString(36).toUpperCase()}`;
  
  // Helper function to add text with wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const maxWidth = pageWidth - 40 - indent;
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20 + indent, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  // Professional Header with Logo Area
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('NY RECORD RELIEF', 20, 18);
  doc.setFontSize(14);
  doc.text('ELIGIBILITY ASSESSMENT REPORT', 20, 30);
  
  doc.setTextColor(0, 0, 0);
  yPosition = 55;

  // Report metadata in professional layout
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${reportId}`, 20, yPosition);
  doc.text(`Generated: ${reportDate}`, pageWidth - 80, yPosition);
  yPosition += 6;
  doc.text(`Client: ${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Anonymous', 20, yPosition);
  doc.text('Jurisdiction: New York State', pageWidth - 80, yPosition);
  yPosition += 12;

  // Professional divider line
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // SECTION 1: EXECUTIVE SUMMARY
  addText('EXECUTIVE SUMMARY', 14, true);
  const executiveSummary = generateExecutiveSummary(result);
  addText(executiveSummary, 11);
  yPosition += 10;

  // SECTION 2: STATUTORY BASIS FOR ELIGIBILITY
  addText('STATUTORY BASIS FOR ELIGIBILITY', 14, true);
  const statutoryBasis = generateStatutoryBasis(result, questionnaireData);
  addText(statutoryBasis, 11);
  yPosition += 10;

  // SECTION 3: ANALYSIS OF SUBMITTED INFORMATION
  addText('ANALYSIS OF SUBMITTED INFORMATION', 14, true);
  const factualAnalysis = generateFactualAnalysis(result, questionnaireData);
  addText(factualAnalysis, 11);
  yPosition += 10;

  // SECTION 4: RECOMMENDED NEXT STEPS
  addText('RECOMMENDED NEXT STEPS', 14, true);
  const nextSteps = generateNextSteps(result);
  addText(nextSteps, 11);

  // Legal Disclaimer
  yPosition += 15;
  addText('IMPORTANT LEGAL DISCLAIMER', 14, true);
  doc.setFillColor(245, 245, 245);
  const disclaimerY = yPosition - 5;
  
  const disclaimerText = "This report is for informational purposes only and does not constitute legal advice. Eligibility determinations are based on information provided and current understanding of New York State laws. Laws, procedures, and interpretations may change. Individual circumstances may affect eligibility. For definitive legal guidance and representation, consult with a qualified attorney licensed in New York State.";
  
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 50);
  doc.rect(20, disclaimerY, pageWidth - 40, disclaimerLines.length * 6 + 10, 'F');
  
  doc.setFontSize(10);
  disclaimerLines.forEach((line: string, index: number) => {
    doc.text(line, 25, yPosition + (index * 6));
  });
  yPosition += disclaimerLines.length * 6 + 20;

  // Footer information
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }
  
  addText('ABOUT THIS ANALYSIS', 12, true);
  addText('This analysis is based on the following New York State legislation:', 10);
  addText('• Marijuana Regulation and Taxation Act (MRTA) of 2021', 10, false, 10);
  addText('• Clean Slate Act of 2024 (effective November 2024)', 10, false, 10);
  addText('• Criminal Procedure Law § 160.59 (Record Sealing)', 10, false, 10);

  // Footer
  doc.setFillColor(41, 128, 185);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Generated by NY Expungement Helper', 20, pageHeight - 10);
  doc.text(`© ${new Date().getFullYear()} All rights reserved.`, pageWidth - 60, pageHeight - 10);

  // Download the PDF
  const fileName = `NY_Expungement_Report_${user.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function getEligibilityStatus(result: EligibilityResult): string {
  if (result.automaticExpungement) return 'Eligible for Automatic Expungement';
  if ((result as any).automaticSealing) return 'Eligible for Automatic Sealing';
  if (result.petitionBasedSealing) return 'Eligible for Petition-Based Sealing';
  return 'Not Currently Eligible';
}

function getStatusColor(status: string): {r: number, g: number, b: number} {
  if (status.includes('Automatic Expungement')) return {r: 34, g: 139, b: 34};  // Green
  if (status.includes('Automatic Sealing')) return {r: 65, g: 105, b: 225};    // Blue
  if (status.includes('Petition-Based')) return {r: 255, g: 140, b: 0};        // Orange
  return {r: 220, g: 20, b: 60};                                               // Red
}

// Future enhancement: Use a proper PDF library
export function generatePDFReportAdvanced(result: EligibilityResult, user: User) {
  // This would integrate with jsPDF or similar library for proper PDF generation
  // Implementation would include:
  // - Professional formatting with headers/footers
  // - Legal citations and references
  // - Charts and visual representations
  // - Branded styling
  // - Digital signatures
  console.log("Advanced PDF generation not yet implemented");
}
