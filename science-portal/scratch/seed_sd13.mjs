import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const modules = [
  {
    id: 1,
    title: "Mengenal Panca Indra Kita",
    description: "Mari belajar tentang mata, hidung, telinga, lidah, dan kulit kita!",
    target_audience: "sd_1_3",
    theory: `
      <h1>Mengenal Panca Indra Kita 🖐️👀👃👅👂</h1>
      <p>Manusia memiliki 5 alat luar biasa yang disebut <strong>Panca Indra</strong>. Mereka membantu kita merasakan dunia di sekitar kita!</p>
      
      <h3>1. Mata (Indra Penglihatan) 👀</h3>
      <p>Mata membantu kita <strong>melihat</strong> keindahan warna, cahaya, dan teman-teman kita. Tanpa cahaya, mata kita tidak bisa melihat dengan jelas.</p>
      
      <h3>2. Hidung (Indra Penciuman) 👃</h3>
      <p>Hidung membantu kita <strong>mencium</strong> bau wangi bunga atau bau sedap masakan ibu!</p>
      
      <h3>3. Telinga (Indra Pendengaran) 👂</h3>
      <p>Telinga digunakan untuk <strong>mendengar</strong> musik, suara burung, dan lagu kesukaanmu.</p>
      
      <h3>4. Lidah (Indra Pengecap) 👅</h3>
      <p>Lidah berguna untuk <strong>merasakan</strong> makanan. Ada rasa manis, asam, asin, dan pahit.</p>
      
      <h3>5. Kulit (Indra Peraba) 🖐️</h3>
      <p>Kulit membantu kita <strong>merasakan</strong> panas, dingin, halus, dan kasar.</p>
      
      <p>Semua indra sangat penting, jadi kita harus rajin menjaganya agar tetap bersih dan sehat!</p>
    `,
    game_type: "sensor_match",
    game_data: {
      sensor_match: [
        { left: "Mata (Penglihatan)", right: "Pelangi" },
        { left: "Hidung (Penciuman)", right: "Bunga Mawar" },
        { left: "Telinga (Pendengaran)", right: "Musik" },
        { left: "Lidah (Pengecap)", right: "Es Krim" },
        { left: "Kulit (Peraba)", right: "Bulu Kucing" }
      ]
    },
    is_published: true
  },
  {
    id: 2,
    title: "Hewan dan Tempat Tinggalnya",
    description: "Ada hewan yang hidup di darat, dan ada yang hidup di air. Ayo pelajari!",
    target_audience: "sd_1_3",
    theory: `
      <h1>Hewan dan Tempat Tinggalnya 🐘🐟</h1>
      <p>Sama seperti manusia yang tinggal di rumah, hewan juga memiliki tempat tinggal khusus yang disebut <strong>Habitat</strong>.</p>
      
      <h3>1. Hewan Darat 🐅🌲</h3>
      <p>Hewan darat adalah hewan yang menghabiskan sebagian besar waktunya di daratan (tanah, pohon, atau padang rumput). Hewan darat berjalan menggunakan kaki atau melata.</p>
      <ul>
        <li><strong>Contoh:</strong> Kucing, Anjing, Sapi, Singa, dan Semut.</li>
      </ul>
      
      <h3>2. Hewan Air 🐠🌊</h3>
      <p>Hewan air hidup di dalam air (sungai, danau, atau laut). Mereka bernapas menggunakan alat khusus seperti insang dan berenang menggunakan sirip.</p>
      <ul>
        <li><strong>Contoh:</strong> Ikan, Gurita, Hiu, dan Bintang Laut.</li>
      </ul>
      
      <h3>Tahukah Kamu? 🐸</h3>
      <p>Ada juga hewan yang bisa hidup di darat <strong>DAN</strong> di air! Hewan ini disebut <strong>Amfibi</strong>, contohnya adalah Katak.</p>
    `,
    game_type: "dynamic_match",
    game_data: {
      dynamic_match: {
        categories: [
          { id: "darat", label: "Hewan Darat", icon: "🐅", color: "bg-green-500" },
          { id: "air", label: "Hewan Air", icon: "🐟", color: "bg-blue-500" }
        ],
        items: [
          { id: "h1", label: "Kucing", icon: "🐈", categoryId: "darat" },
          { id: "h2", label: "Ikan Hiu", icon: "🦈", categoryId: "air" },
          { id: "h3", label: "Kuda", icon: "🐎", categoryId: "darat" },
          { id: "h4", label: "Lumba-lumba", icon: "🐬", categoryId: "air" },
          { id: "h5", label: "Gajah", icon: "🐘", categoryId: "darat" },
          { id: "h6", label: "Gurita", icon: "🐙", categoryId: "air" }
        ]
      }
    },
    is_published: true
  },
  {
    id: 6,
    title: "Mengenal Cuaca",
    description: "Ada cuaca cerah, hujan, berawan... Ayo belajar bersiap menghadapi cuaca!",
    target_audience: "sd_1_3",
    theory: `
      <h1>Mengenal Cuaca di Sekitar Kita ☀️🌧️</h1>
      <p>Cuaca adalah keadaan udara di tempat kita berada. Cuaca bisa berubah-ubah setiap hari!</p>
      
      <h3>1. Cuaca Cerah ☀️</h3>
      <p>Matahari bersinar terang dan awan sedikit. Udara terasa lebih hangat. Ini waktu yang tepat untuk bermain di luar atau menjemur pakaian!</p>
      
      <h3>2. Cuaca Berawan ⛅</h3>
      <p>Langit dipenuhi oleh awan tebal. Matahari tertutup awan sehingga udara terasa lebih sejuk dan tidak terlalu panas.</p>
      
      <h3>3. Cuaca Hujan 🌧️</h3>
      <p>Awan menjadi sangat gelap (mendung) dan titik-titik air jatuh dari langit. Udara terasa dingin. Jangan lupa bawa payung atau jas hujan jika keluar rumah!</p>
      
      <h3>4. Cuaca Berangin 💨</h3>
      <p>Angin bertiup kencang, daun-daun berguguran. Hati-hati saat bermain layang-layang ya!</p>
    `,
    game_type: "visual_quiz",
    game_data: {
      visual_quiz: [
        {
          question: "Cuaca hari ini sangat cerah (☀️). Barang apa yang paling tepat kita pakai agar tidak kepanasan?",
          image_url: null,
          options: ["Topi", "Payung", "Jas Hujan", "Selimut Tebal"],
          correct_answer: "Topi",
          explanation: "Saat cuaca cerah dan terik, topi membantu melindungi kepala kita dari panasnya sinar matahari."
        },
        {
          question: "Langit terlihat gelap dan air mulai turun (🌧️). Benda apa yang harus kita bawa saat keluar rumah?",
          image_url: null,
          options: ["Payung", "Kacamata Hitam", "Kipas Angin", "Mainan"],
          correct_answer: "Payung",
          explanation: "Payung dan jas hujan sangat penting untuk melindungi tubuh kita dari air hujan agar tidak sakit."
        },
        {
          question: "Angin bertiup sangat kencang (💨). Permainan apa yang paling seru dimainkan saat cuaca seperti ini?",
          image_url: null,
          options: ["Layang-layang", "Berenang", "Lompat Tali", "Bermain Catur"],
          correct_answer: "Layang-layang",
          explanation: "Layang-layang membutuhkan tenaga angin agar bisa terbang tinggi ke udara."
        }
      ]
    },
    is_published: true
  }
];

async function seedData() {
  for (const mod of modules) {
    const { data: existing, error: findError } = await supabase
      .from('materials')
      .select('id')
      .eq('id', mod.id)
      .single();
    
    if (existing) {
      console.log("Updating Module ID " + mod.id + "...");
      const { error } = await supabase
        .from('materials')
        .update(mod)
        .eq('id', mod.id);
      if (error) console.error("Error updating Module ID " + mod.id + ":", error.message);
      else console.log("Successfully updated Module ID " + mod.id);
    } else {
      console.log("Inserting Module ID " + mod.id + "...");
      const { error } = await supabase
        .from('materials')
        .insert(mod);
      if (error) console.error("Error inserting Module ID " + mod.id + ":", error.message);
      else console.log("Successfully inserted Module ID " + mod.id);
    }
  }
}

seedData().then(() => console.log("Done seeding SD 1-3!"));
