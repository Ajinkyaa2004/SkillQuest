import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const ToastDemo: React.FC = () => {
  const showWarningToast = (violationNumber: number) => {
    toast.warning(
      `Warning ${violationNumber}/3: Tab switching detected. Further violations will result in disqualification.`,
      {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          border: '2px solid #d97706',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px',
        },
        icon: '⚠️',
      }
    );
  };

  const showErrorToast = () => {
    toast.error(
      `Warning 3/3: Assessment terminated due to multiple tab switches. You have been disqualified.`,
      {
        duration: 10000,
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          border: '2px solid #dc2626',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px',
        },
        icon: '🚫',
      }
    );
  };

  const showSuccessToast = () => {
    toast.success(
      'Assessment completed successfully! Great job!',
      {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: '2px solid #059669',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px',
        },
        icon: '✅',
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-[#f3f0fc] via-[#faf9fc] to-[#f3f0fc] flex flex-col items-center justify-center p-6"
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl shadow-[#8558ed]/20 max-w-md">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8558ed] to-[#b18aff] mb-6 text-center">
          Toast Notification Demo
        </h1>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#030303]/70 mb-2">Warning Toasts</h3>
            <div className="space-y-2">
              <Button
                onClick={() => showWarningToast(1)}
                className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white"
              >
                Show Warning 1/3
              </Button>
              <Button
                onClick={() => showWarningToast(2)}
                className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white"
              >
                Show Warning 2/3
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#030303]/70 mb-2">Error Toast</h3>
            <Button
              onClick={showErrorToast}
              className="w-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white"
            >
              Show Disqualification (3/3)
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#030303]/70 mb-2">Success Toast</h3>
            <Button
              onClick={showSuccessToast}
              className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white"
            >
              Show Success
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#8558ed]/10 border border-[#8558ed]/20 rounded-xl">
          <p className="text-sm text-[#030303]/70">
            <strong className="text-[#8558ed]">Note:</strong> In the actual game, these toasts will appear automatically when tab switching is detected.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
