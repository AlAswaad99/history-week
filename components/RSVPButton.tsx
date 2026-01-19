"use client";

import React, { useState, useEffect, useCallback } from 'react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby3TaIr2A20hTav4-Ge4RkPZO7i3brwWQkV66nSK3CQD66_stjMlCgsizQxSNJv-K54/exec';

type RSVPState = 'idle' | 'loading' | 'success' | 'error';

interface RSVPButtonProps {
  className?: string;
}

export function RSVPButton({ className = '' }: RSVPButtonProps) {
  const [attendeeCount, setAttendeeCount] = useState<number | null>(null);
  const [state, setState] = useState<RSVPState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Load current count on mount
  // useEffect(() => {
  //   loadCount();
  // }, []);

  const loadCount = async () => {
    try {
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      if (data.success) {
        setAttendeeCount(data.count);
      }
    } catch (error) {
      console.error('Error loading count:', error);
      setAttendeeCount(0);
    }
  };

  const recordAttendance = useCallback(async () => {
    if (state === 'loading' || state === 'success') return;
    
    setState('loading');
    setErrorMessage('');

    try {
      // Get user's IP (optional, for deduplication)
      let userIP = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userIP = ipData.ip;
      } catch (e) {
        console.log('Could not get IP:', e);
      }

      // Send to Google Sheets (no-cors mode for Apps Script)
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip: userIP }),
      });

      setState('success');
      
      // Reload count after a brief delay
      // setTimeout(() => {
      //   loadCount();
      // }, 1000);

    } catch (error) {
      console.error('Error:', error);
      setState('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  }, [state]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      recordAttendance();
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Attendee Counter */}
      {/* {attendeeCount !== null && attendeeCount > 0 && (
        <div className="flex items-center gap-2 text-amber-300/80 text-sm">
          <span className="text-lg">👥</span>
          <span>
            <strong className="text-amber-200">{attendeeCount}</strong> people attending
          </span>
        </div>
      )} */}
      
      {/* RSVP Button */}
      <button
        onClick={recordAttendance}
        onKeyDown={handleKeyDown}
        disabled={state === 'loading' || state === 'success'}
        aria-label={state === 'success' ? "You're registered!" : "Count me in for the event"}
        className={`
          px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base
          transition-all duration-300 shadow-lg
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900
          ${state === 'success' 
            ? 'bg-green-500 text-white cursor-default' 
            : state === 'loading'
            ? 'bg-gray-500 text-gray-300 cursor-wait'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-400 hover:to-purple-500 hover:shadow-purple-500/30 active:scale-95'
          }
          disabled:opacity-70
        `}
      >
        {state === 'loading' && (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Registering...
          </span>
        )}
        {state === 'success' && 'You\'re In!'}
        {state === 'error' && 'Try Again'}
        {state === 'idle' && 'Count Me In!'}
      </button>

      {/* Error Message */}
      {state === 'error' && errorMessage && (
        <p className="text-red-400 text-xs" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Success Message */}
      {state === 'success' && (
        <p className="text-green-400 text-xs" role="status">
          Great! We'll see you there!
        </p>
      )}
    </div>
  );
}
