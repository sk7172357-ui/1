import { useHumanHandovers, useUpdateHumanMode } from "@/hooks/use-bot";
import { User, MessageSquare, AlertCircle, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Handovers() {
  const { data: users, isLoading } = useHumanHandovers();
  const updateMode = useUpdateHumanMode();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  // Mock chat for visual demo since backend might not have messages yet
  const mockChat = [
    { role: 'user', content: 'I need to speak to a real person please.' },
    { role: 'assistant', content: 'I understand. I have flagged this conversation for a human agent.' },
    { role: 'user', content: 'Thanks, the bot answers aren\'t helping with my refund.' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-6 animate-enter">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Human Handover</h1>
        <p className="text-muted-foreground mt-1">Conversations flagged for human intervention.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* User List */}
        <div className="col-span-4 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-muted/30">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Queue ({users?.length || 0})</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading queue...</div>
            ) : users?.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <User className="w-6 h-6" />
                </div>
                <p className="text-muted-foreground">All caught up! No active handovers.</p>
              </div>
            ) : (
              users?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={cn(
                    "w-full p-4 flex items-center gap-3 border-b border-border/30 hover:bg-muted/50 transition-colors text-left",
                    selectedUser === user.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.firstName?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username || "unknown"}
                    </p>
                  </div>
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                </button>
              ))
            )}
            
            {/* Visual Placeholder if empty for demo */}
            {!users?.length && !isLoading && (
              <div className="opacity-40 pointer-events-none p-4">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="text-center text-xs mt-2">Example Placeholder</div>
              </div>
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className="col-span-8 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col overflow-hidden relative">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Conversation #{selectedUser}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-xs text-orange-500 font-medium">Needs Attention</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                       updateMode.mutate({ userId: selectedUser, isHumanMode: false });
                       setSelectedUser(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-black/20">
                {mockChat.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex gap-4 max-w-[80%]",
                    msg.role === 'assistant' ? "ml-auto flex-row-reverse" : ""
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === 'assistant' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {msg.role === 'assistant' ? <BotIcon /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.role === 'assistant' 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-card border border-border rounded-tl-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Area */}
              <div className="p-4 border-t border-border/50 bg-card">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Type a reply..."
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button className="px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a conversation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BotIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4Z" fill="currentColor" fillOpacity="0.2"/>
      <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8Z" fill="currentColor"/>
    </svg>
  );
}
