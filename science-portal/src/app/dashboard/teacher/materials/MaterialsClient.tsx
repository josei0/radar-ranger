"use client";

import { useState, useRef } from "react";
import { Material } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Edit2, Trash2, X, ArrowLeft, Image as ImageIcon, Video, Bold, Heading, Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { createMaterial, updateMaterial, deleteMaterial, toggleMaterialStatus } from "../actions";
import RichEditor from "@/components/RichEditor";
import QuizBuilder from "./components/QuizBuilder";
import GameBuilder from "./components/GameBuilder";

export default function MaterialsClient({ materials }: { materials: Material[] }) {
  const [editingMaterial, setEditingMaterial] = useState<Material | Partial<Material> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredMaterials = materials
    .filter(m => filterCategory === "all" || m.category === filterCategory)
    .sort((a, b) => {
      const orderA = a.topic_order ?? 0;
      const orderB = b.topic_order ?? 0;
      return sortOrder === "asc" ? orderA - orderB : orderB - orderA;
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    setSaving(true);
    
    const materialToSave = { ...editingMaterial };
    if (!materialToSave.game_slug && materialToSave.title) {
      // Generate unique slug from title
      materialToSave.game_slug = materialToSave.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }

    let result;
    if ('id' in materialToSave && materialToSave.id) {
      result = await updateMaterial(materialToSave.id, materialToSave);
    } else {
      result = await createMaterial(materialToSave);
    }
    
    setSaving(false);
    
    if (result && result.error) {
      alert("Error saving material: " + result.error);
      return;
    }
    
    setEditingMaterial(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this material? This will also delete all student progress for this material.")) {
      const result = await deleteMaterial(id);
      if (result && result.error) {
        alert("Error deleting material: " + result.error);
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await toggleMaterialStatus(id, !currentStatus);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-black" style={{ fontFamily: "var(--font-heading)" }}>Manage Materials</h1>
          </div>
        </div>
        <button 
          onClick={() => setEditingMaterial({
            title: "", description: "", category: "sd_1_3", topic_order: materials.length + 1,
            game_slug: "", game_type: "sensor_match", kkm_score: 70, theory_content: "", is_published: true
          })}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" /> Add Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-card-bg border border-card-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 opacity-70" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent border border-card-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-sm"
          >
            <option value="all">All Categories</option>
            <option value="sd_1_3">SD Kelas 1-3</option>
            <option value="sd_4_6">SD Kelas 4-6</option>
            <option value="smp_7_9">SMP Kelas 7-9</option>
            <option value="sma_10_12">SMA Kelas 10-12</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 opacity-70" />
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="bg-transparent border border-card-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-sm"
          >
            <option value="asc">Order (Ascending)</option>
            <option value="desc">Order (Descending)</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 border-b border-card-border text-sm uppercase tracking-wider opacity-70">
                <th className="p-6 font-bold">Order</th>
                <th className="p-6 font-bold w-1/3">Title</th>
                <th className="p-6 font-bold">Category</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center opacity-60 font-bold">No materials found.</td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => (
                  <tr key={mat.id} className="border-b border-card-border last:border-0 hover:bg-black/5 transition-colors">
                    <td className="p-6 font-bold text-lg text-primary">{mat.topic_order}</td>
                    <td className="p-6">
                      <div className="font-bold text-lg mb-1">{mat.title}</div>
                      <div className="text-sm opacity-70 line-clamp-1">{mat.description}</div>
                    </td>
                    <td className="p-6">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 uppercase">
                        {mat.category}
                      </span>
                    </td>
                    <td className="p-6">
                      <button
                        onClick={() => handleToggleStatus(mat.id, mat.is_published ?? true)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          (mat.is_published ?? true) ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (mat.is_published ?? true) ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div className="text-xs mt-1 font-bold opacity-70 uppercase tracking-wider">
                        {(mat.is_published ?? true) ? 'Open' : 'Locked'}
                      </div>
                    </td>
                    <td className="p-6 text-center space-x-3">
                      <button 
                        onClick={() => setEditingMaterial(mat)}
                        className="p-2 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500/20 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(mat.id)}
                        className="p-2 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {editingMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card-bg w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setEditingMaterial(null)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-black mb-4 flex-shrink-0" style={{ fontFamily: "var(--font-heading)" }}>
                {'id' in editingMaterial ? "Edit Material" : "Add Material"}
              </h2>
              
              <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                <div className="overflow-y-auto pr-4 space-y-4 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold opacity-70 mb-1">Title</label>
                      <input 
                        required type="text"
                        value={editingMaterial.title || ""}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold opacity-70 mb-1">Description</label>
                      <textarea 
                        required rows={2}
                        value={editingMaterial.description || ""}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium resize-none"
                      />
                    </div>

                  <div>
                    <label className="block text-sm font-bold opacity-70 mb-1">Category</label>
                    <select 
                      value={editingMaterial.category || "sd_1_3"}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, category: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                    >
                      <option value="sd_1_3">Elementary 1-3</option>
                      <option value="sd_4_6">Elementary 4-6</option>
                      <option value="smp_7_9">Middle School 7-9</option>
                      <option value="sma_10_12">High School 10-12</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold opacity-70 mb-1">Topic Order</label>
                    <input 
                      required type="number" min="1"
                      value={editingMaterial.topic_order || 1}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, topic_order: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold opacity-70 mb-1">Initial Status</label>
                    <select 
                      value={(editingMaterial.is_published ?? true) ? "true" : "false"}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, is_published: e.target.value === "true" })}
                      className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                    >
                      <option value="true">Open (Published)</option>
                      <option value="false">Locked (Hidden from students)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold opacity-70 mb-1">Game Type (After Quiz)</label>
                    <select 
                      value={editingMaterial.game_type || "sensor_match"}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, game_type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                    >
                      <option value="sensor_match">Sensor Match (Drag & Drop)</option>
                      <option value="dynamic_match">Dynamic Category Match</option>
                      <option value="sequence">Sequence Order Game</option>
                      <option value="word_scramble">Word Scramble (Susun Kata)</option>
                      <option value="true_false">Rapid True/False (Benar/Salah)</option>
                      <option value="memory_match">Memory Card Match (Kartu Memori)</option>
                      <option value="fill_blanks">Fill in the Blanks (Kalimat Rumpang)</option>
                      <option value="odd_one_out">Odd One Out (Cari Yang Berbeda)</option>
                      <option value="visual_quiz">Visual Quiz (Kuis Gambar 4 Pilihan)</option>
                      <option value="word_guess">Word Guess (Hangman Edukasi)</option>
                      <option value="balloon_pop">Balloon Pop (Pecahkan Balon)</option>
                      <option value="sorting_bins">Sorting Bins (Keranjang Klasifikasi)</option>
                      <option value="falling_words">Falling Words (Hujan Kata)</option>
                      <option value="truth_or_myth">Truth or Myth (Swipe)</option>
                      <option value="science_wordle">Science Wordle</option>
                      <option value="catch_basket">Catch the Basket</option>
                      <option value="none">No Game</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold opacity-70 mb-1">KKM Score</label>
                    <input 
                      required type="number" min="0" max="100"
                      value={editingMaterial.kkm_score || 70}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, kkm_score: parseInt(e.target.value) || 70 })}
                      className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold opacity-70 mb-2">Theory Content</label>
                    <RichEditor 
                      value={editingMaterial.theory_content || ""}
                      onChange={(value) => setEditingMaterial({ ...editingMaterial, theory_content: value })}
                    />
                  </div>

                  <div className="col-span-2 mt-4 pt-6 border-t border-card-border">
                    <QuizBuilder 
                      data={editingMaterial.quiz_data || { questions: [] }}
                      onChange={(data) => setEditingMaterial({ ...editingMaterial, quiz_data: data })}
                    />
                  </div>

                  <div className="col-span-2 mt-4 pt-6 border-t border-card-border">
                    <GameBuilder 
                      gameType={editingMaterial.game_type || "sensor_match"}
                      data={editingMaterial.game_data || {}}
                      onChange={(data) => setEditingMaterial({ ...editingMaterial, game_data: data })}
                    />
                  </div>
                </div>
              </div>

                <div className="pt-4 mt-2 border-t border-card-border flex-shrink-0">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Material"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
