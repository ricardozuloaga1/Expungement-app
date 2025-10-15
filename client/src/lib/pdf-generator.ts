import { jsPDF } from 'jspdf';
import type { EligibilityResult, User } from "@shared/schema";

function generateExecutiveSummary(result: EligibilityResult): string {
  // Clean Slate eligibility should be driven by explicit flags to avoid false positives
  const details = result.eligibilityDetails as any;
  const isCleanSlateEligible = !!details?.cleanSlateApplicable;
  
  if (result.automaticExpungement) {
    return "Based on the information you provided, you are eligible for automatic expungement of your marijuana-related conviction under New York's Marihuana Regulation and Taxation Act (MRTA), enacted in 2021. Your conviction should have already been automatically expunged by the state, though verification with the court is recommended to obtain proper documentation.";
  } else if (result.automaticSealing || isCleanSlateEligible) {
    return "Based on the information you provided, you are eligible for automatic sealing under New York's Clean Slate Act (CPL § 160.57). Your record will be automatically sealed without any action required on your part, effective November 16, 2024.";
  } else if (result.petitionBasedSealing) {
    return "Based on your responses, you may be eligible for petition-based record sealing under New York Criminal Procedure Law § 160.59. This process requires filing a formal petition with the court and obtaining judicial approval, but offers significant benefits in limiting public access to your criminal record.";
  } else {
    return "Based on the information provided, you do not currently qualify for automatic expungement or sealing under existing New York State laws. However, your eligibility may change over time as waiting periods are satisfied or new legislation is enacted. We recommend periodic reassessment of your status.";
  }
}

function generateStatutoryBasis(result: EligibilityResult, questionnaireData?: any): string {
  let basis = "";
  
  const details = result.eligibilityDetails as any;
  const isCleanSlateEligible = !!details?.cleanSlateApplicable;

  if (result.automaticExpungement) {
    basis = `Your marijuana-related conviction qualifies for automatic expungement under the Marihuana Regulation and Taxation Act (MRTA), specifically codified in New York Criminal Procedure Law § 160.50(3)(k). This provision mandates automatic expungement of convictions for unlawful possession of marihuana under Penal Law § 221.05, § 221.10, § 221.15, § 221.35, and § 221.40 that occurred prior to March 31, 2021.

The MRTA became effective on March 31, 2021, and required automatic expungement without the need for individual petitions or court appearances. Under CPL § 160.50(3)(k), qualifying records are automatically sealed and treated as if the arrest or conviction never occurred.`;
  } else if (result.automaticSealing || isCleanSlateEligible) {
    basis = `Your conviction qualifies for automatic sealing under New York's Clean Slate Act, codified in Criminal Procedure Law § 160.57. This statute provides for automatic sealing of eligible criminal convictions effective November 16, 2024. The Clean Slate Act covers misdemeanor convictions after 3 years and felony convictions after 8 years from sentence completion, provided certain conditions are met.

Under CPL § 160.57, qualifying records are automatically sealed without requiring individual petitions or court appearances. Once sealed, these records are not accessible to most employers or landlords, though certain exceptions exist for law enforcement and specific regulated industries.`;
  } else if (result.petitionBasedSealing) {
    basis = `Your case appears to meet the criteria for petition-based sealing under New York Criminal Procedure Law § 160.59. This statute allows individuals to petition for sealing of criminal records where: (1) the individual has no more than two eligible convictions, (2) at least ten years have passed since the individual's last conviction or release from incarceration (whichever is later), and (3) the individual has no pending criminal charges.

CPL § 160.59 excludes certain serious offenses including sex offenses under Article 130 of the Penal Law and violent felony offenses as defined in CPL § 70.02. The statute provides discretionary relief, meaning the court will consider factors including the nature of the offense, the applicant's rehabilitation, and public safety considerations.`;
  } else {
    basis = `Based on current New York State law, your conviction does not qualify for automatic relief under the MRTA (CPL § 160.50(3)(k)) or the Clean Slate Act (CPL § 160.57). You may not currently meet the eligibility criteria for petition-based sealing under CPL § 160.59, which requires specific timing and conviction history requirements.

Future eligibility may be possible under the Clean Slate Act, which will automatically seal certain eligible convictions beginning November 16, 2024, provided waiting periods are satisfied and no disqualifying convictions exist.`;
  }

  return basis;
}

function generateFactualAnalysis(result: EligibilityResult, questionnaireData?: any): string {
  if (!questionnaireData) {
    return "Analysis based on assessment responses provided during eligibility questionnaire.";
  }

  let analysis = "";

  // CASE PROFILE SECTION
  analysis += "CASE PROFILE:\n\n";

  // Basic conviction information
  if (questionnaireData.convictionState) {
    analysis += `Jurisdiction: ${questionnaireData.convictionState === 'ny' ? 'New York State' : questionnaireData.convictionState}\n`;
  }
  
  if (questionnaireData.convictionYear && questionnaireData.convictionMonth) {
    analysis += `Date of Conviction: ${getMonthName(questionnaireData.convictionMonth)} ${questionnaireData.convictionYear}\n`;
  } else if (questionnaireData.convictionYear) {
    analysis += `Year of Conviction: ${questionnaireData.convictionYear}\n`;
  }

  if (questionnaireData.offenseTypes) {
    const offenseTypes = Array.isArray(questionnaireData.offenseTypes) ? questionnaireData.offenseTypes : [questionnaireData.offenseTypes];
    analysis += `Offense Type(s): ${formatOffenseTypes(offenseTypes)}\n`;
  }

  if (questionnaireData.convictionLevel) {
    analysis += `Conviction Classification: ${questionnaireData.convictionLevel.charAt(0).toUpperCase() + questionnaireData.convictionLevel.slice(1)}\n`;
  }
  
  if (questionnaireData.penalCode) {
    analysis += `Penal Law Code: ${questionnaireData.penalCode}\n`;
  }
  
  // Time analysis
  if (questionnaireData.convictionYear) {
    const currentYear = new Date().getFullYear();
    const yearsElapsed = currentYear - parseInt(questionnaireData.convictionYear);
    analysis += `Time Elapsed Since Conviction: ${yearsElapsed} years\n`;
  }

  analysis += "\n";

  // Criminal history analysis
  if (questionnaireData.otherConvictions) {
    analysis += `Additional Criminal History: ${questionnaireData.otherConvictions === 'no' ? 'None reported' : 'Has other convictions'}\n`;
  }

  if (questionnaireData.onSupervision) {
    analysis += `Current Supervision Status: ${questionnaireData.onSupervision === 'no' ? 'Not under supervision' : 'Currently on probation/parole'}\n`;
  }
  
  analysis += "\n\n";
  
  // ELIGIBILITY PATHWAY ANALYSIS
  analysis += "ELIGIBILITY PATHWAY ANALYSIS:\n\n";
  
  if (result.automaticExpungement) {
    analysis += generateMRTAAnalysis(questionnaireData);
  } else if (result.automaticSealing) {
    analysis += generateCleanSlateAnalysis(questionnaireData);
  } else if (result.petitionBasedSealing) {
    analysis += generatePetitionAnalysis(questionnaireData);
  } else {
    analysis += generateIneligibilityAnalysis(questionnaireData, result);
  }
  
  // RISK FACTORS AND CONSIDERATIONS
  analysis += "\n\nRISK FACTORS AND CONSIDERATIONS:\n\n";
  analysis += generateRiskFactorAnalysis(questionnaireData, result);
  
  // DOCUMENTATION STATUS
  analysis += "\n\nDOCUMENTATION STATUS:\n\n";
  if (questionnaireData.hasRecords === 'yes') {
    analysis += "• Client reports having official court records or RAP sheet available\n";
  } else if (questionnaireData.hasRecords === 'no') {
    analysis += "• Client does not currently have official court records or RAP sheet\n";
    if (questionnaireData.wantsRapAssistance === 'yes') {
      analysis += "• Client has requested assistance obtaining official records\n";
    }
  }
  
  if (questionnaireData.uploadedDocument) {
    analysis += `• Document uploaded: ${questionnaireData.uploadedDocument}\n`;
  }
  
  return analysis;
}

function getMonthName(monthNumber: string): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[parseInt(monthNumber) - 1] || monthNumber;
}

function formatOffenseTypes(offenseTypes: string[]): string {
  const formatted = offenseTypes.map(type => {
    switch(type) {
      case 'possession': return 'Simple Possession';
      case 'possession_intent': return 'Possession with Intent to Distribute';
      case 'sale': return 'Sale/Distribution';
      case 'cultivation': return 'Cultivation';
      case 'other': return 'Other marijuana-related offense';
      case 'dont_know': return 'Unspecified marijuana offense';
      default: return type;
    }
  });
  return formatted.join(', ');
}

function generateMRTAAnalysis(questionnaireData: any): string {
  let analysis = "MRTA Automatic Expungement Analysis:\n\n";
  
  if (questionnaireData.convictionYear && parseInt(questionnaireData.convictionYear) < 2021) {
    analysis += "• Conviction occurred prior to March 31, 2021 (MRTA effective date) ✓\n";
  }
  
  if (questionnaireData.possessionAmount === 'yes') {
    analysis += "• Conviction involved 3 ounces (85g) or less of marijuana ✓\n";
  } else if (questionnaireData.possessionAmount === 'no') {
    analysis += "• WARNING: Conviction involved more than 3 ounces - may affect MRTA eligibility\n";
  }
  
  if (questionnaireData.offenseTypes?.includes('possession')) {
    analysis += "• Offense type qualifies under MRTA (simple possession) ✓\n";
  }
  
  analysis += "\n\nMRTA Conclusion: This conviction appears to meet the statutory requirements for automatic expungement under CPL § 160.50(3)(k). The conviction should have been automatically expunged without requiring individual action.";
  
  return analysis;
}

function generateCleanSlateAnalysis(questionnaireData: any): string {
  let analysis = "Clean Slate Act Analysis:\n\n";
  
  const currentYear = new Date().getFullYear();
  const convictionYear = parseInt(questionnaireData.convictionYear || '0');
  const yearsElapsed = currentYear - convictionYear;
  
  if (questionnaireData.convictionLevel === 'misdemeanor') {
    analysis += `• Misdemeanor conviction requires 3-year waiting period\n`;
    analysis += `• Time elapsed: ${yearsElapsed} years ${yearsElapsed >= 3 ? '✓' : '(insufficient)'}\n`;
  } else if (questionnaireData.convictionLevel === 'felony') {
    analysis += `• Felony conviction requires 8-year waiting period\n`;
    analysis += `• Time elapsed: ${yearsElapsed} years ${yearsElapsed >= 8 ? '✓' : '(insufficient)'}\n`;
  }
  
  if (questionnaireData.otherConvictions === 'no') {
    analysis += "• Single eligible conviction requirement met ✓\n";
  } else {
    analysis += "• WARNING: Multiple convictions may affect Clean Slate eligibility\n";
  }
  
  if (questionnaireData.onSupervision === 'no') {
    analysis += "• Not currently under criminal justice supervision ✓\n";
  } else {
    analysis += "• WARNING: Current supervision may delay Clean Slate sealing\n";
  }
  
  if (questionnaireData.hasExcludedOffenses === 'no') {
    analysis += "• No excluded offenses (Class A felonies, sex offenses) ✓\n";
  } else if (questionnaireData.hasExcludedOffenses === 'yes') {
    analysis += "• WARNING: Excluded offenses present - not eligible for Clean Slate\n";
  }
  
  analysis += "\n\nClean Slate Conclusion: This conviction profile appears eligible for automatic sealing under CPL § 160.57, effective November 16, 2024.";
  
  return analysis;
}

function generatePetitionAnalysis(questionnaireData: any): string {
  let analysis = "Petition-Based Sealing Analysis (CPL § 160.59):\n\n";
  
  const currentYear = new Date().getFullYear();
  const convictionYear = parseInt(questionnaireData.convictionYear || '0');
  const yearsElapsed = currentYear - convictionYear;
  
  analysis += `• Ten-year waiting period: ${yearsElapsed} years elapsed ${yearsElapsed >= 10 ? '✓' : '(insufficient)'}\n`;
  
  const totalConvictions = parseInt(questionnaireData.totalConvictions || '0');
  if (totalConvictions <= 2) {
    analysis += `• Conviction count requirement: ${totalConvictions} convictions (within 2-conviction limit) ✓\n`;
  } else {
    analysis += `• WARNING: ${totalConvictions} convictions exceeds 2-conviction limit for petition-based sealing\n`;
  }
  
  if (questionnaireData.sentenceCompleted === 'yes') {
    analysis += "• All sentence conditions completed ✓\n";
  } else if (questionnaireData.sentenceCompleted === 'no') {
    analysis += "• WARNING: Pending sentence obligations must be completed\n";
  }
  
  if (questionnaireData.hasExcludedOffenses === 'no') {
    analysis += "• No excluded offenses present ✓\n";
  } else if (questionnaireData.hasExcludedOffenses === 'yes') {
    analysis += "• WARNING: Excluded offenses may disqualify petition\n";
  }
  
  analysis += "\n\nPetition Conclusion: This case appears to meet the basic statutory requirements for petition-based sealing. Success will depend on judicial discretion considering rehabilitation factors and public safety.";

  return analysis;
}

function generateIneligibilityAnalysis(questionnaireData: any, result: EligibilityResult): string {
  let analysis = "Ineligibility Analysis:\n";
  
  const details = result.eligibilityDetails as any;
  if (details?.primaryReason) {
    analysis += `Primary Barrier: ${details.primaryReason}\n\n`;
  }
  
  // Analyze specific barriers
  const currentYear = new Date().getFullYear();
  const convictionYear = parseInt(questionnaireData.convictionYear || '0');
  const yearsElapsed = currentYear - convictionYear;
  
  if (questionnaireData.convictionYear && parseInt(questionnaireData.convictionYear) >= 2021) {
    analysis += "• MRTA Ineligible: Conviction occurred after March 31, 2021\n";
  }
  
  if (questionnaireData.convictionLevel === 'misdemeanor' && yearsElapsed < 3) {
    analysis += `• Clean Slate Ineligible: Only ${yearsElapsed} years elapsed (requires 3 years for misdemeanors)\n`;
  } else if (questionnaireData.convictionLevel === 'felony' && yearsElapsed < 8) {
    analysis += `• Clean Slate Ineligible: Only ${yearsElapsed} years elapsed (requires 8 years for felonies)\n`;
  }
  
  if (yearsElapsed < 10) {
    analysis += `• Petition Ineligible: Only ${yearsElapsed} years elapsed (requires 10 years)\n`;
  }
  
  const totalConvictions = parseInt(questionnaireData.totalConvictions || '0');
  if (totalConvictions > 2) {
    analysis += `• Petition Ineligible: ${totalConvictions} convictions exceeds 2-conviction limit\n`;
  }
  
  if (questionnaireData.hasExcludedOffenses === 'yes') {
    analysis += "• Multiple Pathways Blocked: Excluded offenses present\n";
  }
  
  analysis += "\nFuture Eligibility: Monitor waiting periods and legislative changes that may expand eligibility options.\n";

  return analysis;
}

function generateRiskFactorAnalysis(questionnaireData: any, result: EligibilityResult): string {
  let riskFactors = [];
  
  if (questionnaireData.otherConvictions === 'yes') {
    riskFactors.push("Multiple convictions may complicate eligibility determination");
  }
  
  if (questionnaireData.onSupervision === 'yes') {
    riskFactors.push("Current supervision status may delay or prevent sealing");
  }
  
  if (questionnaireData.hasExcludedOffenses === 'not_sure') {
    riskFactors.push("Uncertain conviction history requires verification");
  }
  
  if (questionnaireData.sentenceCompleted === 'not_sure') {
    riskFactors.push("Uncertain sentence completion status needs verification");
  }
  
  if (questionnaireData.hasRecords === 'no') {
    riskFactors.push("Lack of official documentation may complicate verification process");
  }
  
  if (!questionnaireData.penalCode || questionnaireData.knowsPenalCode === 'no') {
    riskFactors.push("Unknown Penal Law code may require additional legal research");
  }
  
  if (riskFactors.length === 0) {
    return "• No significant risk factors identified based on provided information";
  }
  
  return riskFactors.map(factor => `• ${factor}`).join('\n');
}

function generateNextSteps(result: EligibilityResult): string {
  if (result.automaticExpungement) {
    return `1. REQUEST VERIFICATION
   Contact the court clerk's office where you were convicted to confirm your record has been expunged and request documentation.

2. OBTAIN RAP SHEET
   Request an updated criminal history record (RAP sheet) from the New York State Division of Criminal Justice Services to verify the expungement is reflected in state records.

3. BACKGROUND CHECK GUIDANCE
   For employment or housing applications, you may legally answer "no" to questions about criminal convictions for expunged offenses.

4. LEGAL ASSISTANCE
   If you encounter issues with the expungement not being properly reflected in records, consider consulting with an attorney who specializes in criminal record relief.`;
  } else if (result.petitionBasedSealing) {
    return `1. GATHER DOCUMENTATION
   Collect all court documents related to your conviction(s), proof of sentence completion, and evidence of rehabilitation.

2. COMPLETE PETITION FORMS
   Obtain and complete the required petition forms for record sealing from the court where you were convicted.

3. LEGAL ASSISTANCE RECOMMENDED
   Given the discretionary nature of petition-based sealing, consider consulting with an attorney to strengthen your petition and improve chances of success.

4. FILE PETITION
   Submit your completed petition with all supporting documentation to the appropriate court and pay any required filing fees.

5. COURT HEARING
   Be prepared to attend a court hearing where a judge will consider your petition and any opposition from the prosecution.`;
  } else {
    return `1. MONITOR ELIGIBILITY
   Check back periodically as your eligibility may change when waiting periods are satisfied or new laws are enacted.

2. CLEAN SLATE ACT
   If you have eligible convictions, automatic sealing may begin on November 16, 2024, under the Clean Slate Act. Monitor your record status after this date.

3. MAINTAIN CLEAN RECORD
   Avoid new convictions to preserve future eligibility for relief programs.

4. LEGAL CONSULTATION
   Consider consulting with a criminal defense attorney to explore any alternative relief options specific to your circumstances.

5. STAY INFORMED
   Keep informed about changes to New York expungement and sealing laws that may expand eligibility in the future.`;
  }
}

export function generatePDFReport(result: EligibilityResult, user: User, questionnaireData?: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Generate unique report ID
  const reportId = `NYR-${Date.now().toString(36).toUpperCase()}`;
  
  // Helper function to clean text and remove problematic characters while preserving line breaks
  const cleanText = (text: string): string => {
    if (!text) return '';
    
    // Remove problematic characters but preserve line breaks and basic structure
    return text
      .replace(/[^\w\s\-\.\,\:\;\(\)\[\]\/\\\'\"\!\?\&\%\$\@\#\+\=\<\>\|\~\`\n]/g, ' ') // Keep line breaks
      .replace(/[ \t]+/g, ' ') // Normalize spaces and tabs but keep line breaks
      .replace(/\n\s+/g, '\n') // Clean up lines with leading spaces
      .trim();
  };
  
  // Helper function to add text with wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const maxWidth = pageWidth - 40 - indent;
    const lineHeight = fontSize * 0.35 + 4; // Improved line spacing
    
    // Clean the text first - remove any weird spacing issues and problematic characters
    const processedText = cleanText(text);
    
    // Split text into paragraphs and individual lines
    const paragraphs = processedText.split('\n\n');
    
    paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraph.trim() === '') {
        yPosition += lineHeight;
        return;
      }
      
      // Handle numbered lists (1. 2. 3. etc.)
      if (/^\d+\.\s/.test(paragraph.trim())) {
        const listItems = paragraph.split(/(?=\n\d+\.\s)/);
        listItems.forEach(item => {
          if (item.trim()) {
            const lines = item.trim().split('\n');
            lines.forEach((line, lineIndex) => {
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
              }
              
              const wrappedLines = doc.splitTextToSize(line.trim(), maxWidth);
              wrappedLines.forEach((wrappedLine: string) => {
                if (yPosition > pageHeight - 30) {
                  doc.addPage();
                  yPosition = 20;
                }
                doc.text(wrappedLine, 20 + indent + (lineIndex > 0 ? 10 : 0), yPosition);
                yPosition += lineHeight;
              });
            });
            yPosition += 3; // Space between list items
          }
        });
      }
      // Handle bullet points
      else if (paragraph.trim().startsWith('•')) {
        const bulletLines = paragraph.split('\n');
        bulletLines.forEach(bulletLine => {
          if (bulletLine.trim()) {
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = 20;
            }
            
            const lines = doc.splitTextToSize(bulletLine.trim(), maxWidth);
            lines.forEach((line: string, lineIndex: number) => {
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
              }
              
              // Add extra indent for continuation lines of bullet points
              const bulletIndent = lineIndex > 0 ? 10 : 0;
              doc.text(line.toString(), 20 + indent + bulletIndent, yPosition);
              yPosition += lineHeight;
            });
          }
        });
      } 
      // Handle regular paragraphs with internal line breaks
      else {
        const lines = paragraph.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = 20;
            }
            
            const wrappedLines = doc.splitTextToSize(line.trim(), maxWidth);
            wrappedLines.forEach((wrappedLine: string) => {
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(wrappedLine, 20 + indent, yPosition);
              yPosition += lineHeight;
            });
          } else {
            // Empty line within paragraph
            yPosition += lineHeight * 0.3;
          }
        });
      }
      
      // Add space between paragraphs
      if (paragraphIndex < paragraphs.length - 1) {
        yPosition += lineHeight * 0.5;
      }
    });
    
    yPosition += 8; // Space after section
  };

  // Professional Header
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

  // Report metadata
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

  // SECTION 2: STATUTORY BASIS FOR ELIGIBILITY
  addText('STATUTORY BASIS FOR ELIGIBILITY', 14, true);
  const statutoryBasis = generateStatutoryBasis(result, questionnaireData);
  addText(statutoryBasis, 11);

  // SECTION 3: ANALYSIS OF SUBMITTED INFORMATION
  addText('ANALYSIS OF SUBMITTED INFORMATION', 14, true);
  const factualAnalysis = generateFactualAnalysis(result, questionnaireData);
  addText(factualAnalysis, 11);

  // SECTION 4: RECOMMENDED NEXT STEPS
  addText('RECOMMENDED NEXT STEPS', 14, true);
  const nextSteps = generateNextSteps(result);
  addText(nextSteps, 11);

  // Legal Disclaimer
  yPosition += 15;
  addText('IMPORTANT LEGAL DISCLAIMER', 14, true);
  doc.setFillColor(245, 245, 245);
  const disclaimerY = yPosition - 5;
  
  const disclaimerText = `This report is generated based on user-submitted data and current understanding of New York State law as of ${reportDate}. This analysis does not constitute legal advice and is not a guarantee of eligibility outcomes. Actual eligibility is subject to final determination by the appropriate New York State court or agency. Individual circumstances may affect eligibility that are not captured in this assessment.

For personalized legal counsel regarding your specific situation, please consult with an attorney licensed to practice in New York State. For questions about this report or additional assistance, contact NY Record Relief support.`;
  
  // Clean disclaimer text before processing
  const cleanDisclaimerText = cleanText(disclaimerText);
  const disclaimerLines = doc.splitTextToSize(cleanDisclaimerText, pageWidth - 50);
  doc.rect(20, disclaimerY, pageWidth - 40, disclaimerLines.length * 6 + 10, 'F');
  
  doc.setFontSize(10);
  disclaimerLines.forEach((line: string, index: number) => {
    doc.text(line.toString(), 25, yPosition + (index * 6));
  });
  yPosition += disclaimerLines.length * 6 + 20;

  // Footer
  doc.setFillColor(41, 128, 185);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Generated by NY Record Relief', 20, pageHeight - 10);
  doc.text(`© ${new Date().getFullYear()} All rights reserved.`, pageWidth - 60, pageHeight - 10);

  // Download the PDF
  const fileName = `NY_Record_Relief_Assessment_${reportId}.pdf`;
  doc.save(fileName);
}

function getEligibilityStatus(result: EligibilityResult): string {
  const details = result.eligibilityDetails as any;
  const isCleanSlateEligible = !!details?.cleanSlateApplicable;
    
  if (result.automaticExpungement) return 'Eligible for Automatic Expungement';
  if (result.automaticSealing || isCleanSlateEligible) return 'Eligible for Automatic Sealing';
  if (result.petitionBasedSealing) return 'Eligible for Petition-Based Sealing';
  return 'Not Currently Eligible';
}

function getStatusColor(status: string): {r: number, g: number, b: number} {
  if (status.includes('Automatic Expungement')) return {r: 34, g: 139, b: 34};  // Green
  if (status.includes('Automatic Sealing')) return {r: 65, g: 105, b: 225};    // Blue
  if (status.includes('Petition-Based')) return {r: 255, g: 140, b: 0};        // Orange
  return {r: 220, g: 20, b: 60};                                               // Red
}
