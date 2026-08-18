-- Seed interactive games for SD 4-6 materials

-- 1. Fotosintesis (ID: 3) -> True/False Game
UPDATE materials
SET 
  game_type = 'true_false',
  game_data = '{
    "true_false": [
      { "statement": "Akar tumbuhan bertugas menyerap air dari dalam tanah.", "isCorrect": true },
      { "statement": "Daun menyerap Oksigen dari udara untuk melakukan fotosintesis.", "isCorrect": false },
      { "statement": "Klorofil adalah zat hijau daun yang menangkap energi dari cahaya matahari.", "isCorrect": true },
      { "statement": "Proses fotosintesis pada siang hari akan menghasilkan Karbon Dioksida.", "isCorrect": false },
      { "statement": "Tumbuhan menggunakan energi matahari untuk mengubah air dan Karbon Dioksida menjadi glukosa (makanan).", "isCorrect": true },
      { "statement": "Hasil dari fotosintesis adalah gas Oksigen yang kita hirup setiap hari.", "isCorrect": true }
    ]
  }'::jsonb
WHERE id = 3;

-- 2. Tata Surya (ID: 4) -> Sequence Game (Urutan dari terdekat ke terjauh)
UPDATE materials
SET 
  game_type = 'sequence',
  game_data = '{
    "sequence": [
      { "id": "ts1", "content": "Matahari (Pusat Tata Surya)" },
      { "id": "ts2", "content": "Merkurius (Planet Paling Dekat)" },
      { "id": "ts3", "content": "Venus" },
      { "id": "ts4", "content": "Bumi (Planet Kita)" },
      { "id": "ts5", "content": "Mars (Planet Merah)" },
      { "id": "ts6", "content": "Yupiter (Planet Terbesar)" },
      { "id": "ts7", "content": "Saturnus (Planet Bercincin)" },
      { "id": "ts8", "content": "Uranus" },
      { "id": "ts9", "content": "Neptunus (Planet Paling Jauh)" }
    ]
  }'::jsonb
WHERE id = 4;

-- 3. Siklus Air (ID: 5) -> Fill in the Blanks Game
UPDATE materials
SET 
  game_type = 'fill_blanks',
  game_data = '{
    "fill_blanks": [
      {
        "sentence": "Air di laut dipanaskan oleh matahari dan berubah menjadi uap air yang naik ke langit. Proses ini disebut [BLANK].",
        "answer": "Evaporasi",
        "options": ["Kondensasi", "Infiltrasi"]
      },
      {
        "sentence": "Uap air di langit kemudian mendingin dan berkumpul membentuk [BLANK].",
        "answer": "Awan",
        "options": ["Pelangi", "Bintang"]
      },
      {
        "sentence": "Proses berkumpulnya uap air ini disebut [BLANK].",
        "answer": "Kondensasi",
        "options": ["Presipitasi", "Evaporasi"]
      },
      {
        "sentence": "Ketika awan sudah terlalu berat, tetesan air jatuh ke bumi sebagai hujan atau salju, ini disebut [BLANK].",
        "answer": "Presipitasi",
        "options": ["Infiltrasi", "Evaporasi"]
      },
      {
        "sentence": "Air hujan yang jatuh ke tanah akan meresap ke dalam melalui proses [BLANK].",
        "answer": "Infiltrasi",
        "options": ["Kondensasi", "Penguapan"]
      }
    ]
  }'::jsonb
WHERE id = 5;
