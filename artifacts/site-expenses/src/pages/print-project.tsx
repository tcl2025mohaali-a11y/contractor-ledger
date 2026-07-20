import { useEffect } from "react";
import { useParams } from "wouter";
import { useGetProject, useListProjectTransactions } from "@workspace/api-client-react";
import { PrintableReport } from "@/components/printable-report";
import { Loader2 } from "lucide-react";

export default function PrintProject() {
  const { id } = useParams();
  const projectId = Number(id);

  const { data: project, isLoading: isLoadingProject } = useGetProject(projectId);
  const { data: transactions, isLoading: isLoadingTransactions } = useListProjectTransactions(projectId);

  useEffect(() => {
    if (!isLoadingProject && !isLoadingTransactions && project) {
      document.title = `تقرير_حركات_${project.name.replace(/\s+/g, "_")}`;
      // Small delay to ensure render is complete before printing
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProject, isLoadingTransactions, project]);

  if (isLoadingProject || isLoadingTransactions) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-row-reverse" dir="rtl">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="mr-4 font-bold text-lg">جاري تجهيز التقرير للطباعة...</span>
      </div>
    );
  }

  if (!project) {
    return <div className="p-10 text-center font-bold">المشروع غير موجود</div>;
  }

  return (
    <div className="bg-white min-h-screen text-black">
      <PrintableReport project={project as any} transactions={(transactions || []) as any} />
    </div>
  );
}
