"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, ArrowRight, RefreshCcw } from "lucide-react";
import { QuizData } from "../../../teacher/materials/components/QuizBuilder";
import { sfx } from "@/lib/audio";

interface Props {
  data: QuizData;
  kkmScore: number;
  onPass: (score: number) => void;
  onCancel: () => void;
}

export default function QuizGate({ data, kkmScore, onPass, onCancel }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(data.questions[0]?.timeLimit || 15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = data.questions[currentIndex];

  useEffect(() => {
    if (isFinished || showFeedback || !currentQuestion) return;
    
    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }
    
    if (timeLeft <= 3) {
      sfx.playTimerTick();
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, showFeedback, currentQuestion]);

  useEffect(() => {
    if (isFinished) {
      if (score >= kkmScore) {
        sfx.playUnlock();
      } else {
        sfx.playWrong();
      }
    }
  }, [isFinished, score, kkmScore]);

  const handleTimeOut = () => {
    if (showFeedback) return;
    sfx.playWrong();
    setSelectedOption(-1); // -1 means timeout/wrong
    setShowFeedback(true);
    setTimeout(nextQuestion, 2000);
  };

  const handleOptionClick = (index: number) => {
    if (showFeedback) return;
    
    setSelectedOption(index);
    setShowFeedback(true);
    
    if (index === currentQuestion.correctAnswerIndex) {
      sfx.playCorrect();
      setScore(prev => prev + (100 / data.questions.length));
    } else {
      sfx.playWrong();
    }
    
    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = () => {
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(data.questions[currentIndex + 1].timeLimit);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(data.questions[0]?.timeLimit || 15);
    setSelectedOption(null);
    setShowFeedback(false);
    setIsFinished(false);
  };

  if (!currentQuestion) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold opacity-50">This quiz has no questions.</h3>
        <button onClick={() => onPass(100)} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl">Skip Quiz</button>
      </div>
    );
  }

  if (isFinished) {
    const passed = score >= kkmScore;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
          {passed ? (
            <CheckCircle className="w-24 h-24 text-success" />
          ) : (
            <XCircle className="w-24 h-24 text-red-500" />
          )}
        </motion.div>
        
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {passed ? "Gate Unlocked!" : "Gateway Failed"}
        </h2>
        <p className="text-xl opacity-80 mb-2">
          You scored {Math.round(score)}% (Required: {kkmScore}%)
        </p>
        
        {!passed && (
          <p className="opacity-60 mb-8 max-w-md">
            You need to understand the theory better before unlocking the game. Try taking the quiz again.
          </p>
        )}

        <div className="flex gap-4 mt-8">
          {!passed ? (
            <button 
              onClick={() => { sfx.playClick(); resetQuiz(); }}
              onMouseEnter={() => sfx.playHover()}
              className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg flex items-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" /> Try Again
            </button>
          ) : (
            <button 
              onClick={() => { sfx.playClick(); onPass(score); }}
              onMouseEnter={() => sfx.playHover()}
              className="px-8 py-4 bg-success text-white font-bold rounded-xl hover:bg-success-hover transition-colors shadow-lg flex items-center gap-2 animate-bounce"
            >
              Enter Game <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => { sfx.playClick(); onCancel(); }}
            onMouseEnter={() => sfx.playHover()}
            className="px-8 py-4 bg-black/10 text-foreground font-bold rounded-xl hover:bg-black/20 transition-colors"
          >
            Back to Theory
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-card-bg backdrop-blur-md rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-black/10 w-full">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(currentIndex / data.questions.length) * 100}%` }}
        />
      </div>

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="bg-primary/20 text-primary px-4 py-1.5 rounded-full font-bold text-sm">
            Question {currentIndex + 1} of {data.questions.length}
          </div>
          <div className="flex items-center gap-2 text-red-500 font-bold bg-red-500/10 px-4 py-1.5 rounded-full">
            <Clock className="w-4 h-4" /> 00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-8 text-center">{currentQuestion.question}</h3>

        <div className="space-y-4">
          <AnimatePresence>
            {currentQuestion.options.map((opt, idx) => {
              let btnClass = "bg-black/5 hover:bg-black/10 border-transparent text-foreground";
              if (showFeedback) {
                if (idx === currentQuestion.correctAnswerIndex) {
                  btnClass = "bg-success text-white border-success shadow-lg transform scale-[1.02]";
                } else if (idx === selectedOption) {
                  btnClass = "bg-red-500 text-white border-red-500";
                } else {
                  btnClass = "bg-black/5 opacity-50";
                }
              }

              return (
                <motion.button
                  key={idx}
                  disabled={showFeedback}
                  onClick={() => handleOptionClick(idx)}
                  onMouseEnter={() => sfx.playHover()}
                  className={`w-full text-left p-4 rounded-xl border-2 font-bold text-lg transition-all ${btnClass}`}
                >
                  {opt}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
