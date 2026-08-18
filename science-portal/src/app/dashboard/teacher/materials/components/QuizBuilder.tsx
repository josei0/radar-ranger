import { Plus, Trash2, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  timeLimit: number;
}

export interface QuizData {
  questions: QuizQuestion[];
}

interface Props {
  data: QuizData | null;
  onChange: (data: QuizData) => void;
}

export default function QuizBuilder({ data, onChange }: Props) {
  const questions = data?.questions || [];

  const addQuestion = () => {
    onChange({
      questions: [
        ...questions,
        { question: "", options: ["", "", "", ""], correctAnswerIndex: 0, timeLimit: 15 }
      ]
    });
  };

  const updateQuestion = (index: number, updated: Partial<QuizQuestion>) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], ...updated };
    onChange({ questions: newQs });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQs = [...questions];
    const newOpts = [...newQs[qIndex].options];
    newOpts[optIndex] = value;
    newQs[qIndex].options = newOpts;
    onChange({ questions: newQs });
  };

  const removeQuestion = (index: number) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    onChange({ questions: newQs });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg">Quiz Questions (Theory Gate)</h3>
        <button 
          type="button" 
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-hover transition-colors font-bold text-sm shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      <AnimatePresence>
        {questions.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8 bg-black/5 rounded-xl border border-dashed border-black/20">
            <p className="opacity-60 font-medium">No quiz questions yet. Add one to enable the Gateway Assessment.</p>
          </motion.div>
        )}
        
        {questions.map((q, qIndex) => (
          <motion.div 
            key={qIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm relative group"
          >
            <button 
              type="button"
              onClick={() => removeQuestion(qIndex)}
              className="absolute top-4 right-4 p-2 text-red-500 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex gap-4 mb-4">
              <div className="mt-2 text-primary opacity-50 cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold opacity-70 uppercase tracking-widest mb-1">Question {qIndex + 1}</label>
                  <textarea 
                    rows={2}
                    placeholder="Enter question text..."
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold opacity-70 uppercase tracking-widest mb-2">Options & Correct Answer</label>
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name={`correct-${qIndex}`} 
                            checked={q.correctAnswerIndex === optIndex}
                            onChange={() => updateQuestion(qIndex, { correctAnswerIndex: optIndex })}
                            className="w-5 h-5 accent-success"
                          />
                          <input 
                            type="text" 
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium ${
                              q.correctAnswerIndex === optIndex 
                                ? 'bg-success/10 border-success/30 text-success-700' 
                                : 'bg-black/5 border-black/10'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold opacity-70 uppercase tracking-widest mb-2">Settings</label>
                    <div className="bg-black/5 p-4 rounded-xl border border-black/10">
                      <label className="block text-xs font-bold opacity-70 mb-1">Time Limit (Seconds)</label>
                      <input 
                        type="number" min="5" max="120"
                        value={q.timeLimit}
                        onChange={(e) => updateQuestion(qIndex, { timeLimit: parseInt(e.target.value) || 15 })}
                        className="w-full px-4 py-2 bg-white border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                      />
                      <p className="text-xs opacity-50 mt-2">How long the student has to answer this question before it auto-fails.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
