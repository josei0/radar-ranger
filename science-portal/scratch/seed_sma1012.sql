-- Script to upsert learning modules for SMA 10-12 (Physics Only)

-- 7. Teori Atom & Radioaktivitas
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  7, 
  'Teori Atom & Radioaktivitas', 
  'Pelajari sejarah perkembangan model atom dan misteri di balik radioaktivitas inti.', 
  'sma_10_12', 
  true,
  1,
  '<h1>Teori Atom & Radioaktivitas ⚛️</h1>
<p>Segala sesuatu di alam semesta tersusun atas partikel sangat kecil yang disebut <strong>Atom</strong>. Konsep atom telah berkembang pesat berkat para fisikawan hebat!</p>

<h3>1. Perkembangan Model Atom</h3>
<ul>
  <li><strong>John Dalton:</strong> Atom berbentuk seperti bola pejal tak terbagi.</li>
  <li><strong>J.J. Thomson:</strong> Menemukan elektron. Modelnya seperti roti kismis (elektron tersebar di muatan positif).</li>
  <li><strong>Ernest Rutherford:</strong> Menemukan inti atom (nukleus). Elektron mengelilingi inti seperti tata surya, dengan sebagian besar ruang atom adalah hampa.</li>
  <li><strong>Niels Bohr:</strong> Elektron mengelilingi inti pada lintasan atau orbit tertentu tingkat energinya (kulit atom).</li>
  <li><strong>Mekanika Kuantum:</strong> Elektron berada dalam awan probabilitas (orbital), tidak pada lintasan pasti.</li>
</ul>

<h3>2. Radioaktivitas ☢️</h3>
<p>Inti atom yang tidak stabil akan meluruh memancarkan radiasi untuk mencapai kestabilan. Tiga jenis sinar radioaktif utama adalah <strong>Sinar Alfa (α)</strong> (positif, daya tembus lemah), <strong>Sinar Beta (β)</strong> (negatif, elektron cepat), dan <strong>Sinar Gamma (γ)</strong> (gelombang elektromagnetik murni, daya tembus sangat kuat).</p>',
  'teori-atom',
  'sequence',
  70,
  15,
  35,
  70,
  'Fisikawan Kuantum',
  '{
    "sequence": [
      { "id": "a1", "content": "Model Atom Bola Pejal (Dalton)" },
      { "id": "a2", "content": "Model Roti Kismis (Thomson)" },
      { "id": "a3", "content": "Penemuan Inti Atom (Rutherford)" },
      { "id": "a4", "content": "Model Tingkat Energi/Kulit (Bohr)" },
      { "id": "a5", "content": "Awan Probabilitas/Orbital (Mekanika Kuantum)" }
    ]
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Ilmuwan manakah yang pertama kali menyatakan bahwa atom memiliki inti padat bermuatan positif di tengahnya?",
        "options": ["John Dalton", "J.J. Thomson", "Ernest Rutherford", "Niels Bohr"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      },
      {
        "question": "Sinar radioaktif manakah yang memiliki daya tembus paling kuat?",
        "options": ["Sinar Alfa", "Sinar Beta", "Sinar Gamma", "Sinar X"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      },
      {
        "question": "Pada model atom Bohr, di manakah letak elektron?",
        "options": ["Di dalam inti bersama proton", "Tersebar acak seperti roti kismis", "Mengorbit pada lintasan tingkat energi tertentu", "Sebagai awan probabilitas"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published,
  topic_order = EXCLUDED.topic_order,
  theory_content = EXCLUDED.theory_content,
  game_slug = EXCLUDED.game_slug,
  game_type = EXCLUDED.game_type,
  kkm_score = EXCLUDED.kkm_score,
  xp_theory = EXCLUDED.xp_theory,
  xp_pass = EXCLUDED.xp_pass,
  xp_perfect = EXCLUDED.xp_perfect,
  badge_name = EXCLUDED.badge_name,
  game_data = EXCLUDED.game_data,
  quiz_data = EXCLUDED.quiz_data;


-- 8. Hukum Newton & Gaya
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  8, 
  'Hukum Newton & Gaya', 
  'Pahami tiga hukum gerak dasar Isaac Newton yang menjadi pondasi mekanika klasik.', 
  'sma_10_12', 
  true, 
  2,
  '<h1>Hukum Gerak Newton 🍎</h1>
<p>Isaac Newton merumuskan tiga hukum fisika yang mendeskripsikan hubungan antara benda dan gaya yang bekerja padanya.</p>

<h3>Hukum I Newton (Kelembaman/Inersia)</h3>
<p><em>"Benda yang diam akan tetap diam, dan benda yang bergerak lurus beraturan akan tetap bergerak lurus beraturan kecuali jika ada gaya luar yang bekerja padanya."</em><br/>
Contoh: Tubuh kita terdorong ke depan saat mobil yang melaju direm mendadak.</p>

<h3>Hukum II Newton (F = m.a)</h3>
<p><em>"Percepatan sebuah benda sebanding dengan gaya total yang bekerja padanya dan berbanding terbalik dengan massanya."</em><br/>
Semakin besar massa (m), semakin besar pula gaya (F) yang dibutuhkan untuk membuatnya berakselerasi (a).</p>

<h3>Hukum III Newton (Aksi - Reaksi)</h3>
<p><em>"Untuk setiap aksi, selalu ada reaksi yang sama besar dan berlawanan arah."</em><br/>
Contoh: Saat roket menyemburkan gas ke bawah (aksi), gas memberikan gaya dorong ke atas yang membuat roket meluncur (reaksi).</p>',
  'hukum-newton',
  'dynamic_match',
  70,
  15,
  35,
  70,
  'Ahli Mekanika',
  '{
    "dynamic_match": {
      "pairs": [
        {
          "category": "Hukum I (Inersia)",
          "items": ["Terdorong ke depan saat direm", "Gelas di atas taplak meja tidak jatuh saat ditarik cepat"]
        },
        {
          "category": "Hukum II (F = m.a)",
          "items": ["Mendorong truk butuh tenaga lebih besar dari mobil", "Benda jatuh bebas dengan percepatan gravitasi"]
        },
        {
          "category": "Hukum III (Aksi-Reaksi)",
          "items": ["Roket meluncur ke angkasa", "Berjalan di lantai (kaki dorong ke belakang, tubuh maju)"]
        }
      ]
    }
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Hukum Newton manakah yang dapat menjelaskan mengapa roket bisa meluncur ke luar angkasa?",
        "options": ["Hukum I Newton", "Hukum II Newton", "Hukum III Newton", "Hukum Gravitasi Universal"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      },
      {
        "question": "Jika sebuah benda diberikan gaya yang sama, apa yang terjadi pada percepatannya jika massa benda tersebut diperbesar?",
        "options": ["Percepatan bertambah", "Percepatan berkurang", "Percepatan tetap", "Percepatan menjadi nol"],
        "correctAnswerIndex": 1,
        "timeLimit": 20
      },
      {
        "question": "Konsep Inersia (kelembaman) paling tepat direpresentasikan oleh...",
        "options": ["Hukum I Newton", "Hukum II Newton", "Hukum III Newton", "Gaya Gesek"],
        "correctAnswerIndex": 0,
        "timeLimit": 20
      }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published,
  topic_order = EXCLUDED.topic_order,
  theory_content = EXCLUDED.theory_content,
  game_slug = EXCLUDED.game_slug,
  game_type = EXCLUDED.game_type,
  kkm_score = EXCLUDED.kkm_score,
  xp_theory = EXCLUDED.xp_theory,
  xp_pass = EXCLUDED.xp_pass,
  xp_perfect = EXCLUDED.xp_perfect,
  badge_name = EXCLUDED.badge_name,
  game_data = EXCLUDED.game_data,
  quiz_data = EXCLUDED.quiz_data;


-- 9. Gelombang Elektromagnetik
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  9, 
  'Gelombang Elektromagnetik', 
  'Jelajahi spektrum gelombang elektromagnetik dari gelombang radio hingga sinar Gamma!', 
  'sma_10_12', 
  true, 
  3,
  '<h1>Gelombang Elektromagnetik 📡🌈</h1>
<p>Gelombang Elektromagnetik adalah gelombang yang dapat merambat melalui ruang hampa (tanpa medium) karena terdiri dari osilasi medan listrik dan medan magnet.</p>

<h3>Spektrum Elektromagnetik (Dari energi terendah ke tertinggi)</h3>
<ol>
  <li><strong>Gelombang Radio:</strong> Frekuensi terendah, digunakan untuk komunikasi TV dan radio.</li>
  <li><strong>Gelombang Mikro (Microwave):</strong> Digunakan pada oven microwave, WiFi, dan radar kapal.</li>
  <li><strong>Sinar Inframerah:</strong> Dihasilkan oleh benda panas, digunakan pada *remote control* dan *night vision*.</li>
  <li><strong>Cahaya Tampak:</strong> Gelombang yang bisa dilihat mata manusia (Merah, Jingga, Kuning, Hijau, Biru, Nila, Ungu).</li>
  <li><strong>Sinar Ultraviolet (UV):</strong> Berasal dari matahari, dapat membunuh bakteri tetapi berlebihan menyebabkan kanker kulit.</li>
  <li><strong>Sinar-X:</strong> Daya tembus kuat, digunakan di bidang medis (rontgen tulang).</li>
  <li><strong>Sinar Gamma:</strong> Energi tertinggi, daya tembus sangat kuat, dihasilkan dari reaksi nuklir, dipakai mensterilkan alat medis.</li>
</ol>',
  'gelombang-elektromagnetik',
  'true_false',
  70,
  15,
  35,
  70,
  'Penjelajah Gelombang',
  '{
    "true_false": [
      { "statement": "Gelombang Elektromagnetik tidak membutuhkan medium (seperti udara atau air) untuk merambat.", "isCorrect": true },
      { "statement": "Sinar-X memiliki energi yang lebih rendah daripada cahaya tampak.", "isCorrect": false },
      { "statement": "Remote control televisi memanfaatkan sinar Inframerah.", "isCorrect": true },
      { "statement": "Gelombang mikro (Microwave) selain digunakan untuk memasak juga digunakan untuk radar dan komunikasi satelit.", "isCorrect": true },
      { "statement": "Sinar Gamma memiliki panjang gelombang paling panjang di seluruh spektrum.", "isCorrect": false },
      { "statement": "Cahaya warna Merah memiliki panjang gelombang lebih besar dari Ungu pada cahaya tampak.", "isCorrect": true }
    ]
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Gelombang elektromagnetik manakah yang memiliki frekuensi paling tinggi dan energi paling besar?",
        "options": ["Sinar-X", "Sinar Gamma", "Sinar Ultraviolet", "Cahaya Tampak"],
        "correctAnswerIndex": 1,
        "timeLimit": 20
      },
      {
        "question": "Aplikasi dari gelombang mikro (microwave) dalam kehidupan sehari-hari selain memanaskan makanan adalah...",
        "options": ["Rontgen tulang medis", "Membunuh bakteri di ruang operasi", "Radar dan koneksi WiFi", "Menjemur pakaian"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      },
      {
        "question": "Apakah ciri unik yang dimiliki seluruh Gelombang Elektromagnetik dibandingkan dengan Gelombang Mekanik (seperti bunyi)?",
        "options": ["Membutuhkan udara untuk merambat", "Hanya bisa merambat di dalam air", "Bisa merambat di ruang hampa (vakum)", "Selalu kasat mata"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published,
  topic_order = EXCLUDED.topic_order,
  theory_content = EXCLUDED.theory_content,
  game_slug = EXCLUDED.game_slug,
  game_type = EXCLUDED.game_type,
  kkm_score = EXCLUDED.kkm_score,
  xp_theory = EXCLUDED.xp_theory,
  xp_pass = EXCLUDED.xp_pass,
  xp_perfect = EXCLUDED.xp_perfect,
  badge_name = EXCLUDED.badge_name,
  game_data = EXCLUDED.game_data,
  quiz_data = EXCLUDED.quiz_data;
