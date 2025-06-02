import { analyzeEligibility } from './client/src/lib/eligibility';

const testCases = [
  {
    name: '✅ MRTA Expungement – PL 221.05 (2016)',
    input: {
      convictionState: 'ny',
      hasMarijuanaConviction: 'yes',
      offenseTypes: ['possession'],
      possessionAmount: 'yes',
      convictionMonth: '01',
      convictionYear: '2016',
      receivedNotice: 'no',
      convictionLevel: 'misdemeanor',
      servedTime: 'no',
      otherConvictions: 'no',
      onSupervision: 'no',
      hasExcludedOffenses: 'no',
      sentenceCompleted: 'yes',
    },
    expectedStatus: 'automatic_expungement'
  },
  {
    name: '🔐 Clean Slate – Misdemeanor 2019',
    input: {
      convictionState: 'ny',
      hasMarijuanaConviction: 'yes',
      offenseTypes: ['possession'],
      possessionAmount: 'no', // More than 3 ounces, so not MRTA eligible
      convictionMonth: '03',
      convictionYear: '2019',
      convictionLevel: 'misdemeanor',
      servedTime: 'no',
      releaseMonth: null,
      releaseYear: null,
      onSupervision: 'no',
      otherConvictions: 'no',
      hasExcludedOffenses: 'no',
      sentenceCompleted: 'yes',
    },
    expectedStatus: 'automatic_sealing'
  },
  {
    name: '🔐 Clean Slate – Felony Sale 2012 (8+ years)',
    input: {
      convictionState: 'ny',
      hasMarijuanaConviction: 'yes',
      offenseTypes: ['sale'],
      convictionMonth: '05',
      convictionYear: '2012',
      convictionLevel: 'felony',
      servedTime: 'yes',
      releaseMonth: '08',
      releaseYear: '2014',
      tenYearsPassed: 'yes',
      totalConvictions: '1',
      totalFelonies: '1',
      otherConvictions: 'no',
      onSupervision: 'no',
      hasExcludedOffenses: 'no',
      sentenceCompleted: 'yes',
    },
    expectedStatus: 'automatic_sealing'
  },
  {
    name: '❌ Not Eligible – Too Recent',
    input: {
      convictionState: 'ny',
      hasMarijuanaConviction: 'yes',
      offenseTypes: ['possession'],
      possessionAmount: 'yes',
      convictionMonth: '12',
      convictionYear: '2022',
      convictionLevel: 'misdemeanor',
      servedTime: 'no',
      onSupervision: 'no',
      otherConvictions: 'no',
      hasExcludedOffenses: 'no',
      sentenceCompleted: 'yes',
    },
    expectedStatus: 'not_eligible'
  },
  {
    name: '❌ Excluded Offense – Class A Felony',
    input: {
      convictionState: 'ny',
      hasMarijuanaConviction: 'yes',
      offenseTypes: ['sale'],
      convictionMonth: '05',
      convictionYear: '2015',
      convictionLevel: 'felony',
      onSupervision: 'no',
      hasExcludedOffenses: 'yes', // Class A felony or sex offense
      sentenceCompleted: 'yes',
    },
    expectedStatus: 'not_eligible'
  },
  {
    name: '❌ Currently on Supervision',
    input: {
      convictionState: 'ny',
      hasMarijuanaConviction: 'yes',
      offenseTypes: ['possession'],
      possessionAmount: 'yes',
      convictionMonth: '01',
      convictionYear: '2016',
      convictionLevel: 'misdemeanor',
      onSupervision: 'yes', // Currently on probation/parole
      hasExcludedOffenses: 'no',
      sentenceCompleted: 'no',
    },
    expectedStatus: 'not_eligible'
  },
  {
    name: '🔐 Clean Slate – Felony 2015 (8+ years)',
    input: {
      convictionState: 'ny',
      hasMarijuanaConviction: 'yes',
      offenseTypes: ['possession_intent'],
      convictionMonth: '01',
      convictionYear: '2015',
      convictionLevel: 'felony',
      servedTime: 'yes',
      releaseMonth: '12',
      releaseYear: '2016',
      onSupervision: 'no',
      otherConvictions: 'no',
      hasExcludedOffenses: 'no',
      sentenceCompleted: 'yes',
    },
    expectedStatus: 'automatic_sealing'
  },
  {
    name: '📝 Petition Sealing – Recent Felony (10+ years, multiple convictions)',
    input: {
      convictionState: 'ny',
      hasMarijuanaConviction: 'yes',
      offenseTypes: ['cultivation'],
      convictionMonth: '01',
      convictionYear: '2010',
      convictionLevel: 'felony',
      servedTime: 'yes',
      releaseMonth: '06',
      releaseYear: '2012',
      tenYearsPassed: 'yes',
      totalConvictions: '2',
      totalFelonies: '1',
      otherConvictions: 'yes', // This prevents Clean Slate eligibility
      onSupervision: 'no',
      hasExcludedOffenses: 'no',
      sentenceCompleted: 'yes',
    },
    expectedStatus: 'petition_sealing'
  }
];

console.log('🧪 NY Expungement Eligibility Test Runner');
console.log('==========================================\n');

let passCount = 0;
let totalTests = testCases.length;

testCases.forEach((test, index) => {
  try {
    const result = analyzeEligibility(test.input);
    
    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`Expected Status: ${test.expectedStatus}`);
    console.log(`Actual Status: ${result.eligibilityStatus}`);
    console.log(`Primary Reason: ${result.eligibilityDetails.primaryReason}`);
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log(`Recommendations:`);
      result.recommendations.slice(0, 2).forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec.title} – ${rec.description.substring(0, 60)}...`);
      });
    }

    const pass = result.eligibilityStatus === test.expectedStatus;
    console.log(`Result: ${pass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (pass) {
      passCount++;
    } else {
      console.log(`❌ MISMATCH: Expected '${test.expectedStatus}' but got '${result.eligibilityStatus}'`);
    }
    
    console.log('-'.repeat(80));
    
  } catch (error) {
    console.log(`❌ ERROR in test: ${test.name}`);
    console.log(`Error: ${error.message}`);
    console.log('-'.repeat(80));
  }
});

console.log(`\n📊 Test Summary:`);
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${totalTests - passCount}`);
console.log(`Success Rate: ${((passCount / totalTests) * 100).toFixed(1)}%`);

if (passCount === totalTests) {
  console.log('🎉 All tests passed! Eligibility logic is working correctly.');
} else {
  console.log('⚠️  Some tests failed. Review the eligibility logic for inconsistencies.');
}