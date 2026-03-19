'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  BookOpen, Lightbulb, Flag,
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { useHistoryStore } from '@/store/historyStore';
import QuestionTimer from './QuestionTimer';
import type { UserAnswer, QuizHistoryEntry } from '@/types';

export default function QuizInterface() {
  const router = useRouter();
  const {
    session,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitAnswer,
    completeQuiz,
    incrementTotalTime,
  } = useQuizStore();
  const { addEntry } = useHistoryStore();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const question = session?.questions[session.currentQuestionIndex];
  const isLastQuestion =
    session && session.currentQuestionIndex === session.questions.length - 1;
  const currentAnswer = session?.answers[question?.id ?? ''];

  // Reset state when question changes
  useEffect(() => {
    if (!mounted || !question) return;
    const existing = session?.answers[question.id];
    setSelectedOptionId(existing?.selectedOptionId ?? null);
    setIsAnswered(!!existing);
    setShowExplanation(false);
    setQuestionStartTime(Date.now());
  }, [question?.id, mounted, session?.answers]);

  const handleTimerExpire = useCallback(() => {
    if (!question || isAnswered) return;
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const answer: UserAnswer = {
      questionId: question.id,
      selectedOptionId: null,
      isCorrect: false,
      timeTakenSeconds: timeTaken,
    };
    submitAnswer(answer);
    incrementTotalTime(timeTaken);
    setIsAnswered(true);
    setShowExplanation(true);
  }, [question, isAnswered, questionStartTime, submitAnswer, incrementTotalTime]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswered || !question) return;
    const isCorrect = optionId === question.correctOptionId;
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);

    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const answer: UserAnswer = {
      questionId: question.id,
      selectedOptionId: optionId,
      isCorrect,
      timeTakenSeconds: timeTaken,
    };
    submitAnswer(answer);
    incrementTotalTime(timeTaken);
  };

  const handleFinishQuiz = useCallback(() => {
    if (!session) return;
    completeQuiz();

    const correctCount = Object.values(session.answers).filter((a) => a.isCorrect).length;
    const percentage = Math.round((correctCount / session.questions.length) * 100);

    const historyEntry: QuizHistoryEntry = {
      id: uuidv4(),
      topic: session.config.topic,
      difficulty: session.config.difficulty,
      numQuestions: session.questions.length,
      score: correctCount,
      percentage,
      totalTimeSeconds: session.totalTimeSeconds,
      completedAt: Date.now(),
      questions: session.questions,
      answers: session.answers,
    };
    addEntry(historyEntry);
    router.push('/results');
  }, [session, completeQuiz, addEntry, router]);

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinishQuiz();
    } else {
      nextQuestion();
    }
  };

  if (!mounted || !session || !question) return null;

  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;
  const correctCount = Object.values(session.answers).filter((a) => a.isCorrect).length;
  const answeredCount = Object.keys(session.answers).length;

  return (
    <div className="w-full flex justify-center min-h-screen">
      <div className="w-full max-w-2xl px-4 sm:px-6 py-8 flex flex-col">
        <div className="glass-card rounded-2xl p-5 border border-white/[0.06] mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">
                Question{' '}
                <span className="text-white font-bold text-base">
                  {session.currentQuestionIndex + 1}
                </span>
                <span className="text-gray-600"> / {session.questions.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                {correctCount}/{answeredCount} correct
              </span>
              <span className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize
                ${session.config.difficulty === 'easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  session.config.difficulty === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {session.config.difficulty}
              </span>
            </div>
            {session.config.enableTimer && (
              <QuestionTimer
                limitSeconds={session.config.timeLimitSeconds}
                onExpire={handleTimerExpire}
                isActive={!isAnswered}
                questionKey={question.id}
              />
            )}
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/[0.06] animate-slide-in flex-1 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white leading-relaxed text-center">
              {question.question}
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {question.options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.id === question.correctOptionId;
              const showResult = isAnswered;

              let optionClass = 'option-card';
              if (showResult) {
                if (isCorrect) optionClass += ' option-correct';
                else if (isSelected && !isCorrect) optionClass += ' option-incorrect';
                else optionClass += ' opacity-50';
              } else if (isSelected) {
                optionClass += ' option-selected';
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={option.id}
                  id={`option-${idx}`}
                  onClick={() => handleSelectOption(option.id)}
                  className={`flex items-center gap-4 w-full p-4 rounded-xl border text-left transition-all duration-200 ${optionClass}
                    ${showResult && isCorrect
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : showResult && isSelected && !isCorrect
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      : isSelected
                      ? 'bg-indigo-500/20 border-indigo-500/50'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                  disabled={isAnswered}
                >
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-all ${
                    showResult && isCorrect
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : showResult && isSelected && !isCorrect
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      : isSelected
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                      : 'bg-white/[0.03] border-white/[0.08] text-gray-500'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span className="flex-1 text-sm sm:text-base text-gray-200">{option.text}</span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-emerald-400" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="flex-shrink-0 w-5 h-5 text-rose-400" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && question.explanation && (
            <div className="mb-8 p-4 rounded-xl bg-indigo-500/[0.07] border border-indigo-500/20 animate-fade-in-up">
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-auto pt-6">
            <button
              id="prev-question-btn"
              onClick={prevQuestion}
              disabled={session.currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-ghost text-sm font-medium text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1.5 justify-center">
              {session.questions.map((q, idx) => {
                const ans = session.answers[q.id];
                return (
                  <button
                    key={q.id}
                    id={`question-dot-${idx}`}
                    onClick={() => goToQuestion(idx)}
                    title={`Question ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      idx === session.currentQuestionIndex
                        ? 'w-5 bg-indigo-500'
                        : ans
                        ? ans.isCorrect
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                        : 'bg-white/[0.12]'
                    }`}
                  />
                );
              })}
            </div>

            {isLastQuestion ? (
              <button
                id="finish-quiz-btn"
                onClick={handleFinishQuiz}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-primary text-sm font-semibold text-white"
              >
                <Flag className="w-4 h-4" />
                Finish
              </button>
            ) : (
              <button
                id="next-question-btn"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-primary text-sm font-semibold text-white"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
