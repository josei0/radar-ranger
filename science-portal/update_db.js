const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://hdqbmuwrgdisryonsmkh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkcWJtdXdyZ2Rpc3J5b25zbWtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzIxMzkzMCwiZXhwIjoyMDM4Nzg5OTMwfQ.RzV5hOsw1GezB04i6t2fDq6g-3n0aE0sU_F5s52J91Q');

const theoryMarkdown = `
# Mengenal Panca Indra Kita 🖐️👀👃👅👂

Tubuh manusia itu sangat luar biasa! Kita memiliki **5 alat khusus** yang disebut sebagai **Panca Indra**. Panca indra membantu kita untuk mengetahui apa yang terjadi di sekitar kita. 

Tanpa panca indra, kita tidak akan bisa melihat indahnya pelangi, mendengarkan musik favorit, atau merasakan lezatnya es krim!

Mari kita pelajari satu per satu:

---

## 1. Mata (Indra Penglihat) 👀
Mata kita bekerja seperti kamera ajaib. Dengan mata, kita bisa **melihat** warna, cahaya, bentuk, dan ukuran benda. 
- **Fungsi:** Melihat indahnya pemandangan, membaca buku, dan menonton kartun kesukaanmu!

## 2. Telinga (Indra Pendengar) 👂
Pernahkah kamu mendengar suara burung berkicau atau suara petir yang keras? Itu semua berkat telinga kita!
- **Fungsi:** Mendengarkan suara, musik, ucapan orang tua, dan mendeteksi bahaya (seperti klakson mobil).

## 3. Hidung (Indra Pencium) 👃
Coba tarik napas dalam-dalam. Apakah ada wangi bunga atau bau masakan ibu di dapur? Hidung kita membantu kita mencium aroma.
- **Fungsi:** Mencium wangi parfum, bau tidak sedap (seperti sampah agar kita menjauh), dan mengenali bau makanan.

## 4. Lidah (Indra Pengecap) 👅
Di permukaan lidah kita ada bintik-bintik kecil yang hebat. Mereka bisa mendeteksi rasa manis, asam, asin, dan pahit!
- **Fungsi:** Merasakan manisnya cokelat, asinnya garam, atau asamnya jeruk. Yummy!

## 5. Kulit (Indra Peraba) ✋
Kulit membungkus seluruh tubuh kita dari kepala sampai kaki. Dengan kulit, kita bisa merasakan apakah benda itu kasar, halus, panas, atau dingin.
- **Fungsi:** Merasakan lembutnya bulu kucing, panasnya api, dan dinginnya es.

---

### Siap untuk Ujian?
Setelah kamu mengerti fungsi dari kelima indra ini, klik tombol **"I Understand! Let's Play"** di bawah ini untuk memulai permainan tebak indra!
`;

async function updateMaterial() {
  const { data, error } = await supabase
    .from('materials')
    .update({ 
      theory_content: theoryMarkdown,
      game_type: 'sensor_match'
    })
    .eq('id', 1);

  if (error) {
    console.error('Error updating material:', error);
  } else {
    console.log('Successfully updated material!');
  }
}

updateMaterial();
