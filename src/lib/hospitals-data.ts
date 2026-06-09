// Daftar rumah sakit utama di Indonesia (kurasi manual, koordinat aproksimasi).
// Dipakai untuk fitur peta + rekomendasi terdekat tanpa dependensi pihak ketiga.

export type Hospital = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
};

export const HOSPITALS: Hospital[] = [
  { id: "rscm", name: "RSUPN Dr. Cipto Mangunkusumo", city: "Jakarta", address: "Jl. Diponegoro No.71, Jakarta Pusat", phone: "(021) 1500135", hours: "24 jam", lat: -6.1864, lng: 106.8378 },
  { id: "rspad", name: "RSPAD Gatot Soebroto", city: "Jakarta", address: "Jl. Abdul Rahman Saleh No.24, Jakarta Pusat", phone: "(021) 3441008", hours: "24 jam", lat: -6.1739, lng: 106.8364 },
  { id: "rshs", name: "RSUP Dr. Hasan Sadikin", city: "Bandung", address: "Jl. Pasteur No.38, Bandung", phone: "(022) 2034953", hours: "24 jam", lat: -6.8965, lng: 107.5994 },
  { id: "rsuds", name: "RSUP Dr. Sardjito", city: "Yogyakarta", address: "Jl. Kesehatan No.1, Sleman, DIY", phone: "(0274) 587333", hours: "24 jam", lat: -7.7708, lng: 110.3744 },
  { id: "rsudsoeto", name: "RSUD Dr. Soetomo", city: "Surabaya", address: "Jl. Mayjen Prof. Dr. Moestopo No.6-8, Surabaya", phone: "(031) 5501011", hours: "24 jam", lat: -7.2664, lng: 112.7587 },
  { id: "rssanglah", name: "RSUP Sanglah", city: "Denpasar", address: "Jl. Diponegoro, Dauh Puri Klod, Denpasar", phone: "(0361) 227911", hours: "24 jam", lat: -8.6800, lng: 115.2178 },
  { id: "rsadam", name: "RSUP H. Adam Malik", city: "Medan", address: "Jl. Bunga Lau No.17, Medan Tuntungan", phone: "(061) 8360381", hours: "24 jam", lat: 3.5547, lng: 98.6342 },
  { id: "rsw", name: "RSUP Dr. Mohammad Hoesin", city: "Palembang", address: "Jl. Jenderal Sudirman KM 3.5, Palembang", phone: "(0711) 354088", hours: "24 jam", lat: -2.9707, lng: 104.7388 },
  { id: "rswahidin", name: "RSUP Dr. Wahidin Sudirohusodo", city: "Makassar", address: "Jl. Perintis Kemerdekaan KM 11, Makassar", phone: "(0411) 584677", hours: "24 jam", lat: -5.1370, lng: 119.4870 },
  { id: "rskaria", name: "RSUP Prof. Dr. R.D. Kandou", city: "Manado", address: "Jl. Raya Tanawangko, Malalayang, Manado", phone: "(0431) 838203", hours: "24 jam", lat: 1.4470, lng: 124.7942 },
  { id: "siloamtb", name: "Siloam Hospitals TB Simatupang", city: "Jakarta", address: "Jl. RA Kartini Kav.8, Jakarta Selatan", phone: "(021) 29531900", hours: "24 jam", lat: -6.2929, lng: 106.7986 },
  { id: "mitrakemayoran", name: "Mitra Keluarga Kemayoran", city: "Jakarta", address: "Jl. HBR. Motik (Landas Pacu Timur), Jakarta Pusat", phone: "(021) 6545555", hours: "24 jam", lat: -6.1556, lng: 106.8528 },
];

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
