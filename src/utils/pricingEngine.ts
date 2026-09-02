import { 
  FacilitySectorId, 
  FrequencyId, 
  AddOnServiceId, 
  PricingParameters, 
  EstimateResult 
} from '../types/cleanCommand';
import { 
  facilitySectors, 
  frequencyOptions, 
  addOnServices, 
  defaultPricingParameters 
} from '../config/clientConfig';

/**
 * Transparent Commercial Cleaning Bidding Engine
 * 
 * Calibrated against ISSA 540 Cleaning Times & Commercial Janitorial Cost Models.
 * 
 * Formula:
 * 1. Hours per visit = Square Footage / Production Rate (sq ft/hr for sector)
 * 2. Direct Labor Cost = Hours * Wage * (1 + Payroll Burden)
 * 3. Base Direct Cost = Direct Labor + Direct Supplies (4.5%)
 * 4. Cost with Overhead = Base Direct Cost / (1 - Overhead Buffer)
 * 5. Price Per Visit = Cost with Overhead / (1 - Target Margin) * Frequency Multiplier
 * 6. Base Monthly Investment = Price Per Visit * Visits Per Month
 */

export function calculateCommercialEstimate(
  squareFootage: number,
  sectorId: FacilitySectorId,
  frequencyId: FrequencyId,
  selectedAddOns: AddOnServiceId[] = [],
  customPricing: PricingParameters = defaultPricingParameters
): EstimateResult {
  // 1. Resolve Sector and Frequency Settings
  const sector = facilitySectors.find(s => s.id === sectorId) || facilitySectors[0];
  const frequency = frequencyOptions.find(f => f.id === frequencyId) || frequencyOptions[1];
  
  const productionRate = sector.defaultProductionRate;
  
  // 2. Compute Labor Time per Visit
  const rawHoursPerVisit = squareFootage / productionRate;
  // Minimum labor visit threshold: 1.0 hour minimum charge
  const hoursPerVisit = Math.max(1.0, Math.round(rawHoursPerVisit * 100) / 100);
  
  // Recommended Crew Size (1 cleaner per 3.5 hours of work per shift)
  const recommendedCrewSize = Math.max(1, Math.ceil(hoursPerVisit / 3.5));
  const visitsPerMonth = frequency.daysPerMonth;
  const totalMonthlyLaborHours = Math.round(hoursPerVisit * visitsPerMonth * 10) / 10;
  
  // 3. Labor & Materials Unit Cost
  const directLaborCostPerVisit = hoursPerVisit * customPricing.baseLaborRatePerHour * (1 + customPricing.payrollBurdenRate);
  const directSuppliesCostPerVisit = directLaborCostPerVisit * customPricing.suppliesMaterialsRate;
  const baseCostPerVisit = (directLaborCostPerVisit + directSuppliesCostPerVisit) / (1 - customPricing.overheadBufferRate);
  
  // 4. Client Price per Visit with Target Margin and Frequency Discount
  const rawPricePerVisit = baseCostPerVisit / (1 - customPricing.targetGrossMargin);
  const pricePerVisit = Math.round(rawPricePerVisit * frequency.multiplier);
  
  // 5. Monthly Contract Price
  const baseMonthlyRate = Math.round(pricePerVisit * visitsPerMonth);
  
  // 6. Add-On Services Calculation (amortized monthly or standalone)
  let addOnMonthlyTotal = 0;
  selectedAddOns.forEach(addOnId => {
    const addOn = addOnServices.find(a => a.id === addOnId);
    if (addOn) {
      // Scale add-on price proportionally to facility square footage (base unit = 5,000 sq ft)
      const sqFtMultiplier = Math.max(1, Math.round(squareFootage / 5000));
      // Spread periodic specialty services over 12 months for contract inclusion, or direct monthly
      const serviceCost = addOn.basePrice * sqFtMultiplier;
      addOnMonthlyTotal += Math.round(serviceCost / (frequencyId === 'onetime_deep' ? 1 : 3)); // quarterly frequency amortization
    }
  });
  
  const totalEstimatedMonthlyInvestment = baseMonthlyRate + addOnMonthlyTotal;
  const annualContractValue = totalEstimatedMonthlyInvestment * 12;
  
  // 7. Ballpark Range (+/- 7% variance for walkthrough contingency)
  const lowMonthlyRange = Math.round(totalEstimatedMonthlyInvestment * 0.93);
  const highMonthlyRange = Math.round(totalEstimatedMonthlyInvestment * 1.07);
  
  return {
    squareFootage,
    sectorId,
    frequencyId,
    selectedAddOns,
    productionRateSqFtPerHour: productionRate,
    hoursPerCleaningVisit: hoursPerVisit,
    recommendedCrewSize,
    cleaningVisitsPerMonth: Math.round(visitsPerMonth * 10) / 10,
    totalMonthlyLaborHours,
    directLaborCostPerVisit: Math.round(directLaborCostPerVisit),
    directSuppliesCostPerVisit: Math.round(directSuppliesCostPerVisit),
    baseCostPerVisit: Math.round(baseCostPerVisit),
    pricePerVisit,
    baseMonthlyRate,
    addOnMonthlyRate: addOnMonthlyTotal,
    totalEstimatedMonthlyInvestment,
    annualContractValue,
    lowMonthlyRange,
    highMonthlyRange
  };
}

/**
 * Format currency in USD or local denomination
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}
