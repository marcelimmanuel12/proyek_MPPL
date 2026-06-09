import { Heart, Activity, Candy, Sparkles } from "lucide-react";
import { getBloodPressureRange, getAgeCategory, getSugarRecommendation } from "@/lib/age-health-info";

export function AgeHealthInfo({ age }: { age: number }) {
  if (!age || age < 1 || age > 120) return null;
  const bp = getBloodPressureRange(age);
  const cat = getAgeCategory(age);
  const sugar = getSugarRecommendation(age);

  return (
    <div className="rounded-xl border bg-gradient-to-br from-teal/5 to-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-teal" />
        <p className="text-sm font-semibold">Info kesehatan untuk usia {age} tahun</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-card border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span>Tekanan darah normal</span>
          </div>
          <p className="text-lg font-bold leading-tight">{bp.systolic}<span className="text-xs font-normal text-muted-foreground"> / </span>{bp.diastolic}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">mmHg · {bp.label}</p>
        </div>

        <div className={`rounded-lg border p-3 ${cat.productive ? "bg-teal/10 border-teal/30" : "bg-card"}`}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Activity className="h-3.5 w-3.5 text-teal" />
            <span>Kategori usia</span>
          </div>
          <p className="text-sm font-bold leading-tight">{cat.label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{cat.info}</p>
        </div>

        <div className="rounded-lg bg-card border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Candy className="h-3.5 w-3.5 text-amber-500" />
            <span>Batas gula harian</span>
          </div>
          <p className="text-lg font-bold leading-tight">{sugar.maxGrams} g <span className="text-xs font-normal text-muted-foreground">/ ≈{sugar.teaspoons} sdt</span></p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{sugar.note}</p>
        </div>
      </div>
    </div>
  );
}
