import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Copy, Eye } from "lucide-react";
import { generatePDFReport } from "@/lib/pdf-generator";
import type { EligibilityResult, User } from "@shared/schema";

interface AssessmentReportPreviewProps {
  eligibilityResult: EligibilityResult;
  questionnaireData: any;
  user: User | null;
}

export function AssessmentReportPreview({ eligibilityResult, questionnaireData, user }: AssessmentReportPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [reportText, setReportText] = useState<string>('');

  // Clean text processing function
  const cleanText = (text: string): string => {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  };

  const generateReportText = (): string => {
    const reportId = `ASSESS-${Date.now().toString(36).toUpperCase()}`;
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let report = '';
    
    // Header
    report += '=' + '='.repeat(58) + '=\n';
    report += 'NY RECORD RELIEF - ELIGIBILITY ASSESSMENT REPORT\n';
    report += '=' + '='.repeat(58) + '=\n';
    report += `Report ID: ${reportId}\n`;
    report += `Generated: ${reportDate}\n`;
    report += `Client: ${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Anonymous\n';
    report += `Jurisdiction: New York State\n`;
    report += '\n';

    // Executive Summary
    report += 'EXECUTIVE SUMMARY\n';
    report += '-'.repeat(40) + '\n';
    report += cleanText(generateExecutiveSummary(eligibilityResult)) + '\n\n';

    // Eligibility Status
    report += 'ELIGIBILITY STATUS\n';
    report += '-'.repeat(40) + '\n';
    if (eligibilityResult.automaticExpungement) {
      report += '[ELIGIBLE] AUTOMATIC EXPUNGEMENT: Eligible under MRTA 2021\n';
    } else if (eligibilityResult.automaticSealing) {
      report += '[ELIGIBLE] AUTOMATIC SEALING: Eligible under Clean Slate Act\n';
    } else if (eligibilityResult.petitionBasedSealing) {
      report += '[PETITION] PETITION-BASED SEALING: Court petition required\n';
    } else {
      report += '[NOT ELIGIBLE] NOT CURRENTLY ELIGIBLE: Does not meet current criteria\n';
    }
    report += '\n';

    // Factual Analysis
    report += 'FACTUAL ANALYSIS\n';
    report += '-'.repeat(40) + '\n';
    report += cleanText(generateFactualAnalysis(eligibilityResult, questionnaireData)) + '\n';

    // Statutory Basis
    report += 'STATUTORY BASIS\n';
    report += '-'.repeat(40) + '\n';
    report += cleanText(generateStatutoryBasis(eligibilityResult, questionnaireData)) + '\n\n';

    // Recommendations
    const recommendations = eligibilityResult.recommendations as any[];
    if (recommendations && recommendations.length > 0) {
      report += 'RECOMMENDATIONS\n';
      report += '-'.repeat(40) + '\n';
      recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${cleanText(rec.title)}\n`;
        report += `   ${cleanText(rec.description)}\n`;
        report += `   Priority: ${rec.priority?.toUpperCase() || 'MEDIUM'} | Timeline: ${rec.timeline || 'TBD'}\n\n`;
      });
    }

    // Disclaimer
    report += 'IMPORTANT LEGAL DISCLAIMER\n';
    report += '-'.repeat(40) + '\n';
    const disclaimer = 'This assessment is based on information provided and current New York State law. ' +
                     'This analysis does not constitute legal advice and should not be relied upon as a substitute for consultation with a qualified attorney. ' +
                     'Eligibility determinations are subject to verification with official court records and may change based on additional information or legal developments.';
    report += cleanText(disclaimer) + '\n';

    return report;
  };

  const handlePreviewReport = () => {
    const text = generateReportText();
    setReportText(text);
    setIsPreviewOpen(true);
  };

  const handleDownloadPDF = () => {
    if (!user) return;
    generatePDFReport(eligibilityResult, user, questionnaireData);
    setIsPreviewOpen(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(reportText);
  };

  const generateExecutiveSummary = (result: EligibilityResult): string => {
    if (result.automaticExpungement) {
      return "Based on the information you provided, you are eligible for automatic expungement of your marijuana-related conviction under New York's Marihuana Regulation and Taxation Act (MRTA), enacted in 2021. Your conviction should have already been automatically expunged by the state, though verification with the court is recommended to obtain proper documentation.";
    } else if (result.automaticSealing) {
      return "Based on the information you provided, you are eligible for automatic sealing under New York's Clean Slate Act (CPL § 160.57). Your record will be automatically sealed without any action required on your part, effective November 16, 2024.";
    } else if (result.petitionBasedSealing) {
      return "Based on your responses, you may be eligible for petition-based record sealing under New York Criminal Procedure Law § 160.59. This process requires filing a formal petition with the court and obtaining judicial approval, but offers significant benefits in limiting public access to your criminal record.";
    } else {
      return "Based on the information provided, you do not currently qualify for automatic expungement or sealing under existing New York State laws. However, your eligibility may change over time as waiting periods are satisfied or new legislation is enacted. We recommend periodic reassessment of your status.";
    }
  };

  const generateFactualAnalysis = (result: EligibilityResult, questionnaireData: any): string => {
    let analysis = "";

    // Basic conviction information
    analysis += "CASE PROFILE:\n\n";
    
    if (questionnaireData?.convictionState) {
      analysis += `Jurisdiction: ${questionnaireData.convictionState === 'ny' ? 'New York State' : questionnaireData.convictionState}\n`;
    }
    
    if (questionnaireData?.convictionYear && questionnaireData?.convictionMonth) {
      analysis += `Date of Conviction: ${getMonthName(questionnaireData.convictionMonth)} ${questionnaireData.convictionYear}\n`;
    }
    if (questionnaireData?.offenseTypes) {
      const offenseTypes = Array.isArray(questionnaireData.offenseTypes) ? questionnaireData.offenseTypes : [questionnaireData.offenseTypes];
      analysis += `Offense Type(s): ${formatOffenseTypes(offenseTypes)}\n`;
    }
    if (questionnaireData?.convictionLevel) {
      analysis += `Conviction Classification: ${questionnaireData.convictionLevel.charAt(0).toUpperCase() + questionnaireData.convictionLevel.slice(1)}\n`;
    }
    if (questionnaireData?.penalCode) {
      analysis += `Penal Law Code: ${questionnaireData.penalCode}\n`;
    }

    // Time analysis
    if (questionnaireData?.convictionYear) {
      const currentYear = new Date().getFullYear();
      const yearsElapsed = currentYear - parseInt(questionnaireData.convictionYear);
      analysis += `Time Elapsed Since Conviction: ${yearsElapsed} years\n`;
    }

    analysis += "\n";

    analysis += `Additional Criminal History: ${questionnaireData?.otherConvictions === 'no' ? 'None reported' : 'Has additional convictions'}\n`;
    analysis += `Current Supervision Status: ${questionnaireData?.onSupervision === 'no' ? 'Not under supervision' : 'Currently on probation/parole'}\n`;

    return analysis;
  };

  const generateStatutoryBasis = (result: EligibilityResult, questionnaireData: any): string => {
    if (result.automaticExpungement) {
      return `Your marijuana-related conviction qualifies for automatic expungement under the Marihuana Regulation and Taxation Act (MRTA), specifically codified in New York Criminal Procedure Law § 160.50(3)(k). This provision mandates automatic expungement of convictions for unlawful possession of marihuana under Penal Law § 221.05, § 221.10, § 221.15, § 221.35, and § 221.40 that occurred prior to March 31, 2021.`;
    } else if (result.automaticSealing) {
      return `Your conviction qualifies for automatic sealing under New York's Clean Slate Act, codified in Criminal Procedure Law § 160.57. This statute provides for automatic sealing of eligible criminal convictions effective November 16, 2024. The Clean Slate Act covers misdemeanor convictions after 3 years and felony convictions after 8 years from sentence completion, provided certain conditions are met.`;
    } else if (result.petitionBasedSealing) {
      return `Your case appears to meet the criteria for petition-based sealing under New York Criminal Procedure Law § 160.59. This statute allows individuals to petition for sealing of criminal records where specific criteria are met including conviction limits and timing requirements.`;
    } else {
      return `Based on current New York State law, your conviction does not qualify for automatic relief under the MRTA (CPL § 160.50(3)(k)) or the Clean Slate Act (CPL § 160.57). Future eligibility may be possible as waiting periods are satisfied.`;
    }
  };

  const getMonthName = (monthNumber: string): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber) - 1] || monthNumber;
  };

  const formatOffenseTypes = (offenseTypes: string[]): string => {
    return offenseTypes.map(type => {
      switch(type) {
        case 'possession': return 'Simple Possession';
        case 'possession_intent': return 'Possession with Intent to Distribute';
        case 'sale': return 'Sale/Distribution';
        case 'cultivation': return 'Cultivation';
        case 'other': return 'Other marijuana-related offense';
        default: return type;
      }
    }).join(', ');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Assessment Report
        </CardTitle>
        <CardDescription>
          Generate and review your detailed eligibility assessment report
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            onClick={handlePreviewReport}
            variant="outline" 
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Report
          </Button>
          <Button 
            onClick={() => {
              if (!user) return;
              generatePDFReport(eligibilityResult, user, questionnaireData);
            }}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assessment Report Preview</DialogTitle>
              <DialogDescription>
                Review your eligibility assessment report before downloading
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
                  {reportText}
                </pre>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleDownloadPDF} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleCopyText} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 