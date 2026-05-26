import * as React from 'react';
import { QuizLibraryPage, SetupPage } from '@/pages/ModeSelectionPage';
import { QuizPage } from '@/pages/QuizPage';
import { ResultPage } from '@/pages/ResultPage';
import {
  STATS_KEY,
  countCorrect,
  defaultSettings,
  modes,
  percent,
  parseQuestions,
  readStats,
  selectQuestions,
  type FinishReason,
  type OptionKey,
  type Question,
  type QuizPreset,
  type QuizSettings,
  type QuizStats,
  type Screen,
} from '@/quiz';

function App() {
  const [screen, setScreen] = React.useState<Screen>('setup');
  const [settings, setSettings] = React.useState<QuizSettings>(defaultSettings);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [sourceQuestions, setSourceQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, OptionKey>>({});
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [finishReason, setFinishReason] = React.useState<FinishReason>('complete');
  const [resultReachedCount, setResultReachedCount] = React.useState(0);
  const [resultTotal, setResultTotal] = React.useState(0);
  const [sourceTitle, setSourceTitle] = React.useState('');
  const [sourceTotal, setSourceTotal] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(defaultSettings.secondsPerQuestion);
  const [livesLeft, setLivesLeft] = React.useState(defaultSettings.lives);
  const [uploadError, setUploadError] = React.useState('');
  const [stats, setStats] = React.useState<QuizStats>(() => readStats());

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentIndex, screen]);

  const currentQuestion = questions[currentIndex];
  const activeMode = modes.find((mode) => mode.id === settings.mode) ?? modes[0];
  const score = React.useMemo(() => countCorrect(questions, answers), [answers, questions]);
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const percentScore = percent(score, resultTotal);
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  React.useEffect(() => {
    if (screen !== 'quiz' || settings.mode !== 'timed' || !currentQuestion || selectedAnswer) {
      return;
    }

    setTimeLeft(settings.secondsPerQuestion);

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
  }, [currentIndex, currentQuestion?.id, screen, selectedAnswer, settings.mode, settings.secondsPerQuestion]);

  function persistStats(nextStats: QuizStats) {
    setStats(nextStats);
    window.localStorage.setItem(STATS_KEY, JSON.stringify(nextStats));
  }

  function resetRunState(nextSettings = settings) {
    setAnswers({});
    setCurrentIndex(0);
    setFinishReason('complete');
    setResultReachedCount(0);
    setResultTotal(0);
    setTimeLeft(nextSettings.secondsPerQuestion);
    setLivesLeft(nextSettings.lives);
  }

  function updateSettings(nextSettings: QuizSettings) {
    setSettings(nextSettings);
    setTimeLeft(nextSettings.secondsPerQuestion);
    setLivesLeft(nextSettings.lives);
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

  function openLibrary() {
    resetRunState();
    setUploadError('');
    setScreen('library');
  }

  function startQuestionRun(sourceQuestions: Question[], title: string) {
    const selectedQuestions = selectQuestions(sourceQuestions, settings.questionCount);
    setQuestions(selectedQuestions);
    setSourceQuestions(sourceQuestions);
    setSourceTitle(title);
    setSourceTotal(sourceQuestions.length);
    resetRunState();
    setScreen('quiz');
  }

  function startPreset(preset: QuizPreset) {
    startQuestionRun(preset.questions, preset.title);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const uploadedQuestions = parseQuestions(String(reader.result));
        setUploadError('');
        startQuestionRun(uploadedQuestions, file.name.replace(/\.[^.]+$/, '') || file.name);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Could not parse that file.');
      }
    };
    reader.onerror = () => setUploadError('Could not read that file.');
    reader.readAsText(file);
  }

  function finishQuiz(reason: FinishReason = 'complete', finalAnswers = answers) {
    setFinishReason(reason);
    setResultReachedCount(Math.min(currentIndex + 1, questions.length));
    setResultTotal(Object.keys(finalAnswers).length);
    updateStats(finalAnswers);
    setScreen('results');
  }

  function advanceAfterAnswer(finalAnswers: Record<string, OptionKey>) {
    window.setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        finishQuiz('complete', finalAnswers);
        return;
      }

      setCurrentIndex((index) => index + 1);
    }, 760);
  }

  function chooseAnswer(optionKey: OptionKey) {
    if (!currentQuestion || screen !== 'quiz' || answers[currentQuestion.id]) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: optionKey,
    };
    const wasCorrect = optionKey === currentQuestion.answer;

    setAnswers(nextAnswers);

    if (settings.mode === 'classic') {
      return;
    }

    if (settings.mode === 'survival' && !wasCorrect) {
      const nextLives = livesLeft - 1;
      setLivesLeft(Math.max(nextLives, 0));

      if (nextLives <= 0) {
        window.setTimeout(() => finishQuiz('survival', nextAnswers), 900);
        return;
      }
    }

    advanceAfterAnswer(nextAnswers);
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
    if (!questions.length) {
      setScreen('library');
      return;
    }

    startQuestionRun(sourceQuestions.length ? sourceQuestions : questions, sourceTitle);
  }

  if (screen === 'setup') {
    return <SetupPage settings={settings} stats={stats} updateSettings={updateSettings} continueToLibrary={openLibrary} />;
  }

  if (screen === 'library') {
    return (
      <QuizLibraryPage
        goBack={() => setScreen('setup')}
        handleFileUpload={handleFileUpload}
        selectedQuestionCount={settings.questionCount}
        startPreset={startPreset}
        uploadError={uploadError}
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
        goBack={() => setScreen('library')}
        goNext={goNext}
        goPrevious={goPrevious}
        livesLeft={livesLeft}
        progress={progress}
        questionCount={questions.length}
        score={score}
        settings={settings}
        sourceTitle={sourceTitle}
        sourceTotal={sourceTotal}
        timeLeft={timeLeft}
      />
    );
  }

  return (
    <ResultPage
      answers={answers}
      fileName={sourceTitle}
      finishReason={finishReason}
      goModes={() => setScreen('setup')}
      percentScore={percentScore}
      questions={questions}
      resultReachedCount={resultReachedCount}
      resultTotal={resultTotal}
      restartQuiz={restartQuiz}
      score={score}
      selectedMode={settings.mode}
    />
  );
}

export default App;
