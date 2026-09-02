/**
 * =========================================================================
 * COMMERCIAL CLEANING - GOOGLE SHEETS WALKTHROUGH BOOKING BACKEND
 * =========================================================================
 * 
 * Connected Spreadsheet ID: 15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM
 * Spreadsheet URL: https://docs.google.com/spreadsheets/d/15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM/edit
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM/edit
 * 2. In the menu, click Extensions > Apps Script.
 * 3. Replace all existing code in the editor with this file's entire content.
 * 4. Click the Save icon (💾).
 * 5. In the toolbar, select "setupSpreadsheet" and click "Run" (▶). Grant permissions if prompted.
 *    -> This will automatically format your sheet with headers, column widths, and status dropdowns!
 * 6. Click "Deploy" (top right) > "New deployment".
 * 7. Click the gear icon next to "Select type" > choose "Web app".
 * 8. Set:
 *    - Description: Commercial Cleaning Booking Webhook
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone (required so your website can send booking leads)
 * 9. Click "Deploy".
 * 10. Copy the generated "Web App URL" (ends with /exec) and paste it into your application!
 */

// SPREADSHEET CONFIGURATION
var SPREADSHEET_ID = "15lDGthD8xdEIv0DlK5GhHGyCJdBe0-jBqtnDX4zeaOM";
var SHEET_NAME = "Walkthrough_Bookings";

// TABLE COLUMN HEADERS
var HEADERS = [
  "Booking ID",
  "Booking Status",
  "Submission Date",
  "Submission Time",
  "Full Name",
  "Company / Property Name",
  "Business Work Email",
  "Direct Phone Number",
  "Preferred Walkthrough Date",
  "Preferred Time Window",
  "Facility Sector",
  "Cleanable Sq Footage",
  "Cleaning Frequency",
  "Ballpark Low ($/mo)",
  "Ballpark High ($/mo)",
  "Monthly Investment ($/mo)",
  "Rate Per Visit ($)",
  "Annual Contract Value ($)",
  "Cleaning Frustrations / Notes",
  "Confirmed Date",
  "Confirmed Time",
  "Assigned Sales Rep",
  "Internal CRM Notes",
  "Submission Timestamp",
  "Last Updated"
];

/**
 * Run this function once from the Apps Script toolbar to automatically initialize & format the Google Sheet.
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // If the default sheet exists, rename it; otherwise create new
    var defaultSheet = ss.getSheets()[0];
    if (defaultSheet && defaultSheet.getLastRow() === 0 && defaultSheet.getName() === "Sheet1") {
      defaultSheet.setName(SHEET_NAME);
      sheet = defaultSheet;
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  // Set Headers if first row is empty
  var currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var hasHeaders = currentHeaders[0] === HEADERS[0];

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  // Header Styling: Dark Corporate Slate (#0F172A), Bold White text
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#0F172A");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Arial");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  // Freeze Header Row
  sheet.setFrozenRows(1);

  // Set Status Column (Column B) Data Validation Dropdown
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange("B2:B1000").setDataValidation(statusRule);

  // Optimize Column Widths for readability
  sheet.setColumnWidth(1, 140); // Booking ID
  sheet.setColumnWidth(2, 120); // Status
  sheet.setColumnWidth(3, 110); // Date
  sheet.setColumnWidth(4, 110); // Time
  sheet.setColumnWidth(5, 160); // Full Name
  sheet.setColumnWidth(6, 200); // Company Name
  sheet.setColumnWidth(7, 220); // Email
  sheet.setColumnWidth(8, 140); // Phone
  sheet.setColumnWidth(9, 150); // Preferred Date
  sheet.setColumnWidth(10, 210); // Time Window
  sheet.setColumnWidth(11, 180); // Sector
  sheet.setColumnWidth(12, 130); // Sq Ft
  sheet.setColumnWidth(13, 130); // Frequency
  sheet.setColumnWidth(14, 130); // Low
  sheet.setColumnWidth(15, 130); // High
  sheet.setColumnWidth(16, 150); // Monthly
  sheet.setColumnWidth(17, 130); // Per Visit
  sheet.setColumnWidth(18, 160); // Annual Value
  sheet.setColumnWidth(19, 280); // Frustrations
  sheet.setColumnWidth(20, 130); // Confirmed Date
  sheet.setColumnWidth(21, 130); // Confirmed Time
  sheet.setColumnWidth(22, 160); // Sales Rep
  sheet.setColumnWidth(23, 250); // Internal Notes

  Logger.log("✅ Google Sheet successfully formatted and initialized!");
}

/**
 * Handle incoming POST requests from the website booking modal.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  try {
    // Wait up to 30 seconds for lock to prevent race condition / double bookings
    lock.waitLock(30000);

    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var data = payload.data || payload;

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      setupSpreadsheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    // Sanitize user inputs to prevent formula injection (=, +, -, @)
    function sanitize(val) {
      if (val === null || val === undefined) return "";
      var str = String(val).trim();
      if (/^[=+\-@]/.test(str)) {
        return "'" + str;
      }
      return str;
    }

    var rowValues = [
      sanitize(data.bookingId),
      sanitize(data.bookingStatus || "NEW"),
      sanitize(data.submissionDate),
      sanitize(data.submissionTime),
      sanitize(data.fullName),
      sanitize(data.companyName),
      sanitize(data.businessEmail),
      sanitize(data.phoneNumber),
      sanitize(data.preferredWalkthroughDate),
      sanitize(data.preferredTimeWindow),
      sanitize(data.facilityType),
      Number(data.squareFootage) || 0,
      sanitize(data.cleaningFrequency),
      Number(data.ballparkEstimateLow) || 0,
      Number(data.ballparkEstimateHigh) || 0,
      Number(data.estimatedMonthlyInvestment) || 0,
      Number(data.ratePerVisit) || 0,
      Number(data.annualContractValue) || 0,
      sanitize(data.cleaningFrustrations),
      sanitize(data.confirmedDate || ""),
      sanitize(data.confirmedTime || ""),
      sanitize(data.assignedSalesRep || ""),
      sanitize(data.internalNotes || ""),
      sanitize(data.submissionTimestamp || new Date().toISOString()),
      new Date().toISOString()
    ];

    sheet.appendRow(rowValues);
    var lastRow = sheet.getLastRow();

    // Format new row styling
    var dataRange = sheet.getRange(lastRow, 1, 1, HEADERS.length);
    dataRange.setFontFamily("Arial");
    dataRange.setFontSize(9.5);
    dataRange.setVerticalAlignment("middle");

    // Format numeric and currency columns
    sheet.getRange(lastRow, 12).setNumberFormat("#,##0"); // Sq Ft
    sheet.getRange(lastRow, 14, 1, 5).setNumberFormat("$#,##0"); // Low, High, Monthly, Visit, Annual

    // Alignments
    sheet.getRange(lastRow, 1).setHorizontalAlignment("center").setFontWeight("bold"); // Booking ID
    sheet.getRange(lastRow, 2).setHorizontalAlignment("center").setFontWeight("bold"); // Status
    sheet.getRange(lastRow, 3, 1, 2).setHorizontalAlignment("center"); // Dates

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      bookingId: data.bookingId,
      row: lastRow,
      message: "Walkthrough booking successfully recorded."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error processing booking: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Health check endpoint to verify webhook is active via browser GET request.
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "Commercial Cleaning Walkthrough Booking Webhook",
    spreadsheetId: SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
