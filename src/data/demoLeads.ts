import { LeadRecord } from '../types/cleanCommand';

export const initialDemoLeads: LeadRecord[] = [
  {
    leadId: 'LEAD-2026-0001',
    status: 'PROPOSAL',
    leadSource: 'Referral',
    createdDate: 'Sep 1, 2026',
    lastUpdated: new Date().toISOString(),

    fullName: 'David Vance',
    companyName: 'Apex Innovation Park',
    businessEmail: 'david.vance@apexinnovation.com',
    phoneNumber: '(214) 555-0812',

    propertyAddress: '1420 Innovation Way, Suite 400, Dallas, TX',
    facilityType: 'corporate_office',
    squareFootage: 24000,
    cleaningFrequency: 'business_5x',
    selectedAddOns: ['carpet_extraction'],
    specialRequirements: 'Night keycard access after 7:00 PM. Server room locked, do not enter.',
    internalNotes: 'Client transitioning away from franchise cleaner due to missed trash and dirty restrooms.',

    monthlyEstimate: 3450,
    ratePerVisit: 159,
    annualContractValue: 41400,
    estimatedLaborHours: 5.5,
    recommendedCrewSize: 2,

    walkthroughStatus: 'SCHEDULED',
    walkthroughDate: '2026-09-08',
    walkthroughTime: '10:00 AM - 11:30 AM',
    assignedSalesRep: 'Marcus Sterling',
    meetingInstructions: 'Meet at Security Desk Suite 400. Bring photo ID.',
    walkthroughNotes: 'Inspect 3rd-floor executive suites and central cafeteria tile.',

    proposalId: 'PROP-2026-8812',
    proposalStatus: 'GENERATED',
    proposalIssueDate: 'Sep 2, 2026',
    proposalValidThrough: 'Oct 2, 2026',
    proposalSentDate: ''
  },
  {
    leadId: 'LEAD-2026-0002',
    status: 'QUALIFIED',
    leadSource: 'Phone',
    createdDate: 'Sep 2, 2026',
    lastUpdated: new Date().toISOString(),

    fullName: 'Dr. Robert Chen',
    companyName: 'Metroplex Surgical Pavilion',
    businessEmail: 'rchen@metroplexsurgical.org',
    phoneNumber: '(214) 555-0344',

    propertyAddress: '8800 Medical City Parkway, Building B, Dallas, TX',
    facilityType: 'medical_clinical',
    squareFootage: 18500,
    cleaningFrequency: 'daily_7x',
    selectedAddOns: ['restroom_deep_steam', 'electrostatic_disinfection'],
    specialRequirements: 'Strict terminal clean protocols for outpatient prep suites.',
    internalNotes: 'Wants EPA List N certified hospital-grade disinfectant SDS sheets on file.',

    monthlyEstimate: 4850,
    ratePerVisit: 161,
    annualContractValue: 58200,
    estimatedLaborHours: 6.0,
    recommendedCrewSize: 2,

    walkthroughStatus: 'NOT SCHEDULED',
    walkthroughDate: '',
    walkthroughTime: '',
    assignedSalesRep: 'Marcus Sterling',
    meetingInstructions: '',
    walkthroughNotes: '',

    proposalId: '',
    proposalStatus: 'NOT GENERATED',
    proposalIssueDate: '',
    proposalValidThrough: '',
    proposalSentDate: ''
  },
  {
    leadId: 'LEAD-2026-0003',
    status: 'WON',
    leadSource: 'Website',
    createdDate: 'Aug 24, 2026',
    lastUpdated: new Date().toISOString(),

    fullName: 'Marcus Thorne',
    companyName: 'Highland Logistics Depot',
    businessEmail: 'mthorne@highlandfreight.com',
    phoneNumber: '(817) 555-0992',

    propertyAddress: '3100 Intermodal Blvd, Fort Worth, TX',
    facilityType: 'industrial_warehouse',
    squareFootage: 45000,
    cleaningFrequency: 'triweekly_3x',
    selectedAddOns: ['high_dusting'],
    specialRequirements: 'Forklift traffic in main bays; high-vis vests required.',
    internalNotes: 'Signed 12-month master service agreement. First month paid Net-15.',

    monthlyEstimate: 2780,
    ratePerVisit: 213,
    annualContractValue: 33360,
    estimatedLaborHours: 4.5,
    recommendedCrewSize: 2,

    walkthroughStatus: 'COMPLETED',
    walkthroughDate: '2026-08-28',
    walkthroughTime: '02:00 PM',
    assignedSalesRep: 'Marcus Sterling',
    meetingInstructions: 'Gate 4 security kiosk check-in.',
    walkthroughNotes: 'Warehouse manager accompanied inspection. Confirmed dock restrooms.',

    proposalId: 'PROP-2026-1049',
    proposalStatus: 'ACCEPTED',
    proposalIssueDate: 'Aug 29, 2026',
    proposalValidThrough: 'Sep 29, 2026',
    proposalSentDate: 'Aug 29, 2026'
  },
  {
    leadId: 'LEAD-2026-0004',
    status: 'NEW',
    leadSource: 'LinkedIn',
    createdDate: 'Sep 3, 2026',
    lastUpdated: new Date().toISOString(),

    fullName: 'Karen Miller',
    companyName: 'Frisco Financial Plaza',
    businessEmail: 'kmiller@friscofinancial.com',
    phoneNumber: '(972) 555-0781',

    propertyAddress: '6400 Dallas Parkway, Suite 300, Frisco, TX',
    facilityType: 'financial_legal',
    squareFootage: 12000,
    cleaningFrequency: 'business_5x',
    selectedAddOns: [],
    specialRequirements: 'Clean after 6:30 PM. Secure shredding containers on site.',
    internalNotes: 'Inbound inquiry from LinkedIn message. Needs estimate by Friday.',

    monthlyEstimate: 1950,
    ratePerVisit: 90,
    annualContractValue: 23400,
    estimatedLaborHours: 3.5,
    recommendedCrewSize: 1,

    walkthroughStatus: 'NOT SCHEDULED',
    walkthroughDate: '',
    walkthroughTime: '',
    assignedSalesRep: 'Marcus Sterling',
    meetingInstructions: '',
    walkthroughNotes: '',

    proposalId: '',
    proposalStatus: 'NOT GENERATED',
    proposalIssueDate: '',
    proposalValidThrough: '',
    proposalSentDate: ''
  }
];
