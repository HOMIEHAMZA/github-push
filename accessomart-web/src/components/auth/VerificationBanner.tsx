'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/api-client';

export function VerificationBanner() {
  const { user, isAuthenticated, isGuest } = useAuthStore();
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show if not logged in, is a guest, or is already verified
  if (!isAuthenticated || !user || isGuest() || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    setError(null);
    try {
      await authApi.resendVerification(user.email);
      setIsSent(true);
      // Reset success state after a few seconds
      setTimeout(() => setIsSent(false), 5000);
    } catch (err) {
      console.error('[VerificationBanner] Resend error:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend link.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <AlertTriangle size={16} />
          </div>
          <p className="text-sm font-medium text-on-surface">
            Your email is not verified. <span className="hidden sm:inline text-on-surface-variant">Verify your account to ensure full security and access.</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {error && (
            <span className="text-xs text-red-400 font-medium">{error}</span>
          )}
          
          {isSent ? (
            <span className="text-xs text-primary font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 size={14} /> Verification Link Sent
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isSending}
              className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={14} /> Resend Link
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
