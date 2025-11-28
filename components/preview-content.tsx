"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trophy, RotateCcw, Brain } from "lucide-react"

// Just receives path and navigate as props from the VM

const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correct: 3,
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
    correct: 1,
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct: 2,
  },
]

interface QuizAppProps {
  path: string
  navigate: (path: string) => void
}

export function QuizApp({ path }: QuizAppProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null))

  const handleRestart = () => {
    setAnswers(Array(quizQuestions.length).fill(null))
  }

  // Simple routing based on path prop
  if (path === "/") {
    return <HomePage />
  }

  if (path.startsWith("/quiz/")) {
    const questionNum = Number.parseInt(path.split("/")[2], 10)
    if (questionNum >= 1 && questionNum <= quizQuestions.length) {
      return <QuizPage questionIndex={questionNum - 1} answers={answers} setAnswers={setAnswers} />
    }
  }

  if (path === "/results") {
    return <ResultsPage answers={answers} onRestart={handleRestart} />
  }

  // 404 fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4">
      <h1 className="text-2xl font-bold text-neutral-900 mb-4">Page Not Found</h1>
      <p className="text-neutral-500 mb-6">The page "{path}" doesn't exist.</p>
      <a
        href="/"
        className="inline-flex items-center justify-center h-10 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md font-medium transition-colors"
      >
        Go Home
      </a>
    </div>
  )
}

function HomePage() {
  useEffect(() => {
    console.info("Quiz app initialized")
    console.log("Welcome to General Knowledge Quiz!")
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-12 w-12 text-neutral-700" />
      </div>
      <h1 className="text-3xl font-bold italic text-neutral-900 mb-2">General Knowledge Quiz</h1>
      <p className="text-neutral-500 mb-8 text-center max-w-md">
        Test your knowledge with 5 challenging questions. Are you ready?
      </p>

      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-neutral-900">5</div>
              <div className="text-xs text-neutral-500">Questions</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-neutral-900">4</div>
              <div className="text-xs text-neutral-500">Options</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-neutral-900">~2m</div>
              <div className="text-xs text-neutral-500">Duration</div>
            </div>
          </div>

          <a
            href="/quiz/1"
            className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md font-medium transition-colors"
            onClick={() => console.log("User started the quiz")}
          >
            Start Quiz
          </a>
        </CardContent>
      </Card>
    </div>
  )
}

function QuizPage({
  questionIndex,
  answers,
  setAnswers,
}: {
  questionIndex: number
  answers: (number | null)[]
  setAnswers: React.Dispatch<React.SetStateAction<(number | null)[]>>
}) {
  const question = quizQuestions[questionIndex]
  const selectedAnswer = answers[questionIndex]
  const progress = ((questionIndex + 1) / quizQuestions.length) * 100

  useEffect(() => {
    console.log(`Navigated to question ${questionIndex + 1}`)
    console.info(`Question: "${question.question}"`)
  }, [questionIndex, question.question])

  const handleAnswerSelect = (value: string) => {
    const answerIndex = Number.parseInt(value, 10)
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
    console.log(`User selected: "${question.options[answerIndex]}"`)
  }

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const isCorrect = selectedAnswer === question.correct
      if (isCorrect) {
        console.log(`Correct answer for Q${questionIndex + 1}!`)
      } else {
        console.warn(`Wrong answer for Q${questionIndex + 1}. Correct was: "${question.options[question.correct]}"`)
      }
    }
  }

  const nextHref = questionIndex < quizQuestions.length - 1 ? `/quiz/${questionIndex + 2}` : "/results"
  const prevHref = questionIndex > 0 ? `/quiz/${questionIndex}` : "/"

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4">
      <h1 className="text-3xl font-bold italic text-neutral-900 mb-8">General Knowledge Quiz</h1>

      <Card className="w-full max-w-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500">
              Question {questionIndex + 1} of {quizQuestions.length}
            </span>
            <span className="text-sm text-neutral-900 font-medium">{Math.round(progress)}%</span>
          </div>

          <Progress value={progress} className="h-2 mb-6" />

          <h2 className="text-lg font-semibold text-neutral-900 mb-4">{question.question}</h2>

          <RadioGroup
            value={selectedAnswer !== null ? String(selectedAnswer) : ""}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <Label
                  htmlFor={`option-${index}`}
                  className="flex items-center gap-3 w-full p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <RadioGroupItem value={String(index)} id={`option-${index}`} />
                  <span className="text-neutral-900">{option}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center justify-between mt-6">
            <a
              href={prevHref}
              className="inline-flex items-center justify-center h-10 px-4 py-2 border border-neutral-200 bg-transparent text-neutral-600 rounded-md font-medium hover:bg-neutral-100 transition-colors"
              onClick={() => console.log("User navigated to previous question")}
            >
              Previous
            </a>
            <a
              href={nextHref}
              className="inline-flex items-center justify-center h-10 px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-md font-medium transition-colors"
              onClick={handleNext}
            >
              {questionIndex === quizQuestions.length - 1 ? "Finish" : "Next"}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ResultsPage({
  answers,
  onRestart,
}: {
  answers: (number | null)[]
  onRestart: () => void
}) {
  const correctCount = answers.reduce((count, answer, index) => {
    return answer === quizQuestions[index].correct ? count + 1 : count
  }, 0)

  const percentage = Math.round((correctCount / quizQuestions.length) * 100)

  useEffect(() => {
    console.info(`Final Score: ${correctCount}/${quizQuestions.length} (${percentage}%)`)
    if (percentage >= 80) {
      console.log("Excellent performance!")
    } else if (percentage >= 60) {
      console.log("Good job!")
    } else {
      console.warn("Consider reviewing the material")
    }
  }, [correctCount, percentage])

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4">
      <h1 className="text-3xl font-bold italic text-neutral-900 mb-8">Quiz Complete!</h1>

      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-neutral-100 rounded-full">
              <Trophy className={`h-12 w-12 ${percentage >= 60 ? "text-yellow-500" : "text-neutral-400"}`} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
          </h2>

          <p className="text-neutral-500 mb-6">
            You scored {correctCount} out of {quizQuestions.length} questions
          </p>

          <div className="bg-neutral-50 rounded-lg p-6 mb-6">
            <div className="text-5xl font-bold text-neutral-900 mb-1">{percentage}%</div>
            <div className="text-sm text-neutral-500">Final Score</div>
          </div>

          <div className="space-y-3">
            {quizQuestions.map((q, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  answers[index] === q.correct ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <span className="text-sm text-neutral-700 truncate flex-1 text-left">
                  Q{index + 1}: {q.question}
                </span>
                <span
                  className={`text-sm font-medium ${answers[index] === q.correct ? "text-green-600" : "text-red-600"}`}
                >
                  {answers[index] === q.correct ? "Correct" : "Wrong"}
                </span>
              </div>
            ))}
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center w-full h-10 px-4 py-2 mt-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md font-medium transition-colors"
            onClick={() => {
              console.log("User restarted the quiz")
              console.info("Resetting all answers...")
              onRestart()
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
