import { useBotLogs } from "@/hooks/use-bot";
import { format } from "date-fns";
import { Terminal, Download, Pause, Play } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LiveLogs() {
  const { data: logs } = useBotLogs();
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-6 animate-enter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">System Logs</h1>
          <p className="text-muted-foreground mt-1">Real-time stream of backend events.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors font-medium text-sm"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? "Resume" : "Pause Stream"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm shadow-lg shadow-primary/25">
            <Download className="w-4 h-4" />
            Export Log
          </button>
        </div>
      </div>

      <div className="flex-1 bg-black/80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col backdrop-blur-md">
        <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            <span>amina-core-service</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 font-mono text-sm space-y-1">
          {logs?.map((log, idx) => (
            <div key={idx} className="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors group">
              <span className="text-muted-foreground/50 select-none w-8 text-right">{idx + 1}</span>
              <span className="text-blue-400/80 min-w-[150px]">
                {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss.SSS")}
              </span>
              <span className={cn(
                "font-bold min-w-[60px]",
                log.level === "INFO" ? "text-green-400" :
                log.level === "WARN" ? "text-yellow-400" :
                log.level === "ERROR" ? "text-red-400" : "text-gray-400"
              )}>
                {log.level}
              </span>
              <span className="text-gray-300 group-hover:text-white transition-colors">{log.message}</span>
            </div>
          ))}
          {!logs?.length && (
            <div className="text-muted-foreground/50 italic p-4">Waiting for logs...</div>
          )}
        </div>
      </div>
    </div>
  );
}
