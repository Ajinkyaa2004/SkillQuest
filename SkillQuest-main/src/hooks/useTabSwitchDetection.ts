import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface TabSwitchDetectionOptions {
  maxViolations?: number;
  onDisqualified?: () => void;
  enabled?: boolean;
}

export const useTabSwitchDetection = ({
  maxViolations = 3,
  onDisqualified,
  enabled = true,
}: TabSwitchDetectionOptions = {}) => {
  const violationCountRef = useRef(0);
  const hasBeenDisqualifiedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasBeenDisqualifiedRef.current) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched away
        violationCountRef.current += 1;
        const currentViolations = violationCountRef.current;

        if (currentViolations >= maxViolations) {
          // Disqualification
          hasBeenDisqualifiedRef.current = true;
          toast.error(
            `Warning ${currentViolations}/${maxViolations}: Assessment terminated due to multiple tab switches. You have been disqualified.`,
            {
              duration: 10000,
              icon: '🚫',
            }
          );
          
          if (onDisqualified) {
            setTimeout(() => {
              onDisqualified();
            }, 2000);
          }
        } else {
          // Warning
          toast.warning(
            `Warning ${currentViolations}/${maxViolations}: Tab switching detected. Further violations will result in disqualification.`,
            {
              duration: 5000,
              icon: '⚠️',
            }
          );
        }
      }
    };

    const handleBlur = () => {
      // Additional detection for window blur
      if (!document.hidden) {
        violationCountRef.current += 1;
        const currentViolations = violationCountRef.current;

        if (currentViolations >= maxViolations && !hasBeenDisqualifiedRef.current) {
          hasBeenDisqualifiedRef.current = true;
          toast.error(
            `Warning ${currentViolations}/${maxViolations}: Assessment terminated. You have been disqualified.`,
            {
              duration: 10000,
              icon: '🚫',
            }
          );
          
          if (onDisqualified) {
            setTimeout(() => {
              onDisqualified();
            }, 2000);
          }
        } else if (currentViolations < maxViolations) {
          toast.warning(
            `Warning ${currentViolations}/${maxViolations}: Tab switching detected. Further violations will result in disqualification.`,
            {
              duration: 5000,
              icon: '⚠️',
            }
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, maxViolations, onDisqualified]);

  return {
    violationCount: violationCountRef.current,
    isDisqualified: hasBeenDisqualifiedRef.current,
  };
};
