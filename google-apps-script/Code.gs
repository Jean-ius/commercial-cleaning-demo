/**
 * =========================================================================
 * COMMERCIAL CLEANING SALES & ESTIMATING SYSTEM - GOOGLE SHEETS BACKEND
 * =========================================================================
 * 
 * ARCHITECTURE (4 SHEETS):
 * 1. Sheet 1: "Leads" (Exactly 15 human-readable sales columns, formatted for executive visibility)
 * 2. Sheet 2: "Lead Details" (Full structured persistence for LeadRecord fields not visible in Leads view)
 * 3. Sheet 3: "Settings" (Company brand, terms, SLA, sales rep, and notification email)
 * 4. Sheet 4: "Activity Log" (Audit trail of lead lifecycle, status transitions, estimates, and walkthroughs)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your target Google Sheet.
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Replace all existing code in the editor with this entire file.
 * 4. Click the Save icon.
 * 5. Select "setupSpreadsheet" from the run dropdown and click "Run".
 *    -> Automatically creates and formats "Leads", "Lead Details", "Settings", and "Activity Log"!
 * 6. Click "Deploy" > "New deployment" > Select type "Web app".
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (handled via POST/GET for web app webhook)
 * 7. Copy the Web App URL and paste it into your clientConfig or app settings.
 */

// SPREADSHEET CONFIGURATION
var SPREADSHEET_ID = "15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM";

var SHEET_NAMES = {
  LEADS: "Leads",
  LEAD_DETAILS: "Lead Details",
  SETTINGS: "Settings",
  ACTIVITY_LOG: "Activity Log"
};

// SHEET 1: LEADS - EXACTLY 15 HUMAN-READABLE SALES COLUMNS (A to O)
var LEADS_HEADERS = [
  "Lead ID",          // Col A (140px, Center)
  "Date",             // Col B (110px, Center)
  "Contact Name",     // Col C (160px, Left)
  "Company",          // Col D (190px, Left)
  "Email",            // Col E (210px, Left)
  "Phone",            // Col F (140px, Left)
  "Property",         // Col G (200px, Left)
  "Facility Type",    // Col H (170px, Left)
  "Square Footage",   // Col I (120px, Right, Numeric #,##0)
  "Frequency",        // Col J (130px, Center)
  "Monthly Estimate", // Col K (140px, Right, Currency $#,##0)
  "Walkthrough",      // Col L (130px, Center, Dropdown)
  "Proposal",         // Col M (130px, Center, Dropdown)
  "Status",           // Col N (120px, Center, Dropdown)
  "Notes"             // Col O (260px, Left, Wrapped)
];

// SHEET 2: LEAD DETAILS - PERSISTENT DATA EXTENSION FOR COMPLETE LEADRECORD
var LEAD_DETAILS_HEADERS = [
  "Lead ID",                  // Col A (Foreign Key)
  "Lead Source",              // Col B
  "Property Address",         // Col C
  "Selected Add-Ons",         // Col D (Comma-separated)
  "Special Requirements",     // Col E
  "Rate Per Visit",           // Col F
  "Annual Contract Value",    // Col G
  "Estimated Labor Hours",    // Col H
  "Recommended Crew Size",    // Col I
  "Walkthrough Date",         // Col J
  "Walkthrough Time",         // Col K
  "Assigned Sales Rep",       // Col L
  "Meeting Instructions",     // Col M
  "Walkthrough Notes",        // Col N
  "Proposal ID",              // Col O
  "Proposal Issue Date",      // Col P
  "Proposal Valid Through",   // Col Q
  "Proposal Sent Date",       // Col R
  "Last Updated"              // Col S
];

// SHEET 3: SETTINGS
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
  ["Default SLA", "4-hour prompt re-clean response at zero added charge if any area is unsatisfactory."],
  ["Industry Standards / Service Specifications", "ISSA 540 Workloading • EPA List N Disinfection"],
  ["Default Assigned Sales Representative", "Marcus Sterling"],
  ["Notification Email", "jcsabillo23@gmail.com"]
];

// SHEET 4: ACTIVITY LOG
var ACTIVITY_LOG_HEADERS = [
  "Activity ID",       // Col A
  "Lead ID",           // Col B
  "Timestamp",         // Col C
  "Activity Type",     // Col D (LEAD CREATED | STATUS CHANGE | ESTIMATE SAVED | WALKTHROUGH SCHEDULED | PROPOSAL GENERATED | LEAD UPDATED)
  "Previous Status",   // Col E
  "New Status",        // Col F
  "User / Staff",      // Col G
  "Notes"              // Col H
];

/**
 * Initialize / setup all 4 sheets with headers, column widths, formatting, and validation.
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet();

  // 1. LEADS SHEET
  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet(SHEET_NAMES.LEADS, 0);
  }
  setupLeadsSheet(leadsSheet);

  // 2. LEAD DETAILS SHEET
  var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS);
  if (!detailsSheet) {
    detailsSheet = ss.insertSheet(SHEET_NAMES.LEAD_DETAILS, 1);
  }
  setupLeadDetailsSheet(detailsSheet);

  // 3. SETTINGS SHEET
  var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SHEET_NAMES.SETTINGS, 2);
  }
  setupSettingsSheet(settingsSheet);

  // 4. ACTIVITY LOG SHEET
  var logSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_NAMES.ACTIVITY_LOG, 3);
  }
  setupActivityLogSheet(logSheet);

  Logger.log("CleanCommand Pro: 4-Sheet Architecture successfully configured!");
}

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      // fallback to active
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function setupLeadsSheet(sheet) {
  sheet.clear();
  sheet.appendRow(LEADS_HEADERS);

  var headerRange = sheet.getRange(1, 1, 1, 15);
  headerRange.setBackground("#0F172A");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Arial");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  var colWidths = [140, 110, 160, 190, 210, 140, 200, 170, 120, 130, 140, 130, 130, 120, 260];
  for (var i = 0; i < colWidths.length; i++) {
    sheet.setColumnWidth(i + 1, colWidths[i]);
  }

  // Number & Currency formatting (Rows 2 to 1000)
  sheet.getRange("I2:I1000").setNumberFormat("#,##0").setHorizontalAlignment("right");
  sheet.getRange("K2:K1000").setNumberFormat("$#,##0").setHorizontalAlignment("right");
  sheet.getRange("O2:O1000").setWrap(true);

  // Dropdown validations
  var walkthroughRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["NOT SCHEDULED", "SCHEDULED", "COMPLETED", "CANCELLED"], true)
    .build();
  sheet.getRange("L2:L1000").setDataValidation(walkthroughRule);

  var proposalRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["NOT GENERATED", "GENERATED", "SENT", "ACCEPTED"], true)
    .build();
  sheet.getRange("M2:M1000").setDataValidation(proposalRule);

  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["NEW", "QUALIFIED", "WALKTHROUGH", "PROPOSAL", "WON", "LOST"], true)
    .build();
  sheet.getRange("N2:N1000").setDataValidation(statusRule);

  // Filter
  var existingFilter = sheet.getFilter();
  if (existingFilter) existingFilter.remove();
  sheet.getRange(1, 1, 1, 15).createFilter();
}

function setupLeadDetailsSheet(sheet) {
  sheet.clear();
  sheet.appendRow(LEAD_DETAILS_HEADERS);

  var headerRange = sheet.getRange(1, 1, 1, LEAD_DETAILS_HEADERS.length);
  headerRange.setBackground("#1E293B");
  headerRange.setFontColor("#F8FAFC");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Arial");
  headerRange.setFontSize(10);
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  for (var i = 1; i <= LEAD_DETAILS_HEADERS.length; i++) {
    sheet.setColumnWidth(i, 160);
  }
}

function setupSettingsSheet(sheet) {
  sheet.clear();
  sheet.appendRow(["Setting Key", "Setting Value"]);

  var headerRange = sheet.getRange(1, 1, 1, 2);
  headerRange.setBackground("#0F172A");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  sheet.setRowHeight(1, 35);

  for (var i = 0; i < DEFAULT_SETTINGS.length; i++) {
    sheet.appendRow(DEFAULT_SETTINGS[i]);
  }
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 420);
}

function setupActivityLogSheet(sheet) {
  sheet.clear();
  sheet.appendRow(ACTIVITY_LOG_HEADERS);

  var headerRange = sheet.getRange(1, 1, 1, ACTIVITY_LOG_HEADERS.length);
  headerRange.setBackground("#334155");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  var logWidths = [150, 140, 170, 180, 130, 130, 140, 260];
  for (var j = 0; j < logWidths.length; j++) {
    sheet.setColumnWidth(j + 1, logWidths[j]);
  }
}

/**
 * Web App GET endpoint (Read-only operations)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "get_leads";
    var ss = getSpreadsheet();

    if (action === "get_leads") {
      var leads = getLeadsData(ss);
      return jsonResponse({ success: true, count: leads.length, leads: leads });
    }

    if (action === "get_lead_details") {
      var leadId = e.parameter.leadId;
      if (!leadId) {
        return jsonResponse({ success: false, error: "Missing leadId parameter" }, 400);
      }
      var fullLead = getFullLeadRecord(ss, leadId);
      if (!fullLead) {
        return jsonResponse({ success: false, error: "Lead not found: " + leadId }, 404);
      }
      return jsonResponse({ success: true, lead: fullLead });
    }

    if (action === "get_settings") {
      var settings = getSettingsMap(ss);
      return jsonResponse({ success: true, settings: settings });
    }

    return jsonResponse({ success: false, error: "Invalid action: " + action }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  }
}

/**
 * Web App POST endpoint (Idempotent write/update operations with LockService)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // 30s lock for concurrency safety

    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (pe) {
        return jsonResponse({ success: false, error: "Malformed JSON payload" }, 400);
      }
    }

    var action = payload.action || (e && e.parameter && e.parameter.action);
    var data = payload.data || payload;
    var ss = getSpreadsheet();

    if (action === "create_lead") {
      return handleCreateLead(ss, data);
    } else if (action === "save_estimate") {
      return handleSaveEstimate(ss, data);
    } else if (action === "update_walkthrough") {
      return handleUpdateWalkthrough(ss, data);
    } else if (action === "update_proposal") {
      return handleUpdateProposal(ss, data);
    } else if (action === "update_status") {
      return handleUpdateStatus(ss, data);
    } else if (action === "update_lead") {
      return handleUpdateLead(ss, data);
    }

    return jsonResponse({ success: false, error: "Unsupported POST action: " + action }, 400);

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// DATA ACCESS & HANDLERS
// ---------------------------------------------------------------------------

function getLeadsData(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
  var leads = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var leadId = String(row[0] || "").trim();
    if (!leadId) continue;

    leads.push({
      leadId: leadId,
      createdDate: String(row[1] || ""),
      fullName: String(row[2] || ""),
      companyName: String(row[3] || ""),
      businessEmail: String(row[4] || ""),
      phoneNumber: String(row[5] || ""),
      propertyAddress: String(row[6] || ""),
      facilityType: String(row[7] || ""),
      squareFootage: Number(row[8]) || 0,
      cleaningFrequency: String(row[9] || ""),
      monthlyEstimate: Number(row[10]) || 0,
      walkthroughStatus: String(row[11] || "NOT SCHEDULED"),
      proposalStatus: String(row[12] || "NOT GENERATED"),
      status: String(row[13] || "NEW"),
      internalNotes: String(row[14] || "")
    });
  }

  return leads;
}

function getFullLeadRecord(ss, leadId) {
  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS);
  if (!leadsSheet) return null;

  var leadRowIndex = findRowIndexByLeadId(leadsSheet, leadId);
  if (leadRowIndex === -1) return null;

  var leadValues = leadsSheet.getRange(leadRowIndex, 1, 1, 15).getValues()[0];
  var detailValues = [];
  if (detailsSheet) {
    var detailRowIndex = findRowIndexByLeadId(detailsSheet, leadId);
    if (detailRowIndex !== -1) {
      detailValues = detailsSheet.getRange(detailRowIndex, 1, 1, LEAD_DETAILS_HEADERS.length).getValues()[0];
    }
  }

  var selectedAddOns = [];
  if (detailValues[3]) {
    selectedAddOns = String(detailValues[3]).split(",").map(function(s) { return s.trim(); }).filter(Boolean);
  }

  return {
    leadId: leadId,
    createdDate: String(leadValues[1] || ""),
    fullName: String(leadValues[2] || ""),
    companyName: String(leadValues[3] || ""),
    businessEmail: String(leadValues[4] || ""),
    phoneNumber: String(leadValues[5] || ""),
    propertyAddress: String(leadValues[6] || detailValues[2] || ""),
    facilityType: String(leadValues[7] || ""),
    squareFootage: Number(leadValues[8]) || 0,
    cleaningFrequency: String(leadValues[9] || ""),
    monthlyEstimate: Number(leadValues[10]) || 0,
    walkthroughStatus: String(leadValues[11] || "NOT SCHEDULED"),
    proposalStatus: String(leadValues[12] || "NOT GENERATED"),
    status: String(leadValues[13] || "NEW"),
    internalNotes: String(leadValues[14] || ""),

    // Extended Details
    leadSource: String(detailValues[1] || "Website"),
    selectedAddOns: selectedAddOns,
    specialRequirements: String(detailValues[4] || ""),
    ratePerVisit: Number(detailValues[5]) || 0,
    annualContractValue: Number(detailValues[6]) || 0,
    estimatedLaborHours: Number(detailValues[7]) || 0,
    recommendedCrewSize: Number(detailValues[8]) || 1,
    walkthroughDate: String(detailValues[9] || ""),
    walkthroughTime: String(detailValues[10] || ""),
    assignedSalesRep: String(detailValues[11] || ""),
    meetingInstructions: String(detailValues[12] || ""),
    walkthroughNotes: String(detailValues[13] || ""),
    proposalId: String(detailValues[14] || ""),
    proposalIssueDate: String(detailValues[15] || ""),
    proposalValidThrough: String(detailValues[16] || ""),
    proposalSentDate: String(detailValues[17] || ""),
    lastUpdated: String(detailValues[18] || new Date().toISOString())
  };
}

function getSettingsMap(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  var map = {};
  if (!sheet) return map;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return map;

  var values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    var k = String(values[i][0] || "").trim();
    if (k) map[k] = values[i][1];
  }
  return map;
}

function findRowIndexByLeadId(sheet, leadId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var colA = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < colA.length; i++) {
    if (String(colA[i][0]).trim() === String(leadId).trim()) {
      return i + 2; // 1-indexed row number
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// WRITE OPERATIONS (In-Place Row Updates & Duplicate Prevention)
// ---------------------------------------------------------------------------

function handleCreateLead(ss, lead) {
  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS);
  if (!leadsSheet) throw new Error("Leads sheet missing. Please run setupSpreadsheet.");

  var leadId = lead.leadId;
  if (!leadId) {
    var year = new Date().getFullYear();
    var count = Math.max(1, leadsSheet.getLastRow());
    leadId = "LEAD-" + year + "-" + ("0000" + count).slice(-4);
  }

  // Check if lead already exists (idempotency)
  var existingRow = findRowIndexByLeadId(leadsSheet, leadId);
  if (existingRow !== -1) {
    return handleUpdateLead(ss, lead);
  }

  var dateStr = lead.createdDate || formatDate(new Date());
  var nowIso = new Date().toISOString();

  // 1. Append to Leads Sheet (15 columns)
  var leadRow = [
    leadId,
    dateStr,
    lead.fullName || "",
    lead.companyName || "",
    lead.businessEmail || "",
    lead.phoneNumber || "",
    lead.propertyAddress || "",
    lead.facilityType || "",
    Number(lead.squareFootage) || 0,
    lead.cleaningFrequency || "",
    Number(lead.monthlyEstimate) || 0,
    lead.walkthroughStatus || "NOT SCHEDULED",
    lead.proposalStatus || "NOT GENERATED",
    lead.status || "NEW",
    lead.internalNotes || ""
  ];
  leadsSheet.appendRow(leadRow);

  // 2. Append to Lead Details Sheet
  if (detailsSheet) {
    var addOnsStr = Array.isArray(lead.selectedAddOns) ? lead.selectedAddOns.join(", ") : (lead.selectedAddOns || "");
    var detailRow = [
      leadId,
      lead.leadSource || "Website",
      lead.propertyAddress || "",
      addOnsStr,
      lead.specialRequirements || "",
      Number(lead.ratePerVisit) || 0,
      Number(lead.annualContractValue) || 0,
      Number(lead.estimatedLaborHours) || 0,
      Number(lead.recommendedCrewSize) || 1,
      lead.walkthroughDate || "",
      lead.walkthroughTime || "",
      lead.assignedSalesRep || "",
      lead.meetingInstructions || "",
      lead.walkthroughNotes || "",
      lead.proposalId || "",
      lead.proposalIssueDate || "",
      lead.proposalValidThrough || "",
      lead.proposalSentDate || "",
      nowIso
    ];
    detailsSheet.appendRow(detailRow);
  }

  // 3. Log Activity
  logActivity(ss, leadId, "LEAD CREATED", "", lead.status || "NEW", "System / Sales", "Lead created via sales workflow");

  return jsonResponse({
    success: true,
    message: "Lead created successfully",
    leadId: leadId
  });
}

function handleSaveEstimate(ss, data) {
  var leadId = data.leadId;
  if (!leadId) throw new Error("Missing leadId for save_estimate");

  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS);
  var rowIdx = findRowIndexByLeadId(leadsSheet, leadId);
  if (rowIdx === -1) throw new Error("Lead not found: " + leadId);

  // Update Col K (Monthly Estimate), Col H (Facility Type), Col I (Sq Ft), Col J (Frequency)
  if (data.monthlyEstimate !== undefined) leadsSheet.getRange(rowIdx, 11).setValue(Number(data.monthlyEstimate) || 0);
  if (data.facilityType) leadsSheet.getRange(rowIdx, 8).setValue(data.facilityType);
  if (data.squareFootage) leadsSheet.getRange(rowIdx, 9).setValue(Number(data.squareFootage) || 0);
  if (data.cleaningFrequency) leadsSheet.getRange(rowIdx, 10).setValue(data.cleaningFrequency);

  // Update Lead Details
  if (detailsSheet) {
    var detIdx = findRowIndexByLeadId(detailsSheet, leadId);
    if (detIdx !== -1) {
      if (data.ratePerVisit !== undefined) detailsSheet.getRange(detIdx, 6).setValue(Number(data.ratePerVisit) || 0);
      if (data.annualContractValue !== undefined) detailsSheet.getRange(detIdx, 7).setValue(Number(data.annualContractValue) || 0);
      if (data.estimatedLaborHours !== undefined) detailsSheet.getRange(detIdx, 8).setValue(Number(data.estimatedLaborHours) || 0);
      if (data.recommendedCrewSize !== undefined) detailsSheet.getRange(detIdx, 9).setValue(Number(data.recommendedCrewSize) || 1);
      if (data.selectedAddOns) {
        var addOnsStr = Array.isArray(data.selectedAddOns) ? data.selectedAddOns.join(", ") : String(data.selectedAddOns);
        detailsSheet.getRange(detIdx, 4).setValue(addOnsStr);
      }
      detailsSheet.getRange(detIdx, 19).setValue(new Date().toISOString());
    }
  }

  logActivity(ss, leadId, "ESTIMATE SAVED", "", "", "Estimator", "Saved monthly estimate: $" + (data.monthlyEstimate || 0));

  return jsonResponse({ success: true, message: "Estimate saved successfully", leadId: leadId });
}

function handleUpdateWalkthrough(ss, data) {
  var leadId = data.leadId;
  if (!leadId) throw new Error("Missing leadId for update_walkthrough");

  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS);
  var rowIdx = findRowIndexByLeadId(leadsSheet, leadId);
  if (rowIdx === -1) throw new Error("Lead not found: " + leadId);

  // Update Col L (Walkthrough Status) in Leads
  var wtStatus = data.walkthroughStatus || "SCHEDULED";
  leadsSheet.getRange(rowIdx, 12).setValue(wtStatus);

  if (detailsSheet) {
    var detIdx = findRowIndexByLeadId(detailsSheet, leadId);
    if (detIdx !== -1) {
      if (data.walkthroughDate) detailsSheet.getRange(detIdx, 10).setValue(data.walkthroughDate);
      if (data.walkthroughTime) detailsSheet.getRange(detIdx, 11).setValue(data.walkthroughTime);
      if (data.assignedSalesRep) detailsSheet.getRange(detIdx, 12).setValue(data.assignedSalesRep);
      if (data.meetingInstructions) detailsSheet.getRange(detIdx, 13).setValue(data.meetingInstructions);
      if (data.walkthroughNotes) detailsSheet.getRange(detIdx, 14).setValue(data.walkthroughNotes);
      detailsSheet.getRange(detIdx, 19).setValue(new Date().toISOString());
    }
  }

  logActivity(ss, leadId, "WALKTHROUGH SCHEDULED", "", "", data.assignedSalesRep || "Sales Rep", "Date: " + (data.walkthroughDate || "") + " " + (data.walkthroughTime || ""));

  return jsonResponse({ success: true, message: "Walkthrough updated successfully", leadId: leadId });
}

function handleUpdateProposal(ss, data) {
  var leadId = data.leadId;
  if (!leadId) throw new Error("Missing leadId for update_proposal");

  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS);
  var rowIdx = findRowIndexByLeadId(leadsSheet, leadId);
  if (rowIdx === -1) throw new Error("Lead not found: " + leadId);

  var propStatus = data.proposalStatus || "GENERATED";
  leadsSheet.getRange(rowIdx, 13).setValue(propStatus);

  if (detailsSheet) {
    var detIdx = findRowIndexByLeadId(detailsSheet, leadId);
    if (detIdx !== -1) {
      if (data.proposalId) detailsSheet.getRange(detIdx, 15).setValue(data.proposalId);
      if (data.proposalIssueDate) detailsSheet.getRange(detIdx, 16).setValue(data.proposalIssueDate);
      if (data.proposalValidThrough) detailsSheet.getRange(detIdx, 17).setValue(data.proposalValidThrough);
      if (data.proposalSentDate) detailsSheet.getRange(detIdx, 18).setValue(data.proposalSentDate);
      detailsSheet.getRange(detIdx, 19).setValue(new Date().toISOString());
    }
  }

  logActivity(ss, leadId, "PROPOSAL GENERATED", "", propStatus, "Proposal System", "Proposal: " + (data.proposalId || ""));

  return jsonResponse({ success: true, message: "Proposal updated successfully", leadId: leadId });
}

function handleUpdateStatus(ss, data) {
  var leadId = data.leadId;
  if (!leadId) throw new Error("Missing leadId for update_status");

  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  var rowIdx = findRowIndexByLeadId(leadsSheet, leadId);
  if (rowIdx === -1) throw new Error("Lead not found: " + leadId);

  var prevStatus = String(leadsSheet.getRange(rowIdx, 14).getValue() || "");
  var newStatus = data.status || data.newStatus;
  leadsSheet.getRange(rowIdx, 14).setValue(newStatus);

  logActivity(ss, leadId, "STATUS CHANGE", prevStatus, newStatus, data.user || "Staff", data.notes || "Pipeline status transition");

  return jsonResponse({ success: true, message: "Status updated successfully", leadId: leadId, status: newStatus });
}

function handleUpdateLead(ss, lead) {
  var leadId = lead.leadId;
  if (!leadId) throw new Error("Missing leadId for update_lead");

  var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
  var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS);
  var rowIdx = findRowIndexByLeadId(leadsSheet, leadId);

  if (rowIdx === -1) {
    // If doesn't exist, create it
    return handleCreateLead(ss, lead);
  }

  // Update in-place on Leads Sheet
  if (lead.fullName !== undefined) leadsSheet.getRange(rowIdx, 3).setValue(lead.fullName);
  if (lead.companyName !== undefined) leadsSheet.getRange(rowIdx, 4).setValue(lead.companyName);
  if (lead.businessEmail !== undefined) leadsSheet.getRange(rowIdx, 5).setValue(lead.businessEmail);
  if (lead.phoneNumber !== undefined) leadsSheet.getRange(rowIdx, 6).setValue(lead.phoneNumber);
  if (lead.propertyAddress !== undefined) leadsSheet.getRange(rowIdx, 7).setValue(lead.propertyAddress);
  if (lead.facilityType !== undefined) leadsSheet.getRange(rowIdx, 8).setValue(lead.facilityType);
  if (lead.squareFootage !== undefined) leadsSheet.getRange(rowIdx, 9).setValue(Number(lead.squareFootage) || 0);
  if (lead.cleaningFrequency !== undefined) leadsSheet.getRange(rowIdx, 10).setValue(lead.cleaningFrequency);
  if (lead.monthlyEstimate !== undefined) leadsSheet.getRange(rowIdx, 11).setValue(Number(lead.monthlyEstimate) || 0);
  if (lead.walkthroughStatus !== undefined) leadsSheet.getRange(rowIdx, 12).setValue(lead.walkthroughStatus);
  if (lead.proposalStatus !== undefined) leadsSheet.getRange(rowIdx, 13).setValue(lead.proposalStatus);
  if (lead.status !== undefined) leadsSheet.getRange(rowIdx, 14).setValue(lead.status);
  if (lead.internalNotes !== undefined) leadsSheet.getRange(rowIdx, 15).setValue(lead.internalNotes);

  // Update details sheet
  if (detailsSheet) {
    var detIdx = findRowIndexByLeadId(detailsSheet, leadId);
    if (detIdx !== -1) {
      if (lead.leadSource !== undefined) detailsSheet.getRange(detIdx, 2).setValue(lead.leadSource);
      if (lead.propertyAddress !== undefined) detailsSheet.getRange(detIdx, 3).setValue(lead.propertyAddress);
      if (lead.selectedAddOns !== undefined) {
        var addOnsStr = Array.isArray(lead.selectedAddOns) ? lead.selectedAddOns.join(", ") : String(lead.selectedAddOns);
        detailsSheet.getRange(detIdx, 4).setValue(addOnsStr);
      }
      if (lead.specialRequirements !== undefined) detailsSheet.getRange(detIdx, 5).setValue(lead.specialRequirements);
      if (lead.ratePerVisit !== undefined) detailsSheet.getRange(detIdx, 6).setValue(Number(lead.ratePerVisit) || 0);
      if (lead.annualContractValue !== undefined) detailsSheet.getRange(detIdx, 7).setValue(Number(lead.annualContractValue) || 0);
      if (lead.estimatedLaborHours !== undefined) detailsSheet.getRange(detIdx, 8).setValue(Number(lead.estimatedLaborHours) || 0);
      if (lead.recommendedCrewSize !== undefined) detailsSheet.getRange(detIdx, 9).setValue(Number(lead.recommendedCrewSize) || 1);
      if (lead.walkthroughDate !== undefined) detailsSheet.getRange(detIdx, 10).setValue(lead.walkthroughDate);
      if (lead.walkthroughTime !== undefined) detailsSheet.getRange(detIdx, 11).setValue(lead.walkthroughTime);
      if (lead.assignedSalesRep !== undefined) detailsSheet.getRange(detIdx, 12).setValue(lead.assignedSalesRep);
      if (lead.meetingInstructions !== undefined) detailsSheet.getRange(detIdx, 13).setValue(lead.meetingInstructions);
      if (lead.walkthroughNotes !== undefined) detailsSheet.getRange(detIdx, 14).setValue(lead.walkthroughNotes);
      if (lead.proposalId !== undefined) detailsSheet.getRange(detIdx, 15).setValue(lead.proposalId);
      if (lead.proposalIssueDate !== undefined) detailsSheet.getRange(detIdx, 16).setValue(lead.proposalIssueDate);
      if (lead.proposalValidThrough !== undefined) detailsSheet.getRange(detIdx, 17).setValue(lead.proposalValidThrough);
      if (lead.proposalSentDate !== undefined) detailsSheet.getRange(detIdx, 18).setValue(lead.proposalSentDate);
      detailsSheet.getRange(detIdx, 19).setValue(new Date().toISOString());
    }
  }

  logActivity(ss, leadId, "LEAD UPDATED", "", lead.status || "", "Sales / Operations", "Updated lead information in-place");

  return jsonResponse({ success: true, message: "Lead updated in-place successfully", leadId: leadId });
}

function logActivity(ss, leadId, activityType, prevStatus, newStatus, user, notes) {
  var logSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);
  if (!logSheet) return;

  var actId = "ACT-" + Date.now().toString(36).toUpperCase();
  var timestamp = formatDate(new Date()) + " " + formatTime(new Date());

  logSheet.appendRow([
    actId,
    leadId,
    timestamp,
    activityType,
    prevStatus || "",
    newStatus || "",
    user || "Staff",
    notes || ""
  ]);
}

// ---------------------------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------------------------

function jsonResponse(obj, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function formatDate(d) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function formatTime(d) {
  var hours = d.getHours();
  var minutes = d.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + " " + ampm;
}
