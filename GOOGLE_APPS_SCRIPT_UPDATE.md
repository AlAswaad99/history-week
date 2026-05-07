# Google Apps Script Update for Group Bookings

## Overview
This guide explains how to update your Google Apps Script to handle group bookings and send Telegram notifications.

## Current Script URL
```
https://script.google.com/macros/s/AKfycby3TaIr2A20hTav4-Ge4RkPZO7i3brwWQkV66nSK3CQD66_stjMlCgsizQxSNJv-K54/exec
```

## Steps to Update

### 1. Open Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Find your existing script or create a new one
3. Make sure you have a Google Sheet with two sheets:
   - Sheet 1: "Individual RSVPs" (existing)
   - Sheet 2: "Group Bookings" (new - create this)

### 2. Update the Script Code

Replace your existing code with the following:

```javascript
// Configuration
const TELEGRAM_BOT_TOKEN = '7680806997:AAEyBGWvSS4YDGVLBUDCfM0cXp4K2Fu0U1U';
const TELEGRAM_CHAT_IDS = ['502060443']; // Add more chat IDs as needed

// Sheet names
const INDIVIDUAL_SHEET = 'Individual RSVPs';
const GROUP_SHEET = 'Group Bookings';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Determine which sheet to use
    if (data.type === 'group') {
      // Handle group booking
      const groupSheet = sheet.getSheetByName(GROUP_SHEET);
      
      // Create headers if sheet is empty
      if (groupSheet.getLastRow() === 0) {
        groupSheet.appendRow([
          'Timestamp',
          'Group Name',
          'Group Type',
          'Day',
          'Time',
          'Contact Phone',
          'IP Address'
        ]);
      }
      
      // Add the booking
      const timestamp = new Date();
      groupSheet.appendRow([
        timestamp,
        data.groupName,
        data.groupType,
        data.day,
        data.time,
        data.contactPhone || 'not provided',
        data.ip || 'unknown'
      ]);
      
      // Send Telegram notification
      sendTelegramNotification(data, 'group');
      
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: 'Group booking recorded' })
      ).setMimeType(ContentService.MimeType.JSON);
      
    } else {
      // Handle individual RSVP (existing logic)
      const individualSheet = sheet.getSheetByName(INDIVIDUAL_SHEET);
      
      if (individualSheet.getLastRow() === 0) {
        individualSheet.appendRow(['Timestamp', 'IP Address']);
      }
      
      individualSheet.appendRow([new Date(), data.ip || 'unknown']);
      
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, count: individualSheet.getLastRow() - 1 })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Return count for individual RSVPs
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const individualSheet = sheet.getSheetByName(INDIVIDUAL_SHEET);
  const count = Math.max(0, individualSheet.getLastRow() - 1);
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true, count: count })
  ).setMimeType(ContentService.MimeType.JSON);
}

function sendTelegramNotification(data, type) {
  try {
    let message = '';
    
    if (type === 'group') {
      message = `🎉 *New Group Booking*\n\n` +
                `👥 *Group Name:* ${data.groupName}\n` +
                `📋 *Type:* ${data.groupType}\n` +
                `📅 *Day:* ${data.day}\n` +
                `⏰ *Time:* ${data.time}\n` +
                `📞 *Contact Phone:* ${data.contactPhone || 'not provided'}\n` +
                `🌐 *IP:* ${data.ip || 'unknown'}\n` +
                `\n_Submitted at: ${new Date().toLocaleString()}_`;
    }
    
    // Send to all chat IDs
    const chatIds = data.telegramChatIds || TELEGRAM_CHAT_IDS;
    const botToken = data.telegramBotToken || TELEGRAM_BOT_TOKEN;
    
    chatIds.forEach(chatId => {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      };
      
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      };
      
      try {
        UrlFetchApp.fetch(url, options);
      } catch (error) {
        Logger.log(`Failed to send to chat ${chatId}: ${error.toString()}`);
      }
    });
    
  } catch (error) {
    Logger.log('Telegram notification error: ' + error.toString());
  }
}
```

### 3. Set Up Google Sheet

1. Open your Google Sheet
2. Create a new sheet named **"Group Bookings"**
3. The script will automatically create headers, but you can manually add:
   - Column A: Timestamp
   - Column B: Group Name
   - Column C: Group Type
   - Column D: Day
   - Column E: Time
   - Column F: Contact Phone
   - Column G: IP Address

### 4. Deploy the Script

1. Click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the new Web App URL
6. Update the `SCRIPT_URL` in `components/RSVPButton.tsx` and `components/GroupBookingModal.tsx` if needed

### 5. Test the Integration

1. Test individual RSVP (should work as before)
2. Test group booking:
   - Click "Book Tour as a Group"
   - Fill in the form
   - Submit
   - Check Google Sheet for the entry
   - Check Telegram for the notification

## Adding More Telegram Chat IDs

To add more chat IDs, update the `TELEGRAM_CHAT_IDS` array in the script:

```javascript
const TELEGRAM_CHAT_IDS = [
  '502060443',
  'ANOTHER_CHAT_ID',
  'YET_ANOTHER_CHAT_ID'
];
```

## Getting Telegram Chat IDs

1. Start a chat with your bot on Telegram
2. Send a message to your bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `"chat":{"id":502060443}` in the response
5. Use that number as the chat ID

## Troubleshooting

- **Telegram not sending**: Check that the bot token is correct and the bot has been started
- **Sheet not updating**: Make sure the sheet names match exactly (case-sensitive)
- **CORS errors**: The script uses `no-cors` mode, so responses won't be readable, but data will still be saved

## Security Notes

- The Telegram bot token is sent from the client (for flexibility)
- Consider moving sensitive data to server-side if needed
- IP addresses are logged for deduplication purposes
