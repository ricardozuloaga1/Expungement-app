export interface EligibilityAnalysis {
  automaticExpungement: boolean;
  petitionBasedSealing: boolean;
  eligibilityDetails: {
    automaticReason?: string;
    petitionReason?: string;
    cleanSlateApplicable?: boolean;
    mrtaApplicable?: boolean;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    timeline?: string;
    priority: number;
  }>;
}

export function analyzeEligibility(questionnaireData: any): EligibilityAnalysis {
  const {
    age,
    county,
    chargeTypes = [],
    firstArrestDate,
  } = questionnaireData;

  let automaticExpungement = false;
  let petitionBasedSealing = false;
  const eligibilityDetails: any = {};
  const recommendations: any[] = [];

  // MRTA 2021 Analysis - Automatic Expungement
  if (firstArrestDate === "before_march_2021") {
    const hasPossessionCharges = chargeTypes.includes("possession");
    
    if (hasPossessionCharges) {
      automaticExpungement = true;
      eligibilityDetails.automaticReason = "MRTA 2021 - Possession charges before March 31, 2021 qualify for automatic expungement";
      eligibilityDetails.mrtaApplicable = true;
      
      recommendations.push({
        type: "automatic",
        title: "Monitor Automatic Expungement Status",
        description: "Your possession charges should be automatically expunged. Check with the court clerk's office in 3-6 months for status updates.",
        timeline: "3-6 months",
        priority: 1
      });
    }
  }

  // Clean Slate Act 2024 Analysis
  if (firstArrestDate === "before_march_2021" || firstArrestDate === "after_march_2021") {
    eligibilityDetails.cleanSlateApplicable = true;
  }

  // Petition-Based Sealing Analysis
  const hasSaleCharges = chargeTypes.includes("sale");
  const hasCultivationCharges = chargeTypes.includes("cultivation");
  const hasOtherCharges = chargeTypes.includes("other");

  if (hasSaleCharges || hasCultivationCharges || hasOtherCharges) {
    petitionBasedSealing = true;
    eligibilityDetails.petitionReason = "Sale, cultivation, or other marijuana charges require petition-based sealing";
    
    recommendations.push({
      type: "petition",
      title: "File Petition for Record Sealing",
      description: "Sale, cultivation, and certain other charges require a formal petition to the court for sealing.",
      timeline: "6-12 months",
      priority: 2
    });
  }

  // Universal Recommendations
  recommendations.push({
    type: "report",
    title: "Download Your Complete Eligibility Report",
    description: "Get a detailed analysis of your eligibility with legal citations, timelines, and next steps.",
    timeline: "Immediate",
    priority: 0
  });

  if (petitionBasedSealing) {
    recommendations.push({
      type: "legal_help",
      title: "Consider Professional Legal Assistance",
      description: "For petition-based cases, legal assistance can help ensure proper filing and increase success rates.",
      timeline: "Varies",
      priority: 3
    });
  }

  // Age-specific considerations
  if (age === "under_21") {
    recommendations.push({
      type: "youth",
      title: "Special Provisions for Youth Offenses",
      description: "Additional protections may apply to offenses committed as a minor. Consider consulting with a youth advocacy specialist.",
      timeline: "Varies",
      priority: 4
    });
  }

  // Sort recommendations by priority
  recommendations.sort((a, b) => a.priority - b.priority);

  return {
    automaticExpungement,
    petitionBasedSealing,
    eligibilityDetails,
    recommendations
  };
}

export function formatEligibilityForDisplay(analysis: EligibilityAnalysis) {
  const { automaticExpungement, petitionBasedSealing } = analysis;
  
  let statusTitle = "Mixed Results";
  let statusDescription = "You may qualify for some relief";
  
  if (automaticExpungement && !petitionBasedSealing) {
    statusTitle = "Great news!";
    statusDescription = "You appear to qualify for automatic expungement";
  } else if (!automaticExpungement && petitionBasedSealing) {
    statusTitle = "Good news!";
    statusDescription = "You appear to qualify for petition-based sealing";
  } else if (automaticExpungement && petitionBasedSealing) {
    statusTitle = "Excellent news!";
    statusDescription = "You qualify for both automatic and petition-based relief";
  } else {
    statusTitle = "Limited Options";
    statusDescription = "You may have limited expungement options";
  }
  
  return { statusTitle, statusDescription };
}
