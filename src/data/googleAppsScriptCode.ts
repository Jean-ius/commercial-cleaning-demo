/**
 * Ready-to-Deploy Google Apps Script for Client-Owned Google Sheet Database
 * 
 * Target Google Sheet ID: 15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM
 * 
 * Canonical 16-Column Schema:
 * Lead ID | Lead Source | Company Name | Contact Person | Email | Phone |
 * Property Address | Property Type | Square Footage | Cleaning Frequency |
 * Special Requirements | Assigned Sales Rep | Status | Notes | Date Created | Last Updated
 */

export const googleAppsScriptTemplate = `/**
 * =========================================================================
 * COMMERCIAL CLEANING SALES & ESTIMATING SYSTEM - GOOGLE SHEETS BACKEND
 * =========================================================================
 * 
 * CANONICAL SCHEMA (16 COLUMNS):
 * 1.  Lead ID
 * 2.  Lead Source
 * 3.  Company Name
 * 4.  Contact Person
 * 5.  Email
 * 6.  Phone
 * 7.  Property Address
 * 8.  Property Type
 * 9.  Square Footage
 * 10. Cleaning Frequency
 * 11. Special Requirements
 * 12. Assigned Sales Rep
 * 13. Status
 * 14. Notes
 * 15. Date Created
 * 16. Last Updated
 * 
 * FEATURES:
 * - Dynamic Header Mapping: Writes/reads by header name, resilient to column order differences.
 * - Center Alignment: Horizontal & vertical middle centering on all cells.
 * - Full Text Visibility: Text wrapping enabled (setWrap: true) with generous column widths.
 * - Direct Target Sheet Binding: Configured for target spreadsheet ID 15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM.
 * - Explicit Error Handling: Returns JSON with detailed error if lead not found or write fails.
 * 
 * SETUP INSTRUCTIONS:
 * 1. In your Google Sheet, click: Extensions > Apps Script.
 * 2. Replace all code in Code.gs with this script.
 * 3. Click Save (Ctrl+S).
 * 4. Select "setupSpreadsheet" from the toolbar dropdown and click "Run".
 *    -> Sets up canonical headers, centering, and column widths.
 * 5. Click Deploy > Manage Deployments > Edit > New version > Deploy.
 */

var TARGET_SPREADSHEET_ID = "15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM";

var SHEET_NAMES = {
  LEADS: "Leads",
  SETTINGS: "Settings",
  ACTIVITY_LOG: "Activity Log"
};

var LEADS_HEADERS = [
  "Lead ID",
  "Lead Source",
  "Company Name",
  "Contact Person",
  "Email",
  "Phone",
  "Property Address",
  "Property Type",
  "Square Footage",
  "Cleaning Frequency",
  "Special Requirements",
  "Assigned Sales Rep",
  "Status",
  "Notes",
  "Date Created",
  "Last Updated"
];

// Generous column widths (in pixels) ensuring all letters and text remain 100% visible
var COLUMN_WIDTHS = [
  150, // Lead ID
  140, // Lead Source
  240, // Company Name
  200, // Contact Person
  240, // Email
  160, // Phone
  280, // Property Address
  200, // Property Type
  140, // Square Footage
  170, // Cleaning Frequency
  260, // Special Requirements
  180, // Assigned Sales Rep
  140, // Status
  320, // Notes
  130, // Date Created
  140  // Last Updated
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

// Mapping of normalized header string -> canonical field name
var HEADER_ALIAS_MAP = {
  "leadid": "leadId",
  "id": "leadId",
  
  "leadsource": "leadSource",
  "source": "leadSource",
  
  "companyname": "companyName",
  "company": "companyName",
  "businessname": "companyName",
  
  "contactperson": "contactPerson",
  "contact": "contactPerson",
  "fullname": "contactPerson",
  "name": "contactPerson",
  
  "email": "email",
  "businessemail": "email",
  
  "phone": "phone",
  "phonenumber": "phone",
  
  "propertyaddress": "propertyAddress",
  "address": "propertyAddress",
  "projectlocation": "propertyAddress",
  "location": "propertyAddress",
  
  "propertytype": "propertyType",
  "projecttype": "propertyType",
  "facilitytype": "propertyType",
  
  "squarefootage": "squareFootage",
  "sqft": "squareFootage",
  
  "cleaningfrequency": "cleaningFrequency",
  "frequency": "cleaningFrequency",
  
  "specialrequirements": "specialRequirements",
  "specialinstructions": "specialRequirements",
  "requirements": "specialRequirements",
  
  "assignedsalesrep": "assignedSalesRep",
  "salesrep": "assignedSalesRep",
  "assignedrep": "assignedSalesRep",
  "rep": "assignedSalesRep",
  
  "status": "status",
  "leadstatus": "status",
  
  "notes": "notes",
  "internalnotes": "notes",
  
  "datecreated": "dateCreated",
  "createddate": "dateCreated",
  "createdat": "dateCreated",
  
  "lastupdated": "lastUpdated",
  "updateddate": "lastUpdated",
  "updatedat": "lastUpdated",

  // Extended estimator mappings if present in sheet
  "estimatedvalue": "estimatedValue",
  "annualcontractvalue": "estimatedValue",
  "monthlyestimate": "monthlyEstimate",
  "proposalid": "proposalId"
};

/**
 * Get the target Google Spreadsheet instance
 */
function getSpreadsheet() {
  if (TARGET_SPREADSHEET_ID && TARGET_SPREADSHEET_ID.trim().length > 0) {
    try {
      return SpreadsheetApp.openById(TARGET_SPREADSHEET_ID.trim());
    } catch (e) {
      Logger.log("openById failed: " + e + ". Falling back to active spreadsheet.");
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Build dynamic 1-indexed column map for the sheet based on actual row 1 headers
 */
function getSheetColumnMap(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    return { keyToCol: {}, colToKey: {}, headers: [] };
  }
  
  var headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var keyToCol = {}; // canonicalKey -> 1-based colIndex
  var colToKey = {}; // 0-based colIdx -> canonicalKey

  for (var i = 0; i < headerValues.length; i++) {
    var raw = String(headerValues[i] || '').trim();
    var norm = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    var canonical = HEADER_ALIAS_MAP[norm] || null;
    if (canonical) {
      keyToCol[canonical] = i + 1;
      colToKey[i] = canonical;
    }
  }
  return { keyToCol: keyToCol, colToKey: colToKey, headers: headerValues };
}

/**
 * Run setupSpreadsheet once to configure canonical headers, center alignment, and generous column widths
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet();

  // 1. Setup LEADS Sheet
  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS) || ss.insertSheet(SHEET_NAMES.LEADS, 0);
  
  // If sheet is empty or has mismatched headers, set canonical headers
  var lastCol = leadsSheet.getLastColumn();
  var needsNewHeaders = false;
  if (lastCol < LEADS_HEADERS.length) {
    needsNewHeaders = true;
  } else {
    var existingHeaders = leadsSheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var normFirst = String(existingHeaders[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normFirst !== "leadid" && normFirst !== "id") {
      needsNewHeaders = true;
    }
  }

  if (needsNewHeaders) {
    leadsSheet.clear();
    leadsSheet.appendRow(LEADS_HEADERS);
  } else {
    // Ensure canonical headers are written to row 1
    leadsSheet.getRange(1, 1, 1, LEADS_HEADERS.length).setValues([LEADS_HEADERS]);
  }

  // Header Styling: Navy Dark Background, Bold White Text, Centered
  var headerRange = leadsSheet.getRange(1, 1, 1, LEADS_HEADERS.length);
  headerRange
    .setBackground("#0F172A")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);
  leadsSheet.setRowHeight(1, 42);
  leadsSheet.setFrozenRows(1);

  // Set generous column widths so all letters are completely visible
  for (var i = 0; i < COLUMN_WIDTHS.length; i++) {
    leadsSheet.setColumnWidth(i + 1, COLUMN_WIDTHS[i]);
  }

  // Pre-format data rows (Rows 2 to 1000): Centered horizontally & vertically, Text wrap enabled
  var dataRange = leadsSheet.getRange(2, 1, 999, LEADS_HEADERS.length);
  dataRange
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true)
    .setFontFamily("Arial")
    .setFontSize(10);

  for (var r = 2; r <= 30; r++) {
    leadsSheet.setRowHeight(r, 38);
  }

  // Status dropdown validation (Col 13) - Centered
  var statRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["New", "Contacted", "Estimating", "Quoted", "Negotiation", "Won", "Lost"], true)
    .build();
  leadsSheet.getRange("M2:M1000").setDataValidation(statRule).setHorizontalAlignment("center");

  // Format Square Footage as number with comma separator (Col 9)
  leadsSheet.getRange("I2:I1000").setNumberFormat("#,##0").setHorizontalAlignment("center");

  // 2. Setup SETTINGS Sheet
  var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS) || ss.insertSheet(SHEET_NAMES.SETTINGS, 1);
  if (settingsSheet.getLastRow() < 1) {
    settingsSheet.appendRow(["Setting Key", "Setting Value"]);
    for (var s = 0; s < DEFAULT_SETTINGS.length; s++) {
      settingsSheet.appendRow(DEFAULT_SETTINGS[s]);
    }
  }
  settingsSheet.getRange(1, 1, 1, 2)
    .setBackground("#0F172A")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  settingsSheet.setRowHeight(1, 36);
  settingsSheet.setFrozenRows(1);
  settingsSheet.getRange("A2:B100").setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  settingsSheet.setColumnWidth(1, 280);
  settingsSheet.setColumnWidth(2, 480);

  // 3. Setup ACTIVITY LOG Sheet
  var logSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG) || ss.insertSheet(SHEET_NAMES.ACTIVITY_LOG, 2);
  if (logSheet.getLastRow() < 1) {
    logSheet.appendRow(ACTIVITY_LOG_HEADERS);
  }
  logSheet.getRange(1, 1, 1, ACTIVITY_LOG_HEADERS.length)
    .setBackground("#334155")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  logSheet.setRowHeight(1, 36);
  logSheet.setFrozenRows(1);
  logSheet.getRange("A2:H500").setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  for (var k = 1; k <= ACTIVITY_LOG_HEADERS.length; k++) {
    logSheet.setColumnWidth(k, 180);
  }
}

/**
 * Handle GET Requests
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "get_leads";

  if (action === "get_leads") {
    return handleGetLeads();
  } else if (action === "get_settings") {
    return handleGetSettings();
  }

  return ContentService.createTextOutput(JSON.stringify({ 
    success: true, 
    message: "CleanCommand Lead & Estimating API Online - Centered & Synchronized",
    spreadsheetId: TARGET_SPREADSHEET_ID
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST Requests
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Server lock busy. Please retry shortly." 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          error: "Invalid JSON in POST body: " + parseErr.toString() 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var action = body.action;
    var data = body.data || {};

    var ss = getSpreadsheet();
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Target spreadsheet could not be opened (ID: " + TARGET_SPREADSHEET_ID + ")" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
    var logSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);

    if (!leadsSheet) {
      setupSpreadsheet();
      leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
    }

    // -----------------------------------------------------------------
    // ACTION: CREATE LEAD
    // -----------------------------------------------------------------
    if (action === "create_lead") {
      var leadId = data.leadId || ("LD-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900));
      var today = new Date().toISOString().split("T")[0];
      var nowStr = new Date().toLocaleString();

      var colInfo = getSheetColumnMap(leadsSheet);
      var keyMap = colInfo.keyToCol;
      var totalCols = Math.max(leadsSheet.getLastColumn(), LEADS_HEADERS.length);

      // Construct normalized row based on actual sheet headers
      var rowData = new Array(totalCols);
      for (var c = 0; c < totalCols; c++) {
        rowData[c] = "";
      }

      // Map values directly to their resolved columns
      function assignVal(key, val) {
        if (keyMap[key] && keyMap[key] <= totalCols) {
          rowData[keyMap[key] - 1] = val !== undefined ? val : "";
        }
      }

      assignVal("leadId", leadId);
      assignVal("leadSource", data.leadSource || "Website");
      assignVal("companyName", data.companyName || "Untitled Prospect");
      assignVal("contactPerson", data.contactPerson || data.fullName || "");
      assignVal("email", data.email || data.businessEmail || "");
      assignVal("phone", data.phone || data.phoneNumber || "");
      assignVal("propertyAddress", data.propertyAddress || data.projectLocation || "");
      assignVal("propertyType", data.propertyType || data.projectType || data.facilityType || "Commercial Office");
      assignVal("squareFootage", Number(data.squareFootage) || 0);
      assignVal("cleaningFrequency", data.cleaningFrequency || "");
      assignVal("specialRequirements", data.specialRequirements || "");
      assignVal("assignedSalesRep", data.assignedSalesRep || "Unassigned");
      assignVal("status", data.status || "New");
      assignVal("notes", data.notes || data.internalNotes || "");
      assignVal("dateCreated", data.dateCreated || today);
      assignVal("lastUpdated", data.lastUpdated || today);

      // Extended fields if column exists
      assignVal("estimatedValue", Number(data.estimatedValue || data.annualContractValue) || 0);
      assignVal("proposalId", data.proposalId || "");

      leadsSheet.appendRow(rowData);

      // Format appended row: centered, middle vertical, text wrap, row height 38
      var newRowIdx = leadsSheet.getLastRow();
      var newRowRange = leadsSheet.getRange(newRowIdx, 1, 1, totalCols);
      newRowRange
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle")
        .setWrap(true)
        .setFontFamily("Arial")
        .setFontSize(10);
      leadsSheet.setRowHeight(newRowIdx, 38);

      if (keyMap["squareFootage"]) {
        leadsSheet.getRange(newRowIdx, keyMap["squareFootage"]).setNumberFormat("#,##0").setHorizontalAlignment("center");
      }
      if (keyMap["estimatedValue"]) {
        leadsSheet.getRange(newRowIdx, keyMap["estimatedValue"]).setNumberFormat("$#,##0").setHorizontalAlignment("center");
      }

      // Log activity
      if (logSheet) {
        logSheet.appendRow([
          "ACT-" + Date.now().toString(36).toUpperCase(),
          leadId,
          nowStr,
          "LEAD CREATED",
          "",
          data.status || "New",
          data.assignedSalesRep || "System",
          "Created lead record for " + (data.companyName || "Prospect")
        ]);
        var logIdx = logSheet.getLastRow();
        logSheet.getRange(logIdx, 1, 1, ACTIVITY_LOG_HEADERS.length)
          .setHorizontalAlignment("center")
          .setVerticalAlignment("middle")
          .setWrap(true);
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Lead created and synchronized to Google Sheet", 
        leadId: leadId 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------
    // ACTION: UPDATE LEAD
    // -----------------------------------------------------------------
    if (action === "update_lead") {
      var targetLeadId = data.leadId;
      if (!targetLeadId) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          error: "Missing required parameter 'leadId' for update_lead" 
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var colInfoU = getSheetColumnMap(leadsSheet);
      var keyMapU = colInfoU.keyToCol;
      var leadIdCol = keyMapU["leadId"] || 1;

      var targetRow = findLeadRow(leadsSheet, targetLeadId, leadIdCol);
      if (targetRow < 2) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          error: "Lead ID '" + targetLeadId + "' not found in Google Sheet." 
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var todayStr = new Date().toISOString().split("T")[0];

      function updateField(key, val) {
        if (keyMapU[key] && val !== undefined) {
          leadsSheet.getRange(targetRow, keyMapU[key]).setValue(val);
        }
      }

      if (data.leadSource !== undefined) updateField("leadSource", data.leadSource);
      if (data.companyName !== undefined) updateField("companyName", data.companyName);
      if (data.contactPerson !== undefined || data.fullName !== undefined) {
        updateField("contactPerson", data.contactPerson !== undefined ? data.contactPerson : data.fullName);
      }
      if (data.email !== undefined || data.businessEmail !== undefined) {
        updateField("email", data.email !== undefined ? data.email : data.businessEmail);
      }
      if (data.phone !== undefined || data.phoneNumber !== undefined) {
        updateField("phone", data.phone !== undefined ? data.phone : data.phoneNumber);
      }
      if (data.propertyAddress !== undefined || data.projectLocation !== undefined) {
        updateField("propertyAddress", data.propertyAddress !== undefined ? data.propertyAddress : data.projectLocation);
      }
      if (data.propertyType !== undefined || data.projectType !== undefined || data.facilityType !== undefined) {
        updateField("propertyType", data.propertyType || data.projectType || data.facilityType);
      }
      if (data.squareFootage !== undefined) {
        updateField("squareFootage", Number(data.squareFootage));
        if (keyMapU["squareFootage"]) {
          leadsSheet.getRange(targetRow, keyMapU["squareFootage"]).setNumberFormat("#,##0").setHorizontalAlignment("center");
        }
      }
      if (data.cleaningFrequency !== undefined) updateField("cleaningFrequency", data.cleaningFrequency);
      if (data.specialRequirements !== undefined) updateField("specialRequirements", data.specialRequirements);
      if (data.assignedSalesRep !== undefined) updateField("assignedSalesRep", data.assignedSalesRep);
      if (data.status !== undefined) updateField("status", data.status);
      if (data.notes !== undefined || data.internalNotes !== undefined) {
        updateField("notes", data.notes !== undefined ? data.notes : data.internalNotes);
      }

      // Always update Last Updated
      updateField("lastUpdated", data.lastUpdated || todayStr);

      // Extended
      if (data.estimatedValue !== undefined || data.annualContractValue !== undefined) {
        updateField("estimatedValue", Number(data.estimatedValue || data.annualContractValue));
        if (keyMapU["estimatedValue"]) {
          leadsSheet.getRange(targetRow, keyMapU["estimatedValue"]).setNumberFormat("$#,##0").setHorizontalAlignment("center");
        }
      }
      if (data.proposalId !== undefined) updateField("proposalId", data.proposalId);

      // Re-apply centering and wrapping
      var numCols = leadsSheet.getLastColumn();
      leadsSheet.getRange(targetRow, 1, 1, numCols)
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle")
        .setWrap(true);

      // Log update
      if (logSheet) {
        logSheet.appendRow([
          "ACT-" + Date.now().toString(36).toUpperCase(),
          targetLeadId,
          new Date().toLocaleString(),
          "LEAD UPDATED",
          "",
          data.status || "",
          data.assignedSalesRep || "Staff",
          "Updated lead record in Google Sheet"
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Lead record successfully updated in Google Sheet", 
        leadId: targetLeadId 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------
    // ACTION: UPDATE STATUS
    // -----------------------------------------------------------------
    if (action === "update_status") {
      var sLeadId = data.leadId;
      var newStatus = data.status;
      if (!sLeadId || !newStatus) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          error: "Missing leadId or status parameter" 
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var colInfoS = getSheetColumnMap(leadsSheet);
      var keyMapS = colInfoS.keyToCol;
      var leadIdColS = keyMapS["leadId"] || 1;

      var sRow = findLeadRow(leadsSheet, sLeadId, leadIdColS);
      if (sRow < 2) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          error: "Lead ID '" + sLeadId + "' not found" 
        })).setMimeType(ContentService.MimeType.JSON);
      }

      if (keyMapS["status"]) {
        leadsSheet.getRange(sRow, keyMapS["status"]).setValue(newStatus).setHorizontalAlignment("center");
      }
      if (keyMapS["lastUpdated"]) {
        leadsSheet.getRange(sRow, keyMapS["lastUpdated"]).setValue(new Date().toISOString().split("T")[0]).setHorizontalAlignment("center");
      }

      if (logSheet) {
        logSheet.appendRow([
          "ACT-" + Date.now().toString(36).toUpperCase(),
          sLeadId,
          new Date().toLocaleString(),
          "STATUS CHANGE",
          data.previousStatus || "",
          newStatus,
          "Staff",
          "Status updated to " + newStatus
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Status updated successfully", 
        leadId: sLeadId, 
        status: newStatus 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------
    // ACTION: SAVE ESTIMATE
    // -----------------------------------------------------------------
    if (action === "save_estimate") {
      var eLeadId = data.leadId;
      var colInfoE = getSheetColumnMap(leadsSheet);
      var keyMapE = colInfoE.keyToCol;
      var leadIdColE = keyMapE["leadId"] || 1;

      var eRow = findLeadRow(leadsSheet, eLeadId, leadIdColE);
      if (eRow >= 2) {
        if (keyMapE["squareFootage"] && data.squareFootage !== undefined) {
          leadsSheet.getRange(eRow, keyMapE["squareFootage"]).setValue(Number(data.squareFootage)).setNumberFormat("#,##0").setHorizontalAlignment("center");
        }
        if (keyMapE["cleaningFrequency"] && data.cleaningFrequency !== undefined) {
          leadsSheet.getRange(eRow, keyMapE["cleaningFrequency"]).setValue(data.cleaningFrequency).setHorizontalAlignment("center");
        }
        if (keyMapE["propertyType"] && data.facilityType !== undefined) {
          leadsSheet.getRange(eRow, keyMapE["propertyType"]).setValue(data.facilityType).setHorizontalAlignment("center");
        }
        if (keyMapE["estimatedValue"] && (data.estimatedValue !== undefined || data.annualContractValue !== undefined)) {
          leadsSheet.getRange(eRow, keyMapE["estimatedValue"]).setValue(Number(data.estimatedValue || data.annualContractValue)).setNumberFormat("$#,##0").setHorizontalAlignment("center");
        }
        if (keyMapE["status"]) {
          leadsSheet.getRange(eRow, keyMapE["status"]).setValue("Estimating").setHorizontalAlignment("center");
        }
        if (keyMapE["lastUpdated"]) {
          leadsSheet.getRange(eRow, keyMapE["lastUpdated"]).setValue(new Date().toISOString().split("T")[0]).setHorizontalAlignment("center");
        }

        if (logSheet) {
          logSheet.appendRow([
            "ACT-" + Date.now().toString(36).toUpperCase(),
            eLeadId,
            new Date().toLocaleString(),
            "ESTIMATE SAVED",
            "",
            "Estimating",
            "Estimator",
            "Commercial cleaning calculation saved"
          ]);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Estimate saved to lead", 
        leadId: eLeadId 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------
    // ACTION: UPDATE PROPOSAL
    // -----------------------------------------------------------------
    if (action === "update_proposal") {
      var pLeadId = data.leadId;
      var colInfoP = getSheetColumnMap(leadsSheet);
      var keyMapP = colInfoP.keyToCol;
      var leadIdColP = keyMapP["leadId"] || 1;

      var pRow = findLeadRow(leadsSheet, pLeadId, leadIdColP);
      if (pRow >= 2) {
        if (keyMapP["proposalId"] && data.proposalId) {
          leadsSheet.getRange(pRow, keyMapP["proposalId"]).setValue(data.proposalId).setHorizontalAlignment("center");
        }
        if (keyMapP["status"]) {
          leadsSheet.getRange(pRow, keyMapP["status"]).setValue("Quoted").setHorizontalAlignment("center");
        }
        if (keyMapP["lastUpdated"]) {
          leadsSheet.getRange(pRow, keyMapP["lastUpdated"]).setValue(new Date().toISOString().split("T")[0]).setHorizontalAlignment("center");
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Proposal attached to lead", 
        leadId: pLeadId 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Unrecognized action: '" + action + "'" 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Internal script error: " + err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET Leads: reads and normalizes all rows into canonical Lead records
 */
function handleGetLeads() {
  var ss = getSpreadsheet();
  if (!ss) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Cannot open target spreadsheet ID: " + TARGET_SPREADSHEET_ID 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  }

  var numRows = sheet.getLastRow();
  var numCols = sheet.getLastColumn();

  if (numRows <= 1 || numCols < 1) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      count: 0, 
      leads: [] 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getRange(1, 1, numRows, numCols).getValues();
  var headerValues = data[0];

  // Map header column index -> canonical property name
  var colMap = {};
  for (var c = 0; c < headerValues.length; c++) {
    var raw = String(headerValues[c] || '').trim();
    var norm = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    colMap[c] = HEADER_ALIAS_MAP[norm] || null;
  }

  var leads = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var record = {};

    for (var colIdx = 0; colIdx < row.length; colIdx++) {
      var prop = colMap[colIdx];
      if (prop) {
        var cellVal = row[colIdx];
        if (cellVal instanceof Date) {
          record[prop] = cellVal.toISOString().split("T")[0];
        } else {
          record[prop] = cellVal;
        }
      }
    }

    if (!record.leadId && row[0]) {
      record.leadId = String(row[0]).trim();
    }
    if (!record.leadId) continue; // Skip empty row

    // Canonical fields with safe defaults
    var canonicalLead = {
      leadId: String(record.leadId),
      leadSource: String(record.leadSource || "Website"),
      companyName: String(record.companyName || "Untitled Prospect"),
      contactPerson: String(record.contactPerson || ""),
      email: String(record.email || ""),
      phone: String(record.phone || ""),
      propertyAddress: String(record.propertyAddress || ""),
      propertyType: String(record.propertyType || "Commercial Office"),
      squareFootage: Number(record.squareFootage) || 12000,
      cleaningFrequency: String(record.cleaningFrequency || "business_5x"),
      specialRequirements: String(record.specialRequirements || ""),
      assignedSalesRep: String(record.assignedSalesRep || "Unassigned"),
      status: String(record.status || "New"),
      notes: String(record.notes || ""),
      dateCreated: String(record.dateCreated || new Date().toISOString().split("T")[0]),
      lastUpdated: String(record.lastUpdated || new Date().toISOString().split("T")[0]),

      // Estimator & Proposal connections
      estimatedValue: Number(record.estimatedValue) || 0,
      annualContractValue: Number(record.estimatedValue) || 0,
      proposalId: String(record.proposalId || ""),

      // Compatibility helpers for UI components
      fullName: String(record.contactPerson || ""),
      businessEmail: String(record.email || ""),
      phoneNumber: String(record.phone || ""),
      projectLocation: String(record.propertyAddress || ""),
      projectType: String(record.propertyType || "Commercial Office"),
      facilityType: String(record.propertyType || "corporate_office"),
      projectName: String(record.companyName || "Prospect Facility"),
      monthlyEstimate: Math.round((Number(record.estimatedValue) || 0) / 12) || 0,
      internalNotes: String(record.notes || ""),
      createdDate: String(record.dateCreated || ""),
      updatedDate: String(record.lastUpdated || "")
    };

    leads.push(canonicalLead);
  }

  return ContentService.createTextOutput(JSON.stringify({ 
    success: true, 
    count: leads.length, 
    leads: leads 
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Read Settings from Settings sheet
 */
function handleGetSettings() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);
  }

  var rows = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) settings[String(rows[i][0])] = rows[i][1];
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, settings: settings })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Locate 1-indexed row number matching leadId
 */
function findLeadRow(sheet, targetLeadId, leadIdCol) {
  if (!targetLeadId) return -1;
  var col = leadIdCol || 1;
  var numRows = sheet.getLastRow();
  if (numRows < 2) return -1;

  var ids = sheet.getRange(1, col, numRows, 1).getValues();
  var target = String(targetLeadId).trim().toLowerCase();

  for (var r = 1; r < ids.length; r++) {
    if (String(ids[r][0] || '').trim().toLowerCase() === target) {
      return r + 1;
    }
  }

  // Fallback: search across first 3 columns in case columns were shifted
  for (var c = 1; c <= Math.min(3, sheet.getLastColumn()); c++) {
    if (c === col) continue;
    var altIds = sheet.getRange(1, c, numRows, 1).getValues();
    for (var r2 = 1; r2 < altIds.length; r2++) {
      if (String(altIds[r2][0] || '').trim().toLowerCase() === target) {
        return r2 + 1;
      }
    }
  }

  return -1;
}
`;
