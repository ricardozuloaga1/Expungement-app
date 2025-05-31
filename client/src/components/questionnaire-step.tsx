import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { HelpCircle } from "lucide-react";

interface QuestionnaireStepProps {
  step: number;
  data: any;
  onUpdate: (field: string, value: any) => void;
}

export function QuestionnaireStep({ step, data, onUpdate }: QuestionnaireStepProps) {
  const handleChargeTypeChange = (chargeType: string, checked: boolean) => {
    const currentTypes = data.chargeTypes || [];
    if (checked) {
      onUpdate("chargeTypes", [...currentTypes, chargeType]);
    } else {
      onUpdate("chargeTypes", currentTypes.filter((type: string) => type !== chargeType));
    }
  };

  switch (step) {
    case 1:
      return (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-dark mb-4">
              Let's start with some basic information
            </h1>
            <p className="text-lg text-neutral-medium">
              This helps us determine which New York laws apply to your situation.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-neutral-dark mb-3">
                What is your age?
                <Button variant="ghost" size="sm" className="ml-2 h-auto p-0">
                  <HelpCircle className="w-4 h-4 text-primary" />
                </Button>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => onUpdate("age", "under_21")}
                  className={`p-4 h-auto text-left justify-start ${
                    data.age === "under_21" ? "border-primary bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <div>
                    <div className="font-medium">Under 21</div>
                    <div className="text-sm text-neutral-medium">Different rules may apply</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onUpdate("age", "21_or_older")}
                  className={`p-4 h-auto text-left justify-start ${
                    data.age === "21_or_older" ? "border-primary bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <div>
                    <div className="font-medium">21 or older</div>
                    <div className="text-sm text-neutral-medium">Standard adult provisions</div>
                  </div>
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-neutral-dark mb-3">
                In which county were you arrested or convicted?
              </Label>
              <Select value={data.county || ""} onValueChange={(value) => onUpdate("county", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your county..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_york">New York County (Manhattan)</SelectItem>
                  <SelectItem value="kings">Kings County (Brooklyn)</SelectItem>
                  <SelectItem value="queens">Queens County</SelectItem>
                  <SelectItem value="bronx">Bronx County</SelectItem>
                  <SelectItem value="richmond">Richmond County (Staten Island)</SelectItem>
                  <SelectItem value="nassau">Nassau County</SelectItem>
                  <SelectItem value="suffolk">Suffolk County</SelectItem>
                  <SelectItem value="westchester">Westchester County</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-dark mb-4">
              Tell us about your marijuana-related charges
            </h1>
            <p className="text-lg text-neutral-medium">
              We need to understand the specific charges to determine eligibility.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-neutral-dark mb-3">
                What type of marijuana charges do you have? (Select all that apply)
              </Label>
              <div className="space-y-3">
                {[
                  { id: "possession", title: "Possession of marijuana", description: "Any amount for personal use" },
                  { id: "sale", title: "Sale of marijuana", description: "Distribution or intent to distribute" },
                  { id: "cultivation", title: "Cultivation/growing marijuana", description: "Growing plants for personal or commercial use" },
                  { id: "other", title: "Other marijuana-related charges", description: "Paraphernalia, public use, etc." }
                ].map((charge) => (
                  <div key={charge.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={charge.id}
                      checked={(data.chargeTypes || []).includes(charge.id)}
                      onCheckedChange={(checked) => handleChargeTypeChange(charge.id, checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor={charge.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{charge.title}</div>
                      <div className="text-sm text-neutral-medium">{charge.description}</div>
                    </Label>
                  </div>
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
            <h1 className="text-3xl font-bold text-neutral-dark mb-4">
              When did these charges occur?
            </h1>
            <p className="text-lg text-neutral-medium">
              The timing affects which expungement laws apply to your case.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-neutral-dark mb-3">
                When were you first arrested or cited for marijuana?
              </Label>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: "before_march_2021", title: "Before March 31, 2021", description: "May qualify for automatic expungement under MRTA" },
                  { id: "after_march_2021", title: "After March 31, 2021", description: "Different provisions may apply" },
                  { id: "not_sure", title: "I'm not sure", description: "We'll help you figure this out" }
                ].map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    onClick={() => onUpdate("firstArrestDate", option.id)}
                    className={`p-4 h-auto text-left justify-start ${
                      data.firstArrestDate === option.id ? "border-primary bg-blue-50" : "border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{option.title}</div>
                      <div className="text-sm text-neutral-medium">{option.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return <div>Invalid step</div>;
  }
}
