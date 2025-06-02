// Legal document templates for NY Record Relief

export interface TemplateData {
  '[YOUR FULL NAME]': string;
  '[YOUR ADDRESS]': string;
  '[CITY, STATE, ZIP CODE]': string;
  '[PHONE NUMBER]': string;
  '[EMAIL ADDRESS]': string;
  '[COUNTY NAME]': string;
  '[DATE]': string;
  '[DOCKET NUMBER]': string;
  '[OFFENSE]': string;
  '[DATE OF CONVICTION]': string;
  '[COURT OF CONVICTION]': string;
  '[DA OFFICE ADDRESS]': string;
  '[COURT ADDRESS]': string;
  '[CONVICTION YEAR]': string;
  '[CONVICTION LEVEL]': string;
}

export const petitionTemplate = `SUPREME COURT OF THE STATE OF NEW YORK
[COUNTY NAME] COUNTY

------------------------------------------------------------X
In the Matter of the Application of

      [YOUR FULL NAME]
      [YOUR ADDRESS]
      [CITY, STATE, ZIP CODE]
      [PHONE NUMBER]

                             Applicant,

               -against-                                   NOTICE OF MOTION
                                                           TO SEAL CONVICTION
                                                           UNDER CPL § 160.59
THE PEOPLE OF THE STATE OF NEW YORK,

                             Respondent.
------------------------------------------------------------X

TO: District Attorney
    Office of the District Attorney
    [COUNTY NAME] County
    [DA OFFICE ADDRESS]

PLEASE TAKE NOTICE that upon the annexed affidavit in support, the exhibits attached thereto, and all prior pleadings and proceedings herein, the undersigned will move this Court at the Supreme Court of the State of New York, [COUNTY NAME] County, located at [COURT ADDRESS], on [DATE], or as soon thereafter as counsel can be heard, for an order pursuant to Criminal Procedure Law § 160.59, granting the applicant's motion to seal the conviction(s) entered against [YOUR FULL NAME] in the case(s) listed below:

- Docket Number(s): [DOCKET NUMBER]
- Offense: [OFFENSE]
- Date of Conviction: [DATE OF CONVICTION]
- Court of Conviction: [COURT OF CONVICTION]

The applicant respectfully requests that the Court grant this motion to seal the above conviction(s), pursuant to CPL § 160.59, and for such other and further relief as the Court may deem just and proper.

DATED: [CITY, STATE, ZIP CODE]
       [DATE]

Respectfully submitted,

_________________________________
[YOUR FULL NAME]
Applicant, Pro Se`;

export const affidavitTemplate = `SUPREME COURT OF THE STATE OF NEW YORK
[COUNTY NAME] COUNTY

------------------------------------------------------------X
In the Matter of the Application of

      [YOUR FULL NAME]

                             Applicant,
                                                           AFFIDAVIT IN SUPPORT
               -against-                                   OF MOTION TO SEAL
                                                           CONVICTION UNDER
THE PEOPLE OF THE STATE OF NEW YORK,                      CPL § 160.59

                             Respondent.
------------------------------------------------------------X

STATE OF NEW YORK    )
                     ) ss.:
COUNTY OF [COUNTY NAME] )

[YOUR FULL NAME], being duly sworn, deposes and says:

1. I am the applicant in the above-entitled proceeding and make this affidavit in support of my motion to seal my criminal conviction pursuant to Criminal Procedure Law § 160.59.

2. I was convicted of [OFFENSE] on [DATE OF CONVICTION] in [COURT OF CONVICTION], under Docket Number [DOCKET NUMBER].

3. More than ten (10) years have passed since my conviction and completion of sentence, including any period of incarceration, probation, or parole.

4. I have no more than two (2) criminal convictions in New York State, and no more than one (1) of those convictions is for a felony offense.

5. I have no pending criminal charges in any jurisdiction.

6. Since my conviction, I have demonstrated rehabilitation through [DESCRIBE REHABILITATION EFFORTS - employment, education, community service, etc.].

7. The sealing of this conviction would serve the interests of justice and public safety by allowing me to fully reintegrate into society and contribute positively to my community.

8. I respectfully request that this Court grant my motion to seal the above-referenced conviction pursuant to CPL § 160.59.

WHEREFORE, I respectfully request that this Court grant my motion to seal my criminal conviction.

_________________________________
[YOUR FULL NAME]
Applicant

Sworn to before me this
_____ day of _______, 20__

_________________________________
Notary Public`;

export const cleanSlateRequestTemplate = `[DATE]

[YOUR FULL NAME]
[YOUR ADDRESS]
[CITY, STATE, ZIP CODE]
[PHONE NUMBER]
[EMAIL ADDRESS]

New York State Division of Criminal Justice Services
Office of Public Safety
Alfred E. Smith Building
80 South Swan Street
Albany, NY 12210

RE: Request for Criminal History Record (RAP Sheet) - Clean Slate Act Verification

Dear Records Bureau:

I am writing to request a copy of my criminal history record (commonly known as a "RAP sheet") to verify the status of my conviction(s) under New York's Clean Slate Act, which became effective November 16, 2024.

Personal Information:
Name: [YOUR FULL NAME]
Date of Birth: [DATE OF BIRTH]
Social Security Number: [SSN] (if providing)
Address: [YOUR ADDRESS], [CITY, STATE, ZIP CODE]

I was convicted of [OFFENSE] in [CONVICTION YEAR] in [COUNTY NAME] County. Under Criminal Procedure Law § 160.57 (Clean Slate Act), this conviction should now be automatically sealed.

I am requesting this record to:
☐ Verify that my conviction has been properly sealed under the Clean Slate Act
☐ Obtain documentation for employment/housing purposes
☐ Confirm my current criminal record status

Please send the criminal history record to the address listed above. I understand there may be a processing fee and am prepared to submit payment as required.

If you need any additional information or documentation, please contact me at [PHONE NUMBER] or [EMAIL ADDRESS].

Thank you for your assistance.

Sincerely,

_________________________________
[YOUR FULL NAME]

Enclosures: [Copy of ID, payment if required]`;

export const mrtaVerificationTemplate = `[DATE]

[YOUR FULL NAME]
[YOUR ADDRESS]
[CITY, STATE, ZIP CODE]
[PHONE NUMBER]
[EMAIL ADDRESS]

[COURT OF CONVICTION]
[COURT ADDRESS]
[CITY, STATE, ZIP CODE]

RE: Request for Certificate of Disposition - MRTA Expungement Verification
    Case Number: [DOCKET NUMBER]

Dear Court Clerk:

I am writing to request a Certificate of Disposition (Form OCA-394) to verify the expungement status of my marijuana-related conviction under the Marihuana Regulation and Taxation Act (MRTA) of 2021.

Case Information:
Defendant Name: [YOUR FULL NAME]
Case/Docket Number: [DOCKET NUMBER]
Date of Conviction: [DATE OF CONVICTION]
Offense: [OFFENSE]
Court: [COURT OF CONVICTION]

Under Criminal Procedure Law § 160.50(3)(k), marijuana possession convictions that occurred prior to March 31, 2021, are subject to automatic expungement. I believe my conviction qualifies for this relief and request documentation showing the current status of this case.

Please provide a Certificate of Disposition that reflects:
- The original conviction details
- Current status (sealed/expunged pursuant to CPL § 160.50(3)(k))
- Date of expungement processing

I understand there may be a fee for this service and am prepared to submit payment as required. Please let me know the exact amount and acceptable forms of payment.

If you need any additional information to process this request, please contact me at [PHONE NUMBER] or [EMAIL ADDRESS].

Thank you for your assistance in this matter.

Sincerely,

_________________________________
[YOUR FULL NAME]

Enclosures: [Copy of ID, payment if required]`;

export function renderTemplate(template: string, data: Partial<TemplateData>): string {
  let rendered = template;
  
  // Replace all placeholders with provided data
  Object.entries(data).forEach(([placeholder, value]) => {
    if (value) {
      rendered = rendered.replaceAll(placeholder, value);
    }
  });
  
  // Add current date if not provided
  if (!data['[DATE]']) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    rendered = rendered.replaceAll('[DATE]', currentDate);
  }
  
  return rendered;
}

export function mapUserDataToTemplate(
  questionnaireData: any,
  user: any,
  additionalData?: Partial<TemplateData>
): Partial<TemplateData> {
  const baseData: Partial<TemplateData> = {
    '[YOUR FULL NAME]': `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || '',
    '[EMAIL ADDRESS]': user?.email || '',
    '[CONVICTION YEAR]': questionnaireData?.convictionYear || '',
    '[CONVICTION LEVEL]': questionnaireData?.convictionLevel || '',
    '[OFFENSE]': Array.isArray(questionnaireData?.offenseTypes) 
      ? questionnaireData.offenseTypes.join(', ') 
      : questionnaireData?.offenseTypes || '',
    '[DATE OF CONVICTION]': questionnaireData?.convictionMonth && questionnaireData?.convictionYear
      ? `${questionnaireData.convictionMonth}/${questionnaireData.convictionYear}`
      : '',
    ...additionalData
  };
  
  return baseData;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  requiredFields: string[];
  eligibilityTypes: string[];
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'petition',
    title: 'Notice of Motion to Seal Conviction (CPL § 160.59)',
    description: 'Formal petition to the court requesting record sealing under petition-based sealing',
    template: petitionTemplate,
    requiredFields: ['[YOUR FULL NAME]', '[COUNTY NAME]', '[DOCKET NUMBER]', '[OFFENSE]', '[DATE OF CONVICTION]', '[COURT OF CONVICTION]'],
    eligibilityTypes: ['petition_sealing']
  },
  {
    id: 'affidavit',
    title: 'Affidavit in Support of Motion to Seal',
    description: 'Sworn statement supporting your petition for record sealing',
    template: affidavitTemplate,
    requiredFields: ['[YOUR FULL NAME]', '[COUNTY NAME]', '[DOCKET NUMBER]', '[OFFENSE]', '[DATE OF CONVICTION]', '[COURT OF CONVICTION]'],
    eligibilityTypes: ['petition_sealing']
  },
  {
    id: 'clean-slate-request',
    title: 'Clean Slate Act Verification Request',
    description: 'Request letter to DCJS for RAP sheet to verify Clean Slate automatic sealing',
    template: cleanSlateRequestTemplate,
    requiredFields: ['[YOUR FULL NAME]', '[OFFENSE]', '[CONVICTION YEAR]', '[COUNTY NAME]'],
    eligibilityTypes: ['automatic_sealing']
  },
  {
    id: 'mrta-verification',
    title: 'MRTA Expungement Verification Request',
    description: 'Request letter to court clerk for Certificate of Disposition showing MRTA expungement',
    template: mrtaVerificationTemplate,
    requiredFields: ['[YOUR FULL NAME]', '[DOCKET NUMBER]', '[OFFENSE]', '[DATE OF CONVICTION]', '[COURT OF CONVICTION]'],
    eligibilityTypes: ['automatic_expungement']
  }
];

export function getAvailableTemplates(eligibilityStatus: string): DocumentTemplate[] {
  return documentTemplates.filter(template => 
    template.eligibilityTypes.includes(eligibilityStatus)
  );
}