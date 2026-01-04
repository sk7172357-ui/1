import { useUpdateBotToken } from "@/hooks/use-bot";
import { useForm } from "react-hook-form";
import { Key, Save, Shield, Bot, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { register, handleSubmit, reset } = useForm<{ token: string }>();
  const updateToken = useUpdateBotToken();
  const [success, setSuccess] = useState(false);

  const onSubmit = (data: { token: string }) => {
    updateToken.mutate(data.token, {
      onSuccess: () => {
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-enter">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage bot connection and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Token Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden md:col-span-2">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Telegram Connection</h3>
                <p className="text-sm text-muted-foreground">Configure the connection to Telegram Bot API.</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" /> Bot API Token
                </label>
                <div className="relative group">
                  <input
                    {...register("token", { required: true })}
                    type="password"
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <div className="absolute right-3 top-3 text-xs text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                    Confidential
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtained from <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary hover:underline">@BotFather</a> on Telegram.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Restart required after changing token</span>
                </div>
                
                <button
                  type="submit"
                  disabled={updateToken.isPending}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg",
                    success 
                      ? "bg-green-500 text-white shadow-green-500/25" 
                      : "bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5",
                    updateToken.isPending && "opacity-70 cursor-wait"
                  )}
                >
                  {success ? (
                    <>Saved Successfully</>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {updateToken.isPending ? "Saving..." : "Save Configuration"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold">Security Note</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This token gives full control over your bot. Never share it with anyone. 
            If you suspect the token has been compromised, revoke it immediately via BotFather.
          </p>
        </div>

        {/* Webhook Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
          <h3 className="font-semibold mb-4">Webhook Status</h3>
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl mb-2">
            <span className="text-sm font-medium text-green-500">Active</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">
            Receiving updates via https webhook.
          </p>
        </div>
      </div>
    </div>
  );
}
