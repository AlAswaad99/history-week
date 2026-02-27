"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhN6z6C_ORwFQnfqWisLG15AXHJG4y5ktxauvlTWXTiBNg0cP-NKyySjVJhyckftok/exec';

// Telegram configuration
const TELEGRAM_BOT_TOKEN = '7680806997:AAEyBGWvSS4YDGVLBUDCfM0cXp4K2Fu0U1U';
const TELEGRAM_CHAT_IDS = ['502060443', '-5193363445'];

interface GroupBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GroupType = 'Fellowship' | 'choir' | 'Bible Study group' | 'Other';

// Time slots available for all days
const TIME_SLOTS_WEEKDAY = ['3:00 - 6:00 LT', '8:00 - 11:00 LT', '10:00 - 1:00 LT'];
const TIME_SLOTS_SUNDAY = ['9:00 - 1:00 LT'];

// Helper function to get day name from date
const getDayName = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = date.getDay();
  return days[dayIndex] || '';
};

// Helper function to format date for display
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Function to send Telegram notification
const sendTelegramNotification = async (formData: any, userIP: string) => {
  const selectedDate = formData.selectedDate ? formatDate(formData.selectedDate) : formData.day || 'Not specified';
  const dayName = formData.selectedDate ? getDayName(formData.selectedDate) : formData.day || '';
  
  const message = `🎉 *New Group Booking*\n\n` +
                  `👥 *Group Name:* ${formData.groupName}\n` +
                  `📋 *Type:* ${formData.groupType}\n` +
                  `📅 *Date:* ${selectedDate}\n` +
                  `📆 *Day:* ${dayName}\n` +
                  `⏰ *Time:* ${formData.time}\n` +
                  `📞 *Contact Phone:* ${formData.contactPhone}\n` +
                  `🌐 *IP:* ${userIP}\n` +
                  `\n_Submitted at: ${new Date().toLocaleString()}_`;

  // Send to all chat IDs
  const promises = TELEGRAM_CHAT_IDS.map(async (chatId) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        }),
      });
      
      if (!response.ok) {
        console.error(`Failed to send to chat ${chatId}:`, await response.text());
      } else {
        console.log(`Successfully sent to chat ${chatId}`);
      }
    } catch (error) {
      console.error(`Error sending to chat ${chatId}:`, error);
    }
  });

  // Wait for all messages to be sent (or fail)
  await Promise.allSettled(promises);
};

export function GroupBookingModal({ isOpen, onClose }: GroupBookingModalProps) {
  const [formData, setFormData] = useState({
    groupName: '',
    groupType: '' as GroupType | '',
    selectedDate: '',
    day: '', // Will be auto-calculated from selectedDate
    time: '',
    contactPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // When date changes, calculate day name and reset time
      if (field === 'selectedDate') {
        updated.day = getDayName(value);
        updated.time = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.groupName || !formData.groupType || !formData.selectedDate || !formData.time || !formData.contactPhone) {
      setErrorMessage('Please fill in all fields');
      setSubmitState('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitState('idle');
    setErrorMessage('');

    try {
      // Get user's IP
      let userIP = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userIP = ipData.ip;
      } catch (e) {
        console.log('Could not get IP:', e);
      }

      // Submit to Google Sheets
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'group',
          groupName: formData.groupName,
          groupType: formData.groupType,
          selectedDate: formData.selectedDate,
          date: formatDate(formData.selectedDate), // Formatted date for display
          day: formData.day, // Day name (e.g., "Wednesday")
          time: formData.time,
          contactPhone: formData.contactPhone,
          ip: userIP,
        }),
      });

      // Send Telegram notification directly from frontend
      await sendTelegramNotification(formData, userIP);

      setSubmitState('success');
      
      // Reset form after 4 seconds (longer to ensure user sees success message)
      setTimeout(() => {
        setFormData({
          groupName: '',
          groupType: '',
          selectedDate: '',
          day: '',
          time: '',
          contactPhone: '',
        });
        setSubmitState('idle');
        onClose();
      }, 4000);

    } catch (error) {
      console.error('Error submitting group booking:', error);
      setSubmitState('error');
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed z-[100] bg-black/70 backdrop-blur-sm"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
        onClick={onClose}
      />
      
      {/* Fullscreen Modal - Takes entire viewport */}
      <div 
        className="fixed z-[101] flex flex-col bg-white dark:bg-gray-900 overflow-hidden"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
      >
        {/* Sticky Header - Full Width */}
        <div className="w-full bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between flex-shrink-0 shadow-lg">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Book a tour as a group</h2>
            <p className="text-purple-100 text-xs sm:text-sm mt-1">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={24} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Form Content - Takes remaining height */}
        <div className="flex-1 overflow-y-auto w-full">
          <form id="group-booking-form" onSubmit={handleSubmit} className="w-full p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Group Name */}
            <div>
              <label htmlFor="groupName" className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                What is the name of the group? <span className="text-red-500">*</span>
              </label>
              <input
                id="groupName"
                type="text"
                value={formData.groupName}
                onChange={(e) => handleInputChange('groupName', e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                required
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Contact Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Enter contact phone number"
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                required
              />
            </div>

            {/* Group Type */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                Group type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {(['Fellowship', 'choir', 'Bible Study group', 'Other'] as GroupType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('groupType', type)}
                    className={`
                      px-4 py-3 sm:py-4 rounded-xl border-2 font-medium transition-all text-sm sm:text-base
                      ${formData.groupType === type
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-md'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600'
                      }
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="selectedDate" className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Select Date <span className="text-red-500">*</span>
              </label>
              <input
                id="selectedDate"
                type="date"
                value={formData.selectedDate}
                onChange={(e) => handleInputChange('selectedDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                required
              />
              {/* Display day name automatically */}
              {formData.selectedDate && formData.day && (
                <div className="mt-3 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-purple-700 dark:text-purple-300 text-sm sm:text-base font-medium">
                    📅 Selected: <span className="font-bold">{formatDate(formData.selectedDate)}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Time Selection */}
            {formData.selectedDate && formData.day && (
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                  Select Time <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {(formData.day === 'Sunday' ? TIME_SLOTS_SUNDAY : TIME_SLOTS_WEEKDAY).map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleInputChange('time', time)}
                      className={`
                        px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 font-medium transition-all text-sm sm:text-base
                        ${formData.time === time
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-md'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitState === 'error' && errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-5">
                <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {submitState === 'success' && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-8 sm:p-10 text-center shadow-lg animate-in fade-in-0 zoom-in-95 duration-500">
                <div className="text-5xl sm:text-6xl mb-6 animate-bounce">🎉</div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                  Group Tour Booking Submitted Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-base sm:text-lg leading-relaxed">
                  Thank you for booking a group tour! We have received your request and will be waiting for you. 
                  Our team will contact you soon to confirm all the details.
                </p>
                <div className="mt-6 text-green-600 dark:text-green-400 text-sm">
                  This window will close automatically in a few seconds...
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer with Buttons - Always Visible */}
        <div className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex-shrink-0 shadow-lg">
          <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 sm:flex-initial sm:min-w-[120px] border-gray-300 dark:border-gray-600 py-3 sm:py-2 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="group-booking-form"
              disabled={isSubmitting || submitState === 'success'}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold shadow-lg py-3 sm:py-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : submitState === 'success' ? (
                'Submitted!'
              ) : (
                'Submit Booking'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
