import { useBotStatus, useBotLogs } from "@/hooks/use-bot";
import { StatCard } from "@/components/StatCard";
import { Activity, Clock, MessageSquare, Users, Cpu } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const mockChartData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  messages: Math.floor(Math.random() * 50) + 10,
  users: Math.floor(Math.random() * 20) + 5,
}));

export default function Dashboard() {
  const { data: status } = useBotStatus();
  const { data: logs } = useBotLogs();

  const uptimeFormatted = status?.uptime 
    ? `${Math.floor(status.uptime / 3600)}h ${Math.floor((status.uptime % 3600) / 60)}m`
    : "0h 0m";

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of Amina's performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-foreground">
            Status: <span className="text-green-500 uppercase">{status?.status || "Connecting..."}</span>
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Users" 
          value="1,284" 
          icon={<Users className="w-6 h-6" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          title="Messages Processed" 
          value="45.2k" 
          icon={<MessageSquare className="w-6 h-6" />}
          trend="+5.4%"
          trendUp={true}
        />
        <StatCard 
          title="System Uptime" 
          value={uptimeFormatted} 
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard 
          title="Avg Response Time" 
          value="240ms" 
          icon={<Cpu className="w-6 h-6" />}
          trend="-12ms"
          trendUp={true}
        />
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Activity Volume</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" /> Messages
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-purple-400" /> Users
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorMessages)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Logs Mini View */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Recent Activity
          </h3>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {logs?.slice(0, 10).map((log, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <span className="text-xs font-mono text-muted-foreground min-w-[60px]">
                    {format(new Date(log.timestamp), "HH:mm:ss")}
                  </span>
                  <div className="flex-1">
                    <span className={cn(
                      "text-xs font-bold uppercase mr-2 px-1.5 py-0.5 rounded",
                      log.level === "ERROR" ? "bg-red-500/10 text-red-500" :
                      log.level === "WARN" ? "bg-amber-500/10 text-amber-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {log.level}
                    </span>
                    <span className="text-muted-foreground/90">{log.message}</span>
                  </div>
                </div>
              ))}
              {!logs?.length && (
                <div className="text-center text-muted-foreground py-8">
                  No activity logs yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
