/**
 * Ready-to-Deploy Google Apps Script for Client-Owned Google Sheet CRM
 * 
 * Instructions for New Client Onboarding:
 * 1. Open Google Sheets (https://sheets.new) in the client's Google account.
 * 2. Click Extensions > Apps Script.
 * 3. Paste the entire script below into Code.gs.
 * 4. Run `setupSpreadsheet` once to automatically create and format the 4 sheets:
 *    - Leads (15 human-readable columns)
 *    - Lead Details (complete LeadRecord persistence)
 *    - Settings (company branding & terms)
 *    - Activity Log (audit trail)
 * 5. Click Deploy > New Deployment > Select Type: "Web App".
 * 6. Set Execute as: "Me" and Who has access: "Anyone".
 * 7. Copy the Web App URL and configure it in clientConfig.ts or in-app settings.
 */

export const googleAppsScriptTemplate = `
/**
 * CleanCommand Pro - Commercial Cleaning Sales & Estimating System Backend
 * 4-Sheet Architecture: Leads, Lead Details, Settings, Activity Log
 */

var SHEET_NAMES = {
  LEADS: "Leads",
  LEAD_DETAILS: "Lead Details",
  SETTINGS: "Settings",
  ACTIVITY_LOG: "Activity Log"
};

var LEADS_HEADERS = [
  "Lead ID", "Date", "Contact Name", "Company", "Email", "Phone",
  "Property", "Facility Type", "Square Footage", "Frequency",
  "Monthly Estimate", "Walkthrough", "Proposal", "Status", "Notes"
];

var LEAD_DETAILS_HEADERS = [
  "Lead ID", "Lead Source", "Property Address", "Selected Add-Ons",
  "Special Requirements", "Rate Per Visit", "Annual Contract Value",
  "Estimated Labor Hours", "Recommended Crew Size", "Walkthrough Date",
  "Walkthrough Time", "Assigned Sales Rep", "Meeting Instructions",
  "Walkthrough Notes", "Proposal ID", "Proposal Issue Date",
  "Proposal Valid Through", "Proposal Sent Date", "Last Updated"
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
  ["Default SLA", "4-hour prompt re-clean response at zero added charge if any area is unsatisfactory."],
  ["Industry Standards / Service Specifications", "ISSA 540 Workloading • EPA List N Disinfection"],
  ["Default Assigned Sales Representative", "Marcus Sterling"],
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
  leadsSheet.getRange(1, 1, 1, 15).setBackground("#0F172A").setFontColor("#FFFFFF").setFontWeight("bold").setFontFamily("Arial").setFontSize(10).setHorizontalAlignment("center");
  leadsSheet.setRowHeight(1, 38);
  leadsSheet.setFrozenRows(1);
  var widths = [140, 110, 160, 190, 210, 140, 200, 170, 120, 130, 140, 130, 130, 120, 260];
  for (var i = 0; i < widths.length; i++) leadsSheet.setColumnWidth(i + 1, widths[i]);
  leadsSheet.getRange("I2:I1000").setNumberFormat("#,##0").setHorizontalAlignment("right");
  leadsSheet.getRange("K2:K1000").setNumberFormat("$#,##0").setHorizontalAlignment("right");
  leadsSheet.getRange("O2:O1000").setWrap(true);

  var wtRule = SpreadsheetApp.newDataValidation().requireValueInList(["NOT SCHEDULED", "SCHEDULED", "COMPLETED", "CANCELLED"], true).build();
  leadsSheet.getRange("L2:L1000").setDataValidation(wtRule);
  var propRule = SpreadsheetApp.newDataValidation().requireValueInList(["NOT GENERATED", "GENERATED", "SENT", "ACCEPTED"], true).build();
  leadsSheet.getRange("M2:M1000").setDataValidation(propRule);
  var statRule = SpreadsheetApp.newDataValidation().requireValueInList(["NEW", "QUALIFIED", "WALKTHROUGH", "PROPOSAL", "WON", "LOST"], true).build();
  leadsSheet.getRange("N2:N1000").setDataValidation(statRule);

  var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS) || ss.insertSheet(SHEET_NAMES.LEAD_DETAILS, 1);
  detailsSheet.clear();
  detailsSheet.appendRow(LEAD_DETAILS_HEADERS);
  detailsSheet.getRange(1, 1, 1, LEAD_DETAILS_HEADERS.length).setBackground("#1E293B").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(10);
  detailsSheet.setRowHeight(1, 35);
  detailsSheet.setFrozenRows(1);

  var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS) || ss.insertSheet(SHEET_NAMES.SETTINGS, 2);
  settingsSheet.clear();
  settingsSheet.appendRow(["Setting Key", "Setting Value"]);
  settingsSheet.getRange(1, 1, 1, 2).setBackground("#0F172A").setFontColor("#FFFFFF").setFontWeight("bold");
  for (var j = 0; j < DEFAULT_SETTINGS.length; j++) settingsSheet.appendRow(DEFAULT_SETTINGS[j]);

  var logSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG) || ss.insertSheet(SHEET_NAMES.ACTIVITY_LOG, 3);
  logSheet.clear();
  logSheet.appendRow(ACTIVITY_LOG_HEADERS);
  logSheet.getRange(1, 1, 1, ACTIVITY_LOG_HEADERS.length).setBackground("#334155").setFontColor("#FFFFFF").setFontWeight("bold");
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "get_leads";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "get_leads") {
      var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
      if (!leadsSheet || leadsSheet.getLastRow() < 2) return jsonResponse({ success: true, count: 0, leads: [] });
      var values = leadsSheet.getRange(2, 1, leadsSheet.getLastRow() - 1, 15).getValues();
      var list = [];
      for (var i = 0; i < values.length; i++) {
        var r = values[i];
        if (!r[0]) continue;
        list.push({
          leadId: String(r[0]),
          createdDate: String(r[1]),
          fullName: String(r[2]),
          companyName: String(r[3]),
          businessEmail: String(r[4]),
          phoneNumber: String(r[5]),
          propertyAddress: String(r[6]),
          facilityType: String(r[7]),
          squareFootage: Number(r[8]) || 0,
          cleaningFrequency: String(r[9]),
          monthlyEstimate: Number(r[10]) || 0,
          walkthroughStatus: String(r[11] || "NOT SCHEDULED"),
          proposalStatus: String(r[12] || "NOT GENERATED"),
          status: String(r[13] || "NEW"),
          internalNotes: String(r[14] || "")
        });
      }
      return jsonResponse({ success: true, count: list.length, leads: list });
    }

    if (action === "get_settings") {
      var sSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
      var map = {};
      if (sSheet && sSheet.getLastRow() >= 2) {
        var sVals = sSheet.getRange(2, 1, sSheet.getLastRow() - 1, 2).getValues();
        for (var k = 0; k < sVals.length; k++) map[String(sVals[k][0])] = sVals[k][1];
      }
      return jsonResponse({ success: true, settings: map });
    }

    return jsonResponse({ success: false, error: "Invalid action" }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var data = payload.data || payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var leadsSheet = ss.getSheetByName(SHEET_NAMES.LEADS);
    var detailsSheet = ss.getSheetByName(SHEET_NAMES.LEAD_DETAILS);
    var logSheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);

    function findRow(id) {
      if (!leadsSheet || leadsSheet.getLastRow() < 2) return -1;
      var colA = leadsSheet.getRange(2, 1, leadsSheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < colA.length; i++) {
        if (String(colA[i][0]).trim() === String(id).trim()) return i + 2;
      }
      return -1;
    }

    if (action === "create_lead") {
      var row = findRow(data.leadId);
      if (row !== -1) {
        // already exists, update
        action = "update_lead";
      } else {
        var leadId = data.leadId || ("LEAD-" + new Date().getFullYear() + "-" + ("0000" + leadsSheet.getLastRow()).slice(-4));
        leadsSheet.appendRow([
          leadId, data.createdDate || "", data.fullName || "", data.companyName || "",
          data.businessEmail || "", data.phoneNumber || "", data.propertyAddress || "",
          data.facilityType || "", Number(data.squareFootage) || 0, data.cleaningFrequency || "",
          Number(data.monthlyEstimate) || 0, data.walkthroughStatus || "NOT SCHEDULED",
          data.proposalStatus || "NOT GENERATED", data.status || "NEW", data.internalNotes || ""
        ]);
        if (detailsSheet) {
          detailsSheet.appendRow([
            leadId, data.leadSource || "Website", data.propertyAddress || "",
            Array.isArray(data.selectedAddOns) ? data.selectedAddOns.join(", ") : "",
            data.specialRequirements || "", Number(data.ratePerVisit) || 0,
            Number(data.annualContractValue) || 0, Number(data.estimatedLaborHours) || 0,
            Number(data.recommendedCrewSize) || 1, data.walkthroughDate || "",
            data.walkthroughTime || "", data.assignedSalesRep || "",
            data.meetingInstructions || "", data.walkthroughNotes || "",
            data.proposalId || "", data.proposalIssueDate || "",
            data.proposalValidThrough || "", data.proposalSentDate || "", new Date().toISOString()
          ]);
        }
        if (logSheet) logSheet.appendRow(["ACT-" + Date.now().toString(36).toUpperCase(), leadId, new Date().toLocaleString(), "LEAD CREATED", "", data.status || "NEW", "System", "Created lead"]);
        return jsonResponse({ success: true, leadId: leadId });
      }
    }

    if (action === "save_estimate") {
      var rIdx = findRow(data.leadId);
      if (rIdx === -1) return jsonResponse({ success: false, error: "Lead not found" }, 404);
      if (data.monthlyEstimate !== undefined) leadsSheet.getRange(rIdx, 11).setValue(Number(data.monthlyEstimate) || 0);
      if (data.facilityType) leadsSheet.getRange(rIdx, 8).setValue(data.facilityType);
      if (data.squareFootage) leadsSheet.getRange(rIdx, 9).setValue(Number(data.squareFootage) || 0);
      if (data.cleaningFrequency) leadsSheet.getRange(rIdx, 10).setValue(data.cleaningFrequency);
      if (logSheet) logSheet.appendRow(["ACT-" + Date.now().toString(36).toUpperCase(), data.leadId, new Date().toLocaleString(), "ESTIMATE SAVED", "", "", "Estimator", "Saved estimate $" + data.monthlyEstimate]);
      return jsonResponse({ success: true, leadId: data.leadId });
    }

    if (action === "update_status") {
      var sIdx = findRow(data.leadId);
      if (sIdx === -1) return jsonResponse({ success: false, error: "Lead not found" }, 404);
      var prev = leadsSheet.getRange(sIdx, 14).getValue();
      leadsSheet.getRange(sIdx, 14).setValue(data.status);
      if (logSheet) logSheet.appendRow(["ACT-" + Date.now().toString(36).toUpperCase(), data.leadId, new Date().toLocaleString(), "STATUS CHANGE", prev, data.status, data.user || "Staff", data.notes || ""]);
      return jsonResponse({ success: true, leadId: data.leadId, status: data.status });
    }

    if (action === "update_walkthrough") {
      var wIdx = findRow(data.leadId);
      if (wIdx === -1) return jsonResponse({ success: false, error: "Lead not found" }, 404);
      leadsSheet.getRange(wIdx, 12).setValue(data.walkthroughStatus || "SCHEDULED");
      if (logSheet) logSheet.appendRow(["ACT-" + Date.now().toString(36).toUpperCase(), data.leadId, new Date().toLocaleString(), "WALKTHROUGH SCHEDULED", "", "", data.assignedSalesRep || "Staff", "Scheduled walkthrough"]);
      return jsonResponse({ success: true, leadId: data.leadId });
    }

    if (action === "update_proposal") {
      var pIdx = findRow(data.leadId);
      if (pIdx === -1) return jsonResponse({ success: false, error: "Lead not found" }, 404);
      leadsSheet.getRange(pIdx, 13).setValue(data.proposalStatus || "GENERATED");
      if (logSheet) logSheet.appendRow(["ACT-" + Date.now().toString(36).toUpperCase(), data.leadId, new Date().toLocaleString(), "PROPOSAL GENERATED", "", "", "Staff", "Proposal generated"]);
      return jsonResponse({ success: true, leadId: data.leadId });
    }

    if (action === "update_lead") {
      var uIdx = findRow(data.leadId);
      if (uIdx === -1) return jsonResponse({ success: false, error: "Lead not found" }, 404);
      if (data.fullName !== undefined) leadsSheet.getRange(uIdx, 3).setValue(data.fullName);
      if (data.companyName !== undefined) leadsSheet.getRange(uIdx, 4).setValue(data.companyName);
      if (data.businessEmail !== undefined) leadsSheet.getRange(uIdx, 5).setValue(data.businessEmail);
      if (data.phoneNumber !== undefined) leadsSheet.getRange(uIdx, 6).setValue(data.phoneNumber);
      if (data.propertyAddress !== undefined) leadsSheet.getRange(uIdx, 7).setValue(data.propertyAddress);
      if (data.facilityType !== undefined) leadsSheet.getRange(uIdx, 8).setValue(data.facilityType);
      if (data.squareFootage !== undefined) leadsSheet.getRange(uIdx, 9).setValue(Number(data.squareFootage) || 0);
      if (data.cleaningFrequency !== undefined) leadsSheet.getRange(uIdx, 10).setValue(data.cleaningFrequency);
      if (data.monthlyEstimate !== undefined) leadsSheet.getRange(uIdx, 11).setValue(Number(data.monthlyEstimate) || 0);
      if (data.walkthroughStatus !== undefined) leadsSheet.getRange(uIdx, 12).setValue(data.walkthroughStatus);
      if (data.proposalStatus !== undefined) leadsSheet.getRange(uIdx, 13).setValue(data.proposalStatus);
      if (data.status !== undefined) leadsSheet.getRange(uIdx, 14).setValue(data.status);
      if (data.internalNotes !== undefined) leadsSheet.getRange(uIdx, 15).setValue(data.internalNotes);
      return jsonResponse({ success: true, leadId: data.leadId });
    }

    return jsonResponse({ success: false, error: "Unknown action" }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
`;
