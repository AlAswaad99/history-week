// Configuration
const TELEGRAM_BOT_TOKEN = '7680806997:AAEyBGWvSS4YDGVLBUDCfM0cXp4K2Fu0U1U';
const TELEGRAM_CHAT_IDS = ['502060443', '-5193363445']; // Add more chat IDs as needed

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
          'Date',
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
        data.date || data.selectedDate || '',
        data.day || '',
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
    // Add debugging logs
    Logger.log('RAW DATA: ' + JSON.stringify(data));
    Logger.log('TYPE: ' + type);
    
    let message = '';
    
    if (type === 'group') {
      message = `🎉 *New Group Booking*\n\n` +
                `👥 *Group Name:* ${data.groupName}\n` +
                `📋 *Type:* ${data.groupType}\n` +
                `📅 *Date:* ${data.date || data.selectedDate || 'Not specified'}\n` +
                `📆 *Day:* ${data.day || 'Not specified'}\n` +
                `⏰ *Time:* ${data.time}\n` +
                `📞 *Contact Phone:* ${data.contactPhone || 'not provided'}\n` +
                `🌐 *IP:* ${data.ip || 'unknown'}\n` +
                `\n_Submitted at: ${new Date().toLocaleString()}_`;
    }
    
    Logger.log('MESSAGE: ' + message);
    Logger.log('DEFAULT CHAT IDS: ' + JSON.stringify(TELEGRAM_CHAT_IDS));
    Logger.log('DEFAULT BOT TOKEN: ' + TELEGRAM_BOT_TOKEN);
    
    // Use ONLY the hardcoded values to avoid override issues
    const chatIds = TELEGRAM_CHAT_IDS;
    const botToken = TELEGRAM_BOT_TOKEN;
    
    Logger.log('USING CHAT IDS: ' + JSON.stringify(chatIds));
    Logger.log('USING BOT TOKEN: ' + botToken);
    
    chatIds.forEach(chatId => {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      Logger.log(`Sending to chat ${chatId} with URL: ${url}`);
      
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      };
      
      Logger.log('PAYLOAD: ' + JSON.stringify(payload));
      
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      };
      
      try {
        const response = UrlFetchApp.fetch(url, options);
        const responseText = response.getContentText();
        Logger.log(`Response for chat ${chatId}: ${responseText}`);
      } catch (error) {
        Logger.log(`Failed to send to chat ${chatId}: ${error.toString()}`);
      }
    });
    
  } catch (error) {
    Logger.log('Telegram notification error: ' + error.toString());
  }
}