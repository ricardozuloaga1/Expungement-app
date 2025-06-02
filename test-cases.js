// Four comprehensive test cases for NY Record Relief eligibility assessment

const testCases = [
  {
    name: "MRTA Automatic Expungement - Marijuana Possession 2018",
    description: "Marijuana possession conviction from 2018, qualifies for automatic expungement under MRTA",
    input: {
      convictionState: "ny",
      hasMarijuanaConviction: "yes",
      offenseTypes: ["possession"],
      convictionMonth: "6",
      convictionYear: "2018",
      possessionAmount: "yes",
      ageAtOffense: "25",
      receivedNotice: "no",
      onSupervision: "no",
      hasExcludedOffenses: "no"
    },
    expectedStatus: "automatic_expungement",
    expectedOutcome: "Eligible for automatic expungement under MRTA 2021"
  },

  {
    name: "Clean Slate Misdemeanor - Drug Possession 2020",
    description: "Single misdemeanor drug possession from 2020, qualifies for Clean Slate automatic sealing",
    input: {
      convictionState: "ny",
      hasMarijuanaConviction: "no",
      offenseTypes: ["possession"],
      convictionMonth: "3",
      convictionYear: "2020",
      convictionLevel: "misdemeanor",
      servedTime: "no",
      otherConvictions: "no",
      onSupervision: "no",
      hasExcludedOffenses: "no"
    },
    expectedStatus: "automatic_sealing",
    expectedOutcome: "Eligible for automatic sealing under Clean Slate Act (misdemeanor, 3+ years)"
  },

  {
    name: "Petition-Based Sealing - Two Convictions from 2010",
    description: "Two misdemeanor convictions from 2010, may qualify for petition-based sealing",
    input: {
      convictionState: "ny",
      hasMarijuanaConviction: "no",
      offenseTypes: ["theft", "drug possession"],
      convictionMonth: "8",
      convictionYear: "2010",
      convictionLevel: "misdemeanor",
      servedTime: "no",
      otherConvictions: "yes",
      onSupervision: "no",
      hasExcludedOffenses: "no",
      totalConvictions: "2",
      totalFelonies: "0",
      tenYearsPassed: "yes",
      sentenceCompleted: "yes"
    },
    expectedStatus: "petition_sealing",
    expectedOutcome: "Eligible for petition-based sealing under CPL § 160.59"
  },

  {
    name: "Not Eligible - Recent Felony 2022",
    description: "Recent felony conviction from 2022, not enough time passed for any relief",
    input: {
      convictionState: "ny",
      hasMarijuanaConviction: "no",
      offenseTypes: ["drug sale"],
      convictionMonth: "9",
      convictionYear: "2022",
      convictionLevel: "felony",
      servedTime: "yes",
      releaseMonth: "12",
      releaseYear: "2023",
      otherConvictions: "no",
      onSupervision: "no",
      hasExcludedOffenses: "no",
      totalConvictions: "1",
      totalFelonies: "1",
      tenYearsPassed: "no",
      sentenceCompleted: "yes"
    },
    expectedStatus: "not_eligible",
    expectedOutcome: "Not enough time has passed for Clean Slate sealing (need 6+ more years)"
  }
];

// Export for use in testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testCases;
}

// For browser usage
if (typeof window !== 'undefined') {
  window.testCases = testCases;
}

console.log("Test Cases Loaded:");
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Description: ${testCase.description}`);
  console.log(`   Expected: ${testCase.expectedOutcome}`);
  console.log("");
});