"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Email atau password salah");
        return;
      }
      toast.success("Berhasil masuk!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setBusy(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal membuat akun");
        return;
      }
      toast.success("Akun berhasil dibuat! Silakan masuk.");
      // Auto-login after register
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Gagal terhubung ke server");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex relative gradient-hero text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="font-display text-xl font-bold">SehatKu</span>
        </Link>

        <div className="relative space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            Kesehatan adalah <br />investasi terbaik.
          </h2>
          <p className="text-white/80 max-w-md">
            AI personal yang memantau, mengingatkan, dan menemanimu menuju
            hidup yang lebih sehat.
          </p>
          <div className="flex flex-col gap-2 pt-4 text-sm text-white/70">
            <span>✓ Monitoring kesehatan harian</span>
            <span>✓ Konsultasi AI 24/7</span>
            <span>✓ Pengingat obat & check-up</span>
            <span>✓ Forum komunitas kesehatan</span>
          </div>
        </div>

        <p className="relative text-sm text-white/50">© 2026 SehatKu</p>
      </div>

      {/* ── Right auth panel ── */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl gradient-teal grid place-items-center">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-bold">SehatKu</span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground">Selamat datang</h1>
          <p className="mt-2 text-muted-foreground">
            Masuk atau buat akun untuk mulai memantau kesehatanmu.
          </p>

          <Tabs defaultValue="signin" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            {/* ── Sign In ── */}
            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="email@contoh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full gradient-hero text-white h-11"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ── Sign Up ── */}
            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nama Lengkap</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      required
                      autoComplete="name"
                      placeholder="Nama kamu"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="email@contoh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Min. 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full gradient-hero text-white h-11"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Buat Akun"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Dengan mendaftar, kamu menyetujui penggunaan data untuk
                  keperluan monitoring kesehatan.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
