import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, Edit } from "lucide-react";
import { documentTemplates, getAvailableTemplates, mapUserDataToTemplate, renderTemplate, type TemplateData, type DocumentTemplate } from "@/lib/legal-templates";
import jsPDF from 'jspdf';

interface DocumentGeneratorProps {
  eligibilityStatus: string;
  questionnaireData: any;
  user: any | null;
}

export function DocumentGenerator({ eligibilityStatus, questionnaireData, user }: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [templateData, setTemplateData] = useState<Partial<TemplateData>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const availableTemplates = getAvailableTemplates(eligibilityStatus);

  if (availableTemplates.length === 0) {
    return null;
  }

  const handleGenerateDocument = (template: DocumentTemplate) => {
    const baseData = mapUserDataToTemplate(questionnaireData, user);
    setTemplateData(baseData);
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleDownloadPDF = () => {
    if (!selectedTemplate) return;

    const renderedTemplate = renderTemplate(selectedTemplate.template, templateData);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(selectedTemplate.title, margin, 20);
    
    // Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const lines = renderedTemplate.split('\n');
    let yPosition = 35;
    
    lines.forEach(line => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      if (line.trim()) {
        const wrappedLines = doc.splitTextToSize(line, maxWidth);
        wrappedLines.forEach((wrappedLine: string) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(wrappedLine, margin, yPosition);
          yPosition += 5;
        });
      } else {
        yPosition += 5;
      }
    });
    
    const fileName = `${selectedTemplate.id.replace('-', '_')}_${Date.now()}.pdf`;
    doc.save(fileName);
    setIsEditDialogOpen(false);
  };

  const handleCopyText = () => {
    if (!selectedTemplate) return;
    
    const renderedTemplate = renderTemplate(selectedTemplate.template, templateData);
    navigator.clipboard.writeText(renderedTemplate);
    setIsEditDialogOpen(false);
  };

  const updateTemplateData = (field: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Legal Documents</h3>
      </div>
      
      <div className="grid gap-4">
        {availableTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleGenerateDocument(template)}
                className="w-full"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Generate Document
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Document Information</DialogTitle>
            <DialogDescription>
              Fill in the required information to generate your legal document. Review and edit as needed before downloading.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={templateData['[YOUR FULL NAME]'] || ''}
                    onChange={(e) => updateTemplateData('[YOUR FULL NAME]', e.target.value)}
                    placeholder="Your full legal name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={templateData['[COUNTY NAME]'] || ''}
                    onChange={(e) => updateTemplateData('[COUNTY NAME]', e.target.value)}
                    placeholder="County where convicted"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={templateData['[YOUR ADDRESS]'] || ''}
                    onChange={(e) => updateTemplateData('[YOUR ADDRESS]', e.target.value)}
                    placeholder="Your street address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cityStateZip">City, State, ZIP</Label>
                  <Input
                    id="cityStateZip"
                    value={templateData['[CITY, STATE, ZIP CODE]'] || ''}
                    onChange={(e) => updateTemplateData('[CITY, STATE, ZIP CODE]', e.target.value)}
                    placeholder="City, State ZIP Code"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={templateData['[PHONE NUMBER]'] || ''}
                    onChange={(e) => updateTemplateData('[PHONE NUMBER]', e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={templateData['[EMAIL ADDRESS]'] || ''}
                    onChange={(e) => updateTemplateData('[EMAIL ADDRESS]', e.target.value)}
                    placeholder="Your email address"
                  />
                </div>

                {selectedTemplate.requiredFields.includes('[DOCKET NUMBER]') && (
                  <div>
                    <Label htmlFor="docketNumber">Case/Docket Number</Label>
                    <Input
                      id="docketNumber"
                      value={templateData['[DOCKET NUMBER]'] || ''}
                      onChange={(e) => updateTemplateData('[DOCKET NUMBER]', e.target.value)}
                      placeholder="Case or docket number"
                    />
                  </div>
                )}

                {selectedTemplate.requiredFields.includes('[COURT OF CONVICTION]') && (
                  <div>
                    <Label htmlFor="courtOfConviction">Court of Conviction</Label>
                    <Input
                      id="courtOfConviction"
                      value={templateData['[COURT OF CONVICTION]'] || ''}
                      onChange={(e) => updateTemplateData('[COURT OF CONVICTION]', e.target.value)}
                      placeholder="e.g., Criminal Court of NYC, Bronx County"
                    />
                  </div>
                )}

                {selectedTemplate.requiredFields.includes('[DA OFFICE ADDRESS]') && (
                  <div className="col-span-2">
                    <Label htmlFor="daOfficeAddress">District Attorney Office Address</Label>
                    <Textarea
                      id="daOfficeAddress"
                      value={templateData['[DA OFFICE ADDRESS]'] || ''}
                      onChange={(e) => updateTemplateData('[DA OFFICE ADDRESS]', e.target.value)}
                      placeholder="District Attorney office address"
                      rows={3}
                    />
                  </div>
                )}

                {selectedTemplate.requiredFields.includes('[COURT ADDRESS]') && (
                  <div className="col-span-2">
                    <Label htmlFor="courtAddress">Court Address</Label>
                    <Textarea
                      id="courtAddress"
                      value={templateData['[COURT ADDRESS]'] || ''}
                      onChange={(e) => updateTemplateData('[COURT ADDRESS]', e.target.value)}
                      placeholder="Supreme Court address"
                      rows={3}
                    />
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <Label>Document Preview</Label>
                <div className="border rounded-md p-4 bg-gray-50 max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {renderTemplate(selectedTemplate.template, templateData)}
                  </pre>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleDownloadPDF} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleCopyText} variant="outline" className="flex-1">
                  Copy Text
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}