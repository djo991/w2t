// src/pages/admin/quiz.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminRoute from "@/components/AdminRoute";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, Loader2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { QuizQuestion, QuizAnswer } from "@/types";

export default function QuizManager() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [availableStyles, setAvailableStyles] = useState<string[]>([]); // NEW STATE
  const [loading, setLoading] = useState(true);
  const [newQText, setNewQText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Fetch Quiz Questions
    const { data: qData, error: qError } = await supabase
      .from("quiz_questions")
      .select(`*, quiz_answers (*, quiz_weights (*))`)
      .order("step_order", { ascending: true });

    if (qError) {
        console.error("Error fetching quiz:", qError);
        toast({ title: "Error loading quiz", variant: "destructive" });
    } else {
        setQuestions(qData as any);
    }

    // 2. Fetch Styles (NEW)
    const { data: sData } = await supabase
        .from("tattoo_styles")
        .select("name")
        .order("name");
    
    if (sData) {
        // We use the Style Name as the tag (e.g. "Traditional")
        setAvailableStyles(sData.map(s => s.name));
    }

    setLoading(false);
  };

  const handleAddQuestion = async () => {
    if (!newQText) return;
    const order = questions.length + 1;
    
    const tempId = `temp-${Date.now()}`;
    setQuestions(prev => [...prev, { id: tempId, question_text: newQText, step_order: order, is_active: true, quiz_answers: [] }]);
    setNewQText("");

    const { data, error } = await supabase
      .from("quiz_questions")
      .insert({ question_text: newQText, step_order: order })
      .select(`*, quiz_answers(*, quiz_weights(*))`)
      .single();

    if (error) {
        fetchData(); 
    } else {
        setQuestions(prev => prev.map(q => q.id === tempId ? (data as any) : q));
        toast({ title: "Question Added" });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
    await supabase.from("quiz_questions").delete().eq("id", id);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6 flex justify-between items-center">
            <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-[hsl(var(--ink-red))]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
            <Link href="/admin/styles">
                <Button variant="outline">Manage Styles & Images</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Quiz Builder</h1>
          </div>

          {/* Add Question */}
          <Card className="mb-8 border-dashed">
            <CardContent className="p-6 flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>New Question Text</Label>
                <Input 
                  value={newQText} 
                  onChange={(e) => setNewQText(e.target.value)} 
                  placeholder="e.g. How do you decorate your room?"
                />
              </div>
              <Button onClick={handleAddQuestion} disabled={!newQText}>
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-6">
            {loading ? (
                <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
            ) : (
                questions.map((q, index) => (
                    <QuestionEditor 
                        key={q.id} 
                        question={q} 
                        index={index} 
                        availableStyles={availableStyles} // PASSING STYLES DOWN
                        onDelete={() => handleDeleteQuestion(q.id)} 
                    />
                ))
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}

// --- SUB-COMPONENT: Single Question Editor ---
function QuestionEditor({ question, index, onDelete, availableStyles }: { question: QuizQuestion, index: number, onDelete: () => void, availableStyles: string[] }) {
  const [answers, setAnswers] = useState<QuizAnswer[]>(question.quiz_answers || []);
  const { toast } = useToast();

  // Form State
  const [draftText, setDraftText] = useState("");
  const [draftWeights, setDraftWeights] = useState<{style: string, val: number}[]>([]);
  const [currentStyle, setCurrentStyle] = useState(""); // Empty by default
  const [currentVal, setCurrentVal] = useState("2");
  const [isSaving, setIsSaving] = useState(false);

  // Set default style when options load
  useEffect(() => {
      if (availableStyles.length > 0 && !currentStyle) {
          setCurrentStyle(availableStyles[0]);
      }
  }, [availableStyles]);

  const addWeightToDraft = () => {
    if (!currentStyle) return;
    setDraftWeights(prev => [...prev, { style: currentStyle, val: parseInt(currentVal) }]);
  };

  const removeWeightFromDraft = (idx: number) => {
    setDraftWeights(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveAnswer = async () => {
    if (!draftText) {
        toast({ title: "Missing Text", description: "Please enter answer text.", variant: "destructive" });
        return;
    }
    if (draftWeights.length === 0) {
        toast({ title: "Missing Points", description: "Please add at least one style point.", variant: "destructive" });
        return;
    }

    setIsSaving(true);

    try {
        const { data: ansData, error: ansError } = await supabase
        .from("quiz_answers")
        .insert({ question_id: question.id, answer_text: draftText })
        .select()
        .single();

        if (ansError) throw ansError;

        const weightsPayload = draftWeights.map(w => ({
            answer_id: ansData.id,
            style_tag: w.style,
            weight_value: w.val
        }));
        
        const { data: wData, error: wError } = await supabase
            .from("quiz_weights")
            .insert(weightsPayload)
            .select();

        if (wError) throw wError;

        const newAnswer: QuizAnswer = {
            ...ansData,
            quiz_weights: wData as any
        };
        
        setAnswers(prev => [...prev, newAnswer]);
        
        setDraftText("");
        setDraftWeights([]);
        toast({ title: "Answer Saved" });

    } catch (error: any) {
        console.error("Save error:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteAnswer = async (id: string) => {
    setAnswers(prev => prev.filter(a => a.id !== id));
    await supabase.from("quiz_answers").delete().eq("id", id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2 border-b bg-muted/20">
        <CardTitle className="text-lg font-medium flex gap-2">
          <span className="text-muted-foreground opacity-50">#{index + 1}</span>
          {question.question_text}
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Existing Answers List */}
          {answers.map((ans) => (
            <div key={ans.id} className="flex items-center justify-between bg-secondary/30 p-3 rounded border">
              <span className="font-medium text-sm flex-1">{ans.answer_text}</span>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                  {ans.quiz_weights?.map((w, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-background border-green-200">
                        {w.style_tag} <span className="text-green-600 font-bold ml-1">+{w.weight_value}</span>
                      </Badge>
                  ))}
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteAnswer(ans.id)}>
                    <XIcon />
                  </Button>
              </div>
            </div>
          ))}

          {/* NEW ANSWER CREATOR */}
          <div className="border rounded-lg p-4 bg-muted/10 mt-4 space-y-3 border-dashed border-2">
            <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Answer</Label>
                <Input 
                    placeholder="Answer text..." 
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="bg-background"
                />
            </div>

            {/* Dynamic Weight Builder */}
            <div className="flex gap-2 items-end bg-background p-2 rounded border">
                <div className="w-40 space-y-1">
                    <Label className="text-xs">Style</Label>
                    {/* USE DYNAMIC STYLES HERE */}
                    <Select value={currentStyle} onValueChange={setCurrentStyle}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..."/></SelectTrigger>
                        <SelectContent>
                        {availableStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-20 space-y-1">
                    <Label className="text-xs">Points</Label>
                    <Input 
                        type="number" 
                        className="h-8 text-xs"
                        value={currentVal}
                        onChange={(e) => setCurrentVal(e.target.value)}
                    />
                </div>
                <Button size="sm" variant="secondary" className="h-8" onClick={addWeightToDraft}>
                    <Plus className="w-3 h-3 mr-1" /> Add Points
                </Button>
            </div>

            {/* Draft Weights Preview */}
            {draftWeights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {draftWeights.map((w, i) => (
                        <Badge key={i} variant="secondary" className="pl-2 pr-1">
                            {w.style} +{w.val}
                            <button onClick={() => removeWeightFromDraft(i)} className="ml-2 hover:text-red-500"><XIcon /></button>
                        </Badge>
                    ))}
                </div>
            )}

            <Button 
                size="sm" 
                className="w-full" 
                onClick={handleSaveAnswer} 
                disabled={isSaving}
            >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Saving..." : "Save Answer"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function XIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
}