export type FacilitySectorId = 
  | 'corporate_office'
  | 'medical_clinical'
  | 'industrial_warehouse'
  | 'education_daycare'
  | 'financial_legal'
  | 'retail_showroom';

export type FrequencyId = 
  | 'daily_7x'
  | 'business_5x'
  | 'triweekly_3x'
  | 'biweekly_2x'
  | 'weekly_1x'
  | 'onetime_deep';

export type AddOnServiceId =
  | 'vct_strip_wax'
  | 'carpet_extraction'
  | 'restroom_deep_steam'
  | 'high_dusting'
  | 'window_detailing'
  | 'electrostatic_disinfection';

export interface FacilitySector {
  id: FacilitySectorId;
  name: string;
  shortDesc: string;
  badge: string;
  defaultProductionRate: number; // sq ft per hour benchmark
  protocols: string[];
  recommendedFrequency: FrequencyId;
}

export interface FrequencyOption {
  id: FrequencyId;
  label: string;
  sublabel: string;
  daysPerMonth: number;
  multiplier: number; // Volume pricing incentive
  isPopular?: boolean;
}

export interface AddOnService {
  id: AddOnServiceId;
  name: string;
  unit: string;
  basePrice: number;
  description: string;
  recommendedFor: FacilitySectorId[];
}

export interface PricingParameters {
  baseLaborRatePerHour: number; // e.g. $18.50
  payrollBurdenRate: number; // e.g. 0.145 (14.5% for taxes, workers comp, insurance)
  suppliesMaterialsRate: number; // e.g. 0.045 (4.5% of gross)
  equipmentAmortizationRate: number; // e.g. 0.02 (2.0%)
  overheadBufferRate: number; // e.g. 0.08 (8.0%)
  targetGrossMargin: number; // e.g. 0.38 (38% target margin)
}

export interface EstimateResult {
  squareFootage: number;
  sectorId: FacilitySectorId;
  frequencyId: FrequencyId;
  selectedAddOns: AddOnServiceId[];
  
  // Operational Metrics
  productionRateSqFtPerHour: number;
  hoursPerCleaningVisit: number;
  recommendedCrewSize: number;
  cleaningVisitsPerMonth: number;
  totalMonthlyLaborHours: number;
  
  // Cost Breakdowns
  directLaborCostPerVisit: number;
  directSuppliesCostPerVisit: number;
  baseCostPerVisit: number;
  
  // Client Pricing
  pricePerVisit: number;
  baseMonthlyRate: number;
  addOnMonthlyRate: number;
  totalEstimatedMonthlyInvestment: number;
  annualContractValue: number;
  
  // Contract Range (Low-High for ballpark presentation)
  lowMonthlyRange: number;
  highMonthlyRange: number;
}

export interface ClientBrandConfig {
  companyName: string;
  tagline: string;
  primaryCity: string;
  serviceAreas: string[];
  phone: string;
  email: string;
  websiteUrl: string;
  address: string;
  licenseNumber: string;
  insuranceCoverage: string; // e.g. "$2,000,000 Commercial General Liability"
  primaryAccentColor: string; // Hex color for active branding
  foundedYear: string;
  industryStandards?: string; // Configurable standards e.g. "ISSA 540 Workloading • EPA List N Disinfection"
  qualitySla?: string;        // Configurable SLA e.g. "4-hour prompt re-clean response at zero added charge if any area is unsatisfactory."
  paymentTerms?: string;      // Configurable invoicing terms e.g. "Invoiced monthly on Net-30 terms. 12-month standard term with 30-day mutual flexibility."
  googleAppsScriptUrl?: string; // Client's Google Apps Script Webhook
}

export type BookingStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface WalkthroughBookingRecord {
  bookingId: string;
  submissionTimestamp: string;
  submissionDate: string;
  submissionTime: string;
  
  // Contact Information
  fullName: string;
  companyName: string;
  businessEmail: string;
  phoneNumber: string;
  preferredWalkthroughDate: string;
  preferredTimeWindow: string;
  cleaningFrustrations?: string;
  
  // Estimator Snapshot at Submission Time
  facilityType: string;
  squareFootage: number;
  cleaningFrequency: string;
  ballparkEstimateLow: number;
  ballparkEstimateHigh: number;
  estimatedMonthlyInvestment: number;
  ratePerVisit: number;
  annualContractValue: number;
  
  // Internal Tracking & CRM Fields (Google Sheets Ready)
  bookingStatus: BookingStatus;
  confirmedDate: string;
  confirmedTime: string;
  assignedSalesRep: string;
  internalNotes: string;
  lastUpdated: string;
}

// Backwards-compatible alias for existing imports
export type WalkthroughLead = WalkthroughBookingRecord;

export type LeadStatus = 'NEW' | 'QUALIFIED' | 'WALKTHROUGH' | 'PROPOSAL' | 'WON' | 'LOST';
export type WalkthroughStatus = 'NOT SCHEDULED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type ProposalStatus = 'NOT GENERATED' | 'GENERATED' | 'SENT' | 'ACCEPTED';
export type LeadSource = 'Phone' | 'Email' | 'Referral' | 'Website' | 'LinkedIn' | 'Other';

export interface LeadRecord {
  // Identity & Pipeline
  leadId: string;                    // "LEAD-2026-0001"
  status: LeadStatus;                // Initial: 'NEW'
  leadSource: LeadSource;
  createdDate: string;               // e.g. "Sep 4, 2026"
  lastUpdated: string;               // ISO timestamp

  // Contact
  fullName: string;
  companyName: string;
  businessEmail: string;
  phoneNumber: string;

  // Facility
  propertyAddress: string;
  facilityType: FacilitySectorId;
  squareFootage: number;
  cleaningFrequency: FrequencyId;
  selectedAddOns: AddOnServiceId[];
  specialRequirements: string;
  internalNotes: string;

  // Estimate Snapshot (populated after calculation)
  monthlyEstimate: number;
  ratePerVisit: number;
  annualContractValue: number;
  estimatedLaborHours: number;
  recommendedCrewSize: number;
  estimateSnapshot?: EstimateResult;  // Full engine output

  // Walkthrough (optional, independent of Lead Status)
  walkthroughStatus: WalkthroughStatus;  // Default: 'NOT SCHEDULED'
  walkthroughDate: string;
  walkthroughTime: string;
  assignedSalesRep: string;
  meetingInstructions: string;
  walkthroughNotes: string;

  // Proposal (independent of walkthrough)
  proposalId: string;
  proposalStatus: ProposalStatus;     // Default: 'NOT GENERATED'
  proposalIssueDate: string;
  proposalValidThrough: string;
  proposalSentDate: string;
}

export interface ProposalData {
  proposalId: string;
  createdDate: string;
  validUntilDate: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  facilityAddress: string;
  estimate: EstimateResult;
  specialInstructions?: string;
}

