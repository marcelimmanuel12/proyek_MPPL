import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Masuk — SehatKu" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Berhasil masuk"); nav({ to: "/dashboard" }); }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Akun dibuat! Cek email untuk konfirmasi.");
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/dashboard` });
    if (res.error) { toast.error("Gagal masuk dengan Google"); setBusy(false); }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative gradient-hero text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-teal/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="font-display text-xl font-bold">SehatKu</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">Kesehatan adalah <br />investasi terbaik.</h2>
          <p className="mt-4 text-white/80 max-w-md">AI personal yang memantau, mengingatkan, dan menemanimu menuju hidup yang lebih sehat.</p>
        </div>
        <p className="relative text-sm text-white/60">© 2026 SehatKu</p>
      </div>

      {/* Right auth panel */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl gradient-teal grid place-items-center">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-bold">SehatKu</span>
          </Link>

          <h1 className="text-3xl font-bold">Selamat datang</h1>
          <p className="mt-2 text-muted-foreground">Masuk atau buat akun untuk mulai memantau kesehatanmu.</p>

          <Button onClick={google} disabled={busy} variant="outline" className="w-full mt-6 h-11">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Lanjut dengan Google
          </Button>

          <div className="relative my-6 text-center text-xs text-muted-foreground">
            <span className="bg-background px-3 relative z-10">atau dengan email</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border -z-0" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="e1">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="e1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="email@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p1">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="p1" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <Button type="submit" disabled={busy} className="w-full gradient-hero text-white h-11">Masuk</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="n2">Nama Lengkap</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="n2" required value={name} onChange={(e) => setName(e.target.value)} className="pl-9" placeholder="Nama kamu" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e2">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="e2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p2">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="p2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <Button type="submit" disabled={busy} className="w-full gradient-hero text-white h-11">Buat Akun</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
