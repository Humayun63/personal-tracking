import { Sidebar } from "@/components/shell/Sidebar";
import { BottomTabBar } from "@/components/shell/BottomTabBar";
import { Header } from "@/components/shell/Header";
import { ToastProvider } from "@/components/ui/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <BottomTabBar />
        </div>
      </div>
    </ToastProvider>
  );
}
