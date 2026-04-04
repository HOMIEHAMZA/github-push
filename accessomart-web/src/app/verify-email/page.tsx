'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Home } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/Button';
import { authApi } from '@/lib/api-client';
import { useAuthStore } from '@/store/useAuthStore';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { fetchMe } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid or missing verification token.');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        // Refresh the user state to update emailVerified across the app
        await fetchMe({ silent: true });
        
        // redirect after 5 seconds
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } catch (err) {
        console.error('[VerifyEmail] Error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Verification failed.');
      }
    }

    verify();
  }, [token, router, fetchMe]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <h1 className="text-3xl font-display font-bold text-on-surface">Verifying your account...</h1>
            <p className="text-on-surface-variant max-w-sm mx-auto">
              Please wait while we establish a secure connection and authenticate your identity.
            </p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
            </div>
            <h1 className="text-3xl font-display font-bold text-on-surface">Email Verified!</h1>
            <p className="text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Congratulations! Your account is now fully verified. You are being redirected to the homepage.
            </p>
            <div className="pt-4">
              <Link href="/">
                <PrimaryButton className="w-full justify-center py-4">
                  CONTINUE TO STORE <ArrowRight className="ml-2 w-5 h-5" />
                </PrimaryButton>
              </Link>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-on-surface">Verification Failed</h1>
            <p className="text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              {errorMessage || 'The verification link is invalid or has expired.'}
            </p>
            <div className="pt-4 space-y-4">
              <Link href="/account">
                <PrimaryButton className="w-full justify-center py-4">
                  REQUEST NEW LINK
                </PrimaryButton>
              </Link>
              <Link href="/" className="flex items-center justify-center text-sm text-on-surface-variant hover:text-primary transition-colors">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-6 py-20 min-h-[70vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-container-low p-10 rounded-3xl border border-surface-container-highest/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-6 py-20 min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
