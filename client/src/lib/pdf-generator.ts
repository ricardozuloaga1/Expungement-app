import jsPDF from 'jspdf';
import type { EligibilityResult, User } from "@shared/schema";

export function generatePDFReport(result: EligibilityResult, user: User) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  
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

  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NY MARIJUANA RECORD EXPUNGEMENT', 20, 18);
  doc.text('ELIGIBILITY REPORT', 20, 28);
  
  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  // Report metadata
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  addText(`Generated on: ${reportDate}`, 10);
  addText(`Report ID: ER-${result.id}-${Date.now().toString().slice(-6)}`, 10);
  yPosition += 10;

  // User Information
  addText('CLIENT INFORMATION', 14, true);
  addText(`Name: ${user.firstName} ${user.lastName}`, 12);
  addText(`Email: ${user.email}`, 12);
  yPosition += 10;

  // Eligibility Status - Main Result
  addText('ELIGIBILITY DETERMINATION', 14, true);
  
  const eligibilityDetails = result.eligibilityDetails as any || {};
  const status = getEligibilityStatus(result);
  
  doc.setFillColor(getStatusColor(status).r, getStatusColor(status).g, getStatusColor(status).b);
  doc.rect(20, yPosition - 5, pageWidth - 40, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(status.toUpperCase(), 25, yPosition + 8);
  doc.setTextColor(0, 0, 0);
  yPosition += 35;

  // Primary reason
  if (eligibilityDetails.primaryReason) {
    addText('Primary Finding:', 12, true);
    addText(eligibilityDetails.primaryReason, 12, false, 10);
  }

  // Secondary details
  if (eligibilityDetails.secondaryReasons && eligibilityDetails.secondaryReasons.length > 0) {
    addText('Additional Details:', 12, true);
    eligibilityDetails.secondaryReasons.forEach((reason: string) => {
      addText(`• ${reason}`, 11, false, 10);
    });
  }

  yPosition += 10;

  // Applicable Laws
  addText('APPLICABLE LAWS', 14, true);
  if (eligibilityDetails.mrtaApplicable) {
    addText('• Marijuana Regulation and Taxation Act (MRTA) 2021', 11, false, 10);
  }
  if (eligibilityDetails.cleanSlateApplicable) {
    addText('• Clean Slate Act 2024', 11, false, 10);
  }
  if (eligibilityDetails.petitionApplicable) {
    addText('• Criminal Procedure Law § 160.59 (Petition-Based Sealing)', 11, false, 10);
  }
  yPosition += 10;

  // Recommendations
  const recommendations = result.recommendations as any[] || [];
  if (recommendations.length > 0) {
    addText('RECOMMENDED NEXT STEPS', 14, true);
    
    recommendations.forEach((rec, index) => {
      addText(`${index + 1}. ${rec.title}`, 12, true, 10);
      addText(rec.description, 11, false, 20);
      if (rec.timeline) {
        addText(`Timeline: ${rec.timeline}`, 10, false, 20);
      }
      yPosition += 5;
    });
  }

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
