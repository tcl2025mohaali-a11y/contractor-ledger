import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProjectTransaction, useUpdateTransaction, getListProjectTransactionsQueryKey, getGetProjectQueryKey, getListProjectsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const transactionSchema = z.object({
  type: z.enum(["deposit", "expense"]),
  amount: z.coerce.number().min(0.01, "المبلغ يجب أن يكون أكبر من 0"),
  description: z.string().min(1, "الوصف مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export function TransactionDialog({
  projectId, open, onOpenChange, type, defaultValues, transactionId
}: {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "deposit" | "expense";
  defaultValues?: TransactionFormData;
  transactionId?: number;
}) {
  const queryClient = useQueryClient();
  const createMutation = useCreateProjectTransaction();
  const updateMutation = useUpdateTransaction();

  const isEdit = !!transactionId;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues || {
      type,
      amount: "" as unknown as number, // Let the user type it fresh
      description: "",
      date: new Date().toISOString().split('T')[0]
    }
  });

  // Reset form when dialog opens/closes or type changes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues || {
        type,
        amount: "" as unknown as number,
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [open, defaultValues, type, form]);

  const onSubmit = (values: TransactionFormData) => {
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListProjectTransactionsQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      onOpenChange(false);
      toast.success(isEdit ? "تم التعديل بنجاح" : "تم التسجيل بنجاح");
    };

    if (isEdit && transactionId) {
      updateMutation.mutate({ id: transactionId, data: values }, { onSuccess });
    } else {
      createMutation.mutate({ id: projectId, data: values }, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل الحركة" : (type === "deposit" ? "تسجيل دفعة مستلمة" : "تسجيل مصروف")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>المبلغ (د.ل)</Label>
            <Input 
              type="number" 
              step="any" 
              {...form.register("amount")} 
              placeholder="مثال: 1500" 
              dir="ltr" 
              className="text-right text-lg font-bold" 
            />
            {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Input {...form.register("description")} placeholder={type === "deposit" ? "مثال: دفعة من المالك" : "مثال: أسمنت وبلك"} />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>التاريخ</Label>
            <Input type="date" {...form.register("date")} />
            {form.formState.errors.date && <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>}
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>إلغاء</Button>
            <Button type="submit" disabled={isPending} variant={type === "deposit" ? "success" : "destructive"}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
