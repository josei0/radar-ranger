"use client";

import { useState } from "react";
import { Profile, gradeToCategory } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Edit2, LineChart, X, Trophy, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updateStudent } from "../actions";

export default function StudentsClient({ students, progressList }: { students: Profile[], progressList: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Profile | null>(null);
  const [viewingProgress, setViewingProgress] = useState<Profile | null>(null);
  
  const [editForm, setEditForm] = useState({ display_name: "", grade_level: 1 });
  const [saving, setSaving] = useState(false);

  const filteredStudents = students.filter(s => 
    s.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (student: Profile) => {
    setEditingStudent(student);
    setEditForm({ display_name: student.display_name, grade_level: student.grade_level || 1 });
  };

  const handleSaveStudent = async () => {
    if (!editingStudent) return;
    setSaving(true);
    await updateStudent(editingStudent.id, {
      display_name: editForm.display_name,
      grade_level: editForm.grade_level
    });
    setSaving(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black" style={{ fontFamily: "var(--font-heading)" }}>Manage Students</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search students by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-card-bg border border-card-border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-lg transition-all"
        />
      </div>

      {/* Students Table */}
      <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 border-b border-card-border text-sm uppercase tracking-wider opacity-70">
                <th className="p-6 font-bold">Name</th>
                <th className="p-6 font-bold">Grade Level</th>
                <th className="p-6 font-bold">Total XP</th>
                <th className="p-6 font-bold">Streak</th>
                <th className="p-6 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center opacity-60 font-bold">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-card-border last:border-0 hover:bg-black/5 transition-colors">
                    <td className="p-6 font-bold text-lg">{student.display_name}</td>
                    <td className="p-6">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                        {student.grade_level ? `Grade ${student.grade_level} (${gradeToCategory(student.grade_level)})` : "Unassigned"}
                      </span>
                    </td>
                    <td className="p-6 font-black text-yellow-500">{student.xp} XP</td>
                    <td className="p-6 font-bold opacity-80">{student.weekly_streak} weeks</td>
                    <td className="p-6 text-center space-x-3">
                      <button 
                        onClick={() => setViewingProgress(student)}
                        className="p-2 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500/20 transition-colors"
                        title="View Progress"
                      >
                        <LineChart className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEditClick(student)}
                        className="p-2 bg-orange-500/10 text-orange-600 rounded-xl hover:bg-orange-500/20 transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card-bg w-full max-w-md rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingStudent(null)}
                className="absolute top-6 right-6 opacity-50 hover:opacity-100"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-black mb-6" style={{ fontFamily: "var(--font-heading)" }}>Edit Student</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold opacity-70 mb-2">Display Name</label>
                  <input 
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold opacity-70 mb-2">Grade Level (1-12)</label>
                  <input 
                    type="number"
                    min="1" max="12"
                    value={editForm.grade_level}
                    onChange={(e) => setEditForm({ ...editForm, grade_level: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>

                <button 
                  onClick={handleSaveStudent}
                  disabled={saving}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl mt-4 hover:bg-primary-hover transition-colors shadow-lg disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress Modal */}
      <AnimatePresence>
        {viewingProgress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card-bg w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl relative flex flex-col"
            >
              <div className="p-8 border-b border-card-border flex justify-between items-center bg-black/5">
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                    Progress: {viewingProgress.display_name}
                  </h2>
                  <p className="text-sm opacity-70 font-medium">Viewing learning history and module statistics.</p>
                </div>
                <button 
                  onClick={() => setViewingProgress(null)}
                  className="p-2 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {progressList.filter(p => p.user_id === viewingProgress.id).length === 0 ? (
                    <div className="col-span-full text-center p-12 opacity-50 font-bold border-2 border-dashed border-gray-300 rounded-2xl">
                      Student hasn't started any modules yet.
                    </div>
                  ) : (
                    progressList.filter(p => p.user_id === viewingProgress.id).map(prog => (
                      <div key={prog.id} className="border border-card-border p-5 rounded-2xl bg-black/5 relative overflow-hidden">
                        {prog.is_module_completed && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            COMPLETED
                          </div>
                        )}
                        <h3 className="font-bold text-lg mb-1 pr-16">{prog.materials?.title}</h3>
                        <div className="text-xs font-bold text-primary mb-4 uppercase tracking-wider">{prog.materials?.category}</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-black/5 text-center">
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Highscore</div>
                            <div className="font-black text-xl text-yellow-600">{prog.highscore}</div>
                          </div>
                          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-black/5 text-center">
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1">XP Earned</div>
                            <div className="font-black text-xl text-blue-600">+{prog.xp_earned}</div>
                          </div>
                          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-black/5 text-center">
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Fails</div>
                            <div className="font-black text-xl text-red-500">{prog.consecutive_fails}</div>
                          </div>
                          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-black/5 text-center">
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Attempts</div>
                            <div className="font-black text-xl">{prog.attempts}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
