const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://hdqbmuwrgdisryonsmkh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkcWJtdXdyZ2Rpc3J5b25zbWtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzIxMzkzMCwiZXhwIjoyMDM4Nzg5OTMwfQ.RzV5hOsw1GezB04i6t2fDq6g-3n0aE0sU_F5s52J91Q');

const gamesData = [
  {
    id: 3, // Fotosintesis
    game_type: "sequence",
    game_data: {
      sequence: [
        { "id": Date.now() + 1, "content": "Akar tumbuhan menyerap air dari dalam tanah." },
        { "id": Date.now() + 2, "content": "Daun menyerap Karbon Dioksida (CO2) dari udara melalui stomata." },
        { "id": Date.now() + 3, "content": "Klorofil pada daun menangkap energi dari cahaya matahari." },
        { "id": Date.now() + 4, "content": "Tumbuhan menggunakan energi untuk mengubah air dan Karbon Dioksida menjadi glukosa (makanan)." },
        { "id": Date.now() + 5, "content": "Tumbuhan melepaskan Oksigen (O2) ke udara untuk kita bernapas." }
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

async function main() {
  for (const game of gamesData) {
    const { error } = await supabase
      .from('materials')
      .update({
        game_type: game.game_type,
        game_data: game.game_data
      })
      .eq('id', game.id);
      
    if (error) {
      console.error('Error updating ID ' + game.id + ':', error);
    } else {
      console.log('Successfully updated ID ' + game.id + ' (' + game.game_type + ')');
    }
  }
}

main();
