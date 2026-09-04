/**
 * Ready-to-Deploy Google Apps Script for Client-Owned Google Sheet Database
 * 
 * Instructions for New Client Onboarding:
 * 1. Open Google Sheets (https://sheets.new) in the client's Google account.
 * 2. Click Extensions > Apps Script.
 * 3. Paste the entire script below into Code.gs.
 * 4. Run `setupSpreadsheet` once to automatically create and format the sheets:
 *    - Leads (14 canonical prospect columns + estimating specs)
 *    - Settings (company branding & terms)
 *    - Activity Log (audit trail)
 * 5. Click Deploy > New Deployment > Select Type: "Web App".
 * 6. Set Execute as: "Me" and Who has access: "Anyone".
 * 7. Copy the Web App URL and configure it in clientConfig.ts or in-app settings.
 */

export const googleAppsScriptTemplate = `
/**
 * CleanCommand Pro - Sales Leads & Estimating Database Backend
 * Sheets: Leads, Settings, Activity Log
 */

var SHEET_NAMES = {
  LEADS: "Leads",
  SETTINGS: "Settings",
  ACTIVITY_LOG: "Activity Log"
};

var LEADS_HEADERS = [
  "Lead ID",
  "Company Name",
  "Contact Person",
  "Email",
  "Phone",
  "Project Name",
  "Project Type",
  "Project Location",
  "Estimated Value",
  "Lead Source",
  "Status",
  "Notes",
  "Date Created",
  "Updated Date",
  "Square Footage",
  "Cleaning Frequency",
  "Proposal ID"
];

var DEFAULT_SETTINGS = [
  ["Company Name", "Apex Commercial Cleaning"],
  ["Company Logo URL", ""],
  ["Company Address", "1400 Main Street, Suite 800, Dallas, TX 75202"],
  ["Phone", "(214) 555-0192"],
  ["Email", "contracts@apexcommercialcleaning.com"],
  ["Website", "https://apexcommercialcleaning.com"],
  ["License Information", "TX-JAN-2024-98421"],
  ["Insurance Information", "$2,000,000 Commercial General Liability & Full Bond"],
  ["Default Proposal Validity", "30 Days"],
  ["Default Payment Terms", "Invoiced monthly on Net-30 terms. 12-month standard term with 30-day mutual flexibility."],
  ["Default SLA", "4-hour prompt response at zero added charge if any area is unsatisfactory."],
  ["Industry Standards / Specifications", "ISSA 540 Workloading • EPA List N Certified"],
  ["Notification Email", "admin@apexcommercialcleaning.com"]
];

var ACTIVITY_LOG_HEADERS = [
  "Activity ID", "Lead ID", "Timestamp", "Activity Type",
  "Previous Status", "New Status", "User / Staff", "Notes"
];

function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS) || ss.insertSheet(SHEET_NAMES.LEADS, 0);
  leadsSheet.clear();
  leadsSheet.appendRow(LEADS_HEADERS);
  leadsSheet.getRange(1, 1, 1, LEADS_HEADERS.length)
    .setBackground("#0F172A")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setHorizontalAlignment("center");
  leadsSheet.setRowHeight(1, 38);
  leadsSheet.setFrozenRows(1);

  var widths = [130, 200, 160, 210, 140, 200, 180, 240, 140, 130, 130, 260, 110, 110, 120, 140, 140];
  for (var i = 0; i < widths.length; i++) {
    if (i < LEADS_HEADERS.length) leadsSheet.setColumnWidth(i + 1, widths[i]);
  }

  // Formatting: Currency on Estimated Value (Col 9), Number on Square Footage (Col 15)
  leadsSheet.getRange("I2:I1000").setNumberFormat("$#,##0").setHorizontalAlignment("right");
  leadsSheet.getRange("O2:O1000").setNumberFormat("#,##0").setHorizontalAlignment("right");
  leadsSheet.getRange("L2:L1000").setWrap(true);

  // Status dropdown validation (Col 11)
  var statRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["New", "Contacted", "Estimating", "Quoted", "Negotiation", "Won", "Lost"], true)
    .build();
  leadsSheet.getRange("K2:K1000").setDataValidation(statRule);

  // Settings sheet
  var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS) || ss.insertSheet(SHEET_NAMES.SETTINGS, 1);
  settingsSheet.clear();
  settingsSheet.appendRow(["Setting Key", "Setting Value"]);
  settingsSheet.getRange(1, 1, 1, 2).setBackground("#0F172A").setFontColor("#FFFFFF").setFontWeight("bold");
  for (var s = 0; s < DEFAULT_SETTINGS.length; s++) {
    settingsSheet.appendRow(DEFAULT_SETTINGS[s]);
  }
  settingsSheet.setColumnWidth(1, 260);
  settingsSheet.setColumnWidth(2, 450);

  // Activity Log sheet
  var logSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG) || ss.insertSheet(SHEET_NAMES.ACTIVITY_LOG, 2);
  logSheet.clear();
  logSheet.appendRow(ACTIVITY_LOG_HEADERS);
  logSheet.getRange(1, 1, 1, ACTIVITY_LOG_HEADERS.length).setBackground("#334155").setFontColor("#FFFFFF").setFontWeight("bold");
  logSheet.setRowHeight(1, 32);
  logSheet.setFrozenRows(1);
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "get_leads";

  if (action === "get_leads") {
    return handleGetLeads();
  } else if (action === "get_settings") {
    return handleGetSettings();
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "CleanCommand API Online" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Server busy, please retry." }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var action = body.action;
    var data = body.data || {};

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
    var logSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);

    if (!leadsSheet) {
      setupSpreadsheet();
      leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
    }

    if (action === "create_lead") {
      var leadId = data.leadId || ("LD-" + Date.now().toString(36).toUpperCase());
      var dateCreated = data.dateCreated || new Date().toISOString().split("T")[0];
      var updatedDate = new Date().toISOString().split("T")[0];

      leadsSheet.appendRow([
        leadId,
        data.companyName || "",
        data.contactPerson || data.fullName || "",
        data.email || data.businessEmail || "",
        data.phone || data.phoneNumber || "",
        data.projectName || data.companyName || "",
        data.projectType || data.facilityType || "Commercial Office",
        data.projectLocation || data.propertyAddress || "",
        Number(data.estimatedValue || data.monthlyEstimate || data.annualContractValue) || 0,
        data.leadSource || "Website",
        data.status || "New",
        data.notes || data.internalNotes || "",
        dateCreated,
        updatedDate,
        Number(data.squareFootage) || 0,
        data.cleaningFrequency || "",
        data.proposalId || ""
      ]);

      if (logSheet) {
        logSheet.appendRow([
          "ACT-" + Date.now().toString(36).toUpperCase(),
          leadId,
          new Date().toLocaleString(),
          "LEAD CREATED",
          "",
          data.status || "New",
          "Web User",
          "Initial lead created for " + (data.companyName || "Prospect")
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, leadId: leadId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "update_lead") {
      var uRow = findLeadRow(leadsSheet, data.leadId);
      if (uRow > 0) {
        if (data.companyName !== undefined) leadsSheet.getRange(uRow, 2).setValue(data.companyName);
        if (data.contactPerson !== undefined || data.fullName !== undefined) leadsSheet.getRange(uRow, 3).setValue(data.contactPerson || data.fullName);
        if (data.email !== undefined || data.businessEmail !== undefined) leadsSheet.getRange(uRow, 4).setValue(data.email || data.businessEmail);
        if (data.phone !== undefined || data.phoneNumber !== undefined) leadsSheet.getRange(uRow, 5).setValue(data.phone || data.phoneNumber);
        if (data.projectName !== undefined) leadsSheet.getRange(uRow, 6).setValue(data.projectName);
        if (data.projectType !== undefined) leadsSheet.getRange(uRow, 7).setValue(data.projectType);
        if (data.projectLocation !== undefined || data.propertyAddress !== undefined) leadsSheet.getRange(uRow, 8).setValue(data.projectLocation || data.propertyAddress);
        if (data.estimatedValue !== undefined) leadsSheet.getRange(uRow, 9).setValue(Number(data.estimatedValue));
        if (data.leadSource !== undefined) leadsSheet.getRange(uRow, 10).setValue(data.leadSource);
        if (data.status !== undefined) leadsSheet.getRange(uRow, 11).setValue(data.status);
        if (data.notes !== undefined || data.internalNotes !== undefined) leadsSheet.getRange(uRow, 12).setValue(data.notes || data.internalNotes);
        leadsSheet.getRange(uRow, 14).setValue(new Date().toISOString().split("T")[0]);

        if (logSheet) {
          logSheet.appendRow([
            "ACT-" + Date.now().toString(36).toUpperCase(),
            data.leadId,
            new Date().toLocaleString(),
            "LEAD UPDATED",
            "",
            data.status || "",
            "Staff",
            "Lead record updated in-place"
          ]);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "save_estimate") {
      var eRow = findLeadRow(leadsSheet, data.leadId);
      if (eRow > 0) {
        if (data.estimatedValue !== undefined || data.annualContractValue !== undefined) {
          leadsSheet.getRange(eRow, 9).setValue(Number(data.estimatedValue || data.annualContractValue));
        }
        if (data.squareFootage !== undefined) leadsSheet.getRange(eRow, 15).setValue(Number(data.squareFootage));
        if (data.cleaningFrequency !== undefined) leadsSheet.getRange(eRow, 16).setValue(data.cleaningFrequency);
        leadsSheet.getRange(eRow, 11).setValue("Estimating");
        leadsSheet.getRange(eRow, 14).setValue(new Date().toISOString().split("T")[0]);

        if (logSheet) {
          logSheet.appendRow([
            "ACT-" + Date.now().toString(36).toUpperCase(),
            data.leadId,
            new Date().toLocaleString(),
            "ESTIMATE SAVED",
            "",
            "Estimating",
            "Estimator",
            "Estimate calculated & saved"
          ]);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "update_status") {
      var sRow = findLeadRow(leadsSheet, data.leadId);
      if (sRow > 0) {
        leadsSheet.getRange(sRow, 11).setValue(data.status);
        leadsSheet.getRange(sRow, 14).setValue(new Date().toISOString().split("T")[0]);

        if (logSheet) {
          logSheet.appendRow([
            "ACT-" + Date.now().toString(36).toUpperCase(),
            data.leadId,
            new Date().toLocaleString(),
            "STATUS CHANGE",
            data.previousStatus || "",
            data.status,
            "Staff",
            "Status updated to " + data.status
          ]);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "update_proposal") {
      var pRow = findLeadRow(leadsSheet, data.leadId);
      if (pRow > 0) {
        if (data.proposalId) leadsSheet.getRange(pRow, 17).setValue(data.proposalId);
        leadsSheet.getRange(pRow, 11).setValue("Quoted");
        leadsSheet.getRange(pRow, 14).setValue(new Date().toISOString().split("T")[0]);

        if (logSheet) {
          logSheet.appendRow([
            "ACT-" + Date.now().toString(36).toUpperCase(),
            data.leadId,
            new Date().toLocaleString(),
            "PROPOSAL GENERATED",
            "",
            "Quoted",
            "Proposal Engine",
            "Proposal " + (data.proposalId || "") + " attached"
          ]);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function handleGetLeads() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, leads: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var leads = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;

    leads.push({
      leadId: String(r[0]),
      companyName: String(r[1] || ""),
      contactPerson: String(r[2] || ""),
      email: String(r[3] || ""),
      phone: String(r[4] || ""),
      projectName: String(r[5] || ""),
      projectType: String(r[6] || "Commercial Office"),
      projectLocation: String(r[7] || ""),
      estimatedValue: Number(r[8]) || 0,
      leadSource: String(r[9] || "Website"),
      status: String(r[10] || "New"),
      notes: String(r[11] || ""),
      dateCreated: String(r[12] || ""),
      updatedDate: String(r[13] || ""),
      squareFootage: Number(r[14]) || 12000,
      cleaningFrequency: String(r[15] || "business_5x"),
      proposalId: String(r[16] || ""),

      // Compatibility helpers
      fullName: String(r[2] || ""),
      businessEmail: String(r[3] || ""),
      phoneNumber: String(r[4] || ""),
      propertyAddress: String(r[7] || ""),
      monthlyEstimate: Math.round((Number(r[8]) || 0) / 12) || 0,
      createdDate: String(r[12] || ""),
      lastUpdated: String(r[13] || ""),
      internalNotes: String(r[11] || "")
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, leads: leads }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);

  var rows = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) settings[String(rows[i][0])] = rows[i][1];
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, settings: settings }))
    .setMimeType(ContentService.MimeType.JSON);
}

function findLeadRow(sheet, leadId) {
  if (!leadId) return -1;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(leadId).trim()) {
      return i + 1; // 1-indexed row number
    }
  }
  return -1;
}
`;
