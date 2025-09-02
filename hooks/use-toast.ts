// /hooks/use-toast.ts
import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastOptions) => {
      if (variant === "destructive") {
        sonnerToast.error(title ?? "Fehler", { description });
      } else {
        sonnerToast.success(title ?? "Hinweis", { description });
      }
    },
  };
}
