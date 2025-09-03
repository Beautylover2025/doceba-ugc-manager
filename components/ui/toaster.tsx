// components/ui/toaster.tsx
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  // Stelle die Position & Farben so ein, wie du sie möchtest
  return (
    <Sonner
      richColors
      position="top-center"
      closeButton
      expand
      toastOptions={{ duration: 4000 }}
    />
  );
}
