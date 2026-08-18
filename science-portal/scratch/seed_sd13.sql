-- Script to upsert learning modules for SD 1-3

-- 1. Panca Indra
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  1, 
  'Mengenal Panca Indra Kita', 
  'Mari belajar tentang mata, hidung, telinga, lidah, dan kulit kita!', 
  'sd_1_3', 
  true,
  1,
  '<h1>Mengenal Panca Indra Kita 🖐️👀👃👅👂</h1>
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

<p>Semua indra sangat penting, jadi kita harus rajin menjaganya agar tetap bersih dan sehat!</p>',
  'panca-indra',
  'sensor_match',
  70,
  10,
  25,
  50,
  'Ahli Panca Indra',
  '{
    "sensor_match": [
      { "left": "Mata (Penglihatan)", "right": "Pelangi" },
      { "left": "Hidung (Penciuman)", "right": "Bunga Mawar" },
      { "left": "Telinga (Pendengaran)", "right": "Musik" },
      { "left": "Lidah (Pengecap)", "right": "Es Krim" },
      { "left": "Kulit (Peraba)", "right": "Bulu Kucing" }
    ]
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Indra apakah yang berfungsi untuk melihat indahnya pelangi?",
        "options": ["Mata", "Hidung", "Telinga", "Kulit"],
        "correctAnswerIndex": 0,
        "timeLimit": 15
      },
      {
        "question": "Saat memakan permen cokelat, indra apa yang membuatmu bisa merasakan rasa manisnya?",
        "options": ["Telinga", "Lidah", "Hidung", "Kulit"],
        "correctAnswerIndex": 1,
        "timeLimit": 15
      },
      {
        "question": "Kamu bisa mendengar bunyi klakson mobil karena menggunakan...",
        "options": ["Mata", "Lidah", "Telinga", "Hidung"],
        "correctAnswerIndex": 2,
        "timeLimit": 15
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


-- 2. Hewan dan Tempat Tinggalnya
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  2, 
  'Hewan dan Tempat Tinggalnya', 
  'Ada hewan yang hidup di darat, dan ada yang hidup di air. Ayo pelajari!', 
  'sd_1_3', 
  true, 
  2,
  '<h1>Hewan dan Tempat Tinggalnya 🐘🐟</h1>
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
<p>Ada juga hewan yang bisa hidup di darat <strong>DAN</strong> di air! Hewan ini disebut <strong>Amfibi</strong>, contohnya adalah Katak.</p>',
  'hewan-tempat-tinggal',
  'dynamic_match',
  70,
  10,
  25,
  50,
  'Penyayang Hewan',
  '{
    "dynamic_match": {
      "pairs": [
        {
          "category": "Hewan Darat",
          "items": ["Kucing", "Kuda", "Gajah"]
        },
        {
          "category": "Hewan Air",
          "items": ["Ikan Hiu", "Lumba-lumba", "Gurita"]
        }
      ]
    }
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Di manakah ikan paus biru hidup?",
        "options": ["Di padang rumput", "Di lautan luas", "Di atas pohon", "Di dalam gua"],
        "correctAnswerIndex": 1,
        "timeLimit": 15
      },
      {
        "question": "Hewan apakah yang bisa berlari sangat cepat di daratan?",
        "options": ["Gurita", "Bintang Laut", "Kuda", "Katak"],
        "correctAnswerIndex": 2,
        "timeLimit": 15
      },
      {
        "question": "Hewan amfibi adalah hewan yang bisa hidup di...",
        "options": ["Hanya di air", "Hanya di darat", "Darat dan di air", "Udara"],
        "correctAnswerIndex": 2,
        "timeLimit": 15
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


-- 6. Mengenal Cuaca
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  6, 
  'Mengenal Cuaca', 
  'Ada cuaca cerah, hujan, berawan... Ayo belajar bersiap menghadapi cuaca!', 
  'sd_1_3', 
  true, 
  3,
  '<h1>Mengenal Cuaca di Sekitar Kita ☀️🌧️</h1>
<p>Cuaca adalah keadaan udara di tempat kita berada. Cuaca bisa berubah-ubah setiap hari!</p>

<h3>1. Cuaca Cerah ☀️</h3>
<p>Matahari bersinar terang dan awan sedikit. Udara terasa lebih hangat. Ini waktu yang tepat untuk bermain di luar atau menjemur pakaian!</p>

<h3>2. Cuaca Berawan ⛅</h3>
<p>Langit dipenuhi oleh awan tebal. Matahari tertutup awan sehingga udara terasa lebih sejuk dan tidak terlalu panas.</p>

<h3>3. Cuaca Hujan 🌧️</h3>
<p>Awan menjadi sangat gelap (mendung) dan titik-titik air jatuh dari langit. Udara terasa dingin. Jangan lupa bawa payung atau jas hujan jika keluar rumah!</p>

<h3>4. Cuaca Berangin 💨</h3>
<p>Angin bertiup kencang, daun-daun berguguran. Hati-hati saat bermain layang-layang ya!</p>',
  'mengenal-cuaca',
  'visual_quiz',
  70,
  10,
  25,
  50,
  'Pengamat Cuaca',
  '{
    "visual_quiz": [
      {
        "question": "Cuaca hari ini sangat cerah. Barang apa yang paling tepat kita pakai agar tidak kepanasan?",
        "image": "☀️",
        "options": [
          { "text": "Topi", "isCorrect": true },
          { "text": "Payung", "isCorrect": false },
          { "text": "Jas Hujan", "isCorrect": false },
          { "text": "Selimut Tebal", "isCorrect": false }
        ],
        "explanation": "Saat cuaca cerah dan terik, topi membantu melindungi kepala kita dari panasnya sinar matahari."
      },
      {
        "question": "Langit terlihat gelap dan air mulai turun. Benda apa yang harus kita bawa saat keluar rumah?",
        "image": "🌧️",
        "options": [
          { "text": "Payung", "isCorrect": true },
          { "text": "Kacamata Hitam", "isCorrect": false },
          { "text": "Kipas Angin", "isCorrect": false },
          { "text": "Mainan", "isCorrect": false }
        ],
        "explanation": "Payung dan jas hujan sangat penting untuk melindungi tubuh kita dari air hujan agar tidak sakit."
      },
      {
        "question": "Angin bertiup sangat kencang. Permainan apa yang paling seru dimainkan saat cuaca seperti ini?",
        "image": "💨",
        "options": [
          { "text": "Layang-layang", "isCorrect": true },
          { "text": "Berenang", "isCorrect": false },
          { "text": "Lompat Tali", "isCorrect": false },
          { "text": "Bermain Catur", "isCorrect": false }
        ],
        "explanation": "Layang-layang membutuhkan tenaga angin agar bisa terbang tinggi ke udara."
      }
    ]
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Apa ciri utama cuaca cerah?",
        "options": ["Langit penuh petir", "Matahari bersinar terang", "Banyak genangan air", "Angin kencang mencabut pohon"],
        "correctAnswerIndex": 1,
        "timeLimit": 15
      },
      {
        "question": "Pakaian apa yang paling cocok digunakan saat cuaca hujan yang dingin?",
        "options": ["Kaus tipis", "Baju renang", "Jaket dan Jas Hujan", "Topi Pantai"],
        "correctAnswerIndex": 2,
        "timeLimit": 15
      },
      {
        "question": "Saat awan menutupi matahari dan langit menjadi sedikit abu-abu, cuaca tersebut dinamakan...",
        "options": ["Cerah", "Salju", "Berawan", "Kemarau"],
        "correctAnswerIndex": 2,
        "timeLimit": 15
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
