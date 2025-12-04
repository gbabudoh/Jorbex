import { NextResponse } from 'next/server';

// Sample onboarding questions - In production, these should be stored in the database
const ONBOARDING_QUESTIONS = [
  {
    id: '1',
    question: 'If all roses are flowers and some flowers are red, which statement must be true?',
    options: ['All roses are red', 'Some roses are red', 'No roses are red', 'Cannot be determined'],
    correctAnswer: 'Cannot be determined',
  },
  {
    id: '2',
    question: 'What number comes next in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    correctAnswer: '42',
  },
  {
    id: '3',
    question: 'If a train travels 120 km in 2 hours, how long will it take to travel 300 km at the same speed?',
    options: ['4 hours', '5 hours', '6 hours', '7 hours'],
    correctAnswer: '5 hours',
  },
  {
    id: '4',
    question: 'Which word does NOT belong with the others?',
    options: ['Apple', 'Banana', 'Carrot', 'Orange'],
    correctAnswer: 'Carrot',
  },
  {
    id: '5',
    question: 'If today is Monday, what day will it be 25 days from now?',
    options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    correctAnswer: 'Friday',
  },
  {
    id: '6',
    question: 'A store sells 20% more items in January than in December. If December sales were 500 items, how many were sold in January?',
    options: ['550', '600', '650', '700'],
    correctAnswer: '600',
  },
  {
    id: '7',
    question: 'Complete the pattern: A, C, E, G, ?',
    options: ['H', 'I', 'J', 'K'],
    correctAnswer: 'I',
  },
  {
    id: '8',
    question: 'If 3 workers can complete a task in 8 hours, how many workers are needed to complete it in 4 hours?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '6',
  },
  {
    id: '9',
    question: 'What is the missing number: 5, 10, 20, 40, ?',
    options: ['60', '70', '80', '90'],
    correctAnswer: '80',
  },
  {
    id: '10',
    question: 'If all managers are leaders and some leaders are mentors, which statement is possible?',
    options: ['All managers are mentors', 'Some managers are mentors', 'No managers are mentors', 'All mentors are managers'],
    correctAnswer: 'Some managers are mentors',
  },
];

export async function GET(request: Request) {
  // Return hardcoded questions - no database needed for this endpoint
  // In production, you can fetch from database based on expertise
  return NextResponse.json(
    { questions: ONBOARDING_QUESTIONS },
    { status: 200 }
  );
}

