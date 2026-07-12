import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProject, useUpdateProject, getListProjectsQueryKey, getGetProjectQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const projectSchema = z.object({
  name: z.string().min(1, "اسم المشروع مطلوب"),
  clientName: z.string().min(1, "اسم المالك مطلوب"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function ProjectDialog({
  open, onOpenChange, defaultValues, projectId
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: ProjectFormData;
  projectId?: number;
}) {
  const queryClient = useQueryClient();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  
  const isEdit = !!projectId;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues || {
      name: "",
      clientName: "",
      location: "",
      notes: ""
    }
  });

  const onSubmit = (values: ProjectFormData) => {
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      }
      onOpenChange(false);
      if (!isEdit) form.reset();
      toast.success(isEdit ? "تم تحديث المشروع بنجاح" : "تم إنشاء المشروع بنجاح");
    };

    if (isEdit) {
      updateMutation.mutate({ id: projectId, data: values }, { onSuccess });
    } else {
      createMutation.mutate({ data: values }, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val && !isEdit) form.reset();
      onOpenChange(val);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل بيانات المشروع" : "إضافة مشروع جديد (حوش)"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>اسم المشروع (الحوش)</Label>
            <Input {...form.register("name")} placeholder="مثال: حوش الزاوية" />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>اسم المالك</Label>
            <Input {...form.register("clientName")} placeholder="مثال: خالد محمد" />
            {form.formState.errors.clientName && <p className="text-sm text-destructive">{form.formState.errors.clientName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>الموقع (اختياري)</Label>
            <Input {...form.register("location")} placeholder="مثال: طريق المطار" />
          </div>
          <div className="space-y-2">
            <Label>ملاحظات (اختياري)</Label>
            <Textarea {...form.register("notes")} placeholder="أي تفاصيل إضافية..." />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>إلغاء</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? "حفظ التعديلات" : "إضافة المشروع"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
