"use client";
import "react-quill-new/dist/quill.snow.css";

import { useState, useEffect } from "react";
import { Material, Progress, Profile } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Gamepad2, CheckCircle, Lock, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { markTheoryCompleted } from "../../actions";
import SensorMatch from "./games/SensorMatch";
import DynamicMatch from "./games/DynamicMatch";
import SequenceGame from "./games/SequenceGame";
import WordScramble from "./games/WordScramble";
import TrueFalseGame from "./games/TrueFalseGame";
import MemoryGame from "./games/MemoryGame";
import FillBlanksGame from "./games/FillBlanksGame";
import OddOneOut from "./games/OddOneOut";
import VisualQuiz from "./games/VisualQuiz";
import WordGuess from "./games/WordGuess";
import BalloonPop from "./games/BalloonPop";
import SortingBins from "./games/SortingBins";
import FallingWords from "./games/FallingWords";
import TruthOrMyth from "./games/TruthOrMyth";
import ScienceWordle from "./games/ScienceWordle";
import CatchBasket from "./games/CatchBasket";
import LevelUpModal from "../../components/LevelUpModal";
import { calculateLevel } from "@/lib/utils/level";
import QuizGate from "./components/QuizGate";
import { useAudio } from "@/app/components/AudioProvider";
import { sfx } from "@/lib/audio";
interface Props {
  material: Material;
  progress: Progress | null;
  profile: Profile | null;
}

export default function ModuleClient({ material, progress, profile }: Props) {
  const [activeTab, setActiveTab] = useState<"theory" | "game">("theory");
  const [loading, setLoading] = useState(false);
  const [localProgress, setLocalProgress] = useState<Progress | null>(progress);
  const [showQuiz, setShowQuiz] = useState(false);

  // Gamification states
  const [currentXp, setCurrentXp] = useState(profile?.xp ?? 0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelData, setLevelData] = useState({ oldLevel: 1, newLevel: 1 });

  const { playBGM } = useAudio();

  useEffect(() => {
    if (activeTab === "game") {
      playBGM("game");
    } else if (showQuiz) {
      playBGM("quiz");
    } else {
      playBGM("dashboard");
    }
  }, [activeTab, showQuiz, playBGM]);

  const isTeacher = profile?.role === "teacher";
  const isTheoryCompleted = isTeacher || localProgress?.is_theory_completed;

  const checkLevelUp = (addedXp: number) => {
    if (addedXp > 0) {
      const oldLevel = calculateLevel(currentXp).level;
      const newXp = currentXp + addedXp;
      const newLevel = calculateLevel(newXp).level;
      
      setCurrentXp(newXp);
      
      if (newLevel > oldLevel) {
        setLevelData({ oldLevel, newLevel });
        setShowLevelUp(true);
      }
    }
  };
  
  // Adaptive Learning Lock Check
  const lockedUntilStr = localProgress?.locked_until;
  let isLocked = false;
  let remainingMinutes = 0;

  if (!isTeacher && lockedUntilStr) {
    const lockTime = new Date(lockedUntilStr).getTime();
    const now = new Date().getTime();
    if (lockTime > now) {
      isLocked = true;
      remainingMinutes = Math.ceil((lockTime - now) / 60000);
    }
  }

  const handleStartQuizOrGame = () => {
    if (isTheoryCompleted) {
      setActiveTab("game");
      return;
    }

    if (material.quiz_data?.questions && material.quiz_data.questions.length > 0) {
      setShowQuiz(true);
    } else {
      handleMarkTheoryCompleted();
    }
  };

  const handleQuizPassed = async (score: number) => {
    setShowQuiz(false);
    await handleMarkTheoryCompleted();
  };

  const handleMarkTheoryCompleted = async () => {
    if (isTheoryCompleted) {
      setActiveTab("game");
      return;
    }
    
    setLoading(true);
    const result = await markTheoryCompleted(material.id);
    if (result.success) {
      // Optimistically update
      setLocalProgress(prev => ({
        ...prev!,
        is_theory_completed: true
      }));
      setActiveTab("game");
      
      if (result.addedXp) {
        checkLevelUp(result.addedXp);
      }
    }
    setLoading(false);
  };

  const renderGame = () => {
    // Override game_type for Panca Indra because it was seeded as 'drag-and-drop'
    const gameType = material.game_type === "drag-and-drop" && material.id === 1 ? "sensor_match" : material.game_type;
    
    if (gameType === "sensor_match") {
      return (
        <SensorMatch 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "dynamic_match") {
      return (
        <DynamicMatch 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "sequence") {
      return (
        <SequenceGame 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "word_scramble") {
      return (
        <WordScramble 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "true_false") {
      return (
        <TrueFalseGame 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "memory_match") {
      return (
        <MemoryGame 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "fill_blanks") {
      return (
        <FillBlanksGame 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "odd_one_out") {
      return (
        <OddOneOut 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "visual_quiz") {
      return (
        <VisualQuiz 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "word_guess") {
      return (
        <WordGuess 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "balloon_pop") {
      return (
        <BalloonPop 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "sorting_bins") {
      return (
        <SortingBins 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "falling_words") {
      return (
        <FallingWords 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "truth_or_myth") {
      return (
        <TruthOrMyth 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "science_wordle") {
      return (
        <ScienceWordle 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    if (gameType === "catch_basket") {
      return (
        <CatchBasket 
          materialId={material.id} 
          currentHighscore={localProgress?.highscore ?? 0}
          gameData={material.game_data}
          onProgressUpdate={(newProg: any) => {
            setLocalProgress(prev => ({ ...prev, ...newProg } as Progress));
            if (newProg.addedXp) {
              checkLevelUp(newProg.addedXp);
            }
          }}
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-300 rounded-3xl">
        <Gamepad2 className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-600">Game In Development</h3>
        <p className="text-gray-500 mt-2">This game is not yet available.</p>
      </div>
    );
  };

  const pancaIndraTheory = `
<h1>Mengenal Panca Indra Kita 🖐️👀👃👅👂</h1>

<p>Tubuh manusia itu sangat luar biasa! Kita memiliki <strong>5 alat khusus</strong> yang disebut sebagai <strong>Panca Indra</strong>. Panca indra membantu kita untuk mengetahui apa yang terjadi di sekitar kita.</p>

<p>Tanpa panca indra, kita tidak akan bisa melihat indahnya pelangi, mendengarkan musik favorit, atau merasakan lezatnya es krim!</p>

<p>Mari kita pelajari satu per satu:</p>

<hr style="margin: 2rem 0; opacity: 0.2;" />

<h2>1. Mata (Indra Penglihat) 👀</h2>
<p>Mata kita bekerja seperti kamera ajaib. Dengan mata, kita bisa melihat warna, cahaya, bentuk, dan ukuran benda.</p>
<ul style="list-style-type: disc; margin-left: 1.5rem;">
  <li><strong>Fungsi:</strong> Melihat indahnya pemandangan, membaca buku, dan menonton kartun kesukaanmu!</li>
</ul>

<br/>

<h2>2. Telinga (Indra Pendengar) 👂</h2>
<p>Pernahkah kamu mendengar suara burung berkicau atau suara petir yang keras? Itu semua berkat telinga kita!</p>
<ul style="list-style-type: disc; margin-left: 1.5rem;">
  <li><strong>Fungsi:</strong> Mendengarkan suara, musik, ucapan orang tua, dan mendeteksi bahaya (seperti klakson mobil).</li>
</ul>

<br/>

<h2>3. Hidung (Indra Pencium) 👃</h2>
<p>Coba tarik napas dalam-dalam. Apakah ada wangi bunga atau bau masakan ibu di dapur? Hidung kita membantu kita mencium aroma.</p>
<ul style="list-style-type: disc; margin-left: 1.5rem;">
  <li><strong>Fungsi:</strong> Mencium wangi parfum, bau tidak sedap (seperti sampah agar kita menjauh), dan mengenali bau makanan.</li>
</ul>

<br/>

<h2>4. Lidah (Indra Pengecap) 👅</h2>
<p>Di permukaan lidah kita ada bintik-bintik kecil yang hebat. Mereka bisa mendeteksi rasa manis, asam, asin, dan pahit!</p>
<ul style="list-style-type: disc; margin-left: 1.5rem;">
  <li><strong>Fungsi:</strong> Merasakan manisnya cokelat, asinnya garam, atau asamnya jeruk. Yummy!</li>
</ul>

<br/>

<h2>5. Kulit (Indra Peraba) ✋</h2>
<p>Kulit membungkus seluruh tubuh kita dari kepala sampai kaki. Dengan kulit, kita bisa merasakan apakah benda itu kasar, halus, panas, atau dingin.</p>
<ul style="list-style-type: disc; margin-left: 1.5rem;">
  <li><strong>Fungsi:</strong> Merasakan lembutnya bulu kucing, panasnya api, dan dinginnya es.</li>
</ul>
  `;

  const renderTheory = () => {
    let content = material.theory_content;
    let formattedHtml = content;
    
    // Check if content is truly empty or just Quill's empty state
    const isEmptyQuill = !content || content.trim() === "" || content.trim() === "<p><br></p>";
    
    if (isEmptyQuill && material.id === 1) {
      formattedHtml = pancaIndraTheory;
    }
    
    // Fix Quill paste bug where it uses non-breaking spaces (&nbsp;) which prevents text wrapping
    if (formattedHtml) {
      formattedHtml = formattedHtml.replace(/&nbsp;/g, ' ');
    }

    // Auto-convert any youtube links (whether plain text or <a> tags) into iframes
    if (formattedHtml) {
      // Handle <a href="youtube.com/embed/...">...</a>
      formattedHtml = formattedHtml.replace(
        /<a\s+(?:[^>]*?\s+)?href=["'](https?:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+)(?:\?[^"']*)?["'][^>]*>.*?<\/a>/gi,
        '<iframe class="ql-video" src="$1" frameborder="0" allowfullscreen="true"></iframe>'
      );
      // Handle plain text youtube embed links
      formattedHtml = formattedHtml.replace(
        /(?<!["'])(https?:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+)/gi,
        '<iframe class="ql-video" src="$1" frameborder="0" allowfullscreen="true"></iframe>'
      );
    }

    return (
      <div 
        className="prose prose-lg max-w-none text-foreground prose-p:text-foreground prose-headings:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-p:m-0 prose-li:m-0 prose-ul:m-0 prose-ol:m-0 prose-h1:font-black prose-h2:font-bold prose-h2:text-primary prose-strong:text-secondary prose-iframe:w-full prose-iframe:aspect-video prose-iframe:rounded-xl prose-iframe:shadow-lg"
        dangerouslySetInnerHTML={{ __html: formattedHtml ?? "" }}
      />
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Dynamic Background Element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {/* We use CSS variables to adapt colors to the current theme */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-blob bg-primary/20"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[30rem] h-[30rem] rounded-full mix-blend-screen filter blur-[120px] animate-blob bg-secondary/10" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <div className="max-w-5xl mx-auto space-y-6 pb-20 relative z-10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/dashboard" 
          onClick={() => sfx.playClick()}
          onMouseEnter={() => sfx.playHover()}
          className="flex items-center gap-2 text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-bold shadow-sm">
          {material.badge_name || (material.category === "sd_1_3" ? "SD Kelas 1-3" : material.category === "sd_4_6" ? "SD Kelas 4-6" : material.category === "smp_7_9" ? "SMP Kelas 7-9" : material.category === "sma_10_12" ? "SMA Kelas 10-12" : "Module")}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-bg rounded-3xl border border-card-border shadow-xl overflow-hidden"
      >
        {/* Title Area */}
        <div className="p-8 border-b border-card-border bg-black/5">
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {material.title}
          </h1>
          <p className="opacity-70 font-medium">
            {material.description}
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="p-4 sm:p-6 pb-0 border-b border-card-border bg-black/5">
          <div className="flex bg-black/10 backdrop-blur-md rounded-2xl p-1 border border-white/10 shadow-inner">
            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab("theory");
                setShowQuiz(false);
              }}
              onMouseEnter={() => sfx.playHover()}
              className={`flex-1 py-3 px-4 font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                activeTab === "theory" 
                  ? "bg-primary text-white shadow-lg shadow-primary/30 transform scale-[1.02]" 
                  : "hover:bg-white/5 opacity-70 hover:opacity-100 text-foreground"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Theory Lesson
            </button>
            
            <button
              onClick={() => {
                if (isTheoryCompleted) {
                  sfx.playClick();
                  setActiveTab("game");
                }
              }}
              onMouseEnter={() => sfx.playHover()}
              disabled={!isTheoryCompleted && !isTeacher}
              className={`flex-1 py-3 px-4 font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                activeTab === "game" 
                  ? "bg-secondary text-white shadow-lg shadow-secondary/30 transform scale-[1.02]" 
                  : !isTheoryCompleted && !isTeacher
                    ? "opacity-30 cursor-not-allowed bg-transparent text-foreground"
                    : "hover:bg-white/5 opacity-70 hover:opacity-100 text-foreground"
              }`}
            >
              {isLocked ? (
                <Clock className="w-5 h-5" />
              ) : !isTheoryCompleted && !isTeacher ? (
                <Lock className="w-5 h-5" />
              ) : (
                <Gamepad2 className="w-5 h-5" />
              )}
              Interactive Game
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-10 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "theory" && (
              <motion.div
                key="theory"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {showQuiz ? (
                  <QuizGate 
                    data={material.quiz_data} 
                    kkmScore={material.kkm_score || 70} 
                    onPass={handleQuizPassed} 
                    onCancel={() => setShowQuiz(false)} 
                  />
                ) : (
                  <>
                    {renderTheory()}

                    {!isTeacher && (
                      <div className="pt-8 border-t border-card-border flex justify-center">
                        <button
                          onClick={() => {
                            sfx.playClick();
                            handleStartQuizOrGame();
                          }}
                          onMouseEnter={() => sfx.playHover()}
                          disabled={loading}
                          className={`relative overflow-hidden py-4 px-8 rounded-2xl font-black flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-2xl group ${
                            isTheoryCompleted 
                              ? "bg-success text-white shadow-success/40"
                              : "bg-primary text-white shadow-primary/40 hover:shadow-primary/60"
                          }`}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                          
                          <span className="relative z-10 flex items-center gap-3">
                            {loading ? (
                              <span className="animate-pulse">Loading...</span>
                            ) : isTheoryCompleted ? (
                              <>
                                <CheckCircle className="w-6 h-6" />
                                Theory Completed - Play Game
                              </>
                            ) : (
                              <>
                                <BookOpen className="w-6 h-6" />
                                I Understand! Let's Play
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "game" && (
              <motion.div
                key="game"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {isLocked ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/10 border-2 border-red-500/30 rounded-3xl backdrop-blur-sm">
                    <Lock className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-2xl font-black text-red-600 mb-2">Adaptive Learning Lock</h3>
                    <p className="text-lg opacity-80 max-w-md">
                      You've struggled a few times. Take a moment to read the theory again.
                    </p>
                    <p className="mt-4 font-bold text-xl text-red-500">
                      Unlocks in {remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''}
                    </p>
                    <button 
                      onClick={() => setActiveTab("theory")}
                      className="mt-6 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                    >
                      Review Theory
                    </button>
                  </div>
                ) : (
                  renderGame()
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <LevelUpModal 
        isOpen={showLevelUp} 
        onClose={() => setShowLevelUp(false)} 
        oldLevel={levelData.oldLevel} 
        newLevel={levelData.newLevel} 
      />
    </div>
    </div>
  );
}
