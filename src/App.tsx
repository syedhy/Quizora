import * as React from 'react';
import { LandingPage } from '@/pages/LandingPage';
import { ModeSelectionPage } from '@/pages/ModeSelectionPage';
import { QuizPage } from '@/pages/QuizPage';
import { ResultPage } from '@/pages/ResultPage';
import {
  QUESTION_FILE,
  STATS_KEY,
  TIMED_SECONDS,
  countCorrect,
  modes,
  percent,
  parseQuestions,
  readStats,
  type FinishReason,
  type OptionKey,
  type Question,
  type QuizMode,
  type QuizStats,
  type Screen,
} from '@/quiz';

function App() {
  const [screen, setScreen] = React.useState<Screen>('landing');
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, OptionKey>>({});
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedMode, setSelectedMode] = React.useState<QuizMode>('classic');
  const [finishReason, setFinishReason] = React.useState<FinishReason>('complete');
  const [resultReachedCount, setResultReachedCount] = React.useState(0);
  const [resultTotal, setResultTotal] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIMED_SECONDS);
  const [status, setStatus] = React.useState('Loading questions.txt...');
  const [fileName, setFileName] = React.useState('questions.txt');
  const [stats, setStats] = React.useState<QuizStats>(() => readStats());

  React.useEffect(() => {
    fetch(QUESTION_FILE)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load public/questions.txt.');
        }

        return response.text();
      })
      .then((text) => loadQuestionText(text))
      .catch((error: Error) => setStatus(error.message));
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentIndex, screen]);

  const currentQuestion = questions[currentIndex];
  const score = React.useMemo(() => countCorrect(questions, answers), [answers, questions]);
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const percentScore = percent(score, resultTotal);
  const activeMode = modes.find((mode) => mode.id === selectedMode) ?? modes[0];

  React.useEffect(() => {
    if (screen !== 'quiz' || selectedMode !== 'timed' || !currentQuestion) {
      return;
    }

    setTimeLeft(TIMED_SECONDS);

    const timer = window.setInterval(() => {
      setTimeLeft((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => goNext(true), 0);
          return 0;
        }

        return remaining - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentIndex, currentQuestion?.id, screen, selectedMode]);

  function persistStats(nextStats: QuizStats) {
    setStats(nextStats);
    window.localStorage.setItem(STATS_KEY, JSON.stringify(nextStats));
  }

  function resetRunState() {
    setAnswers({});
    setCurrentIndex(0);
    setFinishReason('complete');
    setResultReachedCount(0);
    setResultTotal(0);
  }

  function updateStats(finalAnswers: Record<string, OptionKey>) {
    const finalAttempted = Object.keys(finalAnswers).length;
    if (!finalAttempted) {
      return;
    }

    const finalScore = countCorrect(questions, finalAnswers);
    const nextStats = {
      bestPercent: Math.max(stats.bestPercent, percent(finalScore, finalAttempted)),
      quizzesPlayed: stats.quizzesPlayed + 1,
      totalCorrect: stats.totalCorrect + finalScore,
      totalWrong: stats.totalWrong + Math.max(finalAttempted - finalScore, 0),
    };

    persistStats(nextStats);
  }

  function loadQuestionText(text: string, nextFileName = 'questions.txt') {
    try {
      const nextQuestions = parseQuestions(text);
      setQuestions(nextQuestions);
      resetRunState();
      setFileName(nextFileName);
      setStatus(`${nextQuestions.length} questions loaded`);
      setScreen((currentScreen) => (currentScreen === 'quiz' || currentScreen === 'results' ? 'modes' : currentScreen));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not parse that file.');
    }
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => loadQuestionText(String(reader.result), file.name);
    reader.onerror = () => setStatus('Could not read that file.');
    reader.readAsText(file);
  }

  function startQuiz(mode: QuizMode) {
    setSelectedMode(mode);
    resetRunState();
    setTimeLeft(TIMED_SECONDS);
    setScreen('quiz');
  }

  function finishQuiz(reason: FinishReason = 'complete', finalAnswers = answers) {
    setFinishReason(reason);
    setResultReachedCount(Math.min(currentIndex + 1, questions.length));
    setResultTotal(Object.keys(finalAnswers).length);
    updateStats(finalAnswers);
    setScreen('results');
  }

  function chooseAnswer(optionKey: OptionKey) {
    if (!currentQuestion || screen !== 'quiz' || answers[currentQuestion.id]) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: optionKey,
    };

    setAnswers(nextAnswers);

    if (selectedMode === 'classic') {
      return;
    }

    if (selectedMode === 'survival' && optionKey !== currentQuestion.answer) {
      window.setTimeout(() => finishQuiz('survival', nextAnswers), 850);
      return;
    }

    window.setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        finishQuiz('complete', nextAnswers);
        return;
      }

      setCurrentIndex((index) => index + 1);
    }, 650);
  }

  function goNext(fromTimer = false) {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    finishQuiz(fromTimer ? 'time' : 'complete');
  }

  function goPrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function restartQuiz() {
    startQuiz(selectedMode);
  }

  if (screen === 'landing') {
    return <LandingPage onBegin={() => setScreen('modes')} />;
  }

  if (screen === 'modes') {
    return (
      <ModeSelectionPage
        fileName={fileName}
        handleFileUpload={handleFileUpload}
        questions={questions}
        startQuiz={startQuiz}
        stats={stats}
        status={status}
        goHome={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'quiz' && currentQuestion) {
    return (
      <QuizPage
        activeMode={activeMode}
        answers={answers}
        chooseAnswer={chooseAnswer}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        finishQuiz={() => finishQuiz('manual')}
        goBack={() => setScreen('modes')}
        goNext={goNext}
        goPrevious={goPrevious}
        progress={progress}
        questionCount={questions.length}
        score={score}
        selectedMode={selectedMode}
        timeLeft={timeLeft}
      />
    );
  }

  return (
    <ResultPage
      answers={answers}
      fileName={fileName}
      finishReason={finishReason}
      goModes={() => setScreen('modes')}
      percentScore={percentScore}
      questions={questions}
      resultReachedCount={resultReachedCount}
      resultTotal={resultTotal}
      restartQuiz={restartQuiz}
      score={score}
      selectedMode={selectedMode}
    />
  );
}

export default App;
