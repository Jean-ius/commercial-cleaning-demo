import { LeadRecord, LeadStatus } from '../types/cleanCommand';

const LOCAL_STORAGE_LEADS_KEY = 'cleancommand_leads_cache';

/**
 * Helper to get target Webhook URL
 */
function resolveWebhookUrl(overrideUrl?: string): string {
  const envUrl = (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_APPS_SCRIPT_URL;
  const target = (overrideUrl && overrideUrl.trim().length > 0) ? overrideUrl.trim() : envUrl;
  return target ? target.trim() : '';
}

/**
 * Post JSON payload to Apps Script Webhook safely with CORS-compatible text/plain headers
 */
async function postToWebhook(action: string, data: unknown, webhookUrl?: string): Promise<{ success: boolean; data?: any }> {
  const targetUrl = resolveWebhookUrl(webhookUrl);

  if (!targetUrl) {
    console.info(`[GoogleSheetsService] No Apps Script URL configured. Executed locally for action: "${action}"`);
    return { success: true };
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
      console.warn(`[GoogleSheetsService] HTTP status ${response.status} for action: ${action}`);
    }

    try {
      const json = await response.json();
      return json;
    } catch {
      return { success: true };
    }
  } catch (error) {
    console.warn(`[GoogleSheetsService] Network error connecting to Apps Script:`, error);
    return { success: false };
  }
}

/**
 * Fetch persisted leads list from Google Sheets (GET ?action=get_leads)
 */
export async function loadLeadsFromGoogleSheets(webhookUrl?: string): Promise<{ leads: LeadRecord[]; mode: 'live' | 'local_fallback' }> {
  const targetUrl = resolveWebhookUrl(webhookUrl);

  // Read local cache first for instant client-side render
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
      const data = await response.json();
      if (data && data.success && Array.isArray(data.leads)) {
        localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(data.leads));
        return { leads: data.leads, mode: 'live' };
      }
    }
  } catch (err) {
    console.warn('[GoogleSheetsService] Failed to load remote leads, using local cache fallback.', err);
  }

  return { leads: localLeads, mode: 'local_fallback' };
}

/**
 * Create a new lead record in Google Sheets and local cache
 */
export async function createLeadInGoogleSheets(
  lead: LeadRecord,
  webhookUrl?: string
): Promise<{ success: boolean; leadId: string; mode: 'live' | 'local_fallback' }> {
  // Update local cache immediately
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const existingIdx = cached.findIndex((l: LeadRecord) => l.leadId === lead.leadId);
    if (existingIdx !== -1) {
      cached[existingIdx] = lead;
    } else {
      cached.unshift(lead);
    }
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('[GoogleSheetsService] Could not write to local cache', e);
  }

  const targetUrl = resolveWebhookUrl(webhookUrl);
  if (!targetUrl) {
    return { success: true, leadId: lead.leadId, mode: 'local_fallback' };
  }

  const res = await postToWebhook('create_lead', lead, targetUrl);
  return {
    success: res.success !== false,
    leadId: lead.leadId,
    mode: 'live'
  };
}

/**
 * Update complete lead information in Google Sheets in-place
 */
export async function updateLeadInGoogleSheets(
  lead: LeadRecord,
  webhookUrl?: string
): Promise<{ success: boolean }> {
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const idx = cached.findIndex((l: LeadRecord) => l.leadId === lead.leadId);
    if (idx !== -1) {
      cached[idx] = { ...cached[idx], ...lead, updatedDate: new Date().toISOString().split('T')[0] };
    } else {
      cached.unshift(lead);
    }
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('[GoogleSheetsService] Cache update error', e);
  }

  const res = await postToWebhook('update_lead', lead, webhookUrl);
  return { success: res.success !== false };
}

/**
 * Save an updated estimate snapshot to the active lead record in Google Sheets
 */
export async function saveEstimateToGoogleSheets(
  leadId: string,
  estimateData: Partial<LeadRecord>,
  webhookUrl?: string
): Promise<{ success: boolean }> {
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const idx = cached.findIndex((l: LeadRecord) => l.leadId === leadId);
    if (idx !== -1) {
      cached[idx] = { 
        ...cached[idx], 
        ...estimateData, 
        status: cached[idx].status === 'New' ? 'Estimating' : cached[idx].status,
        updatedDate: new Date().toISOString().split('T')[0] 
      };
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
    }
  } catch (e) {
    console.warn('[GoogleSheetsService] Cache update error', e);
  }

  const res = await postToWebhook('save_estimate', { leadId, ...estimateData }, webhookUrl);
  return { success: res.success !== false };
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
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const idx = cached.findIndex((l: LeadRecord) => l.leadId === leadId);
    if (idx !== -1) {
      cached[idx] = { ...cached[idx], status, updatedDate: new Date().toISOString().split('T')[0] };
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
    }
  } catch (e) {
    console.warn('[GoogleSheetsService] Cache update error', e);
  }

  const res = await postToWebhook('update_status', { leadId, status, previousStatus }, webhookUrl);
  return { success: res.success !== false };
}

/**
 * Update proposal status on a lead record in Google Sheets
 */
export async function updateProposalInGoogleSheets(
  leadId: string,
  proposalData: Partial<LeadRecord>,
  webhookUrl?: string
): Promise<{ success: boolean }> {
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const idx = cached.findIndex((l: LeadRecord) => l.leadId === leadId);
    if (idx !== -1) {
      cached[idx] = { 
        ...cached[idx], 
        ...proposalData, 
        status: 'Quoted',
        updatedDate: new Date().toISOString().split('T')[0] 
      };
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(cached));
    }
  } catch (e) {
    console.warn('[GoogleSheetsService] Cache update error', e);
  }

  const res = await postToWebhook('update_proposal', { leadId, ...proposalData }, webhookUrl);
  return { success: res.success !== false };
}
