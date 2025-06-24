import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChoiceCard } from "@/components/ui/choice-card";
import { HelpCircle, Upload, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface QuestionnaireStepProps {
  step: number;
  data: any;
  onUpdate: (field: string, value: any) => void;
}

export function QuestionnaireStep({ step, data, onUpdate }: QuestionnaireStepProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const renderTooltip = (content: string, id: string) => (
    <div className="relative inline-block">
      <Button 
        variant="ghost" 
        size="sm" 
        className="ml-2 h-auto p-1"
        onMouseEnter={() => setShowTooltip(id)}
        onMouseLeave={() => setShowTooltip(null)}
      >
        <HelpCircle className="w-4 h-4 text-primary" />
      </Button>
      {showTooltip === id && (
        <div className="absolute z-10 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg -top-2 left-full ml-2">
          <p className="text-sm text-gray-700">{content}</p>
        </div>
      )}
    </div>
  );

  // Generate years array once to avoid re-computation
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = [];
    for (let i = 0; i < 30; i++) {
      yearsList.push(currentYear - i);
    }
    return yearsList;
  }, []);

  const stepContent = () => {
  switch (step) {
    case 1:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              Basic Information
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              Let's start with some basic details to determine which laws apply to your situation.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Which state were you convicted in?
                {renderTooltip("We currently only support New York convictions. Other states have different laws.", "state")}
              </Label>
                <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "ny", title: "New York", description: "All NY counties supported" },
                  { id: "other", title: "Another state", description: "Not currently supported" },
                  { id: "not_sure", title: "I'm not sure", description: "We'll help you figure this out" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.convictionState === option.id}
                    onClick={() => onUpdate("convictionState", option.id)}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              Conviction Status
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              Tell us about your marijuana-related conviction history.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Have you ever been convicted of a marijuana-related offense in New York?
                {renderTooltip("A conviction means you pleaded guilty or were found guilty by a court.", "conviction")}
              </Label>
                <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "I have been convicted" },
                  { id: "no", title: "No", description: "I have not been convicted" },
                  { id: "not_sure", title: "Not sure", description: "I need help understanding this" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.hasMarijuanaConviction === option.id}
                    onClick={() => onUpdate("hasMarijuanaConviction", option.id)}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              Type of Offense
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              Help us understand what type of marijuana conviction you have.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                What type of marijuana conviction(s) do you have? (Select all that apply)
                {renderTooltip("Different offense types have different eligibility rules for expungement. You can select multiple if you have more than one type.", "offense-type")}
              </Label>
                <div className="space-y-3">
                {[
                  { id: "possession", title: "Possession (personal use)", description: "Simple possession for personal consumption" },
                  { id: "possession_intent", title: "Possession with intent to distribute", description: "Possession with plans to sell or distribute" },
                  { id: "sale", title: "Sale/distribution", description: "Actually selling or distributing marijuana" },
                  { id: "cultivation", title: "Cultivation", description: "Growing marijuana plants" },
                  { id: "other", title: "Other", description: "Paraphernalia, public use, etc." },
                  { id: "dont_know", title: "I don't know", description: "Not sure about the specific charge" }
                ].map((option) => {
                  const selectedOffenses = data.offenseTypes || [];
                  const isSelected = selectedOffenses.includes(option.id);
                  
                  const handleToggle = () => {
                    let newOffenses;
                    if (isSelected) {
                      newOffenses = selectedOffenses.filter((id: string) => id !== option.id);
                    } else {
                      newOffenses = [...selectedOffenses, option.id];
                    }
                    onUpdate("offenseTypes", newOffenses);
                  };

                  return (
                      <ChoiceCard
                      key={option.id}
                        title={option.title}
                        description={option.description}
                        isSelected={isSelected}
                      onClick={handleToggle}
                      />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              Conviction Timeline
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              When your conviction occurred affects which expungement laws apply.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="block text-base font-medium text-[#111827] mb-3">
                When were you convicted?
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Month</Label>
                  <Select value={data.convictionMonth || ""} onValueChange={(value) => onUpdate("convictionMonth", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Year</Label>
                  <Select value={data.convictionYear || ""} onValueChange={(value) => onUpdate("convictionYear", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Do you know the specific Penal Law code for your conviction?
                {renderTooltip("This helps provide more accurate legal analysis. Look for codes like 'PL 221.10' or '221.05' on your court documents.", "penal-code")}
              </Label>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Optional but recommended:</strong> Check your court documents, RAP sheet, or Certificate of Disposition for codes like "PL 221.10" or "Penal Law § 221.05"
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="know-code"
                    name="knowsPenalCode"
                    checked={data.knowsPenalCode === "yes"}
                    onChange={() => onUpdate("knowsPenalCode", "yes")}
                    className="w-4 h-4 text-primary"
                  />
                  <Label htmlFor="know-code">Yes, I know the code</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="dont-know-code"
                    name="knowsPenalCode"
                    checked={data.knowsPenalCode === "no"}
                    onChange={() => onUpdate("knowsPenalCode", "no")}
                    className="w-4 h-4 text-primary"
                  />
                  <Label htmlFor="dont-know-code">No, I don't know</Label>
                </div>
              </div>
              
              {data.knowsPenalCode === "yes" && (
                <div className="mt-3">
                  <Input
                    placeholder="Enter Penal Law code (e.g., PL 221.10)"
                    value={data.penalCode || ""}
                    onChange={(e) => onUpdate("penalCode", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              MRTA Automatic Expungement
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              The Marijuana Regulation and Taxation Act (MRTA) automatically expunged certain marijuana convictions.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Was your marijuana conviction for possession of 3 ounces (85g) or less?
                {renderTooltip("MRTA automatically expunged convictions for possession of 3 ounces or less.", "three-ounces")}
              </Label>
                <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "3 ounces or less" },
                  { id: "no", title: "No", description: "More than 3 ounces" },
                  { id: "not_sure", title: "Not sure", description: "I don't know the amount" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.possessionAmount === option.id}
                    onClick={() => onUpdate("possessionAmount", option.id)}
                    />
                ))}
              </div>
            </div>
            
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Were you 21 or older at the time of the offense?
                {renderTooltip("Age affects eligibility under different provisions of the law.", "age-at-offense")}
              </Label>
                <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "I was 21 or older" },
                  { id: "no", title: "No", description: "I was under 21" },
                  { id: "not_sure", title: "Not sure", description: "I don't remember my exact age" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.ageAtOffense === option.id}
                    onClick={() => onUpdate("ageAtOffense", option.id)}
                    />
                ))}
              </div>
            </div>
            
            <div>
                <Label className="block text-base font-medium text-[#111827] mb-3">
                Have you ever received a notice from the court about your record being sealed or expunged?
              </Label>
                <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "I received official notice" },
                  { id: "no", title: "No", description: "I haven't received any notice" },
                  { id: "not_sure", title: "Not sure", description: "I might have missed it" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.receivedNotice === option.id}
                    onClick={() => onUpdate("receivedNotice", option.id)}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 6:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              Clean Slate Act Eligibility
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              The Clean Slate Act (effective 2024) automatically seals certain records after specific time periods.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Was your conviction a felony or a misdemeanor?
                {renderTooltip("Felonies require 8 years, misdemeanors require 3 years for automatic sealing.", "felony-misdemeanor")}
              </Label>
                <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "felony", title: "Felony", description: "More serious offense" },
                  { id: "misdemeanor", title: "Misdemeanor", description: "Less serious offense" },
                  { id: "not_sure", title: "Not sure", description: "I don't know the classification" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.convictionLevel === option.id}
                    onClick={() => onUpdate("convictionLevel", option.id)}
                    />
                ))}
              </div>
            </div>
            
            <div>
                <Label className="block text-base font-medium text-[#111827] mb-3">
                Have you served jail or prison time for that offense?
              </Label>
                <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "I served time in jail or prison" },
                  { id: "no", title: "No", description: "I did not serve time" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.servedTime === option.id}
                    onClick={() => onUpdate("servedTime", option.id)}
                    />
                ))}
              </div>
            </div>
            
            {data.servedTime === "yes" && (
              <div>
                  <Label className="block text-base font-medium text-[#111827] mb-3">
                  When were you released from custody?
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Month</Label>
                    <Select value={data.releaseMonth || ""} onValueChange={(value) => onUpdate("releaseMonth", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Year</Label>
                    <Select value={data.releaseYear || ""} onValueChange={(value) => onUpdate("releaseYear", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 7:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              Criminal History
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              Information about other convictions affects your eligibility for automatic sealing.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="block text-base font-medium text-[#111827] mb-3">
                Have you been convicted of any other crime since that marijuana conviction?
              </Label>
                <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "I have other convictions" },
                  { id: "no", title: "No", description: "No other convictions" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.otherConvictions === option.id}
                    onClick={() => onUpdate("otherConvictions", option.id)}
                    />
                ))}
              </div>
            </div>
            
            <div>
                <Label className="block text-base font-medium text-[#111827] mb-3">
                Are you currently on probation or parole?
              </Label>
                <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "Currently on probation or parole" },
                  { id: "no", title: "No", description: "Not on probation or parole" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.onSupervision === option.id}
                    onClick={() => onUpdate("onSupervision", option.id)}
                    />
                ))}
              </div>
            </div>
            
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Are any of your convictions for a Class A felony or sex offense?
                {renderTooltip("Class A felonies and sex offenses are excluded from automatic sealing.", "excluded-offenses")}
              </Label>
                <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "I have excluded convictions" },
                  { id: "no", title: "No", description: "No excluded convictions" },
                  { id: "not_sure", title: "Not sure", description: "I'm not certain" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.hasExcludedOffenses === option.id}
                    onClick={() => onUpdate("hasExcludedOffenses", option.id)}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 8:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              Petition-Based Sealing
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              If you don't qualify for automatic sealing, you may be able to petition the court.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="block text-base font-medium text-[#111827] mb-3">
                How many total convictions do you have in New York?
              </Label>
              <Input
                type="number"
                min="0"
                max="20"
                placeholder="Number of convictions"
                value={data.totalConvictions || ""}
                onChange={(e) => onUpdate("totalConvictions", e.target.value)}
              />
            </div>
            
            <div>
                <Label className="block text-base font-medium text-[#111827] mb-3">
                How many of those are felonies?
              </Label>
              <Input
                type="number"
                min="0"
                max="20"
                placeholder="Number of felonies"
                value={data.totalFelonies || ""}
                onChange={(e) => onUpdate("totalFelonies", e.target.value)}
              />
            </div>
            
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Were all fines, probation, parole, or other sentence conditions completed?
                {renderTooltip("You must have completed all aspects of your sentence to be eligible for petition-based sealing.", "sentence-completed")}
              </Label>
                <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "yes", title: "Yes", description: "All sentence conditions completed" },
                  { id: "no", title: "No", description: "Still have pending obligations" },
                  { id: "not_sure", title: "Not sure", description: "I need to verify this" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.sentenceCompleted === option.id}
                    onClick={() => onUpdate("sentenceCompleted", option.id)}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 9:
      return (
        <div>
          <div className="mb-8">
              <h1 className="font-bold text-[#111827] mb-4" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
              Record Verification
            </h1>
              <p className="text-[#6B7280]" style={{ fontSize: '1rem' }}>
              Having your official records helps verify eligibility and prepare any necessary paperwork.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
                <Label className="flex items-center text-base font-medium text-[#111827] mb-3">
                Do you have a copy of your RAP sheet or criminal court record?
                {renderTooltip("A RAP sheet (Record of Arrests and Prosecutions) shows your complete criminal history.", "rap-sheet")}
              </Label>
                <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "yes", title: "Yes – I have it on hand", description: "I have my records available" },
                  { id: "no", title: "No – I need help obtaining it", description: "I need assistance getting records" }
                ].map((option) => (
                    <ChoiceCard
                    key={option.id}
                      title={option.title}
                      description={option.description}
                      isSelected={data.hasRecords === option.id}
                    onClick={() => onUpdate("hasRecords", option.id)}
                    />
                ))}
              </div>
            </div>
            
            {data.hasRecords === "no" && (
              <div>
                  <Label className="block text-base font-medium text-[#111827] mb-3">
                  Would you like assistance requesting your official RAP sheet?
                </Label>
                  <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "yes", title: "Yes", description: "I would like help with this" },
                    { id: "no", title: "No", description: "I'll handle this myself" }
                  ].map((option) => (
                      <ChoiceCard
                      key={option.id}
                        title={option.title}
                        description={option.description}
                        isSelected={data.wantsRapAssistance === option.id}
                      onClick={() => onUpdate("wantsRapAssistance", option.id)}
                      />
                  ))}
                </div>
              </div>
            )}
            
            <div>
                <Label className="block text-base font-medium text-[#111827] mb-3">
                Upload court record or RAP sheet (optional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports PDF, JPG, PNG files up to 5MB
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUpdate("uploadedDocument", file.name);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return <div>Invalid step</div>;
  }
  };

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {stepContent()}
    </motion.div>
  );
}
