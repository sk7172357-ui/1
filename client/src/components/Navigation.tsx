import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Terminal, 
  Users, 
  Settings, 
  Bot,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/handovers", label: "Human Handover", icon: Users },
    { href: "/logs", label: "Live Logs", icon: Terminal },
    { href: "/settings", label: "Configuration", icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-card border-r border-border/40 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight">Amina</h1>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">AI Assistant</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "group-hover:text-primary transition-colors")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-primary">System Online</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            v1.2.4-beta <br/>
            Connected to Telegram API
          </p>
        </div>
      </div>
    </div>
  );
}
