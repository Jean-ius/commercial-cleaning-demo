/**
 * Ready-to-Deploy Google Apps Script for Client-Owned Google Sheet CRM
 * 
 * Instructions for New Client Onboarding:
 * 1. Open Google Sheets (https://sheets.new) in the client's Google account.
 * 2. Rename Sheet1 to "Commercial Leads".
 * 3. Click Extensions > Apps Script.
 * 4. Paste the entire script below into Code.gs.
 * 5. Click Deploy > New Deployment > Select Type: "Web App".
 * 6. Set Execute as: "Me" and Who has access: "Anyone".
 * 7. Copy the Web App URL and paste it into `clientConfig.ts` (or the in-app settings).
 */

export const googleAppsScriptTemplate = `
/**
 * CleanCommand Pro - Commercial Cleaning CRM Lead Ingestion Engine
 * Persistent, zero-maintenance lead capture directly into client Google Sheet.
 */

const SHEET_NAME = 'Commercial Leads';

function doPost(e) {
  const lock = LockService.getScriptLock();
  
  try {
    // Wait up to 20 seconds for concurrent write locks
    lock.waitLock(20000);
    
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: 'Invalid JSON payload received.'
      }, 400);
    }
    
    const {
      contactName,
      companyName,
      email,
      phone,
      facilityType,
      squareFootage,
      frequency,
      estimatedMonthlyValue,
      preferredWalkthroughDate,
      preferredTimeWindow,
      currentCleaningPainPoints,
      submittedAt
    } = payload;
    
    // 1. Basic Validation
    if (!contactName || !email || !phone) {
      return createJsonResponse({
        success: false,
        error: 'Missing required contact fields (Name, Email, Phone).'
      }, 400);
    }
    
    // 2. Locate or Initialize the Spreadsheet Tab
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Format Header Row
      const headers = [
        'Submission Timestamp',
        'Contact Name',
        'Company Name',
        'Email Address',
        'Phone Number',
        'Facility Type',
        'Cleanable Sq Ft',
        'Cleaning Frequency',
        'Est. Monthly Contract Value',
        'Walkthrough Date',
        'Time Window',
        'Current Pain Points / Notes',
        'Pipeline Status',
        'Proposal Sent'
      ];
      
      sheet.appendRow(headers);
      
      // Style Header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#0B132B');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
    
    // 3. Append Lead Row
    const newRow = [
      submittedAt || new Date().toISOString(),
      contactName || '',
      companyName || 'Not Provided',
      email || '',
      phone || '',
      facilityType || 'General Office',
      squareFootage || 0,
      frequency || 'Business 5x',
      estimatedMonthlyValue ? ('$' + Number(estimatedMonthlyValue).toLocaleString()) : '$0',
      preferredWalkthroughDate || 'TBD',
      preferredTimeWindow || 'Morning (8AM - 12PM)',
      currentCleaningPainPoints || 'None specified',
      'New Walkthrough Request', // Default Status
      'No'
    ];
    
    sheet.appendRow(newRow);
    
    return createJsonResponse({
      success: true,
      message: 'Commercial walkthrough lead logged successfully to Google Sheet CRM.',
      leadCompany: companyName,
      estimatedValue: estimatedMonthlyValue
    }, 200);
    
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    }, 500);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({
    status: 'online',
    system: 'CleanCommand Pro Lead CRM Webhook',
    timestamp: new Date().toISOString()
  }, 200);
}

function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`;
