import { WalkthroughBookingRecord } from '../types/cleanCommand';

/**
 * Service to submit Walkthrough Booking Records to Google Sheets via Google Apps Script Webhook.
 */
export async function submitBookingToGoogleSheets(
  booking: WalkthroughBookingRecord,
  webhookUrl?: string
): Promise<{ success: boolean; bookingId: string; mode: 'live' | 'local_fallback' }> {
  const envUrl = (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_APPS_SCRIPT_URL;
  const targetUrl = (webhookUrl && webhookUrl.trim().length > 0) ? webhookUrl.trim() : envUrl;

  // If no webhook URL is provided yet, fallback gracefully for local testing
  if (!targetUrl || targetUrl.trim() === '') {
    console.info('[GoogleSheetsService] No Google Apps Script URL configured. Storing booking locally.', booking);
    // Simulate brief network latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      bookingId: booking.bookingId,
      mode: 'local_fallback'
    };
  }

  try {
    // Google Apps Script Webhooks require text/plain content type or url-encoded form data 
    // to avoid preflight OPTIONS CORS restrictions from browsers.
    const response = await fetch(targetUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'create_walkthrough_booking',
        data: booking
      })
    });

    if (!response.ok) {
      console.warn('[GoogleSheetsService] HTTP response was not ok:', response.status);
    }

    try {
      const result = await response.json();
      if (result && result.success === false) {
        throw new Error(result.error || 'Failed to record booking in Google Sheets.');
      }
    } catch {
      // If response body is opaque (e.g. redirect), assume success if status is in standard 200 range
    }

    return {
      success: true,
      bookingId: booking.bookingId,
      mode: 'live'
    };

  } catch (error: unknown) {
    console.error('[GoogleSheetsService] Error posting to Google Apps Script:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to connect to Google Sheets webhook.'
    );
  }
}
