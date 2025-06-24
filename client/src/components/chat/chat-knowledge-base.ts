export const NY_EXPUNGEMENT_KNOWLEDGE_BASE = {
  // Core Legal Framework
  legalFramework: {
    mrta2021: {
      title: "Marijuana Regulation and Taxation Act (MRTA) 2021",
      description: "Automatic expungement for certain marijuana convictions",
      eligibility: [
        "Possession convictions before March 31, 2021",
        "3 ounces or less of marijuana",
        "Automatic process - no petition required"
      ],
      timeline: "Should already be completed by courts",
      citation: "NY Cannabis Law § 222"
    },
    cleanSlateAct: {
      title: "Clean Slate Act (Effective November 2024)",
      description: "Automatic sealing of eligible criminal records",
      eligibility: {
        misdemeanor: "3+ years after completion of sentence, no other convictions",
        felony: "8+ years after completion of sentence, no other convictions"
      },
      exclusions: [
        "Sex offenses",
        "Class A felonies", 
        "Pending charges",
        "Current supervision"
      ],
      citation: "NY CPL § 160.59"
    },
    petitionBasedSealing: {
      title: "Petition-Based Sealing (CPL § 160.59)",
      description: "Court petition for record sealing",
      eligibility: [
        "10+ years since conviction/sentence completion",
        "Maximum 2 total convictions",
        "Maximum 1 felony conviction",
        "All sentence conditions completed",
        "No excluded offenses"
      ],
      process: "Formal court petition required",
      timeline: "6-12 months average processing time"
    }
  },

  // Definitions and Key Concepts
  definitions: {
    expungement: "Complete destruction of criminal records - as if the arrest/conviction never happened",
    sealing: "Records hidden from public view but may still be accessible to certain agencies",
    automaticProcess: "No action required by individual - courts handle automatically",
    petitionProcess: "Requires formal application and court approval",
    excludedOffenses: [
      "Class A felonies (most serious felonies)",
      "Sex offenses requiring registration",
      "Certain violent felonies"
    ]
  },

  // Common Questions and Accurate Answers
  commonQuestions: {
    "What's the difference between expungement and sealing?": {
      answer: "Expungement completely destroys records (MRTA 2021), while sealing hides them from public view but keeps them accessible to certain agencies (Clean Slate Act, petition-based sealing).",
      relevantLaw: "MRTA 2021 vs CPL § 160.59"
    },
    "How long does the process take?": {
      answer: "MRTA automatic expungement should already be complete. Clean Slate sealing begins November 2024. Petition-based sealing takes 6-12 months after filing.",
      context: "Varies by pathway"
    },
    "Do I need a lawyer?": {
      answer: "Not required for automatic processes (MRTA, Clean Slate). Recommended for petition-based sealing due to complexity and discretionary nature.",
      disclaimer: "This is general information, not legal advice"
    }
  },

  // Strict Response Guidelines
  responseGuidelines: {
    allowedTopics: [
      "NY expungement and sealing laws",
      "MRTA 2021 provisions",
      "Clean Slate Act details",
      "Petition-based sealing process",
      "Eligibility requirements",
      "Timelines and procedures",
      "Definitions of legal terms",
      "General process information"
    ],
    prohibitedResponses: [
      "Specific legal advice for individual cases",
      "Predictions about case outcomes",
      "Advice about other states' laws",
      "Immigration consequences",
      "Employment law advice",
      "Federal law questions",
      "Court strategy recommendations"
    ],
    requiredDisclaimers: [
      "This is general information, not legal advice",
      "Consult with a qualified attorney for case-specific guidance",
      "Laws and procedures may change"
    ]
  },

  // Legal Citations and Sources
  legalCitations: {
    "NY Cannabis Law § 222": "MRTA automatic expungement provisions",
    "NY CPL § 160.59": "Sealing of criminal records",
    "NY CPL § 160.50": "Sealing upon termination in favor of accused",
    "NY Executive Law § 296": "Human Rights Law - use of criminal records"
  }
};

export const SYSTEM_PROMPT = `You are a specialized AI assistant for NY marijuana expungement law. You have access to comprehensive, accurate information about New York State expungement and sealing laws.

STRICT GUIDELINES:
1. ONLY answer questions directly related to NY marijuana expungement, sealing, MRTA 2021, Clean Slate Act, or petition-based sealing
2. Base ALL responses on the provided knowledge base - never speculate or assume
3. Always include appropriate legal disclaimers
4. If asked about other topics, politely redirect to relevant legal resources
5. Never provide specific legal advice - only general information about laws and procedures
6. If uncertain about any detail, state that and recommend consulting an attorney

RESPONSE FORMAT:
- Start with direct answer to the question
- Include relevant legal citations when applicable  
- End with appropriate disclaimers
- Keep responses concise but comprehensive
- Use professional, accessible language

PROHIBITED RESPONSES:
- Case outcome predictions
- Other states' laws
- Immigration advice
- Employment law
- Federal law questions
- Specific legal strategy

Remember: You provide general legal information, not legal advice.`; 