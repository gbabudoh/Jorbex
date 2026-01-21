'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  email?: string;
  domain?: string;
  subject?: string;
  onLeave?: () => void;
  height?: string | number;
  width?: string | number;
}

export default function JitsiMeeting({
  roomName,
  displayName,
  email,
  domain = 'meet.jit.si',
  subject,
  onLeave,
  height = '100%',
  width = '100%',
}: JitsiMeetingProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const apiRef = useRef<any>(null);

  const initializeJitsi = useCallback(() => {
    if (!window.JitsiMeetExternalAPI) return;

    const options = {
      roomName: roomName,
      width: width,
      height: height,
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
          'e2ee'
        ],
      },
      userInfo: {
        displayName: displayName,
        email: email,
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    apiRef.current = api;

    // Event listeners
    api.addEventListeners({
      inputHangup: () => {
        if (onLeave) onLeave();
      },
      videoConferenceLeft: () => {
        if (onLeave) onLeave();
      },
    });
    
    if (subject) {
      api.executeCommand('subject', subject);
    }
  }, [domain, roomName, width, height, displayName, email, subject, onLeave]);

  useEffect(() => {
    // Load Jitsi script
    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      setLoading(false);
      initializeJitsi();
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [domain, initializeJitsi]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-black rounded-xl overflow-hidden shadow-2xl">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="flex flex-col items-center gap-4">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
             <p className="text-gray-400">Loading Secure Interview Room...</p>
          </div>
        </div>
      )}
      <div ref={jitsiContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// Global declaration for Jitsi
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}
