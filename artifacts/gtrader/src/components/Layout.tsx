import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@workspace/replit-auth-web";
import {
  LayoutDashboard, Wallet, BookOpen, BarChart3, Brain,
  ShieldAlert, Menu, X, LogOut, ChevronRight, Bell,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
  { href: "/contas", label: "Contas", icon: Wallet, color: "text-purple-400" },
  { href: "/diario", label: "Diário", icon: BookOpen, color: "text-cyan-400" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-emerald-400" },
  { href: "/psicologia", label: "Psicologia", icon: Brain, color: "text-pink-400" },
  { href: "/risco", label: "Risco", icon: ShieldAlert, color: "text-amber-400" },
];

function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
      <div className="logo-icon w-9 h-9 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <polyline points="2,17 7,12 11,15 16,9 22,14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="16,9 22,9 22,14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {!collapsed && (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-white tracking-tight leading-none">G</span>
            <span className="text-base font-black brand-gradient tracking-tight leading-none">TRADER</span>
            <span className="text-[10px] font-black gold-gradient tracking-widest leading-none">PRO</span>
          </div>
          <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">SMC · ICT · Profissional</p>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors group" data-testid="user-menu-trigger">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.profileImage ?? undefined} />
            <AvatarFallback className="text-xs font-bold brand-bg text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Trader"}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.username ?? "Pro Trader"}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/40 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="button-logout">
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col w-60 transition-transform duration-200 lg:relative lg:translate-x-0",
        "border-r border-sidebar-border",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: "hsl(var(--sidebar))" }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <Logo />
          <button className="lg:hidden p-1 text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="text-[10px] text-sidebar-foreground/40 font-semibold uppercase tracking-widest px-3 pb-2">Menu</p>
          {NAV.map(({ href, label, icon: Icon, color }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group",
                  active
                    ? "sidebar-active-glow font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )} data-testid={`nav-${label.toLowerCase()}`}>
                  <Icon className={cn("h-4 w-4 flex-shrink-0 transition-colors", active ? color : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70")} />
                  {label}
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <UserMenu />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="mobile-menu-toggle">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
