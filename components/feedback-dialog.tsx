'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { usePostHog } from 'posthog-js/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const posthog = usePostHog();

  const handleSubmit = async () => {
    if (message.trim().length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/api/feedback', { message: message.trim() });
      posthog.capture('user_feedback_submitted');
      toast.success('Feedback sent — thank you!');
      setSubmitted(true);
      setTimeout(() => {
        onOpenChange(false);
        setMessage('');
        setSubmitted(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMessage('');
      setError(null);
      setSubmitted(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Bug reports, feature requests, or anything else — we&apos;d love to hear from you.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <p className="py-4 text-center text-sm font-semibold text-[var(--success)]">
            Thank you for your feedback!
          </p>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Tell us what's on your mind..."
              rows={5}
              maxLength={2000}
              className="w-full resize-none rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] px-3 py-2 text-sm text-[var(--ink)] placeholder:font-hand placeholder:text-[var(--ink)]/45 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/35"
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <DialogFooter>
              <Button
                onClick={() => handleOpenChange(false)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || message.trim().length === 0}
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
