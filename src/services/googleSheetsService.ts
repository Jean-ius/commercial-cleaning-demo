import { LeadRecord, LeadStatus } from '../types/cleanCommand';

const LOCAL_STORAGE_LEADS_KEY = 'cleancommand_leads_cache';

export const CANONICAL_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP_7JM9DiCjbIMurFqbhVjFIgt8egv4OLgEe_FmhCGegoUC2ZF5g4lFYTlH3ew-yCnng/exec';

/**
 * Helper to resolve the active Webhook URL
 */
function resolveWebhookUrl(overrideUrl?: string): string {
  if (overrideUrl && overrideUrl.trim().length > 0) {
    return overrideUrl.trim();
  }
  const envUrl = (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_APPS_SCRIPT_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return CANONICAL_APPS_SCRIPT_URL;
}

interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
  leadId?: string;
  lead?: any;
  leads?: any[];
  count?: number;
}

/**
 * Post JSON payload to Apps Script Webhook with text/plain (avoids CORS preflight issues)
 */
async function postToWebhook(action: string, data: unknown, webhookUrl?: string): Promise<WebhookResponse> {
  const targetUrl = resolveWebhookUrl(webhookUrl);

  if (!targetUrl) {
    console.warn(`[GoogleSheetsService] No Google Apps Script URL provided for action "${action}".`);
    return { 
      success: false, 
      error: 'No Google Apps Script Webhook URL configured. Please check brand settings.' 
    };
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ action, data })
    });

    if (!response.ok) {
      const errMsg = `Google Apps Script returned HTTP ${response.status} (${response.statusText})`;
      console.error(`[GoogleSheetsService] ${errMsg} for action: ${action}`);
      return { success: false, error: errMsg };
    }

    const text = await response.text();
    let json: WebhookResponse;
    try {
      json = JSON.parse(text);
    } catch {
      // If server returned plain text or html redirect
      if (text.toLowerCase().includes('success')) {
        return { success: true, message: text };
      }
      return { success: false, error: `Invalid response format from Google Apps Script: ${text.slice(0, 150)}` };
    }

    if (json.success === false) {
      console.error(`[GoogleSheetsService] Apps Script Error [${action}]:`, json.error);
    }

    return json;
  } catch (error: any) {
    console.error(`[GoogleSheetsService] Network error during "${action}":`, error);
    return { 
      success: false, 
      error: error?.message || 'Network error communicating with Google Apps Script.' 
    };
  }
}

/**
 * Fetch persisted leads list from Google Sheets (GET ?action=get_leads)
 */
export async function loadLeadsFromGoogleSheets(webhookUrl?: string): Promise<{ leads: LeadRecord[]; mode: 'live' | 'local_fallback' }> {
  const targetUrl = resolveWebhookUrl(webhookUrl);

  // Read local cache first for initial fallback
  const cachedRaw = localStorage.getItem(LOCAL_STORAGE_LEADS_KEY);
  let localLeads: LeadRecord[] = [];
  if (cachedRaw) {
    try {
      localLeads = JSON.parse(cachedRaw);
    } catch {
      localLeads = [];
    }
  }

  if (!targetUrl) {
    return { leads: localLeads, mode: 'local_fallback' };
  }

  try {
    const url = new URL(targetUrl);
    url.searchParams.set('action', 'get_leads');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const text = await response.text();
      const data = JSON.parse(text);
      if (data && data.success && Array.isArray(data.leads)) {
        // Sanitize and format each lead
        const formattedLeads: LeadRecord[] = data.leads.map((r: any) => ({
          leadId: String(r.leadId || ''),
          leadSource: r.leadSource || 'Website',
          companyName: String(r.companyName || 'Untitled Prospect'),
          contactPerson: String(r.contactPerson || r.fullName || ''),
          email: String(r.email || r.businessEmail || ''),
          phone: String(r.phone || r.phoneNumber || ''),
          propertyAddress: String(r.propertyAddress || r.projectLocation || ''),
          propertyType: String(r.propertyType || r.projectType || 'Commercial Office'),
          squareFootage: Number(r.squareFootage) || 12000,
          cleaningFrequency: r.cleaningFrequency || 'business_5x',
          specialRequirements: String(r.specialRequirements || ''),
          assignedSalesRep: String(r.assignedSalesRep || 'Unassigned'),
          status: (r.status || 'New') as LeadStatus,
          notes: String(r.notes || r.internalNotes || ''),
          dateCreated: String(r.dateCreated || new Date().toISOString().split('T')[0]),
          lastUpdated: String(r.lastUpdated || r.updatedDate || new Date().toISOString().split('T')[0]),

          // Estimator & Proposal values
          estimatedValue: Number(r.estimatedValue || r.annualContractValue) || 0,
          annualContractValue: Number(r.estimatedValue || r.annualContractValue) || 0,
          proposalId: String(r.proposalId || ''),

          // Compatibility helpers
          fullName: String(r.contactPerson || r.fullName || ''),
          businessEmail: String(r.email || r.businessEmail || ''),
          phoneNumber: String(r.phone || r.phoneNumber || ''),
          projectName: String(r.companyName || 'Prospect Facility'),
          projectLocation: String(r.propertyAddress || r.projectLocation || ''),
          projectType: String(r.propertyType || r.projectType || 'Commercial Office'),
          facilityType: (r.propertyType || 'corporate_office') as any,
          monthlyEstimate: Math.round((Number(r.estimatedValue) || 0) / 12) || 0,
          internalNotes: String(r.notes || r.internalNotes || ''),
          createdDate: String(r.dateCreated || ''),
          updatedDate: String(r.lastUpdated || r.updatedDate || '')
        }));

        // Google Sheets is source of truth: update local cache with verified sheet records
        localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(formattedLeads));
        return { leads: formattedLeads, mode: 'live' };
      }
    }
  } catch (err) {
    console.warn('[GoogleSheetsService] Could not reach remote Google Sheet, using local cache:', err);
  }

  return { leads: localLeads, mode: 'local_fallback' };
}

/**
 * Create a new lead record: writes directly to Google Sheet first
 */
export async function createLeadInGoogleSheets(
  lead: LeadRecord,
  webhookUrl?: string
): Promise<{ success: boolean; leadId: string }> {
  const targetUrl = resolveWebhookUrl(webhookUrl);
  if (!targetUrl) {
    throw new Error('Google Apps Script Webhook URL is not configured. Please enter your Webhook URL in settings.');
  }

  const res = await postToWebhook('create_lead', lead, targetUrl);
  if (!res.success) {
    throw new Error(res.error || 'Failed to write new lead to Google Sheet.');
  }

  // Google Sheets write confirmed: update local cache
  try {
    const cached: LeadRecord[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const existingIdx = cached.findIndex((l: LeadRecord) => l.leadId === lead.leadId);
    if (existingIdx !== -1) {
      cached[existingIdx] = lead;
    } else {
      cached.unshift(lead);
    }
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('[GoogleSheetsService] Local storage update error:', e);
  }

  return {
    success: true,
    leadId: res.leadId || lead.leadId
  };
}

/**
 * Update complete lead information in Google Sheet in-place
 */
export async function updateLeadInGoogleSheets(
  lead: LeadRecord,
  webhookUrl?: string
): Promise<{ success: boolean }> {
  const targetUrl = resolveWebhookUrl(webhookUrl);
  if (!targetUrl) {
    throw new Error('Google Apps Script Webhook URL is not configured.');
  }

  const res = await postToWebhook('update_lead', lead, targetUrl);
  if (!res.success) {
    throw new Error(res.error || `Failed to update lead ${lead.leadId} in Google Sheet.`);
  }

  // Google Sheets write confirmed: update local cache
  try {
    const cached: LeadRecord[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const idx = cached.findIndex((l: LeadRecord) => l.leadId === lead.leadId);
    if (idx !== -1) {
      cached[idx] = { 
        ...cached[idx], 
        ...lead, 
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0] 
      };
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
    }
  } catch (e) {
    console.warn('[GoogleSheetsService] Local storage update error:', e);
  }

  return { success: true };
}

/**
 * Update pipeline status on a lead record in Google Sheets
 */
export async function updateStatusInGoogleSheets(
  leadId: string,
  status: LeadStatus,
  previousStatus?: LeadStatus,
  webhookUrl?: string
): Promise<{ success: boolean }> {
  const targetUrl = resolveWebhookUrl(webhookUrl);
  if (!targetUrl) {
    throw new Error('Google Apps Script Webhook URL is not configured.');
  }

  const res = await postToWebhook('update_status', { leadId, status, previousStatus }, targetUrl);
  if (!res.success) {
    throw new Error(res.error || `Failed to update status for lead ${leadId} in Google Sheet.`);
  }

  // Google Sheets write confirmed: update local cache
  try {
    const cached: LeadRecord[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const idx = cached.findIndex((l: LeadRecord) => l.leadId === leadId);
    if (idx !== -1) {
      cached[idx] = { 
        ...cached[idx], 
        status, 
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0] 
      };
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
    }
  } catch (e) {
    console.warn('[GoogleSheetsService] Local storage update error:', e);
  }

  return { success: true };
}

/**
 * Save an updated estimate snapshot to the active lead record in Google Sheets
 */
export async function saveEstimateToGoogleSheets(
  leadId: string,
  estimateData: Partial<LeadRecord>,
  webhookUrl?: string
): Promise<{ success: boolean }> {
  const targetUrl = resolveWebhookUrl(webhookUrl);
  if (!targetUrl) {
    throw new Error('Google Apps Script Webhook URL is not configured.');
  }

  const res = await postToWebhook('save_estimate', { leadId, ...estimateData }, targetUrl);
  if (!res.success) {
    throw new Error(res.error || `Failed to save estimate for lead ${leadId} to Google Sheet.`);
  }

  try {
    const cached: LeadRecord[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const idx = cached.findIndex((l: LeadRecord) => l.leadId === leadId);
    if (idx !== -1) {
      cached[idx] = { 
        ...cached[idx], 
        ...estimateData, 
        status: cached[idx].status === 'New' ? 'Estimating' : cached[idx].status,
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0] 
      };
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
    }
  } catch (e) {
    console.warn('[GoogleSheetsService] Local storage update error:', e);
  }

  return { success: true };
}

/**
 * Update proposal status on a lead record in Google Sheets
 */
export async function updateProposalInGoogleSheets(
  leadId: string,
  proposalData: Partial<LeadRecord>,
  webhookUrl?: string
): Promise<{ success: boolean }> {
  const targetUrl = resolveWebhookUrl(webhookUrl);
  if (!targetUrl) {
    throw new Error('Google Apps Script Webhook URL is not configured.');
  }

  const res = await postToWebhook('update_proposal', { leadId, ...proposalData }, targetUrl);
  if (!res.success) {
    throw new Error(res.error || `Failed to attach proposal to lead ${leadId} in Google Sheet.`);
  }

  try {
    const cached: LeadRecord[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const idx = cached.findIndex((l: LeadRecord) => l.leadId === leadId);
    if (idx !== -1) {
      cached[idx] = { 
        ...cached[idx], 
        ...proposalData, 
        status: 'Quoted',
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0] 
      };
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
    }
  } catch (e) {
    console.warn('[GoogleSheetsService] Local storage update error:', e);
  }

  return { success: true };
}
