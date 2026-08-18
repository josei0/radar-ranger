"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Props {
  gameType: string;
  data: any;
  onChange: (data: any) => void;
}

export default function GameBuilder({ gameType, data, onChange }: Props) {
  if (gameType === "none" || !gameType) return null;

  // 1. FALLING WORDS
  if (gameType === "falling_words") {
    const words = data?.falling_words || [];
    
    const handleAdd = () => {
      onChange({ ...data, falling_words: [...words, { word: "" }] });
    };

    const handleUpdate = (idx: number, word: string) => {
      const newWords = [...words];
      newWords[idx] = { word };
      onChange({ ...data, falling_words: newWords });
    };

    const handleRemove = (idx: number) => {
      const newWords = [...words];
      newWords.splice(idx, 1);
      onChange({ ...data, falling_words: newWords });
    };

    return (
      <div className="bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-blue-900">Falling Words Editor</h3>
            <p className="text-sm opacity-70">Siswa harus mengetik kata-kata ini sebelum jatuh ke tanah.</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Word
          </button>
        </div>
        <div className="space-y-2">
          {words.map((w: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-mono opacity-50 w-6">{i + 1}.</span>
              <input 
                type="text" 
                value={w.word || (typeof w === 'string' ? w : '')} 
                onChange={(e) => handleUpdate(i, e.target.value)} 
                placeholder="Misal: FOTOSINTESIS"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 font-mono uppercase" 
              />
              <button type="button" onClick={() => handleRemove(i)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {words.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada kata. Klik "Add Word".</p>}
        </div>
      </div>
    );
  }

  // 2. SCIENCE WORDLE
  if (gameType === "science_wordle") {
    // Migrate old format { word, clue } to array format [{ word, clue }] if needed
    let items: any[] = [];
    if (Array.isArray(data?.science_wordle)) {
      items = data.science_wordle;
    } else if (data?.science_wordle?.word) {
      items = [data.science_wordle];
    }
    
    const handleAdd = () => onChange({ ...data, science_wordle: [...items, { word: "", clue: "" }] });
    
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newItems = [...items];
      newItems[idx] = { ...newItems[idx], [key]: value };
      onChange({ ...data, science_wordle: newItems });
    };

    const handleRemove = (idx: number) => {
      const newItems = [...items];
      newItems.splice(idx, 1);
      onChange({ ...data, science_wordle: newItems });
    };
    
    return (
      <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-emerald-900">Science Wordle Editor</h3>
            <p className="text-sm opacity-70">Siswa harus menebak kata-kata ini secara beruntun (5 huruf).</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Add Wordle
          </button>
        </div>
        
        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm items-start sm:items-center">
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold opacity-70 mb-1">Target Word (5 Huruf)</label>
                <input 
                  type="text" maxLength={5}
                  value={item.word} 
                  onChange={(e) => handleUpdate(i, 'word', e.target.value.toUpperCase())} 
                  placeholder="Misal: VIRUS"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono text-lg uppercase tracking-widest text-emerald-600 font-bold" 
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold opacity-70 mb-1">Clue / Petunjuk</label>
                <input 
                  type="text" 
                  value={item.clue} 
                  onChange={(e) => handleUpdate(i, 'clue', e.target.value)} 
                  placeholder="Contoh: Agen mikroskopis penyebab penyakit"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300" 
                />
              </div>
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg self-end sm:self-center mt-2 sm:mt-0">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada kata rahasia. Klik "Add Wordle".</p>}
        </div>
      </div>
    );
  }

  // 3. TRUTH OR MYTH
  if (gameType === "truth_or_myth") {
    const cards = data?.truth_or_myth || [];
    
    const handleAdd = () => onChange({ ...data, truth_or_myth: [...cards, { statement: "", isTruth: true }] });
    
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newCards = [...cards];
      newCards[idx] = { ...newCards[idx], [key]: value };
      onChange({ ...data, truth_or_myth: newCards });
    };

    const handleRemove = (idx: number) => {
      const newCards = [...cards];
      newCards.splice(idx, 1);
      onChange({ ...data, truth_or_myth: newCards });
    };

    return (
      <div className="bg-rose-50/50 border-2 border-rose-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-rose-900">Truth or Myth Editor</h3>
            <p className="text-sm opacity-70">Kartu pernyataan (Swipe Kiri = Mitos, Kanan = Fakta)</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-rose-700">
            <Plus className="w-4 h-4" /> Add Card
          </button>
        </div>
        <div className="space-y-4">
          {cards.map((c: any, i: number) => (
            <div key={i} className="flex gap-2 bg-white p-3 rounded-xl border shadow-sm">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={c.statement} 
                  onChange={(e) => handleUpdate(i, 'statement', e.target.value)} 
                  placeholder="Misal: Kelelawar sebenarnya buta..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 mb-2" 
                />
                <select 
                  value={c.isTruth ? "true" : "false"}
                  onChange={(e) => handleUpdate(i, 'isTruth', e.target.value === "true")}
                  className={`w-full px-3 py-2 rounded-lg border font-bold ${c.isTruth ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                >
                  <option value="true">Benar (Fakta) - Swipe Kanan</option>
                  <option value="false">Salah (Mitos) - Swipe Kiri</option>
                </select>
              </div>
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {cards.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada kartu.</p>}
        </div>
      </div>
    );
  }

  // 4. WORD GUESS
  if (gameType === "word_guess") {
    const items = data?.word_guess || [];
    
    const handleAdd = () => onChange({ ...data, word_guess: [...items, { word: "", clue: "" }] });
    
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newItems = [...items];
      newItems[idx] = { ...newItems[idx], [key]: value };
      onChange({ ...data, word_guess: newItems });
    };

    const handleRemove = (idx: number) => {
      const newItems = [...items];
      newItems.splice(idx, 1);
      onChange({ ...data, word_guess: newItems });
    };

    return (
      <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-indigo-900">Word Guess (Hangman) Editor</h3>
            <p className="text-sm opacity-70">Tebak huruf satu per satu dari petunjuk yang ada.</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Word
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex gap-2 bg-white p-3 rounded-xl border shadow-sm">
              <div className="flex-1 space-y-2">
                <input 
                  type="text" 
                  value={item.word} 
                  onChange={(e) => handleUpdate(i, 'word', e.target.value.toUpperCase())} 
                  placeholder="KATA RAHASIA (Misal: GRAVITASI)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 font-mono uppercase font-bold text-indigo-700 tracking-widest" 
                />
                <input 
                  type="text" 
                  value={item.clue} 
                  onChange={(e) => handleUpdate(i, 'clue', e.target.value)} 
                  placeholder="Petunjuk: Gaya tarik bumi..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" 
                />
              </div>
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada kata rahasia.</p>}
        </div>
      </div>
    );
  }

  // 5. BALLOON POP
  if (gameType === "balloon_pop") {
    const bpData = data?.balloon_pop || { targetCategory: "Kategori Target", items: [] };
    const items = bpData.items || [];
    
    const handleAdd = () => onChange({ ...data, balloon_pop: { ...bpData, items: [...items, { text: "", isTarget: true }] } });
    
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newItems = [...items];
      newItems[idx] = { ...newItems[idx], [key]: value };
      onChange({ ...data, balloon_pop: { ...bpData, items: newItems } });
    };

    const handleRemove = (idx: number) => {
      const newItems = [...items];
      newItems.splice(idx, 1);
      onChange({ ...data, balloon_pop: { ...bpData, items: newItems } });
    };

    return (
      <div className="bg-sky-50/50 border-2 border-sky-100 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-sky-900 mb-1">Balloon Pop Editor</h3>
        <p className="text-sm opacity-70 mb-4">Pecahkan balon yang sesuai kategori target, biarkan yang bukan target terbang bebas.</p>
        
        <div className="mb-4">
          <label className="block text-sm font-bold opacity-70 mb-1">Instruksi / Target Kategori</label>
          <input 
            type="text"
            value={bpData.targetCategory} 
            onChange={(e) => onChange({ ...data, balloon_pop: { ...bpData, targetCategory: e.target.value } })} 
            placeholder="Misal: Hewan Berkaki Empat"
            className="w-full px-4 py-2 rounded-lg border border-sky-300 font-bold text-sky-800" 
          />
        </div>

        <div className="flex justify-between items-center mb-2 mt-6">
          <label className="block text-sm font-bold opacity-70">Daftar Opsi Balon</label>
          <button type="button" onClick={handleAdd} className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-sky-700">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex gap-2 bg-white p-2 rounded-xl border shadow-sm items-center">
              <input 
                type="text" 
                value={item.text} 
                onChange={(e) => handleUpdate(i, 'text', e.target.value)} 
                placeholder="Teks (Misal: Kucing)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 font-medium" 
              />
              <select 
                value={item.isTarget ? "true" : "false"}
                onChange={(e) => handleUpdate(i, 'isTarget', e.target.value === "true")}
                className={`w-32 px-2 py-2 rounded-lg border text-sm font-bold ${item.isTarget ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                <option value="true">Target</option>
                <option value="false">Pengecoh</option>
              </select>
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada balon.</p>}
        </div>
      </div>
    );
  }

  // 6. SENSOR MATCH
  if (gameType === "sensor_match") {
    const pairs = data?.sensor_match || [];
    
    const handleAdd = () => onChange({ ...data, sensor_match: [...pairs, { left: "", right: "" }] });
    const handleUpdate = (idx: number, key: string, value: string) => {
      const newPairs = [...pairs];
      newPairs[idx] = { ...newPairs[idx], [key]: value };
      onChange({ ...data, sensor_match: newPairs });
    };
    const handleRemove = (idx: number) => {
      const newPairs = [...pairs];
      newPairs.splice(idx, 1);
      onChange({ ...data, sensor_match: newPairs });
    };

    return (
      <div className="bg-amber-50/50 border-2 border-amber-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-amber-900">Sensor Match Editor</h3>
            <p className="text-sm opacity-70">Siswa menarik garis/mencocokkan blok Kiri ke Kanan.</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-amber-700">
            <Plus className="w-4 h-4" /> Add Pair
          </button>
        </div>
        <div className="space-y-2">
          {pairs.map((p: any, i: number) => (
            <div key={i} className="flex gap-2 bg-white p-2 rounded-xl border shadow-sm items-center">
              <input type="text" value={p.left} onChange={(e) => handleUpdate(i, 'left', e.target.value)} placeholder="Teks Kiri (Misal: Jantung)" className="flex-1 px-3 py-2 rounded-lg border border-gray-200" />
              <div className="px-2 font-bold opacity-30">➜</div>
              <input type="text" value={p.right} onChange={(e) => handleUpdate(i, 'right', e.target.value)} placeholder="Teks Kanan (Misal: Memompa Darah)" className="flex-1 px-3 py-2 rounded-lg border border-gray-200" />
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
          {pairs.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada pasangan. Klik "Add Pair".</p>}
        </div>
      </div>
    );
  }

  // 7. DYNAMIC MATCH
  if (gameType === "dynamic_match") {
    const pairs = data?.dynamic_match?.pairs || [];
    
    const handleAdd = () => onChange({ ...data, dynamic_match: { pairs: [...pairs, { category: "", items: ["", ""] }] } });
    const handleUpdateCat = (idx: number, value: string) => {
      const newPairs = [...pairs];
      newPairs[idx].category = value;
      onChange({ ...data, dynamic_match: { pairs: newPairs } });
    };
    const handleUpdateItem = (idx: number, itemIdx: number, value: string) => {
      const newPairs = [...pairs];
      newPairs[idx].items[itemIdx] = value;
      onChange({ ...data, dynamic_match: { pairs: newPairs } });
    };
    const handleRemove = (idx: number) => {
      const newPairs = [...pairs];
      newPairs.splice(idx, 1);
      onChange({ ...data, dynamic_match: { pairs: newPairs } });
    };

    return (
      <div className="bg-lime-50/50 border-2 border-lime-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-lime-900">Dynamic Match Editor</h3>
            <p className="text-sm opacity-70">Cocokkan banyak anggota keluarga/item ke satu Kategori Pusat.</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-lime-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime-700">
            <Plus className="w-4 h-4" /> Add Category Group
          </button>
        </div>
        <div className="space-y-4">
          {pairs.map((p: any, i: number) => (
            <div key={i} className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <input type="text" value={p.category} onChange={(e) => handleUpdateCat(i, e.target.value)} placeholder="Kategori (Misal: Hewan Karnivora)" className="w-2/3 px-3 py-2 rounded-lg border border-lime-300 font-bold text-lime-800" />
                <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 border-l-2 border-lime-200">
                {p.items.map((item: string, itemIdx: number) => (
                  <input key={itemIdx} type="text" value={item} onChange={(e) => handleUpdateItem(i, itemIdx, e.target.value)} placeholder={`Item ${itemIdx + 1}`} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm" />
                ))}
              </div>
            </div>
          ))}
          {pairs.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada grup kategori.</p>}
        </div>
      </div>
    );
  }

  // 8. SEQUENCE
  if (gameType === "sequence") {
    const items = data?.sequence || [];
    
    const handleAdd = () => onChange({ ...data, sequence: [...items, { id: Date.now(), content: "" }] });
    const handleUpdate = (idx: number, value: string) => {
      const newItems = [...items];
      newItems[idx].content = value;
      onChange({ ...data, sequence: newItems });
    };
    const handleRemove = (idx: number) => {
      const newItems = [...items];
      newItems.splice(idx, 1);
      onChange({ ...data, sequence: newItems });
    };
    const moveUp = (idx: number) => {
      if (idx === 0) return;
      const newItems = [...items];
      [newItems[idx-1], newItems[idx]] = [newItems[idx], newItems[idx-1]];
      onChange({ ...data, sequence: newItems });
    };
    const moveDown = (idx: number) => {
      if (idx === items.length - 1) return;
      const newItems = [...items];
      [newItems[idx], newItems[idx+1]] = [newItems[idx+1], newItems[idx]];
      onChange({ ...data, sequence: newItems });
    };

    return (
      <div className="bg-purple-50/50 border-2 border-purple-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-purple-900">Sequence Editor</h3>
            <p className="text-sm opacity-70">Urutkan langkah/fase dari atas (pertama) ke bawah (terakhir).</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700">
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <div key={item.id} className="flex gap-2 bg-white p-2 rounded-xl border shadow-sm items-center">
              <div className="flex flex-col gap-1 px-1">
                <button type="button" onClick={() => moveUp(i)} disabled={i===0} className="p-0.5 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30">▲</button>
                <button type="button" onClick={() => moveDown(i)} disabled={i===items.length-1} className="p-0.5 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30">▼</button>
              </div>
              <span className="font-bold w-6 text-center text-purple-600">{i + 1}.</span>
              <input type="text" value={item.content} onChange={(e) => handleUpdate(i, e.target.value)} placeholder="Teks Fase/Langkah" className="flex-1 px-3 py-2 rounded-lg border border-gray-200" />
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada urutan.</p>}
        </div>
      </div>
    );
  }

  // 9. WORD SCRAMBLE
  if (gameType === "word_scramble") {
    const items = data?.word_scramble || [];
    
    const handleAdd = () => onChange({ ...data, word_scramble: [...items, { word: "", clue: "" }] });
    const handleUpdate = (idx: number, key: string, value: string) => {
      const newItems = [...items];
      newItems[idx] = { ...newItems[idx], [key]: value };
      onChange({ ...data, word_scramble: newItems });
    };
    const handleRemove = (idx: number) => {
      const newItems = [...items];
      newItems.splice(idx, 1);
      onChange({ ...data, word_scramble: newItems });
    };

    return (
      <div className="bg-teal-50/50 border-2 border-teal-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-teal-900">Word Scramble Editor</h3>
            <p className="text-sm opacity-70">Siswa harus menyusun ulang huruf acak menjadi kata yang benar.</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-teal-700">
            <Plus className="w-4 h-4" /> Add Word
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-xl border shadow-sm items-start sm:items-center">
              <input type="text" value={item.word} onChange={(e) => handleUpdate(i, 'word', e.target.value.toUpperCase())} placeholder="KATA (Misal: CAHAYA)" className="w-full sm:w-1/3 px-3 py-2 rounded-lg border border-gray-200 font-mono uppercase font-bold text-teal-700" />
              <input type="text" value={item.clue} onChange={(e) => handleUpdate(i, 'clue', e.target.value)} placeholder="Clue/Petunjuk" className="w-full flex-1 px-3 py-2 rounded-lg border border-gray-200" />
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada kata.</p>}
        </div>
      </div>
    );
  }

  // 10. TRUE OR FALSE
  if (gameType === "true_false") {
    const questions = data?.true_false || [];
    
    const handleAdd = () => onChange({ ...data, true_false: [...questions, { statement: "", isTrue: true }] });
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newQ = [...questions];
      newQ[idx] = { ...newQ[idx], [key]: value };
      onChange({ ...data, true_false: newQ });
    };
    const handleRemove = (idx: number) => {
      const newQ = [...questions];
      newQ.splice(idx, 1);
      onChange({ ...data, true_false: newQ });
    };

    return (
      <div className="bg-cyan-50/50 border-2 border-cyan-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-cyan-900">Rapid True/False Editor</h3>
            <p className="text-sm opacity-70">Pernyataan beruntun dengan tombol Benar / Salah.</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-cyan-700">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
        <div className="space-y-3">
          {questions.map((q: any, i: number) => (
            <div key={i} className="flex gap-2 bg-white p-3 rounded-xl border shadow-sm">
              <div className="flex-1">
                <input type="text" value={q.statement} onChange={(e) => handleUpdate(i, 'statement', e.target.value)} placeholder="Misal: Matahari mengelilingi Bumi." className="w-full px-3 py-2 rounded-lg border border-gray-200 mb-2" />
                <select value={q.isTrue ? "true" : "false"} onChange={(e) => handleUpdate(i, 'isTrue', e.target.value === "true")} className={`w-full px-3 py-2 rounded-lg border font-bold ${q.isTrue ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <option value="true">Jawaban: BENAR (True)</option>
                  <option value="false">Jawaban: SALAH (False)</option>
                </select>
              </div>
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
          {questions.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada pernyataan.</p>}
        </div>
      </div>
    );
  }

  // 11. MEMORY MATCH
  if (gameType === "memory_match") {
    const pairs = data?.memory_match?.pairs || [];
    
    const handleAdd = () => onChange({ ...data, memory_match: { pairs: [...pairs, { match1: "", match2: "" }] } });
    const handleUpdate = (idx: number, key: string, value: string) => {
      const newPairs = [...pairs];
      newPairs[idx] = { ...newPairs[idx], [key]: value };
      onChange({ ...data, memory_match: { pairs: newPairs } });
    };
    const handleRemove = (idx: number) => {
      const newPairs = [...pairs];
      newPairs.splice(idx, 1);
      onChange({ ...data, memory_match: { pairs: newPairs } });
    };

    return (
      <div className="bg-fuchsia-50/50 border-2 border-fuchsia-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-fuchsia-900">Memory Match Editor</h3>
            <p className="text-sm opacity-70">Permainan balik kartu (temukan pasangan yang cocok).</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-fuchsia-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-fuchsia-700">
            <Plus className="w-4 h-4" /> Add Pair
          </button>
        </div>
        <div className="space-y-2">
          {pairs.map((p: any, i: number) => (
            <div key={i} className="flex gap-2 bg-white p-2 rounded-xl border shadow-sm items-center">
              <input type="text" value={p.match1} onChange={(e) => handleUpdate(i, 'match1', e.target.value)} placeholder="Kartu A (Misal: H2O)" className="flex-1 px-3 py-2 rounded-lg border border-gray-200" />
              <div className="px-2 font-bold opacity-30">🤝</div>
              <input type="text" value={p.match2} onChange={(e) => handleUpdate(i, 'match2', e.target.value)} placeholder="Kartu B (Misal: Air)" className="flex-1 px-3 py-2 rounded-lg border border-gray-200" />
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
          {pairs.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada pasangan. Kartu akan diacak otomatis oleh sistem.</p>}
        </div>
      </div>
    );
  }

  // 12. FILL IN THE BLANKS
  if (gameType === "fill_blanks") {
    const questions = data?.fill_blanks || [];
    
    const handleAdd = () => onChange({ ...data, fill_blanks: [...questions, { sentence: "", answer: "", options: ["", "", ""] }] });
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newQ = [...questions];
      newQ[idx] = { ...newQ[idx], [key]: value };
      onChange({ ...data, fill_blanks: newQ });
    };
    const handleOptionUpdate = (qIdx: number, optIdx: number, value: string) => {
      const newQ = [...questions];
      newQ[qIdx].options[optIdx] = value;
      onChange({ ...data, fill_blanks: newQ });
    };
    const handleRemove = (idx: number) => {
      const newQ = [...questions];
      newQ.splice(idx, 1);
      onChange({ ...data, fill_blanks: newQ });
    };

    return (
      <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-indigo-900">Fill in the Blanks Editor</h3>
            <p className="text-sm opacity-70">Kalimat rumpang. Gunakan kata "[BLANK]" (huruf besar) untuk area yang rumpang.</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Sentence
          </button>
        </div>
        <div className="space-y-4">
          {questions.map((q: any, i: number) => (
            <div key={i} className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <textarea rows={2} value={q.sentence} onChange={(e) => handleUpdate(i, 'sentence', e.target.value)} placeholder="Bumi adalah planet ke-[BLANK] dari Matahari." className="w-full px-3 py-2 rounded-lg border border-gray-200 font-mono mr-2 resize-none" />
                <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold opacity-70 mb-1">Jawaban Benar</label>
                  <input type="text" value={q.answer} onChange={(e) => handleUpdate(i, 'answer', e.target.value)} placeholder="Tiga" className="w-full px-3 py-1.5 rounded-lg border border-green-300 bg-green-50 font-bold text-green-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold opacity-70 mb-1">Pilihan Pengecoh (Pisahkan dengan koma)</label>
                  <input type="text" value={(q.options || []).join(",")} onChange={(e) => handleUpdate(i, 'options', e.target.value.split(","))} placeholder="Satu, Dua, Empat" className="w-full px-3 py-1.5 rounded-lg border border-gray-200" />
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada soal.</p>}
        </div>
      </div>
    );
  }

  // 13. ODD ONE OUT
  if (gameType === "odd_one_out") {
    const questions = data?.odd_one_out || [];
    
    const handleAdd = () => onChange({ ...data, odd_one_out: [...questions, { options: ["", "", "", ""], answerIndex: 0, explanation: "" }] });
    const handleOptionUpdate = (qIdx: number, optIdx: number, value: string) => {
      const newQ = [...questions];
      newQ[qIdx].options[optIdx] = value;
      onChange({ ...data, odd_one_out: newQ });
    };
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newQ = [...questions];
      newQ[idx] = { ...newQ[idx], [key]: value };
      onChange({ ...data, odd_one_out: newQ });
    };
    const handleRemove = (idx: number) => {
      const newQ = [...questions];
      newQ.splice(idx, 1);
      onChange({ ...data, odd_one_out: newQ });
    };

    return (
      <div className="bg-pink-50/50 border-2 border-pink-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-pink-900">Odd One Out Editor</h3>
            <p className="text-sm opacity-70">Siswa mencari satu opsi yang tidak termasuk dalam kelompok (paling beda).</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-pink-700">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
        <div className="space-y-4">
          {questions.map((q: any, i: number) => (
            <div key={i} className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <input type="text" value={q.explanation} onChange={(e) => handleUpdate(i, 'explanation', e.target.value)} placeholder="Penjelasan (Misal: Karena Paus adalah mamalia, bukan ikan)" className="w-full px-3 py-2 rounded-lg border border-gray-200 mr-2 font-medium" />
                <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[0, 1, 2, 3].map(optIdx => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input type="radio" checked={q.answerIndex === optIdx} onChange={() => handleUpdate(i, 'answerIndex', optIdx)} className="w-4 h-4 text-pink-600" />
                    <input type="text" value={q.options[optIdx] || ""} onChange={(e) => handleOptionUpdate(i, optIdx, e.target.value)} placeholder={`Opsi ${optIdx + 1}`} className={`w-full px-3 py-1.5 rounded-lg border ${q.answerIndex === optIdx ? 'border-pink-400 bg-pink-50' : 'border-gray-200'}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada soal.</p>}
        </div>
      </div>
    );
  }

  // 14. VISUAL QUIZ
  if (gameType === "visual_quiz") {
    const questions = data?.visual_quiz || [];
    
    const handleAdd = () => onChange({ ...data, visual_quiz: [...questions, { question: "", image: "🧠", options: [{text: "", isCorrect: true}, {text: "", isCorrect: false}] }] });
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newQ = [...questions];
      newQ[idx] = { ...newQ[idx], [key]: value };
      onChange({ ...data, visual_quiz: newQ });
    };
    const handleOptionUpdate = (qIdx: number, optIdx: number, key: string, value: any) => {
      const newQ = [...questions];
      newQ[qIdx].options[optIdx] = { ...newQ[qIdx].options[optIdx], [key]: value };
      onChange({ ...data, visual_quiz: newQ });
    };
    const handleAddOption = (qIdx: number) => {
      const newQ = [...questions];
      newQ[qIdx].options.push({ text: "", isCorrect: false });
      onChange({ ...data, visual_quiz: newQ });
    };
    const handleRemoveOption = (qIdx: number, optIdx: number) => {
      const newQ = [...questions];
      newQ[qIdx].options.splice(optIdx, 1);
      onChange({ ...data, visual_quiz: newQ });
    };
    const handleRemove = (idx: number) => {
      const newQ = [...questions];
      newQ.splice(idx, 1);
      onChange({ ...data, visual_quiz: newQ });
    };

    return (
      <div className="bg-violet-50/50 border-2 border-violet-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-violet-900">Visual Quiz Editor</h3>
            <p className="text-sm opacity-70">Soal dengan gambar/emoji besar di tengah (Opsional).</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-violet-700">
            <Plus className="w-4 h-4" /> Add Visual Question
          </button>
        </div>
        <div className="space-y-6">
          {questions.map((q: any, i: number) => (
            <div key={i} className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex gap-4 mb-4">
                <div className="w-20">
                  <label className="block text-xs font-bold opacity-70 mb-1">Image/Emoji</label>
                  <input type="text" value={q.image} onChange={(e) => handleUpdate(i, 'image', e.target.value)} placeholder="URL/Emoji" className="w-full px-2 py-2 rounded-lg border border-gray-200 text-center text-xl" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold opacity-70 mb-1">Pertanyaan</label>
                  <input type="text" value={q.question} onChange={(e) => handleUpdate(i, 'question', e.target.value)} placeholder="Tulis pertanyaan di sini..." className="w-full px-3 py-2 rounded-lg border border-gray-200 font-bold" />
                </div>
                <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg self-end"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="pl-4 border-l-2 border-violet-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold opacity-70">Pilihan Jawaban</label>
                  <button type="button" onClick={() => handleAddOption(i)} className="text-xs font-bold text-violet-600 hover:text-violet-800">+ Tambah Opsi</button>
                </div>
                {q.options.map((opt: any, optIdx: number) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input type="text" value={opt.text} onChange={(e) => handleOptionUpdate(i, optIdx, 'text', e.target.value)} placeholder={`Opsi ${optIdx + 1}`} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm" />
                    <select value={opt.isCorrect ? "true" : "false"} onChange={(e) => handleOptionUpdate(i, optIdx, 'isCorrect', e.target.value === "true")} className={`px-2 py-1.5 rounded-lg border text-sm font-bold ${opt.isCorrect ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
                      <option value="true">Benar</option>
                      <option value="false">Salah</option>
                    </select>
                    <button type="button" onClick={() => handleRemoveOption(i, optIdx)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada soal.</p>}
        </div>
      </div>
    );
  }

  // 15. SORTING BINS
  if (gameType === "sorting_bins") {
    const bins = data?.sorting_bins?.bins || [];
    const items = data?.sorting_bins?.items || [];
    
    const handleAddBin = () => onChange({ ...data, sorting_bins: { bins: [...bins, { id: `b${Date.now()}`, title: "" }], items } });
    const handleUpdateBin = (idx: number, value: string) => {
      const newBins = [...bins];
      newBins[idx].title = value;
      onChange({ ...data, sorting_bins: { bins: newBins, items } });
    };
    const handleRemoveBin = (idx: number) => {
      const binId = bins[idx].id;
      const newBins = [...bins];
      newBins.splice(idx, 1);
      // Also remove items that belong to this bin
      const newItems = items.filter((item: any) => item.correctBinId !== binId);
      onChange({ ...data, sorting_bins: { bins: newBins, items: newItems } });
    };

    const handleAddItem = () => onChange({ ...data, sorting_bins: { bins, items: [...items, { id: `i${Date.now()}`, title: "", correctBinId: bins[0]?.id || "" }] } });
    const handleUpdateItem = (idx: number, key: string, value: string) => {
      const newItems = [...items];
      newItems[idx] = { ...newItems[idx], [key]: value };
      onChange({ ...data, sorting_bins: { bins, items: newItems } });
    };
    const handleRemoveItem = (idx: number) => {
      const newItems = [...items];
      newItems.splice(idx, 1);
      onChange({ ...data, sorting_bins: { bins, items: newItems } });
    };

    return (
      <div className="bg-orange-50/50 border-2 border-orange-100 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-orange-900 mb-1">Sorting Bins Editor</h3>
        <p className="text-sm opacity-70 mb-6">Buat 2 Keranjang (Kategori), lalu buat item yang harus dimasukkan ke dalamnya.</p>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold opacity-70">Keranjang Kategori</h4>
            {bins.length < 2 && (
              <button type="button" onClick={handleAddBin} className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-1 rounded hover:bg-orange-300">+ Tambah Keranjang</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bins.map((b: any, i: number) => (
              <div key={b.id} className="flex gap-2">
                <input type="text" value={b.title} onChange={(e) => handleUpdateBin(i, e.target.value)} placeholder={`Keranjang ${i+1}`} className="w-full px-3 py-2 rounded-lg border border-orange-300 font-bold" />
                <button type="button" onClick={() => handleRemoveBin(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold opacity-70">Item-Item (Objek yang akan disortir)</h4>
            <button type="button" onClick={handleAddItem} disabled={bins.length === 0} className="text-sm font-bold bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700 disabled:opacity-50">+ Tambah Item</button>
          </div>
          <div className="space-y-2">
            {items.map((item: any, i: number) => (
              <div key={item.id} className="flex gap-2 bg-white p-2 rounded-xl border shadow-sm">
                <input type="text" value={item.title} onChange={(e) => handleUpdateItem(i, 'title', e.target.value)} placeholder="Teks Item" className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200" />
                <select value={item.correctBinId} onChange={(e) => handleUpdateItem(i, 'correctBinId', e.target.value)} className="w-48 px-2 py-1.5 rounded-lg border border-gray-200 font-medium">
                  <option value="" disabled>Pilih Tujuan...</option>
                  {bins.map((b: any) => <option key={b.id} value={b.id}>{b.title || 'Tanpa Nama'}</option>)}
                </select>
                <button type="button" onClick={() => handleRemoveItem(i)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm opacity-50 italic py-2">Belum ada item. Tambahkan keranjang terlebih dahulu.</p>}
          </div>
        </div>
      </div>
    );
  }

  // 16. CATCH THE BASKET
  if (gameType === "catch_basket") {
    const cbData = data?.catch_basket || { targetCategory: "Target Benda", items: [] };
    const items = cbData.items || [];
    
    const handleAdd = () => onChange({ ...data, catch_basket: { ...cbData, items: [...items, { text: "", isTarget: true }] } });
    const handleUpdate = (idx: number, key: string, value: any) => {
      const newItems = [...items];
      newItems[idx] = { ...newItems[idx], [key]: value };
      onChange({ ...data, catch_basket: { ...cbData, items: newItems } });
    };
    const handleRemove = (idx: number) => {
      const newItems = [...items];
      newItems.splice(idx, 1);
      onChange({ ...data, catch_basket: { ...cbData, items: newItems } });
    };

    return (
      <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-emerald-900">Catch the Basket Editor</h3>
            <p className="text-sm opacity-70">Geser keranjang untuk menangkap benda yang benar.</p>
          </div>
          <button type="button" onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-bold opacity-70 mb-1">Target Benda (Yang Harus Ditangkap)</label>
          <input 
            type="text"
            value={cbData.targetCategory} 
            onChange={(e) => onChange({ ...data, catch_basket: { ...cbData, targetCategory: e.target.value } })} 
            placeholder="Misal: Hewan Herbivora"
            className="w-full px-4 py-2 rounded-lg border border-emerald-300 font-bold text-emerald-800" 
          />
        </div>

        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex gap-2 bg-white p-2 rounded-xl border shadow-sm items-center">
              <input 
                type="text" 
                value={item.text} 
                onChange={(e) => handleUpdate(i, 'text', e.target.value)} 
                placeholder="Teks (Misal: Sapi)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 font-medium" 
              />
              <select 
                value={item.isTarget ? "true" : "false"}
                onChange={(e) => handleUpdate(i, 'isTarget', e.target.value === "true")}
                className={`w-32 px-2 py-2 rounded-lg border text-sm font-bold ${item.isTarget ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                <option value="true">Ditangkap</option>
                <option value="false">Dihindari (Bom)</option>
              </select>
              <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-sm opacity-50 italic py-4">Belum ada item jatuhan.</p>}
        </div>
      </div>
    );
  }

  // Placeholder for other games not yet implemented
  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
      <p className="text-slate-800 font-bold mb-2">UI Editor untuk "{gameType}" belum tersedia (Tahap Pengembangan).</p>
      <p className="text-sm opacity-70 text-slate-500">Data game akan tetap tersimpan dalam format JSON raw di database.</p>
    </div>
  );
}
