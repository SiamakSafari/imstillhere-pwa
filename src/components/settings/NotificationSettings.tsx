'use client';

import React, { useState, useEffect } from 'react';

interface NotificationSettingsProps {
  pushEnabled: boolean;
  onUpdate: (updates: { pushEnabled: boolean }) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  pushEnabled: initialPushEnabled,
  onUpdate,
}) => {
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }
  }, []);

  const handleToggle = async () => {
    if (!pushEnabled) {
      // Trying to enable
      if ('Notification' in window && Notification.permission !== 'granted') {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result !== 'granted') return;
      }
      setPushEnabled(true);
      onUpdate({ pushEnabled: true });
    } else {
      setPushEnabled(false);
      onUpdate({ pushEnabled: false });
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        🔔 Push Notifications
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Get reminded to check in even when the app isn&apos;t open.
      </p>
      <div className="flex justify-between items-center py-2">
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          Enable push notifications
        </span>
        <button
          role="switch"
          aria-checked={pushEnabled}
          onClick={handleToggle}
          disabled={permission === 'unsupported'}
          className="relative w-11 h-6 rounded-full transition-colors disabled:opacity-50"
          style={{ backgroundColor: pushEnabled ? 'var(--accent-dark)' : 'var(--gray-700)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
            style={{
              backgroundColor: pushEnabled ? 'var(--accent)' : 'var(--gray-400)',
              transform: pushEnabled ? 'translateX(20px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>
      {pushEnabled && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm">✅</span>
          <span className="text-sm" style={{ color: 'var(--accent)' }}>
            Notifications enabled
          </span>
        </div>
      )}
      {permission === 'denied' && (
        <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      )}
      {permission === 'unsupported' && (
        <p className="text-xs mt-2" style={{ color: 'var(--gray-500)' }}>
          Push notifications are not supported in this browser.
        </p>
      )}
    </div>
  );
};
