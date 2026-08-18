-- Script to upsert learning modules for SMP 7-9 (Physics Only)

-- 10. Besaran dan Alat Ukur
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  10, 
  'Besaran dan Alat Ukur', 
  'Belajar cara mengukur alam semesta dengan besaran fisika dan alat ukurnya.', 
  'smp_7_9', 
  true,
  1,
  '<h1>Besaran, Satuan, dan Alat Ukur 📏</h1>
<p>Dalam ilmu fisika, sesuatu yang dapat diukur dan memiliki nilai disebut <strong>Besaran</strong>. Ada dua jenis besaran utama: Besaran Pokok dan Besaran Turunan.</p>

<h3>7 Besaran Pokok (SI)</h3>
<ul>
  <li><strong>Panjang (Meter)</strong>: Diukur dengan Mistar, Jangka Sorong, atau Mikrometer Sekrup.</li>
  <li><strong>Massa (Kilogram)</strong>: Diukur dengan Neraca/Timbangan. <em>(Massa berbeda dengan Berat!)</em></li>
  <li><strong>Waktu (Sekon/Detik)</strong>: Diukur dengan Stopwatch atau Jam.</li>
  <li><strong>Suhu (Kelvin)</strong>: Diukur dengan Termometer.</li>
  <li><strong>Kuat Arus Listrik (Ampere)</strong>: Diukur dengan Amperemeter.</li>
  <li><strong>Intensitas Cahaya (Kandela)</strong>: Diukur dengan Luxmeter/Lightmeter.</li>
  <li><strong>Jumlah Zat (Mol)</strong>: Tidak memiliki alat ukur langsung.</li>
</ul>

<p>Besaran turunan adalah gabungan dari besaran pokok, seperti Luas (m²), Kecepatan (m/s), dan Gaya (Newton).</p>',
  'besaran-alat-ukur',
  'sensor_match',
  70,
  12,
  30,
  60,
  'Ahli Metrologi',
  '{
    "sensor_match": [
      { "left": "Panjang", "right": "Jangka Sorong" },
      { "left": "Massa", "right": "Neraca Ohaus" },
      { "left": "Suhu", "right": "Termometer" },
      { "left": "Waktu", "right": "Stopwatch" },
      { "left": "Kuat Arus Listrik", "right": "Amperemeter" }
    ]
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Manakah yang merupakan Satuan Internasional (SI) untuk Suhu?",
        "options": ["Celcius", "Fahrenheit", "Kelvin", "Reamur"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      },
      {
        "question": "Alat ukur apakah yang paling tepat digunakan untuk mengukur massa suatu benda?",
        "options": ["Neraca", "Dinamometer", "Mikrometer Sekrup", "Amperemeter"],
        "correctAnswerIndex": 0,
        "timeLimit": 20
      },
      {
        "question": "Besaran yang diturunkan dari besaran pokok panjang dan waktu adalah...",
        "options": ["Luas", "Kecepatan", "Massa Jenis", "Suhu"],
        "correctAnswerIndex": 1,
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


-- 11. Suhu dan Perpindahan Kalor
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  11, 
  'Suhu dan Perpindahan Kalor', 
  'Mengapa gagang sendok menjadi panas di teh hangat? Ayo pelajari rahasia energi panas!', 
  'smp_7_9', 
  true, 
  2,
  '<h1>Suhu dan Perpindahan Kalor 🔥</h1>
<p><strong>Suhu</strong> adalah derajat panas dinginnya suatu benda. Sedangkan <strong>Kalor</strong> adalah energi panas yang berpindah dari benda bersuhu tinggi ke benda bersuhu rendah.</p>

<h3>3 Cara Perpindahan Kalor</h3>
<ol>
  <li><strong>Konduksi:</strong> Perpindahan panas melalui zat padat tanpa disertai perpindahan partikelnya. Contoh: Panci besi menjadi panas di atas kompor.</li>
  <li><strong>Konveksi:</strong> Perpindahan panas yang disertai perpindahan partikel perantaranya (biasanya pada benda cair dan gas). Contoh: Angin darat dan angin laut, serta air mendidih.</li>
  <li><strong>Radiasi:</strong> Perpindahan panas tanpa membutuhkan medium (zat perantara). Contoh: Panas matahari sampai ke bumi, dan rasa hangat di dekat api unggun.</li>
</ol>

<p>Benda yang mudah menghantarkan panas disebut <em>Konduktor</em> (seperti besi dan tembaga), sedangkan yang sulit menghantarkan panas disebut <em>Isolator</em> (seperti kayu dan plastik).</p>',
  'perpindahan-kalor',
  'visual_quiz',
  70,
  12,
  30,
  60,
  'Pakar Termodinamika',
  '{
    "visual_quiz": [
      {
        "question": "Andi merasakan hangat saat duduk di dekat api unggun. Ini adalah contoh perpindahan panas secara...",
        "image": "🏕️",
        "options": [
          { "text": "Konduksi", "isCorrect": false },
          { "text": "Konveksi", "isCorrect": false },
          { "text": "Radiasi", "isCorrect": true },
          { "text": "Isolasi", "isCorrect": false }
        ],
        "explanation": "Panas dari api unggun memancar langsung ke udara di sekitarnya tanpa zat perantara padat/cair."
      },
      {
        "question": "Ujung sendok logam terasa panas saat dimasukkan ke dalam cangkir berisi air mendidih. Ini adalah contoh...",
        "image": "☕",
        "options": [
          { "text": "Konduksi", "isCorrect": true },
          { "text": "Konveksi", "isCorrect": false },
          { "text": "Radiasi", "isCorrect": false },
          { "text": "Evaporasi", "isCorrect": false }
        ],
        "explanation": "Panas merambat melalui logam (benda padat) dari bagian bawah ke ujung sendok."
      },
      {
        "question": "Asap pabrik yang membubung naik ke udara adalah contoh aliran panas secara...",
        "image": "🏭",
        "options": [
          { "text": "Radiasi", "isCorrect": false },
          { "text": "Konduksi", "isCorrect": false },
          { "text": "Sublimasi", "isCorrect": false },
          { "text": "Konveksi", "isCorrect": true }
        ],
        "explanation": "Gas panas yang lebih ringan naik ke atas sambil membawa kalor, ini adalah sifat konveksi."
      }
    ]
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Perpindahan kalor yang disertai dengan berpindahnya partikel zat perantara disebut...",
        "options": ["Konduksi", "Konveksi", "Radiasi", "Evaporasi"],
        "correctAnswerIndex": 1,
        "timeLimit": 20
      },
      {
        "question": "Bahan manakah di bawah ini yang merupakan isolator panas yang baik?",
        "options": ["Tembaga", "Besi", "Plastik", "Aluminium"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      },
      {
        "question": "Mengapa panas dari matahari bisa sampai ke planet Bumi melintasi ruang angkasa yang hampa udara?",
        "options": ["Karena merambat secara konduksi", "Karena merambat secara konveksi", "Karena merambat secara radiasi", "Karena ditiup oleh angin surya"],
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


-- 12. Gaya dan Gerak
INSERT INTO materials (id, title, description, category, is_published, topic_order, theory_content, game_slug, game_type, kkm_score, xp_theory, xp_pass, xp_perfect, badge_name, game_data, quiz_data)
VALUES (
  12, 
  'Gaya dan Gerak', 
  'Pelajari rahasia bagaimana benda bergerak dan pengaruh gaya terhadap benda tersebut.', 
  'smp_7_9', 
  true, 
  3,
  '<h1>Gaya dan Gerak Benda 🏃‍♂️💨</h1>
<p>Dalam fisika, <strong>Gaya</strong> adalah tarikan atau dorongan yang dapat mengubah posisi, kecepatan, atau bentuk sebuah benda. Satuan gaya adalah Newton (N).</p>

<h3>Gerak Lurus</h3>
<p>Benda dikatakan bergerak jika posisinya berubah terhadap suatu titik acuan.</p>
<ul>
  <li><strong>GLB (Gerak Lurus Beraturan):</strong> Benda bergerak pada lintasan lurus dengan kecepatan tetap (tidak ada percepatan / a = 0).</li>
  <li><strong>GLBB (Gerak Lurus Berubah Beraturan):</strong> Benda bergerak dengan kecepatan yang bertambah atau berkurang secara konstan (memiliki percepatan / a konstan).</li>
</ul>

<h3>Jenis-jenis Gaya</h3>
<ul>
  <li><strong>Gaya Berat:</strong> Gaya tarik gravitasi bumi terhadap massa benda yang arahnya selalu ke bawah.</li>
  <li><strong>Gaya Normal:</strong> Gaya tegak lurus pada bidang sentuh benda.</li>
  <li><strong>Gaya Gesek:</strong> Gaya yang melawan arah gerak benda yang menyentuh permukaan. Semakin kasar permukaan, semakin besar gaya geseknya.</li>
</ul>',
  'gaya-gerak',
  'true_false',
  70,
  12,
  30,
  60,
  'Pengendali Gerak',
  '{
    "true_false": [
      { "statement": "Gaya gesek selalu berlawanan arah dengan arah gerak benda.", "isCorrect": true },
      { "statement": "Pada Gerak Lurus Beraturan (GLB), kecepatan benda selalu bertambah.", "isCorrect": false },
      { "statement": "Gaya bisa mengubah arah gerak sebuah benda.", "isCorrect": true },
      { "statement": "Berat suatu benda akan selalu sama meskipun diukur di Bumi maupun di Bulan.", "isCorrect": false },
      { "statement": "Permukaan yang kasar akan menghasilkan gaya gesekan yang lebih besar daripada permukaan yang licin.", "isCorrect": true },
      { "statement": "Buah kelapa yang jatuh dari pohon adalah contoh Gerak Lurus Beraturan (GLB).", "isCorrect": false }
    ]
  }'::jsonb,
  '{
    "questions": [
      {
        "question": "Sebuah mobil berjalan di jalan tol dengan kecepatan stabil 80 km/jam tanpa direm atau digas lebih lanjut. Mobil ini mengalami gerak...",
        "options": ["Gerak Lurus Berubah Beraturan", "Gerak Lurus Beraturan", "Gerak Melingkar", "Gerak Parabola"],
        "correctAnswerIndex": 1,
        "timeLimit": 20
      },
      {
        "question": "Gaya apakah yang menahan sepedamu agar berhenti ketika kamu menekan tuas rem?",
        "options": ["Gaya Gravitasi", "Gaya Pegas", "Gaya Gesek", "Gaya Magnet"],
        "correctAnswerIndex": 2,
        "timeLimit": 20
      },
      {
        "question": "Jika dua buah gaya sebesar 10 Newton dan 15 Newton mendorong meja ke arah kanan yang sama, berapakah gaya totalnya?",
        "options": ["5 Newton", "25 Newton", "150 Newton", "Tidak ada gaya"],
        "correctAnswerIndex": 1,
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
