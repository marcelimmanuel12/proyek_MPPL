// Edukasi kesehatan otomatis berdasar usia (semua data sumber Kemenkes RI / WHO)

export type BloodPressureRange = {
  label: string;
  systolic: string;
  diastolic: string;
};

export function getBloodPressureRange(age: number): BloodPressureRange {
  if (age < 6) return { label: "Anak (1–5 tahun)", systolic: "80–110", diastolic: "55–75" };
  if (age < 13) return { label: "Anak (6–12 tahun)", systolic: "90–120", diastolic: "60–80" };
  if (age < 18) return { label: "Remaja (13–17 tahun)", systolic: "100–125", diastolic: "65–85" };
  if (age < 60) return { label: "Dewasa (18–59 tahun)", systolic: "90–120", diastolic: "60–80" };
  return { label: "Lansia (60+ tahun)", systolic: "≤140", diastolic: "≤90" };
}

export type AgeCategory = {
  productive: boolean;
  label: string;
  info: string;
};

export function getAgeCategory(age: number): AgeCategory {
  if (age < 15) {
    return {
      productive: false,
      label: "Pra-produktif",
      info: "Usia 0–14 tahun. Belum masuk usia produktif. Fokus pada tumbuh kembang dan pendidikan.",
    };
  }
  if (age <= 64) {
    return {
      productive: true,
      label: "Usia Produktif ✨",
      info: "Usia produktif Indonesia: 15–64 tahun. Kamu bagian dari bonus demografi Indonesia menuju Indonesia Emas 2045 — manfaatkan dengan jaga kesehatan, pendidikan, dan produktivitas.",
    };
  }
  return {
    productive: false,
    label: "Pasca-produktif (Lansia)",
    info: "Usia 65+ tahun. Fokus pada kualitas hidup, kontrol penyakit kronis, dan aktivitas yang menjaga kebugaran.",
  };
}

export type SugarRecommendation = {
  maxGrams: number;
  teaspoons: number;
  note: string;
};

export function getSugarRecommendation(age: number): SugarRecommendation {
  // Kemenkes RI: maksimal 50 g (4 sdm) gula tambahan/hari untuk dewasa.
  // WHO: idealnya <25 g/hari (5%) untuk dewasa, lebih rendah untuk anak.
  if (age < 4) return { maxGrams: 15, teaspoons: 3, note: "Maksimal 15 g/hari (3 sdt). Hindari minuman manis tambahan." };
  if (age < 13) return { maxGrams: 20, teaspoons: 4, note: "Maksimal 20 g/hari (4 sdt). Pilih buah segar daripada permen." };
  if (age < 18) return { maxGrams: 25, teaspoons: 5, note: "Maksimal 25 g/hari (5 sdt). Kurangi minuman bersoda & kemasan." };
  if (age < 60) return { maxGrams: 50, teaspoons: 10, note: "Maksimal 50 g/hari (4 sdm) — Kemenkes RI. WHO menyarankan <25 g untuk lebih sehat." };
  return { maxGrams: 40, teaspoons: 8, note: "Maksimal 40 g/hari (≈8 sdt). Lansia perlu lebih ketat untuk cegah diabetes." };
}
