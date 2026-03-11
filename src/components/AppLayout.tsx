import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Store, CreditCard, BarChart3, LogOut } from "lucide-react";
import { setAuthenticated } from "@/lib/store";
import logo from "@/assets/logo.png";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/shops", icon: Store, label: "Shops" },
  { path: "/payments", icon: CreditCard, label: "Pay" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">RentManager</h1>
        <button onClick={handleLogout} className="text-muted-foreground p-2 hover:text-foreground transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <main className="bottom-nav-safe px-4 py-4 max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
