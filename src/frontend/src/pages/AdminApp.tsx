import { Toaster } from "@/components/ui/sonner";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminContacts } from "@/pages/admin/AdminContacts";
import { AdminCustomers } from "@/pages/admin/AdminCustomers";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminOrders } from "@/pages/admin/AdminOrders";
import { AdminProducts } from "@/pages/admin/AdminProducts";
import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

type AdminTab = "dashboard" | "orders" | "products" | "customers" | "contacts";

const NAV_ITEMS: {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "contacts", label: "Contact Messages", icon: MessageSquare },
];

export function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminAppInner />
    </AdminAuthProvider>
  );
}

function AdminAppInner() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isAuthenticated, logout } = useAdminAuth();

  // Close sidebar on tab change (mobile)
  function handleTabChange(tab: AdminTab) {
    setActiveTab(tab);
    setSidebarOpen(false);
  }

  function handleLogout() {
    logout();
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-admin-sidebar border-r border-white/10 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/generated/dr-greens-logo-transparent.dim_300x300.png"
              alt="Dr. Greens"
              className="h-9 w-9 object-contain"
            />
            <div>
              <p className="font-display text-sm font-bold text-white leading-tight">
                Dr. Greens
              </p>
              <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">
                Admin Panel
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden text-white/50 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-ocid={`admin.nav.${item.id}.link`}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }
                `}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            View Store
          </a>
          <button
            type="button"
            data-ocid="admin.sidebar.logout_button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-rose-300 hover:bg-rose-500/10 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar (mobile only) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="admin.topbar.menu_button"
              onClick={() => setSidebarOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <img
              src="/assets/generated/dr-greens-logo-transparent.dim_300x300.png"
              alt="Dr. Greens"
              className="h-7 w-7 object-contain"
            />
            <span className="font-display text-sm font-bold text-foreground">
              Admin
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-7 max-w-7xl mx-auto w-full">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "customers" && <AdminCustomers />}
          {activeTab === "contacts" && <AdminContacts />}
        </main>

        {/* Footer */}
        <footer className="py-4 px-7 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dr. Greens · Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
