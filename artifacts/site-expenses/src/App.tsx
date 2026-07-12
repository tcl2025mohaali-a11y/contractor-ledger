import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Dashboard from '@/pages/dashboard';
import ProjectDetails from '@/pages/project-details';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects/:id" component={ProjectDetails} />
      <Route>
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
          <div className="text-4xl font-black text-muted">404</div>
          <p>الصفحة غير موجودة</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <div className="min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
          <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-30">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">إدارة مشاريع البناء</h1>
              <div className="text-xs font-medium opacity-80 px-2 py-1 rounded-md bg-primary-foreground/10 border border-primary-foreground/20">
                نسخة المقاول
              </div>
            </div>
          </header>
          <main className="max-w-3xl mx-auto p-4 md:p-6 pb-20">
            <Router />
          </main>
        </div>
      </WouterRouter>
      <Toaster position="top-center" dir="rtl" />
    </QueryClientProvider>
  );
}

export default App;
