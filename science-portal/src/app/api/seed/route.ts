import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const gamesData = [
  {
    id: 3, // Fotosintesis
    game_type: "sequence",
    game_data: {
      sequence: [
        { "id": "sq1", "content": "Akar tumbuhan menyerap air dari dalam tanah." },
        { "id": "sq2", "content": "Daun menyerap Karbon Dioksida (CO2) dari udara melalui stomata." },
        { "id": "sq3", "content": "Klorofil pada daun menangkap energi dari cahaya matahari." },
        { "id": "sq4", "content": "Tumbuhan menggunakan energi untuk mengubah air dan Karbon Dioksida menjadi glukosa (makanan)." },
        { "id": "sq5", "content": "Tumbuhan melepaskan Oksigen (O2) ke udara untuk kita bernapas." }
      ]
    }
  },
  {
    id: 4, // Tata Surya
    game_type: "sorting_bins",
    game_data: {
      sorting_bins: {
        bins: [
          { id: "b1", title: "Planet Terestrial (Berbatu & Dekat Matahari)" },
          { id: "b2", title: "Planet Raksasa (Gas & Es & Jauh dari Matahari)" }
        ],
        items: [
          { id: "i1", title: "Merkurius", correctBinId: "b1" },
          { id: "i2", title: "Venus", correctBinId: "b1" },
          { id: "i3", title: "Bumi", correctBinId: "b1" },
          { id: "i4", title: "Mars", correctBinId: "b1" },
          { id: "i5", title: "Yupiter", correctBinId: "b2" },
          { id: "i6", title: "Saturnus", correctBinId: "b2" },
          { id: "i7", title: "Uranus", correctBinId: "b2" },
          { id: "i8", title: "Neptunus", correctBinId: "b2" }
        ]
      }
    }
  },
  {
    id: 5, // Siklus Air
    game_type: "fill_blanks",
    game_data: {
      fill_blanks: [
        {
          sentence: "Air di laut dipanaskan oleh matahari dan berubah menjadi uap air yang naik ke langit. Proses ini disebut [BLANK].",
          answer: "Evaporasi",
          options: ["Kondensasi", "Infiltrasi"]
        },
        {
          sentence: "Uap air di langit kemudian mendingin dan berkumpul membentuk [BLANK].",
          answer: "Awan",
          options: ["Pelangi", "Bintang"]
        },
        {
          sentence: "Proses berkumpulnya uap air ini disebut [BLANK].",
          answer: "Kondensasi",
          options: ["Presipitasi", "Evaporasi"]
        },
        {
          sentence: "Ketika awan sudah terlalu berat, tetesan air jatuh ke bumi sebagai hujan atau salju, ini disebut [BLANK].",
          answer: "Presipitasi",
          options: ["Infiltrasi", "Evaporasi"]
        },
        {
          sentence: "Air hujan yang jatuh ke tanah akan meresap ke dalam melalui proses [BLANK].",
          answer: "Infiltrasi",
          options: ["Kondensasi", "Penguapan"]
        }
      ]
    }
  }
];

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // We are using the public key here. If RLS blocks it, we might need to tell the user to use the dashboard
  let results = [];
  
  for (const game of gamesData) {
    const { data, error } = await supabase
      .from('materials')
      .update({
        game_type: game.game_type,
        game_data: game.game_data
      })
      .eq('id', game.id)
      .select();
      
    if (error) {
      results.push({ id: game.id, error: error.message });
    } else {
      results.push({ id: game.id, status: "Success", data });
    }
  }

  return NextResponse.json({ results, gamesData });
}
