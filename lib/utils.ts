import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

export function generateReference(): string {
  return `HIREME-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateTestScore(answers: Record<string, string>, correctAnswers: Record<string, string>): number {
  let score = 0;
  const totalQuestions = Object.keys(correctAnswers).length;

  if (totalQuestions === 0) {
    return 0;
  }

  Object.keys(answers).forEach((questionId) => {
    // Normalize both answers for comparison (trim, lowercase for case-insensitive comparison)
    const userAnswer = String(answers[questionId] || '').trim();
    const correctAnswer = String(correctAnswers[questionId] || '').trim();
    
    // Compare answers (case-insensitive for text, exact for numbers)
    if (userAnswer === correctAnswer) {
      score++;
    }
  });

  const percentage = (score / totalQuestions) * 100;
  return Math.round(percentage);
}

export function isPassingScore(score: number, passingScore: number = 70): boolean {
  return score >= passingScore;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

