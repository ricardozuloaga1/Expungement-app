import type { Express, Request, Response } from "express";
import { storage } from "./storage";

// Admin user emails - move this to environment variables in production
const ADMIN_EMAILS = [
  'ricardo@cleanslaterny.com',
  'admin@cleanslaterny.com',
  'ricardozuloaga1@gmail.com' // Your current email
];

// Type definitions for admin data
interface WorkflowSummary {
  id: number;
  userEmail: string;
  completedAt: string;
  convictionState: string | null;
  hasMarijuanaConviction: string | null;
  offenseTypes: any;
  convictionYear: string | null;
  eligibilityResults?: {
    automaticExpungement?: boolean;
    automaticSealing?: boolean;
    petitionBasedSealing?: boolean;
  };
  wantsPremiumService?: boolean;
  contactPhone?: string;
}

interface AnalyticsData {
  totalUsers: number;
  completedWorkflows: number;
  mrtaEligible: number;
  cleanSlateEligible: number;
  petitionEligible: number;
  completionRate: number;
  premiumConversionRate: number;
  avgCompletionTime: string;
  commonDropOffPoints: string[];
}

// Helper function to check if user is admin
function isAdminUser(req: any): boolean {
  const userEmail = req.user?.claims?.email;
  return userEmail && ADMIN_EMAILS.includes(userEmail);
}

export function setupAdminRoutes(app: Express) {
  
  // Admin dashboard - get all completed questionnaires
  app.get("/api/admin/completed-workflows", async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ 
          success: false, 
          message: "Admin access required" 
        });
      }

      // Get all completed questionnaire responses with user data
      const completedWorkflows = await getCompletedWorkflowsForAdmin();
      
      res.json({
        success: true,
        data: {
          workflows: completedWorkflows,
          totalCompleted: completedWorkflows.length,
          exportUrl: '/api/admin/export-workflows'
        }
      });
      
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch workflows",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Export completed workflows as CSV
  app.get("/api/admin/export-workflows", async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ 
          success: false, 
          message: "Admin access required" 
        });
      }

      const workflows = await getCompletedWorkflowsForAdmin();
      
      // Create CSV header
      const csvHeader = [
        'User Email',
        'Completion Date',
        'Conviction State',
        'Has Marijuana Conviction',
        'Offense Types',
        'Conviction Year',
        'MRTA Eligible',
        'Clean Slate Eligible',
        'Petition Eligible',
        'Wants Premium Service',
        'Contact Phone'
      ].join(',');

      // Create CSV rows
      const csvRows = workflows.map(workflow => {
        const formatCell = (value: any) => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        };

        return [
          formatCell(workflow.userEmail),
          formatCell(workflow.completedAt),
          formatCell(workflow.convictionState),
          formatCell(workflow.hasMarijuanaConviction),
          formatCell(workflow.offenseTypes),
          formatCell(workflow.convictionYear),
          formatCell(workflow.eligibilityResults?.automaticExpungement ? 'Yes' : 'No'),
          formatCell(workflow.eligibilityResults?.automaticSealing ? 'Yes' : 'No'),
          formatCell(workflow.eligibilityResults?.petitionBasedSealing ? 'Yes' : 'No'),
          formatCell(workflow.wantsPremiumService ? 'Yes' : 'No'),
          formatCell(workflow.contactPhone || '')
        ].join(',');
      });

      const csvContent = [csvHeader, ...csvRows].join('\n');
      const timestamp = new Date().toISOString().split('T')[0];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=expungement_workflows_${timestamp}.csv`);
      res.send(csvContent);
      
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to export workflows",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get analytics for admin dashboard
  app.get("/api/admin/analytics", async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ 
          success: false, 
          message: "Admin access required" 
        });
      }

      const analytics = await getWorkflowAnalytics();
      
      res.json({
        success: true,
        data: {
          totalUsers: analytics.totalUsers,
          completedWorkflows: analytics.completedWorkflows,
          eligibilityBreakdown: {
            mrtaEligible: analytics.mrtaEligible,
            cleanSlateEligible: analytics.cleanSlateEligible,
            petitionEligible: analytics.petitionEligible
          },
          conversionMetrics: {
            startedToCompleted: analytics.completionRate,
            freeToPremium: analytics.premiumConversionRate
          },
          timeMetrics: {
            averageCompletionTime: analytics.avgCompletionTime,
            dropOffPoints: analytics.commonDropOffPoints
          }
        }
      });
      
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch analytics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get individual user details (for support)
  app.get("/api/admin/user/:userId", async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ 
          success: false, 
          message: "Admin access required" 
        });
      }

      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      const questionnaires = await storage.getUserQuestionnaireResponses(userId);
      const eligibilityResults = await storage.getUserEligibilityResults(userId);
      const premiumSubscription = await storage.getUserPremiumSubscription(userId);

      res.json({
        success: true,
        data: {
          user,
          questionnaires,
          eligibilityResults,
          premiumSubscription
        }
      });
      
    } catch (error) {
      console.error("User details error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch user details",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}

// Helper function to get completed workflows for admin
async function getCompletedWorkflowsForAdmin(): Promise<WorkflowSummary[]> {
  try {
    // Since storage.ts doesn't have this method yet, we'll implement it here
    // In a real implementation, you'd add this to storage.ts
    
    // For now, let's get all users and their questionnaire responses
    // This is a simplified version - you'd optimize this with proper database queries
    
    const workflows: WorkflowSummary[] = [];
    
    // Note: You'll need to implement getCompletedWorkflowsForAdmin in storage.ts
    // For now, this is a placeholder that shows the expected structure
    
    return workflows;
  } catch (error) {
    console.error("Error fetching completed workflows:", error);
    return [];
  }
}

// Helper function to get analytics data
async function getWorkflowAnalytics(): Promise<AnalyticsData> {
  try {
    // Note: You'll need to implement getWorkflowAnalytics in storage.ts
    // For now, this returns mock data to show the structure
    
    return {
      totalUsers: 0,
      completedWorkflows: 0,
      mrtaEligible: 0,
      cleanSlateEligible: 0,
      petitionEligible: 0,
      completionRate: 0,
      premiumConversionRate: 0,
      avgCompletionTime: "0 minutes",
      commonDropOffPoints: []
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
} 