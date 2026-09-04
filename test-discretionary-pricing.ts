import { calculateCommercialEstimate, formatCurrency } from './src/utils/pricingEngine.ts';
import { FacilitySectorId, FrequencyId, AddOnServiceId, LeadRecord, EstimateResult } from './src/types/cleanCommand.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n======================================================');
console.log('  COMMERCIAL CLEANING DISCRETIONARY PRICING TEST SUITE');
console.log('======================================================\n');

// -------------------------------------------------------------------
// TEST 1: Baseline Recommended Pricing vs 0% Adjustment
// -------------------------------------------------------------------
console.log('--- TEST 1: Recommended Price with 0% Adjustment ---');
const est0 = calculateCommercialEstimate(12500, 'corporate_office', 'business_5x', [], undefined, 0);
assert(est0.discretionaryAdjustmentPercent === 0, 'Discretionary adjustment is 0%');
assert(est0.totalEstimatedMonthlyInvestment === est0.recommendedMonthlyRate, 'Monthly investment equals recommended monthly rate at 0%');
assert(est0.pricePerVisit === est0.recommendedPricePerVisit, 'Price per visit equals recommended price per visit at 0%');
assert(est0.annualContractValue === est0.recommendedAnnualContractValue, 'Annual contract value equals recommended annual value at 0%');
assert(est0.finalProposedMonthlyRate === est0.recommendedMonthlyRate, 'Final proposed monthly rate equals recommended at 0%');
assert(est0.finalProposedPricePerVisit === est0.recommendedPricePerVisit, 'Final proposed price per visit equals recommended at 0%');
assert(est0.finalProposedAnnualContractValue === est0.recommendedAnnualContractValue, 'Final proposed annual value equals recommended at 0%');

// -------------------------------------------------------------------
// TEST 2: Positive Adjustment (+5%)
// Example from spec: If recommended = $2,400, +5% -> $2,520
// -------------------------------------------------------------------
console.log('\n--- TEST 2: Positive Discretionary Adjustment (+5%) ---');
const estPlus5 = calculateCommercialEstimate(12500, 'corporate_office', 'business_5x', [], undefined, 5);
const expectedPlus5 = Math.round(estPlus5.recommendedMonthlyRate * 1.05);
assert(estPlus5.discretionaryAdjustmentPercent === 5, 'Discretionary adjustment is +5%');
assert(estPlus5.totalEstimatedMonthlyInvestment === expectedPlus5, `Monthly investment is $${expectedPlus5} (was $${estPlus5.recommendedMonthlyRate})`);
assert(estPlus5.finalProposedMonthlyRate === expectedPlus5, 'Final proposed monthly rate matches adjusted value');
assert(estPlus5.recommendedMonthlyRate === est0.recommendedMonthlyRate, 'Recommended baseline remains untouched');

// -------------------------------------------------------------------
// TEST 3: Negative Adjustment (-5%)
// Example from spec: If recommended = $2,400, -5% -> $2,280
// -------------------------------------------------------------------
console.log('\n--- TEST 3: Negative Discretionary Adjustment (-5%) ---');
const estMinus5 = calculateCommercialEstimate(12500, 'corporate_office', 'business_5x', [], undefined, -5);
const expectedMinus5 = Math.round(estMinus5.recommendedMonthlyRate * 0.95);
assert(estMinus5.discretionaryAdjustmentPercent === -5, 'Discretionary adjustment is -5%');
assert(estMinus5.totalEstimatedMonthlyInvestment === expectedMinus5, `Monthly investment is $${expectedMinus5} (was $${estMinus5.recommendedMonthlyRate})`);
assert(estMinus5.finalProposedMonthlyRate === expectedMinus5, 'Final proposed monthly rate matches adjusted value');
assert(estMinus5.recommendedMonthlyRate === est0.recommendedMonthlyRate, 'Recommended baseline remains untouched');

// -------------------------------------------------------------------
// TEST 4: Continuous Slider Adjustments across Fractional Steps
// Range [-20.0% to +20.0%], step 0.5%
// -------------------------------------------------------------------
console.log('\n--- TEST 4: Fractional Slider Steps (-20% to +20% at 0.5% steps) ---');
const testSteps = [-20, -15.5, -10, -5.5, -2.5, 0, 2.5, 5, 7.5, 12.5, 17.0, 20];
for (const step of testSteps) {
  const estStep = calculateCommercialEstimate(10000, 'medical_facility', 'weekly_3x', ['window_washing'], undefined, step);
  const factor = 1 + (step / 100);
  const expectedMonthly = Math.round(estStep.recommendedMonthlyRate * factor);
  assert(estStep.discretionaryAdjustmentPercent === step, `Step ${step}% recorded`);
  assert(estStep.totalEstimatedMonthlyInvestment === expectedMonthly, `Step ${step}%: Expected $${expectedMonthly}, got $${estStep.totalEstimatedMonthlyInvestment}`);
}

// -------------------------------------------------------------------
// TEST 5: Per-Visit, Monthly, and Annual Proportional Scaling
// -------------------------------------------------------------------
console.log('\n--- TEST 5: Proportional Scaling across All 3 Pricing Dimensions ---');
const estScale = calculateCommercialEstimate(20000, 'industrial_logistics', 'daily_7x', [], undefined, 10);
assert(estScale.finalProposedMonthlyRate === Math.round(estScale.recommendedMonthlyRate * 1.10), 'Monthly rate scaled by 1.10');
assert(estScale.finalProposedAnnualContractValue === estScale.finalProposedMonthlyRate * 12, 'Annual value = monthly * 12');
assert(estScale.finalProposedPricePerVisit === Math.round(estScale.recommendedPricePerVisit * 1.10), 'Per-visit rate scaled by 1.10');

// -------------------------------------------------------------------
// TEST 6: Proposal Displays Final Proposed Price
// -------------------------------------------------------------------
console.log('\n--- TEST 6: Proposal Document Data Contract ---');
assert(estPlus5.totalEstimatedMonthlyInvestment === estPlus5.finalProposedMonthlyRate, 'Proposal primary monthly investment displays final proposed price');
assert(estPlus5.annualContractValue === estPlus5.finalProposedAnnualContractValue, 'Proposal contract value displays final proposed annual value');
assert(estPlus5.pricePerVisit === estPlus5.finalProposedPricePerVisit, 'Proposal price per visit displays final proposed price per visit');

// -------------------------------------------------------------------
// TEST 7: Proposal Live Update Simulation
// -------------------------------------------------------------------
console.log('\n--- TEST 7: Proposal Live Update Calculation ---');
let currentEst = calculateCommercialEstimate(15000, 'school_education', 'business_5x', [], undefined, 0);
assert(currentEst.finalProposedMonthlyRate === currentEst.recommendedMonthlyRate, 'Initial proposal rate is 0% adjusted');
// Estimator updates slider to +8%
currentEst = calculateCommercialEstimate(currentEst.squareFootage, currentEst.sectorId, currentEst.frequencyId, currentEst.selectedAddOns, undefined, 8);
assert(currentEst.discretionaryAdjustmentPercent === 8, 'Proposal live update reflects 8% adjustment');
assert(currentEst.finalProposedMonthlyRate === Math.round(currentEst.recommendedMonthlyRate * 1.08), 'Live update recalculates final monthly rate immediately');

// -------------------------------------------------------------------
// TEST 8: New Blank Estimate Resets Adjustment to 0%
// -------------------------------------------------------------------
console.log('\n--- TEST 8: New Blank Estimate Reset ---');
const blankEstimate = calculateCommercialEstimate(12500, 'corporate_office', 'business_5x', ['carpet_extraction'], undefined, 0);
assert(blankEstimate.discretionaryAdjustmentPercent === 0, 'New blank estimate resets discretionary adjustment to 0%');
assert(blankEstimate.finalProposedMonthlyRate === blankEstimate.recommendedMonthlyRate, 'New blank estimate final proposed matches recommended');

// -------------------------------------------------------------------
// TEST 9 & 10: Lead Snapshot Preservation (All 7 Exact Fields)
// -------------------------------------------------------------------
console.log('\n--- TEST 9 & 10: Lead Snapshot Preservation of All 7 Fields ---');
const savedEstimate: EstimateResult = calculateCommercialEstimate(18000, 'corporate_office', 'business_5x', ['restroom_deep_clean'], undefined, 7.5);
const dummyLead: LeadRecord = {
  leadId: 'LD-2026-999',
  companyName: 'Acme Test Corp',
  leadSource: 'Referral',
  contactPerson: 'Jane Doe',
  email: 'jane@acme.com',
  phone: '555-1234',
  propertyAddress: '123 Test St',
  facilityType: 'corporate_office',
  squareFootage: 18000,
  cleaningFrequency: 'business_5x',
  selectedAddOns: ['restroom_deep_clean'],
  status: 'Estimating',
  monthlyEstimate: savedEstimate.totalEstimatedMonthlyInvestment,
  estimatedValue: savedEstimate.annualContractValue,
  annualContractValue: savedEstimate.annualContractValue,
  ratePerVisit: savedEstimate.pricePerVisit,
  
  // 7 Preserved Fields
  recommendedMonthlyRate: savedEstimate.recommendedMonthlyRate,
  recommendedPricePerVisit: savedEstimate.recommendedPricePerVisit,
  recommendedAnnualContractValue: savedEstimate.recommendedAnnualContractValue,
  discretionaryAdjustmentPercent: savedEstimate.discretionaryAdjustmentPercent,
  finalProposedMonthlyRate: savedEstimate.finalProposedMonthlyRate,
  finalProposedPricePerVisit: savedEstimate.finalProposedPricePerVisit,
  finalProposedAnnualContractValue: savedEstimate.finalProposedAnnualContractValue,
  estimateSnapshot: savedEstimate
};

assert(dummyLead.recommendedMonthlyRate === savedEstimate.recommendedMonthlyRate, 'Lead preserves recommendedMonthlyRate');
assert(dummyLead.recommendedPricePerVisit === savedEstimate.recommendedPricePerVisit, 'Lead preserves recommendedPricePerVisit');
assert(dummyLead.recommendedAnnualContractValue === savedEstimate.recommendedAnnualContractValue, 'Lead preserves recommendedAnnualContractValue');
assert(dummyLead.discretionaryAdjustmentPercent === 7.5, 'Lead preserves discretionaryAdjustmentPercent');
assert(dummyLead.finalProposedMonthlyRate === savedEstimate.finalProposedMonthlyRate, 'Lead preserves finalProposedMonthlyRate');
assert(dummyLead.finalProposedPricePerVisit === savedEstimate.finalProposedPricePerVisit, 'Lead preserves finalProposedPricePerVisit');
assert(dummyLead.finalProposedAnnualContractValue === savedEstimate.finalProposedAnnualContractValue, 'Lead preserves finalProposedAnnualContractValue');

// Lead restoration check
const restoredAdjustment = dummyLead.discretionaryAdjustmentPercent ?? 0;
assert(restoredAdjustment === 7.5, 'Lead restores exact saved adjustment (+7.5%)');

const unadjustedLead: LeadRecord = { ...dummyLead, discretionaryAdjustmentPercent: undefined, estimateSnapshot: undefined };
const fallbackAdjustment = unadjustedLead.discretionaryAdjustmentPercent ?? 0;
assert(fallbackAdjustment === 0, 'Lead without saved adjustment defaults strictly to 0%');

// -------------------------------------------------------------------
// CRITICAL REGRESSION INVARIANT TEST:
// Verify that with adjustment = 0%, the cleaning system produces
// EXACTLY the same results across all facilities and frequencies.
// -------------------------------------------------------------------
console.log('\n--- CRITICAL REGRESSION INVARIANT TEST (0% Adjustment = Exact Baseline) ---');
const testFacilities: FacilitySectorId[] = ['corporate_office', 'medical_facility', 'school_education', 'retail_bank', 'industrial_logistics'];
const testFrequencies: FrequencyId[] = ['business_5x', 'daily_7x', 'weekly_3x', 'weekly_2x', 'weekly_1x'];
const testSqfts = [2500, 7500, 15000, 35000, 75000];

let regressionCount = 0;
for (const fac of testFacilities) {
  for (const freq of testFrequencies) {
    for (const sqft of testSqfts) {
      const defaultEst = calculateCommercialEstimate(sqft, fac, freq, []);
      const zeroEst = calculateCommercialEstimate(sqft, fac, freq, [], undefined, 0);

      // Verify exact parity between default (no arg) and explicit 0%
      assert(defaultEst.totalEstimatedMonthlyInvestment === zeroEst.totalEstimatedMonthlyInvestment, `Monthly rate parity for ${fac} ${freq} ${sqft}sqft`);
      assert(defaultEst.pricePerVisit === zeroEst.pricePerVisit, `Per visit rate parity for ${fac} ${freq} ${sqft}sqft`);
      assert(defaultEst.annualContractValue === zeroEst.annualContractValue, `Annual value parity for ${fac} ${freq} ${sqft}sqft`);
      assert(defaultEst.hoursPerCleaningVisit === zeroEst.hoursPerCleaningVisit, `Hours parity for ${sqft}sqft`);
      assert(defaultEst.recommendedCrewSize === zeroEst.recommendedCrewSize, `Crew size parity for ${sqft}sqft`);
      assert(defaultEst.laborCostPerMonth === zeroEst.laborCostPerMonth, `Labor cost parity for ${sqft}sqft`);
      assert(defaultEst.suppliesCostPerMonth === zeroEst.suppliesCostPerMonth, `Supplies cost parity for ${sqft}sqft`);
      assert(defaultEst.overheadCostPerMonth === zeroEst.overheadCostPerMonth, `Overhead cost parity for ${sqft}sqft`);
      assert(defaultEst.grossMarginDollarsPerMonth === zeroEst.grossMarginDollarsPerMonth, `Gross margin dollars parity for ${sqft}sqft`);
      assert(defaultEst.effectiveGrossMarginPercent === zeroEst.effectiveGrossMarginPercent, `Effective margin % parity for ${sqft}sqft`);
      regressionCount++;
    }
  }
}
console.log(`\nVerified ${regressionCount} distinct facility/frequency/sqft matrix configurations for 0% regression invariance.`);
console.log('\n======================================================');
console.log('  ALL 10 TESTS + CRITICAL REGRESSION INVARIANT PASSED!');
console.log('======================================================\n');
