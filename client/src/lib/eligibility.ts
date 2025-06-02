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
        
        recommendations.push({
          type: "verify",
          title: "Confirm Expungement with Record Check",
          description: "Under MRTA 2021, CPL § 160.50(3)(k), your marijuana possession conviction should be expunged. Request a Certificate of Disposition from the court clerk to verify your record reflects 'SEALED - EXPUNGED PURSUANT TO CPL 160.50(3)(k)'.",
          timeline: "Within 30 days",
          priority: 1
        }, {
          type: "document",
          title: "Obtain Official Expungement Documentation",
          description: "Contact the court clerk's office where you were convicted to request Form OCA-394 (Certificate of Disposition) showing the expungement. This serves as proof for employers, landlords, and background checks.",
          timeline: "2-4 weeks processing time",
          priority: 2
        });
      } else {
        eligibilityDetails.secondaryReasons?.push("May need to verify expungement status with court");
        
        recommendations.push({
          type: "verify",
          title: "Verify MRTA Automatic Expungement Status",
          description: "Under MRTA 2021, CPL § 160.50(3)(k), your pre-2021 marijuana possession conviction qualifies for automatic expungement. Contact the court clerk to confirm the expungement was processed and obtain Form OCA-394 (Certificate of Disposition).",
          timeline: "Contact within 2 weeks",
          priority: 1
        }, {
          type: "legal_help",
          title: "Consider Legal Assistance if Expungement Not Processed",
          description: "If the court has not processed your automatic expungement, contact a public defender or legal aid organization. You may need to file a motion to compel expungement under MRTA.",
          timeline: "If court verification shows no expungement",
          priority: 2
        }, {
          type: "reminder",
          title: "Request RAP Sheet After Verification",
          description: "After confirming expungement, request an updated criminal history record (RAP sheet) from DCJS to ensure the conviction no longer appears on background checks.",
          timeline: "30 days after court verification",
          priority: 3
        });
      }
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
      type: "wait",
      title: "Prepare for Clean Slate Automatic Sealing",
      description: "Under CPL § 160.57 (Clean Slate Act), your misdemeanor conviction will be automatically sealed effective November 16, 2024. No petition or court appearance required. Once sealed, the conviction will not appear on most background checks.",
      timeline: "Effective November 16, 2024",
      priority: 1
    }, {
      type: "document",
      title: "Request Pre-Sealing RAP Sheet for Comparison",
      description: "Before November 2024, request your current criminal history record (RAP sheet) from DCJS. This will serve as baseline documentation showing what will be sealed under the Clean Slate Act.",
      timeline: "Request by October 2024",
      priority: 2
    }, {
      type: "reminder",
      title: "Verify Sealing After Implementation",
      description: "After November 16, 2024, request an updated RAP sheet to confirm your conviction is properly sealed. The record should show 'SEALED PURSUANT TO CPL 160.57' or not appear at all.",
      timeline: "December 2024 or later",
      priority: 3
    });
    return buildFinalResult();
  }
  
  if (convictionLevel === "felony" && yearsPassedSince >= 8 && otherConvictions === "no") {
    automaticSealing = true;
    eligibilityStatus = 'automatic_sealing';
    eligibilityDetails.primaryReason = "Eligible for automatic sealing under Clean Slate Act (felony, 8+ years)";
    eligibilityDetails.cleanSlateApplicable = true;
    
    recommendations.push({
      type: "wait",
      title: "Prepare for Clean Slate Automatic Sealing",
      description: "Under CPL § 160.57 (Clean Slate Act), your felony conviction qualifies for automatic sealing effective November 16, 2024. The 8-year waiting period has been satisfied, and you have no disqualifying additional convictions.",
      timeline: "Effective November 16, 2024",
      priority: 1
    }, {
      type: "document",
      title: "Obtain Current RAP Sheet Before Sealing",
      description: "Request your criminal history record from DCJS before November 2024. This documents your current record status and serves as proof of what will be sealed under the Clean Slate Act.",
      timeline: "Complete by October 2024",
      priority: 2
    }, {
      type: "verify",
      title: "Confirm Automatic Sealing Implementation",
      description: "After November 16, 2024, request an updated RAP sheet to verify your felony conviction is properly sealed. Contact DCJS if the sealing is not reflected within 60 days of the implementation date.",
      timeline: "January 2025",
      priority: 3
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
      title: "File Motion for Record Sealing Under CPL § 160.59",
      description: "You meet the criteria for petition-based sealing: ≤2 convictions, ≤1 felony, 10+ years passed. File Form CR-155 (Motion for Sealing) with the Supreme Court in the county where you were convicted. Include supporting documents showing rehabilitation and public safety considerations.",
      timeline: "File within 6 months for best results",
      priority: 1
    }, {
      type: "document",
      title: "Gather Required Documentation for Petition",
      description: "Collect: (1) Certified copies of all conviction records, (2) Certificate of Disposition for each case, (3) Evidence of rehabilitation (employment records, education certificates, community service), (4) Character references, (5) Statement explaining circumstances and rehabilitation efforts.",
      timeline: "Allow 4-6 weeks to gather documents",
      priority: 2
    }, {
      type: "legal_help",
      title: "Consult Attorney for Petition Strategy",
      description: "CPL § 160.59 sealing is discretionary - the court considers public safety, nature of crimes, and rehabilitation. An experienced criminal defense attorney can strengthen your petition with proper legal arguments and supporting evidence. Contact Legal Aid Society or private counsel.",
      timeline: "Consult before filing petition",
      priority: 3
    });
    return buildFinalResult();
  }

  // PRIORITY 5: Not Currently Eligible
  eligibilityStatus = 'not_eligible';
  
  // Determine specific reason for ineligibility and provide targeted recommendations
  if (convictionLevel === "misdemeanor" && yearsPassedSince < 3) {
    const yearsRemaining = 3 - yearsPassedSince;
    const monthsRemaining = Math.ceil(yearsRemaining * 12);
    const eligibilityDate = new Date();
    eligibilityDate.setMonth(eligibilityDate.getMonth() + monthsRemaining);
    
    eligibilityDetails.primaryReason = `Not enough time has passed for Clean Slate sealing (need ${yearsRemaining.toFixed(1)} more years)`;
    eligibilityDetails.waitingPeriodRequired = `${Math.ceil(yearsRemaining)} years`;
    
    recommendations.push({
      type: "reminder",
      title: "Set Clean Slate Eligibility Reminder",
      description: `Under CPL § 160.57, your misdemeanor conviction will become eligible for automatic sealing in approximately ${monthsRemaining} months (around ${eligibilityDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}). Mark your calendar to check eligibility status after November 16, 2024.`,
      timeline: `Check again in ${Math.ceil(yearsRemaining)} years`,
      priority: 1
    }, {
      type: "document",
      title: "Maintain Clean Record During Waiting Period",
      description: "To preserve Clean Slate eligibility, avoid any new criminal convictions during the waiting period. Any new conviction could reset the clock or disqualify you from automatic sealing.",
      timeline: "Ongoing until eligibility",
      priority: 2
    });
  } else if (convictionLevel === "felony" && yearsPassedSince < 8) {
    const yearsRemaining = 8 - yearsPassedSince;
    const monthsRemaining = Math.ceil(yearsRemaining * 12);
    const eligibilityDate = new Date();
    eligibilityDate.setMonth(eligibilityDate.getMonth() + monthsRemaining);
    
    eligibilityDetails.primaryReason = `Not enough time has passed for Clean Slate sealing (need ${yearsRemaining.toFixed(1)} more years)`;
    eligibilityDetails.waitingPeriodRequired = `${Math.ceil(yearsRemaining)} years`;
    
    recommendations.push({
      type: "reminder",
      title: "Schedule Future Clean Slate Assessment",
      description: `Your felony conviction requires 8 years under CPL § 160.57. You'll become eligible around ${eligibilityDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Set a reminder to reassess eligibility after this date and the November 16, 2024 Clean Slate implementation.`,
      timeline: `Reassess in ${Math.ceil(yearsRemaining)} years`,
      priority: 1
    }, {
      type: "document",
      title: "Consider Early Petition-Based Relief",
      description: "While waiting for Clean Slate eligibility, explore CPL § 160.59 petition-based sealing if you have ≤2 total convictions and 10+ years have passed. This requires court approval but may provide earlier relief than automatic sealing.",
      timeline: "If 10+ years have passed since conviction",
      priority: 2
    });
  } else if (otherConvictions === "yes") {
    eligibilityDetails.primaryReason = "Additional convictions prevent automatic sealing under Clean Slate Act";
    
    recommendations.push({
      type: "petition",
      title: "Explore Petition-Based Sealing for Multiple Convictions",
      description: "While multiple convictions disqualify you from Clean Slate automatic sealing, you may still qualify for petition-based sealing under CPL § 160.59 if you have ≤2 total convictions, ≤1 felony, and 10+ years have passed since your last conviction.",
      timeline: "If criteria are met",
      priority: 1
    }, {
      type: "legal_help",
      title: "Consult Attorney About Individual Case Analysis",
      description: "Multiple convictions create complex eligibility scenarios. A criminal defense attorney can analyze each conviction individually to determine if any qualify for separate relief pathways or if petition-based sealing remains viable.",
      timeline: "Within 60 days",
      priority: 2
    });
  } else if (parseInt(totalConvictions || "0") > 2) {
    eligibilityDetails.primaryReason = "Too many total convictions for petition-based sealing (maximum 2 under CPL § 160.59)";
    
    recommendations.push({
      type: "legal_help",
      title: "Explore Alternative Relief Options",
      description: "With more than 2 convictions, standard sealing options are limited. Consult with a criminal defense attorney about potential Certificate of Relief from Disabilities, Certificate of Good Conduct, or individual conviction challenges that might reduce your total conviction count.",
      timeline: "Consult within 90 days",
      priority: 1
    }, {
      type: "future",
      title: "Monitor Legislative Changes",
      description: "Criminal justice reform continues to evolve in New York. Future legislation may expand relief options for individuals with multiple convictions. Check periodically for new programs or expanded eligibility criteria.",
      timeline: "Annually",
      priority: 2
    });
  } else if (tenYearsPassed === "no") {
    eligibilityDetails.primaryReason = "Less than 10 years have passed since conviction for petition-based sealing under CPL § 160.59";
    
    recommendations.push({
      type: "reminder",
      title: "Set 10-Year Petition Eligibility Reminder",
      description: "CPL § 160.59 requires 10 years from conviction or release (whichever is later) for petition-based sealing. Calculate your exact eligibility date and set a calendar reminder to reassess petition options at that time.",
      timeline: "When 10 years have passed",
      priority: 1
    }, {
      type: "document",
      title: "Begin Preparing Petition Documentation Early",
      description: "Start gathering rehabilitation evidence now: employment records, education certificates, community service, character references. Having strong documentation ready will strengthen your eventual petition under CPL § 160.59.",
      timeline: "Start collecting now",
      priority: 2
    });
  } else {
    eligibilityDetails.primaryReason = "Does not meet current eligibility criteria for any relief pathway";
    
    recommendations.push({
      type: "legal_help",
      title: "Comprehensive Legal Consultation",
      description: "Your case doesn't fit standard relief categories. A criminal defense attorney can review your specific circumstances for overlooked options: conviction challenges, sentence modifications, or alternative relief programs not covered in this assessment.",
      timeline: "Schedule within 30 days",
      priority: 1
    }, {
      type: "future",
      title: "Periodic Eligibility Review",
      description: "Criminal justice laws evolve regularly. New relief programs or expanded eligibility criteria may become available. Reassess your situation annually or when major criminal justice reforms are enacted.",
      timeline: "Annually",
      priority: 2
    });
  }

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
