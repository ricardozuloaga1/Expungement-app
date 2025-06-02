export interface EligibilityAnalysis {
  eligibilityStatus: 'automatic_expungement' | 'automatic_sealing' | 'petition_sealing' | 'not_eligible';
  automaticExpungement: boolean;
  automaticSealing: boolean;
  petitionBasedSealing: boolean;
  eligibilityDetails: {
    primaryReason: string;
    secondaryReasons?: string[];
    mrtaApplicable?: boolean;
    cleanSlateApplicable?: boolean;
    petitionApplicable?: boolean;
    waitingPeriodRequired?: string;
    excludedOffense?: boolean;
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
    // New comprehensive data structure
    convictionState,
    hasMarijuanaConviction,
    offenseTypes = [],
    convictionMonth,
    convictionYear,
    possessionAmount,
    ageAtOffense,
    receivedNotice,
    convictionLevel,
    servedTime,
    releaseMonth,
    releaseYear,
    otherConvictions,
    onSupervision,
    hasExcludedOffenses,
    totalConvictions,
    totalFelonies,
    tenYearsPassed,
    sentenceCompleted,
    
    // Legacy fields for backward compatibility
    age,
    chargeTypes = [],
    firstArrestDate,
  } = questionnaireData;

  let automaticExpungement = false;
  let automaticSealing = false;
  let petitionBasedSealing = false;
  let eligibilityStatus: 'automatic_expungement' | 'automatic_sealing' | 'petition_sealing' | 'not_eligible' = 'not_eligible';
  
  const eligibilityDetails: any = {
    primaryReason: "",
    secondaryReasons: []
  };
  const recommendations: any[] = [];

  // PRIORITY 1: Check for automatic disqualifiers first
  if (onSupervision === "yes") {
    eligibilityStatus = 'not_eligible';
    eligibilityDetails.primaryReason = "Currently on probation or parole - must complete supervision first";
    recommendations.push({
      type: "wait",
      title: "Complete Current Supervision",
      description: "You must complete all probation or parole requirements before becoming eligible for any relief.",
      timeline: "Until supervision ends",
      priority: 1
    });
    return buildFinalResult();
  }

  if (hasExcludedOffenses === "yes") {
    eligibilityStatus = 'not_eligible';
    eligibilityDetails.primaryReason = "Conviction for excluded offense (Class A felony or sex offense)";
    eligibilityDetails.excludedOffense = true;
    recommendations.push({
      type: "excluded",
      title: "Excluded Offense",
      description: "Class A felonies and sex offenses are permanently excluded from expungement and sealing.",
      timeline: "Not applicable",
      priority: 1
    });
    return buildFinalResult();
  }

  if (sentenceCompleted === "no") {
    eligibilityStatus = 'not_eligible';
    eligibilityDetails.primaryReason = "Sentence obligations not completed (fines, community service, etc.)";
    recommendations.push({
      type: "complete",
      title: "Complete All Sentence Requirements",
      description: "You must finish paying all fines, complete community service, and satisfy all other sentence conditions.",
      timeline: "Complete ASAP",
      priority: 1
    });
    return buildFinalResult();
  }

  // PRIORITY 2: Check for MRTA Automatic Expungement (Best outcome)
  if (offenseTypes.includes("possession") && possessionAmount === "yes") {
    // Possession of 3 ounces or less
    const convictionDate = getConvictionDate(convictionMonth, convictionYear);
    if (convictionDate && convictionDate < new Date('2021-03-31')) {
      automaticExpungement = true;
      eligibilityStatus = 'automatic_expungement';
      eligibilityDetails.primaryReason = "Eligible for automatic expungement under MRTA 2021";
      eligibilityDetails.mrtaApplicable = true;
      
      if (receivedNotice === "yes") {
        eligibilityDetails.secondaryReasons?.push("Already received court notice of expungement");
      } else {
        eligibilityDetails.secondaryReasons?.push("May need to verify expungement status with court");
      }
      
      recommendations.push({
        type: "verify",
        title: "Verify Automatic Expungement Status",
        description: "Your record should already be expunged. Contact the court clerk to confirm and obtain documentation.",
        timeline: "1-2 weeks",
        priority: 1
      });
      return buildFinalResult();
    }
  }

  // PRIORITY 3: Check for Clean Slate Act Automatic Sealing
  const yearsPassedSince = calculateYearsSinceConviction(convictionMonth, convictionYear, releaseMonth, releaseYear, servedTime);
  
  if (convictionLevel === "misdemeanor" && yearsPassedSince >= 3 && otherConvictions === "no") {
    automaticSealing = true;
    eligibilityStatus = 'automatic_sealing';
    eligibilityDetails.primaryReason = "Eligible for automatic sealing under Clean Slate Act (misdemeanor, 3+ years)";
    eligibilityDetails.cleanSlateApplicable = true;
    
    recommendations.push({
      type: "automatic_sealing",
      title: "Monitor Clean Slate Implementation",
      description: "Your record will be automatically sealed starting November 2024. No action required on your part.",
      timeline: "November 2024",
      priority: 1
    });
    return buildFinalResult();
  }
  
  if (convictionLevel === "felony" && yearsPassedSince >= 8 && otherConvictions === "no") {
    automaticSealing = true;
    eligibilityStatus = 'automatic_sealing';
    eligibilityDetails.primaryReason = "Eligible for automatic sealing under Clean Slate Act (felony, 8+ years)";
    eligibilityDetails.cleanSlateApplicable = true;
    
    recommendations.push({
      type: "automatic_sealing",
      title: "Monitor Clean Slate Implementation",
      description: "Your record will be automatically sealed starting November 2024. No action required on your part.",
      timeline: "November 2024", 
      priority: 1
    });
    return buildFinalResult();
  }

  // PRIORITY 4: Check for Petition-Based Sealing (CPL § 160.59)
  if (tenYearsPassed === "yes" && 
      parseInt(totalConvictions || "0") <= 2 && 
      parseInt(totalFelonies || "0") <= 1) {
    
    petitionBasedSealing = true;
    eligibilityStatus = 'petition_sealing';
    eligibilityDetails.primaryReason = "Eligible for petition-based sealing under CPL § 160.59";
    eligibilityDetails.petitionApplicable = true;
    
    recommendations.push({
      type: "petition",
      title: "File Court Petition for Record Sealing",
      description: "You can petition the court for record sealing. This requires a formal application and court approval.",
      timeline: "6-12 months",
      priority: 1
    });
    
    recommendations.push({
      type: "legal_help",
      title: "Consider Legal Assistance", 
      description: "Petition-based sealing has specific requirements. Legal help can improve your chances of success.",
      timeline: "Before filing",
      priority: 2
    });
    return buildFinalResult();
  }

  // PRIORITY 5: Not Currently Eligible
  eligibilityStatus = 'not_eligible';
  
  // Determine specific reason for ineligibility
  if (convictionLevel === "misdemeanor" && yearsPassedSince < 3) {
    const yearsRemaining = 3 - yearsPassedSince;
    eligibilityDetails.primaryReason = `Not enough time has passed for Clean Slate sealing (need ${yearsRemaining.toFixed(1)} more years)`;
    eligibilityDetails.waitingPeriodRequired = `${Math.ceil(yearsRemaining)} years`;
  } else if (convictionLevel === "felony" && yearsPassedSince < 8) {
    const yearsRemaining = 8 - yearsPassedSince;
    eligibilityDetails.primaryReason = `Not enough time has passed for Clean Slate sealing (need ${yearsRemaining.toFixed(1)} more years)`;
    eligibilityDetails.waitingPeriodRequired = `${Math.ceil(yearsRemaining)} years`;
  } else if (otherConvictions === "yes") {
    eligibilityDetails.primaryReason = "Additional convictions prevent automatic sealing";
  } else if (parseInt(totalConvictions || "0") > 2) {
    eligibilityDetails.primaryReason = "Too many total convictions for petition-based sealing (maximum 2)";
  } else if (tenYearsPassed === "no") {
    eligibilityDetails.primaryReason = "Less than 10 years have passed since conviction for petition-based sealing";
  } else {
    eligibilityDetails.primaryReason = "Does not meet current eligibility criteria for any relief pathway";
  }

  recommendations.push({
    type: "future",
    title: "Check Eligibility Again Later",
    description: "Your eligibility may change over time as laws evolve and waiting periods are satisfied.",
    timeline: eligibilityDetails.waitingPeriodRequired || "Periodically",
    priority: 1
  });

  function buildFinalResult(): EligibilityAnalysis {
    // Add universal recommendations
    recommendations.push({
      type: "report",
      title: "Download Complete Analysis Report",
      description: "Get detailed documentation of your eligibility status with legal citations and next steps.",
      timeline: "Immediate",
      priority: 0
    });

    recommendations.sort((a, b) => a.priority - b.priority);

    return {
      eligibilityStatus,
      automaticExpungement,
      automaticSealing,
      petitionBasedSealing,
      eligibilityDetails,
      recommendations
    };
  }

  return buildFinalResult();
}

// Helper functions
function getConvictionDate(month?: string, year?: string): Date | null {
  if (!month || !year) return null;
  return new Date(parseInt(year), parseInt(month) - 1);
}

function calculateYearsSinceConviction(
  convictionMonth?: string, 
  convictionYear?: string,
  releaseMonth?: string,
  releaseYear?: string,
  servedTime?: string
): number {
  const now = new Date();
  
  // If they served time, calculate from release date
  if (servedTime === "yes" && releaseMonth && releaseYear) {
    const releaseDate = new Date(parseInt(releaseYear), parseInt(releaseMonth) - 1);
    return (now.getTime() - releaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  }
  
  // Otherwise calculate from conviction date
  if (convictionMonth && convictionYear) {
    const convictionDate = new Date(parseInt(convictionYear), parseInt(convictionMonth) - 1);
    return (now.getTime() - convictionDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  }
  
  return 0;
}

export function formatEligibilityForDisplay(analysis: EligibilityAnalysis) {
  const { eligibilityStatus, eligibilityDetails } = analysis;
  
  let statusTitle = "";
  let statusDescription = "";
  
  switch (eligibilityStatus) {
    case 'automatic_expungement':
      statusTitle = "Excellent News!";
      statusDescription = "You qualify for automatic expungement - your record should already be cleared";
      break;
    case 'automatic_sealing':
      statusTitle = "Great News!";
      statusDescription = "You qualify for automatic record sealing under the Clean Slate Act";
      break;
    case 'petition_sealing':
      statusTitle = "Good News!";
      statusDescription = "You can petition the court for record sealing";
      break;
    case 'not_eligible':
      statusTitle = "Not Currently Eligible";
      statusDescription = eligibilityDetails.primaryReason || "You don't currently qualify for relief";
      break;
    default:
      statusTitle = "Assessment Incomplete";
      statusDescription = "Unable to determine eligibility status";
  }
  
  return { statusTitle, statusDescription };
}
