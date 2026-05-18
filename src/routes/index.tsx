import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart, Activity, Brain, Users, MapPin, Bell, Sparkles, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import heroImg from "@/assets/hero-health.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SehatKu — Monitoring Kesehatan Pribadi dengan AI" },
      { name: "description", content: "Pantau kesehatan harian, konsultasi gejala dengan AI, dan dapatkan rekomendasi pola hidup sehat." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  const features = [
    { icon: Activity, title: "Monitoring Berkelanjutan", desc: "Check-in kesehatan setiap 5 jam, dianalisis oleh AI." },
    { icon: Brain, title: "AI Konsultasi & Gejala", desc: "Tanya gejala, dapatkan analisis cepat dan rekomendasi." },
    { icon: Bell, title: "Pengingat Pintar", desc: "Obat, tidur, olahraga, dan check-up — tidak ada yang terlewat." },
    { icon: Sparkles, title: "Avatar Kesehatan", desc: "Visualisasi suasana kesehatan & progress mingguan." },
    { icon: Users, title: "Komunitas & Challenge", desc: "Forum kesehatan dan tantangan bersama." },
    { icon: MapPin, title: "Peta Rumah Sakit", desc: "Temukan layanan medis terdekat saat dibutuhkan." },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-teal grid place-items-center shadow-glow">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-bold">SehatKu</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link to="/login">
              <Button className="gradient-hero text-white shadow-elegant hover:opacity-95">Mulai Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-50">
          <div className="absolute top-20 -left-20 h-96 w-96 rounded-full bg-teal/30 blur-3xl" />
          <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-primary-glow/30 blur-3xl" />
        </div>
        <div className="container mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-teal" /> Didukung AI untuk kesehatan harianmu
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] pb-2">
              <span className="block text-foreground">Kesehatan kamu,</span>
              <span className="block bg-clip-text text-transparent gradient-hero pb-2">dipantau setiap hari.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Monitoring kesehatan berkelanjutan dengan AI. Catat, konsultasi, dan dapatkan rekomendasi pola hidup sehat — semua dalam satu tempat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/login">
                <Button size="lg" className="gradient-hero text-white shadow-elegant text-base h-12 px-8">
                  Mulai Pantau Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 justify-center lg:justify-start text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-teal" /> Data terenkripsi</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-teal" /> Check-in 5 jam</span>
              <span className="flex items-center gap-1.5"><Brain className="h-4 w-4 text-teal" /> AI 24/7</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 gradient-hero rounded-3xl blur-2xl opacity-30" />
            <img
              src={heroImg}
              alt="Ilustrasi kesehatan: meditasi dengan ikon kesehatan"
              width={1280}
              height={960}
              className="relative rounded-3xl shadow-elegant w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">Semua kebutuhan kesehatanmu</h2>
          <p className="mt-3 text-muted-foreground">Dari pengingat obat sampai analisis gejala — terhubung dalam satu dashboard personal.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group p-7 rounded-2xl border border-border bg-card shadow-card hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl gradient-teal grid place-items-center mb-5 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="rounded-3xl gradient-hero p-12 md:p-16 text-center shadow-elegant">
          <h2 className="text-3xl md:text-5xl font-bold text-white">Mulai perjalanan sehatmu hari ini.</h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">Gratis. AI akan memandumu sejak hari pertama.</p>
          <Link to="/login">
            <Button size="lg" className="mt-8 bg-white text-primary hover:bg-white/90 h-12 px-8 text-base">
              Buat Akun <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 SehatKu — Platform monitoring kesehatan personal.
      </footer>
    </main>
  );
}
