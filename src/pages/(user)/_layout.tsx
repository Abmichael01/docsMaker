import BottomBar from "@/components/Dashboard/Layouts/BottomBar";
import Navbar from "@/components/Dashboard/Layouts/Navbar";
import Sidebar from "@/components/Dashboard/Layouts/Sidebar";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import { useDialogStore } from "@/store/dialogStore";
import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom"; // or next/router if using Next.js

export default function DashboardLayout() {
  const [params] = useSearchParams();
  const dialog = params.get("dialog") as string;
  const { openDialog } = useDialogStore();

  useEffect(() => {
    openDialog(dialog);
  }, [dialog, openDialog]);
  return (
    <ProtectedLayout>
      <div className="flex h-screen text-white">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background pb-30">
          <Navbar />
          <div className="px-3 sm:px-6 md:px-10 py-5">
            <Outlet />
          </div>{" "}
          {/* Renders child routes like dashboard, wallet, etc. */}
        </main>
        <BottomBar />
      </div>
    </ProtectedLayout>
  );
}
