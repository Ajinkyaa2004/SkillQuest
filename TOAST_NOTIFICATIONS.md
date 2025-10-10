# 🎨 Toast Notification System with Sonner

## Overview
The application now includes a beautiful toast notification system using **Sonner** for displaying warnings, errors, and success messages. The toasts are styled with purple gradients matching your app's theme.

## Features

### ✨ **Styled Toast Types**
- **Warning Toast** (Orange gradient) - For tab switching violations
- **Error Toast** (Red gradient) - For disqualification
- **Success Toast** (Green gradient) - For successful completion

### 🎯 **Tab Switch Detection**
Automatically detects when users switch tabs during assessments and shows progressive warnings:
- **Warning 1/3**: First violation
- **Warning 2/3**: Second violation  
- **Warning 3/3**: Disqualification (redirects user)

## Usage

### 1. **Basic Toast Usage**
```typescript
import { toast } from 'sonner';

// Warning toast
toast.warning('Your warning message here', {
  duration: 5000,
  icon: '⚠️',
});

// Error toast
toast.error('Your error message here', {
  duration: 10000,
  icon: '🚫',
});

// Success toast
toast.success('Your success message here', {
  duration: 5000,
  icon: '✅',
});
```

### 2. **Tab Switch Detection Hook**
The `useTabSwitchDetection` hook is already integrated into the Minesweeper game:

```typescript
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';

// In your component
useTabSwitchDetection({
  maxViolations: 3,           // Number of allowed violations
  enabled: !isTrialMode,      // Enable/disable detection
  onDisqualified: () => {     // Callback when disqualified
    // Handle disqualification
    navigate('/applicant/assessment');
  },
});
```

### 3. **Custom Styled Toasts**
For tab switching warnings (already implemented):

```typescript
toast.warning(
  `Warning ${violationCount}/3: Tab switching detected. Further violations will result in disqualification.`,
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
```

## Testing

### **Demo Page**
Visit `/demo/toast` to test all toast notifications:
1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/demo/toast`
3. Click the buttons to see different toast styles

### **Test Tab Switching**
1. Navigate to any game (e.g., Minesweeper)
2. Switch to another tab or window
3. Return to the game tab
4. You'll see the warning toast appear
5. Repeat 3 times to trigger disqualification

## Styling

### **Global Toast Styles**
Custom styles are defined in `src/index.css`:
- Rounded corners (16px)
- Purple shadow effects
- Gradient backgrounds
- Custom close button styling

### **Toast Position**
Toasts appear at **top-center** by default. You can change this in `App.tsx`:

```typescript
<Toaster 
  position="top-center"  // Options: top-left, top-center, top-right, bottom-left, etc.
  expand={true}
  richColors
  closeButton
/>
```

## Integration Points

### **Current Integrations**
- ✅ Minesweeper game component
- ✅ App-wide Toaster component
- ✅ Custom CSS styling
- ✅ Tab switch detection hook

### **To Add to Other Games**
Simply add the hook to any game component:

```typescript
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';
import { useNavigate } from 'react-router-dom';

// In your game component
const navigate = useNavigate();

useTabSwitchDetection({
  maxViolations: 3,
  enabled: !isTrialMode,
  onDisqualified: () => {
    onComplete(score, errors + 100); // Add penalty
    navigate('/applicant/assessment');
  },
});
```

## Customization

### **Change Warning Count**
Modify `maxViolations` in the hook:
```typescript
useTabSwitchDetection({
  maxViolations: 5, // Allow 5 violations instead of 3
  // ...
});
```

### **Change Toast Duration**
Modify the `duration` property (in milliseconds):
```typescript
toast.warning('Message', {
  duration: 8000, // 8 seconds
  // ...
});
```

### **Change Toast Colors**
Update the gradient colors in the toast call:
```typescript
style: {
  background: 'linear-gradient(135deg, #8558ed 0%, #b18aff 100%)', // Purple gradient
  border: '2px solid #8558ed',
  // ...
}
```

## Notes

- Toasts automatically stack if multiple appear
- Close button is enabled by default
- Toasts are accessible and keyboard-friendly
- The system works across all pages once the Toaster is mounted in App.tsx
- CSS warnings about `@tailwind` and `@apply` are normal and can be ignored

## Example Output

**Warning Toast:**
```
⚠️ Warning 1/3: Tab switching detected. Further violations will result in disqualification.
```

**Disqualification Toast:**
```
🚫 Warning 3/3: Assessment terminated due to multiple tab switches. You have been disqualified.
```

Enjoy your beautiful toast notifications! 🎉
