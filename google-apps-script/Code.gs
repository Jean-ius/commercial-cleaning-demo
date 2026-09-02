/**
 * =========================================================================
 * COMMERCIAL CLEANING - GOOGLE SHEETS WALKTHROUGH BOOKING BACKEND
 * =========================================================================
 * 
 * Connected Spreadsheet ID: 15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM
 * Spreadsheet URL: https://docs.google.com/spreadsheets/d/15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM/edit
 * 
 * ARCHITECTURE:
 * 1. Sheet 1: "Bookings" (21 Columns A-U: Complete lead record & frozen estimate snapshot)
 * 2. Sheet 2: "Settings" (Configurable business settings & notification email)
 * 3. Sheet 3: "Activity Log" (Audit trail of booking creation and staff status changes)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM/edit
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Replace all existing code in the editor with this entire file.
 * 4. Click the Save icon (💾).
 * 5. In the toolbar, select "setupSpreadsheet" and click "Run" (▶).
 *    -> This will automatically create and format "Bookings", "Settings", and "Activity Log"!
 * 6. Click "Deploy" (top right) > "Manage deployments" or "New deployment".
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Click Deploy and copy the Web App URL.
 */

// SPREADSHEET CONFIGURATION
var SPREADSHEET_ID = "15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM";

var SHEET_NAMES = {
  BOOKINGS: "Bookings",
  SETTINGS: "Settings",
  ACTIVITY_LOG: "Activity Log"
};

// SHEET 1: BOOKINGS - EXACT 21 HEADERS (Columns A to U)
var BOOKINGS_HEADERS = [
  "Booking ID",                                      // A1
  "Submission Date",                                 // B1
  "Submission Time",                                 // C1
  "Full Name",                                       // D1
  "Company / Property Name",                         // E1
  "Business Work Email",                             // F1
  "Direct Phone Number",                             // G1
  "Facility Type",                                   // H1
  "Square Footage",                                  // I1
  "Cleaning Frequency",                              // J1
  "Ballpark Estimate Low",                           // K1
  "Ballpark Estimate High",                          // L1
  "Preferred Walkthrough Date",                      // M1
  "Preferred Time Window",                           // N1
  "Cleaning Frustrations / Special Instructions",     // O1
  "Booking Status",                                  // P1 (NEW | CONTACTED | CONFIRMED | COMPLETED | CANCELLED)
  "Confirmed Date",                                  // Q1
  "Confirmed Time",                                  // R1
  "Assigned Sales Representative",                   // S1
  "Internal Notes",                                  // T1
  "Last Updated"                                     // U1
];

// SHEET 2: SETTINGS - DEFAULT CONFIGURATION
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

// SHEET 3: ACTIVITY LOG - EXACT 8 HEADERS (Columns A to H)
var ACTIVITY_LOG_HEADERS = [
  "Activity ID",       // A1
  "Booking ID",        // B1
  "Timestamp",         // C1
  "Activity Type",     // D1 (BOOKING CREATED | STATUS CHANGE | NOTE ADDED)
  "Previous Status",   // E1
  "New Status",        // F1
  "User / Staff",      // G1
  "Notes"              // H1
];

/**
 * Run this function once from the Apps Script editor to safely initialize all sheets,
 * format headers, set column widths, freeze rows, enable filters, and add validation.
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. SETUP SHEET 1: Bookings
  var bookingsSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
  if (!bookingsSheet) {
    var firstSheet = ss.getSheets()[0];
    if (firstSheet && firstSheet.getLastRow() === 0 && (firstSheet.getName() === "Sheet1" || firstSheet.getName() === "Walkthrough_Bookings")) {
      firstSheet.setName(SHEET_NAMES.BOOKINGS);
      bookingsSheet = firstSheet;
    } else {
      bookingsSheet = ss.insertSheet(SHEET_NAMES.BOOKINGS);
    }
  }

  // Set Bookings Headers if missing
  var currentBookingsHeaders = bookingsSheet.getRange(1, 1, 1, BOOKINGS_HEADERS.length).getValues()[0];
  if (currentBookingsHeaders[0] !== BOOKINGS_HEADERS[0]) {
    bookingsSheet.getRange(1, 1, 1, BOOKINGS_HEADERS.length).setValues([BOOKINGS_HEADERS]);
  }

  // Style Bookings Header Row: Dark Corporate Slate (#0F172A), Bold White text
  var bookingsHeaderRange = bookingsSheet.getRange(1, 1, 1, BOOKINGS_HEADERS.length);
  bookingsHeaderRange.setBackground("#0F172A");
  bookingsHeaderRange.setFontColor("#FFFFFF");
  bookingsHeaderRange.setFontWeight("bold");
  bookingsHeaderRange.setFontFamily("Arial");
  bookingsHeaderRange.setFontSize(10);
  bookingsHeaderRange.setHorizontalAlignment("center");
  bookingsHeaderRange.setVerticalAlignment("middle");
  bookingsSheet.setRowHeight(1, 38);
  bookingsSheet.setFrozenRows(1);

  // Enable Filter on Bookings
  if (!bookingsSheet.getFilter()) {
    try {
      bookingsSheet.getRange(1, 1, 1000, BOOKINGS_HEADERS.length).createFilter();
    } catch (e) {
      Logger.log("Filter notice: " + e.toString());
    }
  }

  // Set Status Dropdown Validation on Column P (Booking Status)
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"], true)
    .setAllowInvalid(false)
    .build();
  bookingsSheet.getRange("P2:P1000").setDataValidation(statusRule);

  // Set Column Widths on Bookings
  bookingsSheet.setColumnWidth(1, 140);  // A: Booking ID
  bookingsSheet.setColumnWidth(2, 120);  // B: Submission Date
  bookingsSheet.setColumnWidth(3, 110);  // C: Submission Time
  bookingsSheet.setColumnWidth(4, 160);  // D: Full Name
  bookingsSheet.setColumnWidth(5, 200);  // E: Company Name
  bookingsSheet.setColumnWidth(6, 220);  // F: Business Email
  bookingsSheet.setColumnWidth(7, 140);  // G: Phone Number
  bookingsSheet.setColumnWidth(8, 180);  // H: Facility Type
  bookingsSheet.setColumnWidth(9, 130);  // I: Square Footage
  bookingsSheet.setColumnWidth(10, 140); // J: Cleaning Frequency
  bookingsSheet.setColumnWidth(11, 140); // K: Ballpark Low
  bookingsSheet.setColumnWidth(12, 140); // L: Ballpark High
  bookingsSheet.setColumnWidth(13, 150); // M: Preferred Date
  bookingsSheet.setColumnWidth(14, 210); // N: Preferred Time
  bookingsSheet.setColumnWidth(15, 280); // O: Frustrations
  bookingsSheet.setColumnWidth(16, 130); // P: Status
  bookingsSheet.setColumnWidth(17, 130); // Q: Confirmed Date
  bookingsSheet.setColumnWidth(18, 130); // R: Confirmed Time
  bookingsSheet.setColumnWidth(19, 180); // S: Sales Rep
  bookingsSheet.setColumnWidth(20, 240); // T: Internal Notes
  bookingsSheet.setColumnWidth(21, 160); // U: Last Updated

  // 2. SETUP SHEET 2: Settings
  var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SHEET_NAMES.SETTINGS);
  }

  var currentSettingsHeaders = settingsSheet.getRange(1, 1, 1, 2).getValues()[0];
  if (currentSettingsHeaders[0] !== "Setting" || currentSettingsHeaders[1] !== "Value") {
    settingsSheet.getRange(1, 1, 1, 2).setValues([["Setting", "Value"]]);
  }

  // Style Settings Header Row
  var settingsHeaderRange = settingsSheet.getRange(1, 1, 1, 2);
  settingsHeaderRange.setBackground("#0F172A");
  settingsHeaderRange.setFontColor("#FFFFFF");
  settingsHeaderRange.setFontWeight("bold");
  settingsHeaderRange.setFontFamily("Arial");
  settingsHeaderRange.setFontSize(10);
  settingsHeaderRange.setHorizontalAlignment("center");
  settingsSheet.setRowHeight(1, 38);
  settingsSheet.setFrozenRows(1);
  settingsSheet.setColumnWidth(1, 260);
  settingsSheet.setColumnWidth(2, 450);

  // Populate Default Settings only if empty
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.getRange(2, 1, DEFAULT_SETTINGS.length, 2).setValues(DEFAULT_SETTINGS);
    var settingsBodyRange = settingsSheet.getRange(2, 1, DEFAULT_SETTINGS.length, 2);
    settingsBodyRange.setFontFamily("Arial");
    settingsBodyRange.setFontSize(9.5);
    settingsSheet.getRange(2, 1, DEFAULT_SETTINGS.length, 1).setFontWeight("bold");
  }

  // 3. SETUP SHEET 3: Activity Log
  var activitySheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);
  if (!activitySheet) {
    activitySheet = ss.insertSheet(SHEET_NAMES.ACTIVITY_LOG);
  }

  var currentActivityHeaders = activitySheet.getRange(1, 1, 1, ACTIVITY_LOG_HEADERS.length).getValues()[0];
  if (currentActivityHeaders[0] !== ACTIVITY_LOG_HEADERS[0]) {
    activitySheet.getRange(1, 1, 1, ACTIVITY_LOG_HEADERS.length).setValues([ACTIVITY_LOG_HEADERS]);
  }

  // Style Activity Log Header Row
  var activityHeaderRange = activitySheet.getRange(1, 1, 1, ACTIVITY_LOG_HEADERS.length);
  activityHeaderRange.setBackground("#0F172A");
  activityHeaderRange.setFontColor("#FFFFFF");
  activityHeaderRange.setFontWeight("bold");
  activityHeaderRange.setFontFamily("Arial");
  activityHeaderRange.setFontSize(10);
  activityHeaderRange.setHorizontalAlignment("center");
  activitySheet.setRowHeight(1, 38);
  activitySheet.setFrozenRows(1);

  activitySheet.setColumnWidth(1, 130); // Activity ID
  activitySheet.setColumnWidth(2, 140); // Booking ID
  activitySheet.setColumnWidth(3, 170); // Timestamp
  activitySheet.setColumnWidth(4, 150); // Activity Type
  activitySheet.setColumnWidth(5, 120); // Previous Status
  activitySheet.setColumnWidth(6, 120); // New Status
  activitySheet.setColumnWidth(7, 160); // User / Staff
  activitySheet.setColumnWidth(8, 280); // Notes

  Logger.log("✅ All 3 sheets (Bookings, Settings, Activity Log) successfully initialized & formatted!");
}

/**
 * Helper: Read setting value from Settings sheet
 */
function getSettingValue(key, defaultValue) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    if (!sheet) return defaultValue;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(key).trim().toLowerCase()) {
        var val = String(data[i][1]).trim();
        return val !== "" ? val : defaultValue;
      }
    }
  } catch (err) {
    Logger.log("Error reading setting " + key + ": " + err.toString());
  }
  return defaultValue;
}

/**
 * Helper: Record entry in Activity Log sheet
 */
function logActivity(bookingId, activityType, prevStatus, newStatus, userOrStaff, notes) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);
    if (!sheet) {
      setupSpreadsheet();
      sheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);
    }
    
    var year = new Date().getFullYear();
    var randomNum = Math.floor(1000 + Math.random() * 9000);
    var activityId = "ACT-" + year + "-" + randomNum;
    var nowFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+8", "MMM d, yyyy h:mm a");

    var rowValues = [
      activityId,
      bookingId,
      nowFormatted,
      activityType,
      prevStatus || "",
      newStatus || "",
      userOrStaff || "System",
      notes || ""
    ];

    sheet.appendRow(rowValues);
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange(lastRow, 1, 1, ACTIVITY_LOG_HEADERS.length);
    range.setFontFamily("Arial");
    range.setFontSize(9.5);
    sheet.getRange(lastRow, 1).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(lastRow, 2).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 4).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(lastRow, 5, 1, 2).setHorizontalAlignment("center");
  } catch (err) {
    Logger.log("Error writing activity log: " + err.toString());
  }
}

/**
 * Helper: Send Executive Email Notification to configured Notification Email
 */
function sendBookingNotificationEmail(booking, companyName, notificationEmail) {
  if (!notificationEmail || notificationEmail.indexOf("@") === -1) {
    Logger.log("No valid notification email configured.");
    return;
  }

  var subject = "New Facility Walkthrough Request — [" + booking.bookingId + "]";
  
  var htmlBody = ""
    + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0F172A; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;'>"
    + "  <div style='background-color: #0F172A; color: #FFFFFF; padding: 20px 24px;'>"
    + "    <h2 style='margin: 0; font-size: 18px; font-weight: bold;'>" + companyName + "</h2>"
    + "    <p style='margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;'>New On-Site Facility Walkthrough Request Received</p>"
    + "  </div>"
    + "  <div style='padding: 24px; background-color: #FFFFFF;'>"
    + "    <div style='background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;'>"
    + "      <strong style='color: #1E40AF; font-size: 13px;'>Booking Reference ID:</strong> "
    + "      <span style='font-family: monospace; font-size: 14px; font-weight: bold; color: #1E3A8A;'>" + booking.bookingId + "</span>"
    + "      <span style='float: right; background-color: #DBEAFE; color: #1E40AF; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 4px;'>Status: NEW</span>"
    + "    </div>"
    + "    <h3 style='font-size: 14px; text-transform: uppercase; color: #64748B; margin: 0 0 12px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;'>Prospect Contact Information</h3>"
    + "    <table style='width: 100%; font-size: 13px; margin-bottom: 20px; border-collapse: collapse;'>"
    + "      <tr><td style='padding: 6px 0; color: #64748B; width: 40%;'>Full Name:</td><td style='padding: 6px 0; font-weight: bold;'>" + booking.fullName + "</td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Company / Property:</td><td style='padding: 6px 0; font-weight: bold;'>" + booking.companyName + "</td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Business Work Email:</td><td style='padding: 6px 0;'><a href='mailto:" + booking.businessEmail + "' style='color: #2563EB; font-weight: bold;'>" + booking.businessEmail + "</a></td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Direct Phone Number:</td><td style='padding: 6px 0;'><a href='tel:" + booking.phoneNumber + "' style='color: #2563EB; font-weight: bold;'>" + booking.phoneNumber + "</a></td></tr>"
    + "    </table>"
    + "    <h3 style='font-size: 14px; text-transform: uppercase; color: #64748B; margin: 0 0 12px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;'>Requested Schedule &amp; Facility Context</h3>"
    + "    <table style='width: 100%; font-size: 13px; margin-bottom: 20px; border-collapse: collapse;'>"
    + "      <tr><td style='padding: 6px 0; color: #64748B; width: 40%;'>Preferred Date:</td><td style='padding: 6px 0; font-weight: bold;'>" + booking.preferredWalkthroughDate + "</td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Preferred Time Window:</td><td style='padding: 6px 0; font-weight: bold;'>" + booking.preferredTimeWindow + "</td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Facility Sector:</td><td style='padding: 6px 0;'>" + booking.facilityType + "</td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Cleanable Square Footage:</td><td style='padding: 6px 0; font-weight: bold;'>" + Number(booking.squareFootage).toLocaleString() + " sq ft</td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Cleaning Frequency:</td><td style='padding: 6px 0;'>" + booking.cleaningFrequency + "</td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Ballpark Estimate Range:</td><td style='padding: 6px 0; color: #1D4ED8; font-weight: bold;'>$" + Number(booking.ballparkEstimateLow).toLocaleString() + " – $" + Number(booking.ballparkEstimateHigh).toLocaleString() + " / mo</td></tr>"
    + "      <tr><td style='padding: 6px 0; color: #64748B;'>Special Instructions / Notes:</td><td style='padding: 6px 0; font-style: italic; color: #334155;'>" + (booking.cleaningFrustrations || "None provided") + "</td></tr>"
    + "    </table>"
    + "    <div style='text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0;'>"
    + "      <a href='https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/edit' style='background-color: #2563EB; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;'>Open Google Sheets CRM</a>"
    + "    </div>"
    + "  </div>"
    + "  <div style='background-color: #F8FAFC; color: #94A3B8; font-size: 11px; padding: 12px 24px; text-align: center; border-top: 1px solid #E2E8F0;'>"
    + "    Submitted on " + booking.submissionDate + " at " + booking.submissionTime + " • Automated Dispatch"
    + "  </div>"
    + "</div>";

  MailApp.sendEmail({
    to: notificationEmail,
    subject: subject,
    htmlBody: htmlBody
  });
  
  Logger.log("✅ Email notification sent to " + notificationEmail);
}

/**
 * Main Webhook POST Handler: Validates, Prevents Duplicates, Saves to Bookings,
 * Logs Activity, and Dispatches Notification Email.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  try {
    // 1. Double Booking & Race Condition Protection (Wait up to 30s)
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing request payload."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var data = payload.data || payload;

    // 2. Strict Server-Side Validation
    if (!data.fullName || String(data.fullName).trim().length < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Full Name is required (minimum 2 characters)."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!data.companyName || String(data.companyName).trim().length < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Company or Property Name is required."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.businessEmail || !emailRegex.test(String(data.businessEmail).trim())) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "A valid business work email address is required."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var phoneDigits = String(data.phoneNumber || "").replace(/\D/g, "");
    if (!data.phoneNumber || phoneDigits.length < 7) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "A valid phone number is required (minimum 7 digits)."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!data.preferredWalkthroughDate) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Preferred Walkthrough Date is required."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!data.preferredTimeWindow) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Preferred Time Window is required."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var bookingsSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);

    if (!bookingsSheet) {
      setupSpreadsheet();
      bookingsSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
    }

    // 3. Idempotency & Duplicate Submission Prevention
    var bookingId = String(data.bookingId || "").trim();
    if (bookingId !== "") {
      var existingData = bookingsSheet.getDataRange().getValues();
      for (var r = 1; r < existingData.length; r++) {
        if (String(existingData[r][0]).trim() === bookingId) {
          Logger.log("Duplicate request detected for existing Booking ID: " + bookingId);
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            bookingId: bookingId,
            row: r + 1,
            isDuplicate: true,
            message: "Booking request was already recorded previously."
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    } else {
      var year = new Date().getFullYear();
      var rand = Math.floor(1000 + Math.random() * 9000);
      bookingId = "WK-" + year + "-" + rand;
      data.bookingId = bookingId;
    }

    // 4. Formula Injection Protection Helper (=, +, -, @)
    function sanitize(val) {
      if (val === null || val === undefined) return "";
      var str = String(val).trim();
      if (/^[=+\-@]/.test(str)) {
        return "'" + str;
      }
      return str;
    }

    var submissionDate = data.submissionDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+8", "MMM d, yyyy");
    var submissionTime = data.submissionTime || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+8", "h:mm a");
    var timestampIso = data.submissionTimestamp || new Date().toISOString();

    // 5. Construct 21-Column Row Values matching Bookings Sheet Schema exactly
    var rowValues = [
      sanitize(bookingId),                                     // A: Booking ID
      sanitize(submissionDate),                                // B: Submission Date
      sanitize(submissionTime),                                // C: Submission Time
      sanitize(data.fullName),                                 // D: Full Name
      sanitize(data.companyName),                              // E: Company / Property Name
      sanitize(data.businessEmail),                            // F: Business Work Email
      sanitize(data.phoneNumber),                              // G: Direct Phone Number
      sanitize(data.facilityType || "Commercial Facility"),    // H: Facility Type
      Number(data.squareFootage) || 0,                         // I: Square Footage
      sanitize(data.cleaningFrequency || "Standard"),          // J: Cleaning Frequency
      Number(data.ballparkEstimateLow) || 0,                   // K: Ballpark Estimate Low
      Number(data.ballparkEstimateHigh) || 0,                  // L: Ballpark Estimate High
      sanitize(data.preferredWalkthroughDate),                 // M: Preferred Walkthrough Date
      sanitize(data.preferredTimeWindow),                      // N: Preferred Time Window
      sanitize(data.cleaningFrustrations || "None provided"),  // O: Cleaning Frustrations / Special Instructions
      "NEW",                                                   // P: Booking Status (Always initial 'NEW')
      "",                                                      // Q: Confirmed Date (Internal staff use)
      "",                                                      // R: Confirmed Time (Internal staff use)
      sanitize(data.assignedSalesRep || getSettingValue("Default Assigned Sales Representative", "Marcus Sterling")), // S: Sales Rep
      "",                                                      // T: Internal Notes (Internal staff use)
      timestampIso                                             // U: Last Updated
    ];

    bookingsSheet.appendRow(rowValues);
    var newRowNumber = bookingsSheet.getLastRow();

    // Format new row
    var rowRange = bookingsSheet.getRange(newRowNumber, 1, 1, BOOKINGS_HEADERS.length);
    rowRange.setFontFamily("Arial");
    rowRange.setFontSize(9.5);
    rowRange.setVerticalAlignment("middle");

    // Number formatting
    bookingsSheet.getRange(newRowNumber, 9).setNumberFormat("#,##0");           // Sq Ft
    bookingsSheet.getRange(newRowNumber, 11, 1, 2).setNumberFormat("$#,##0");  // Low & High Ballpark

    // Alignment formatting
    bookingsSheet.getRange(newRowNumber, 1).setHorizontalAlignment("center").setFontWeight("bold");
    bookingsSheet.getRange(newRowNumber, 2, 1, 2).setHorizontalAlignment("center");
    bookingsSheet.getRange(newRowNumber, 16).setHorizontalAlignment("center").setFontWeight("bold");

    // 6. Record Audit in Activity Log Sheet
    logActivity(
      bookingId,
      "BOOKING CREATED",
      "",
      "NEW",
      "Website Prospect",
      "New walkthrough requested for " + data.companyName + " (" + (Number(data.squareFootage) || 0).toLocaleString() + " sq ft)."
    );

    // 7. Dispatch Email Notification
    var companyName = getSettingValue("Company Name", "Apex Commercial Cleaning");
    var notificationEmail = getSettingValue("Notification Email", "jcsabillo23@gmail.com");

    try {
      sendBookingNotificationEmail(data, companyName, notificationEmail);
    } catch (emailErr) {
      Logger.log("Email dispatch notice: " + emailErr.toString());
      // Booking is already saved, do not fail the request if email fails
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      bookingId: bookingId,
      row: newRowNumber,
      message: "Walkthrough request successfully saved, logged, and confirmed."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Automatic On-Edit Trigger: When staff changes Status (Column P) in Bookings,
 * automatically update 'Last Updated' and log a STATUS CHANGE in Activity Log.
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    if (sheet.getName() !== SHEET_NAMES.BOOKINGS) return;
    
    var row = e.range.getRow();
    var col = e.range.getColumn();

    // Check if Column P (Column 16: Booking Status) was edited on a data row
    if (col === 16 && row > 1) {
      var newVal = String(e.value || "").trim();
      var oldVal = String(e.oldValue || "").trim();
      
      if (newVal !== oldVal && newVal !== "") {
        var bookingId = String(sheet.getRange(row, 1).getValue()).trim();
        var userEmail = Session.getActiveUser().getEmail() || "Staff Member";
        var nowIso = new Date().toISOString();

        // Update Column U (Last Updated)
        sheet.getRange(row, 21).setValue(nowIso);

        // Record in Activity Log
        logActivity(
          bookingId,
          "STATUS CHANGE",
          oldVal,
          newVal,
          userEmail,
          "Booking status updated to " + newVal + " by " + userEmail
        );
      }
    }
  } catch (err) {
    Logger.log("onEdit notice: " + err.toString());
  }
}

/**
 * Health Check GET endpoint for browser verification
 */
function doGet(e) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var bookingsSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
  var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  var activitySheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY_LOG);

  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "Commercial Cleaning Google Sheets CRM & Webhook",
    spreadsheetId: SPREADSHEET_ID,
    sheetsReady: {
      bookings: bookingsSheet !== null,
      settings: settingsSheet !== null,
      activityLog: activitySheet !== null
    },
    notificationEmail: getSettingValue("Notification Email", "jcsabillo23@gmail.com"),
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
