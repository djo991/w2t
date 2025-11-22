// src/components/QuizModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, MapPin, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Studio } from "@/types";

interface Question {
  id: string;
  question_text: string;
  step_order: number;
  quiz_answers: Answer[];
}

interface Answer {
  id: string;
  answer_text: string;
  quiz_weights: Weight[];
}

interface Weight {
  style_tag: string;
  weight_value: number;
}

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userCity?: string | null;
}

export function QuizModal({ open, onOpenChange, userCity }: QuizModalProps) {
  const [step, setStep] = useState<"intro" | "questions" | "calculating" | "results">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  const [scores, setScores] = useState<Record<string, number>>({});
  const [winningStyle, setWinningStyle] = useState<string | null>(null);
  const [winningImage, setWinningImage] = useState<string | null>(null);
  const [winningDesc, setWinningDesc] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Studio[]>([]);

  useEffect(() => {
    const loadQuiz = async () => {
      const { data } = await supabase
        .from("quiz_questions")
        .select(`*, quiz_answers (*, quiz_weights (*))`)
        .eq("is_active", true)
        .order("step_order");
        
      if (data) {
        // FIXED: Cast to proper type instead of 'any'
        setQuestions(data as unknown as Question[]);
      }
    };
    loadQuiz();
  }, []);

  const handleAnswer = (answer: Answer) => {
    const newScores = { ...scores };
    answer.quiz_weights.forEach(w => {
      newScores[w.style_tag] = (newScores[w.style_tag] || 0) + w.weight_value;
    });
    setScores(newScores);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      finishQuiz(newScores);
    }
  };

  const finishQuiz = async (finalScores: Record<string, number>) => {
    setStep("calculating");

    let winner = "";
    let maxScore = -1;
    Object.entries(finalScores).forEach(([style, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winner = style;
      }
    });
    setWinningStyle(winner);

    // Fetch Style Data
    const { data: styleData } = await supabase
        .from("tattoo_styles")
        .select("image_url, description")
        .eq("slug", winner)
        .single();
    
    if (styleData) {
        setWinningImage(styleData.image_url);
        setWinningDesc(styleData.description);
    }

    // Fetch Studios
    // FIXED: Changed 'let' to 'const'
    const query = supabase
      .from("studios")
      .select("*")
      .eq("verified", true)
      .contains("styles", [winner]);

    if (userCity) {
       const { data: localData } = await query.ilike("city", `%${userCity}%`).limit(3);
       if (localData && localData.length > 0) {
          // Cast to any here is acceptable if Studio types perfectly match but DB returns extra/missing fields
          // Ideally we cast to unknown as Studio[]
          setRecommendations(localData as unknown as Studio[]);
          
          setTimeout(() => setStep("results"), 1500);
          return;
       }
    }

    const { data: globalData } = await query.order("rating", { ascending: false }).limit(3);
    setRecommendations(globalData as unknown as Studio[] || []);
    
    setTimeout(() => setStep("results"), 1500);
  };

  const restart = () => {
    setScores({});
    setCurrentQIndex(0);
    setStep("intro");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] min-h-[500px] flex flex-col p-0 overflow-hidden z-[150]">
        
        {/* --- INTRO --- */}
        {step === "intro" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gradient-to-br from-background to-secondary/20">
            <div className="w-16 h-16 bg-[hsl(var(--ink-red))] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
               <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold">Find Your Ink Personality</h2>
            <p className="text-muted-foreground max-w-md">
              Not sure what style suits you? Answer {questions.length} quick questions about your taste, and we'll match you with the perfect artists.
            </p>
            <Button size="lg" onClick={() => setStep("questions")} className="px-8">
              Start Quiz
            </Button>
          </div>
        )}

        {/* --- QUESTIONS --- */}
        {step === "questions" && questions[currentQIndex] && (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="mb-8 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    <span>Question {currentQIndex + 1} of {questions.length}</span>
                    <span>{Math.round(((currentQIndex) / questions.length) * 100)}%</span>
                </div>
                <Progress value={((currentQIndex) / questions.length) * 100} className="h-2" />
            </div>

            <h3 className="text-2xl font-bold mb-8 leading-tight">
                {questions[currentQIndex].question_text}
            </h3>

            <div className="grid gap-3">
                {questions[currentQIndex].quiz_answers.map((ans) => (
                    <button
                        key={ans.id}
                        onClick={() => handleAnswer(ans)}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-[hsl(var(--ink-red))] hover:bg-[hsl(var(--ink-red))]/5 transition-all text-left group"
                    >
                        <span className="font-medium group-hover:text-[hsl(var(--ink-red))]">{ans.answer_text}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--ink-red))]" />
                    </button>
                ))}
            </div>
          </div>
        )}

        {/* --- CALCULATING --- */}
        {step === "calculating" && (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--ink-red))]" />
              <h3 className="text-xl font-medium">Analyzing your vibe...</h3>
           </div>
        )}

        {/* --- RESULTS --- */}
        {step === "results" && (
          <div className="flex-1 flex flex-col p-0 overflow-y-auto">
             {/* Result Header */}
             <div className="relative h-64 w-full overflow-hidden shrink-0">
                {winningImage && (
                    <img src={winningImage} className="w-full h-full object-cover" alt="Style" />
                )}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-6">
                    <p className="text-sm uppercase tracking-widest opacity-80 text-white mb-2">Your Match</p>
                    <h2 className="text-4xl font-bold text-[hsl(var(--accent-gold))] mb-2">{winningStyle}</h2>
                    <p className="text-zinc-200 max-w-md mx-auto text-sm leading-relaxed">
                        {winningDesc || "Based on your answers, this style matches your aesthetic perfectly."}
                    </p>
                </div>
             </div>

             <div className="p-8 space-y-8 bg-background">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Recommended Artists</h3>
                    {userCity && <Badge variant="outline" className="text-xs"><MapPin className="w-3 h-3 mr-1" /> Near {userCity}</Badge>}
                </div>

                <div className="grid gap-4">
                    {recommendations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed">
                            No specific studios found for this style nearby. 
                            <br/>
                            <Link href={`/studios?style=${winningStyle}`} className="text-[hsl(var(--ink-red))] hover:underline mt-2 inline-block">
                                Browse all {winningStyle} studios
                            </Link>
                        </div>
                    ) : (
                        recommendations.map(studio => (
                            <div key={studio.id} className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="w-16 h-16 bg-muted rounded-md overflow-hidden shrink-0">
                                    <img src={studio.coverImage || ""} className="w-full h-full object-cover" alt="studio" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold truncate">{studio.name}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                        <MapPin className="w-3 h-3" /> {studio.location}
                                    </p>
                                    <div className="flex gap-2">
                                        <Link href={`/studios/${studio.slug || studio.id}`} className="flex-1">
                                            <Button size="sm" variant="outline" className="w-full h-7 text-xs">View Profile</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t flex justify-center">
                    <Button variant="ghost" onClick={restart} className="text-muted-foreground">
                        <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
                    </Button>
                </div>
             </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}