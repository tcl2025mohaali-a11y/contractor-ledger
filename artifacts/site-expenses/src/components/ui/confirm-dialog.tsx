import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ConfirmDialog({
  open, onOpenChange, title, description, onConfirm, isPending, variant = "destructive"
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isPending?: boolean;
  variant?: "destructive" | "default";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>إلغاء</Button>
          <Button variant={variant} onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تأكيد
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
