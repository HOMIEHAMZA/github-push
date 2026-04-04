'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/Button';
import { authApi } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
    } catch (err) {
      console.error("[ForgotPassword] Error:", err);
      setError(err instanceof Error ? err.message : 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-6 py-20 min-h-[70vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-surface-container-low p-10 rounded-3xl border border-surface-container-highest/20 shadow-2xl relative text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Check your email</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            If an account exists for <span className="text-on-surface font-semibold">{email}</span>, 
            you will receive a password reset link shortly.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <PrimaryButton className="w-full justify-center py-4">
                BACK TO LOGIN
              </PrimaryButton>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-20 min-h-[70vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-container-low p-10 rounded-3xl border border-surface-container-highest/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div>
            <Link href="/login" className="inline-flex items-center text-sm text-on-surface-variant hover:text-primary transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Link>
            <h1 className="text-3xl font-display font-bold text-on-surface mb-2 tracking-tight">Forgot Password</h1>
            <p className="text-on-surface-variant text-sm">Enter your email and we&apos;ll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />

            <PrimaryButton 
              type="submit" 
              className="w-full justify-center py-4"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  SENDING LINK...
                </>
              ) : (
                <>
                  RESET PASSWORD <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </PrimaryButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
