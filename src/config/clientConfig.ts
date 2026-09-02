import { 
  ClientBrandConfig, 
  FacilitySector, 
  FrequencyOption, 
  AddOnService, 
  PricingParameters 
} from '../types/cleanCommand';

/**
 * CLIENT CONFIGURATION LAYER
 * 
 * Default Demo Branding: Apex Commercial Cleaning (Dallas, TX)
 */

export const defaultClientBrand: ClientBrandConfig = {
  companyName: "Apex Commercial Cleaning",
  tagline: "Corporate Janitorial & Facility Sanitization Engineered for Zero Disruption",
  primaryCity: "Dallas, TX",
  serviceAreas: [
    "Downtown Dallas",
    "Plano & Frisco",
    "Irving & Las Colinas",
    "Fort Worth Commercial District",
    "Richardson Telecom Corridor"
  ],
  phone: "(214) 555-0192",
  email: "contracts@apexcommercialcleaning.com",
  websiteUrl: "https://apexcommercialcleaning.com",
  address: "1400 Main Street, Suite 800, Dallas, TX 75202",
  licenseNumber: "TX-JAN-2024-98421",
  insuranceCoverage: "$2,000,000 Commercial General Liability & Full Bond",
  primaryAccentColor: "#2563EB", // Royal Corporate Blue
  foundedYear: "2016",
  googleAppsScriptUrl: "" // Client provides their own deployed Google Apps Script Webhook
};

export const defaultPricingParameters: PricingParameters = {
  baseLaborRatePerHour: 18.50, // Base technician wage
  payrollBurdenRate: 0.145,    // 14.5% payroll taxes, workers comp, state insurance
  suppliesMaterialsRate: 0.045, // 4.5% chemicals, trash liners, microfiber, PPE
  equipmentAmortizationRate: 0.02, // 2.0% floor machine, vacuum depreciation
  overheadBufferRate: 0.08,    // 8.0% vehicle fuel, supervision, admin
  targetGrossMargin: 0.38      // 38.0% target gross operating margin
};

export const facilitySectors: FacilitySector[] = [
  {
    id: 'corporate_office',
    name: 'Corporate Office & Tech Suites',
    shortDesc: 'Class A/B office space, workstations, conference suites, and executive boardrooms.',
    badge: 'High Productivity',
    defaultProductionRate: 3800, // sq ft / hr (ISSA 540 Benchmark)
    protocols: [
      'Nightly HEPA vacuuming & microfiber workstation wiping',
      'Conference room AV and glass whiteboard detailing',
      'Central waste diversion & confidential document lockup care',
      'Restroom dual-bucket microfiber touchpoint sanitization'
    ],
    recommendedFrequency: 'business_5x'
  },
  {
    id: 'medical_clinical',
    name: 'Medical & Dental Practices',
    shortDesc: 'Outpatient clinics, dental operatories, surgical suites, and diagnostic centers.',
    badge: 'Terminal Disinfection',
    defaultProductionRate: 2400, // sq ft / hr (Slower, strict medical compliance)
    protocols: [
      'EPA List N hospital-grade broad spectrum disinfectant dwell times',
      'Cross-contamination prevention: color-coded microfiber zone control',
      'Biohazard & sharps container exterior wipe down & sanitation',
      'OSHA Bloodborne Pathogens trained and certified technicians'
    ],
    recommendedFrequency: 'daily_7x'
  },
  {
    id: 'industrial_warehouse',
    name: 'Industrial & Distribution Hubs',
    shortDesc: 'Logistics warehouses, manufacturing break facilities, and shipping offices.',
    badge: 'Heavy-Duty Care',
    defaultProductionRate: 6500, // sq ft / hr (Large open footprint)
    protocols: [
      'High-traffic concrete floor automatic scrubbing & degreasing',
      'Forklift tire mark removal & dock office sanitization',
      'Locker room & high-occupancy restroom power decontamination',
      'High-bay structural dusting & safety aisle floor maintenance'
    ],
    recommendedFrequency: 'triweekly_3x'
  },
  {
    id: 'education_daycare',
    name: 'Schools & Early Childcare',
    shortDesc: 'Private academies, daycare centers, learning pods, and campus facilities.',
    badge: 'Child-Safe Green Clean',
    defaultProductionRate: 3100, // sq ft / hr
    protocols: [
      'Green Seal certified 100% non-toxic sanitizing solutions',
      'High-frequency touchpoint sanitization (door handles, desks, play areas)',
      'Restroom deep enzymatic odor elimination and scale removal',
      'Comprehensive background-checked and vetted night staff'
    ],
    recommendedFrequency: 'business_5x'
  },
  {
    id: 'financial_legal',
    name: 'Financial & Legal Practices',
    shortDesc: 'Banking institutions, law offices, accounting firms, and wealth advisories.',
    badge: 'Confidential Security',
    defaultProductionRate: 3400, // sq ft / hr
    protocols: [
      'Strict NDA-bound and security-badged cleaning personnel',
      'High-end mahogany, leather, and architectural glass detailing',
      'Client consultation suite spotless presentation protocol',
      'Keycard and alarm arm/disarm audit compliance'
    ],
    recommendedFrequency: 'business_5x'
  },
  {
    id: 'retail_showroom',
    name: 'Retail Showrooms & Boutiques',
    shortDesc: 'Auto dealerships, luxury retail storefronts, and commercial galleries.',
    badge: 'Mirror-Finish Optics',
    defaultProductionRate: 4200, // sq ft / hr
    protocols: [
      'Streak-free interior glass and display case detailing',
      'High-gloss hard surface buffing and polished concrete care',
      'Customer lounge and refreshment bar continuous sanitation',
      'Entrance matting vacuuming and debris extraction'
    ],
    recommendedFrequency: 'triweekly_3x'
  }
];

export const frequencyOptions: FrequencyOption[] = [
  {
    id: 'daily_7x',
    label: '7 Days / Week',
    sublabel: 'Continuous 24/7 Facility Operation',
    daysPerMonth: 30.4,
    multiplier: 0.82, // 18% volume discount for high frequency
    isPopular: false
  },
  {
    id: 'business_5x',
    label: '5 Days / Week',
    sublabel: 'Standard Business Days (Mon–Fri)',
    daysPerMonth: 21.7,
    multiplier: 0.88, // 12% volume incentive
    isPopular: true
  },
  {
    id: 'triweekly_3x',
    label: '3 Days / Week',
    sublabel: 'E.g. Mon / Wed / Fri Schedule',
    daysPerMonth: 13.0,
    multiplier: 0.94, // 6% volume incentive
    isPopular: false
  },
  {
    id: 'biweekly_2x',
    label: '2 Days / Week',
    sublabel: 'E.g. Tue / Thu Schedule',
    daysPerMonth: 8.7,
    multiplier: 0.98,
    isPopular: false
  },
  {
    id: 'weekly_1x',
    label: '1 Day / Week',
    sublabel: 'Weekly Weekend or Deep Clean',
    daysPerMonth: 4.33,
    multiplier: 1.05, // Slower production due to weekly dust/soil accumulation
    isPopular: false
  },
  {
    id: 'onetime_deep',
    label: 'One-Time Deep Clean',
    sublabel: 'Post-Construction or Move-in Initial Clean',
    daysPerMonth: 1.0,
    multiplier: 1.65, // Significant labor intensity multiplier
    isPopular: false
  }
];

export const addOnServices: AddOnService[] = [
  {
    id: 'vct_strip_wax',
    name: 'VCT Floor Strip, Seal & High-Gloss Wax',
    unit: 'per 1,000 sq ft',
    basePrice: 280,
    description: 'Complete chemical strip of aged wax, 2 coats of heavy-duty commercial sealer, and 3 coats of 25% solid high-traffic wax.',
    recommendedFor: ['corporate_office', 'medical_clinical', 'education_daycare']
  },
  {
    id: 'carpet_extraction',
    name: 'Commercial Hot-Water Carpet Extraction',
    unit: 'per 1,000 sq ft',
    basePrice: 195,
    description: 'Deep fiber pre-spray, agitation, and high-pressure steam extraction removing embedded soil, allergens, and coffee stains.',
    recommendedFor: ['corporate_office', 'financial_legal', 'retail_showroom']
  },
  {
    id: 'restroom_deep_steam',
    name: 'High-Pressure Restroom Tile & Grout Steam Sanitation',
    unit: 'per fixture bank',
    basePrice: 160,
    description: '300°F pressurized steam injection lifting deep grout odor, mineral scale, and bacteriological buildup around fixtures.',
    recommendedFor: ['medical_clinical', 'education_daycare', 'industrial_warehouse']
  },
  {
    id: 'high_dusting',
    name: 'High-Bay Structural & Exposed Duct Dusting',
    unit: 'per 2,500 sq ft',
    basePrice: 240,
    description: 'Boom/ladder extraction of return air grilles, structural beams, lighting fixtures, and industrial ceiling conduits.',
    recommendedFor: ['industrial_warehouse', 'retail_showroom']
  },
  {
    id: 'window_detailing',
    name: 'Interior & Exterior Perimeter Window Detailing',
    unit: 'per 20 window panes',
    basePrice: 140,
    description: 'Streak-free squeegee cleaning of all interior and exterior glass, sills, frames, and commercial entrance vestibules.',
    recommendedFor: ['corporate_office', 'financial_legal', 'retail_showroom']
  },
  {
    id: 'electrostatic_disinfection',
    name: 'Whole-Facility Electrostatic Hospital-Grade Fogging',
    unit: 'per 5,000 sq ft',
    basePrice: 320,
    description: 'Positively charged aerosolized micro-droplet disinfection adhering 360° to all keyboards, chair undersides, and surfaces.',
    recommendedFor: ['medical_clinical', 'education_daycare', 'corporate_office']
  }
];
