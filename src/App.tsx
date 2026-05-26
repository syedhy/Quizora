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
  type LlmQuizConfig,
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
  const [llmStatus, setLlmStatus] = React.useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = React.useState(false);
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

  async function generateLlmQuiz(config: LlmQuizConfig) {
    setIsGeneratingQuiz(true);
    setLlmStatus('Generating 10 questions...');

    try {
      const generatedQuestions =
        config.provider === 'openai' ? await generateOpenAiQuiz(config) : await generateGeminiQuiz(config);

      setQuestions(generatedQuestions);
      resetRunState();
      setSelectedMode('llm');
      setFileName(`${config.topic.trim()} · ${config.difficulty} · ${config.provider}`);
      setStatus(`${generatedQuestions.length} LLM questions loaded`);
      setLlmStatus('');
      setScreen('quiz');
      return true;
    } catch (error) {
      setLlmStatus(formatLlmError(error));
      return false;
    } finally {
      setIsGeneratingQuiz(false);
    }
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
        generateLlmQuiz={generateLlmQuiz}
        handleFileUpload={handleFileUpload}
        isGeneratingQuiz={isGeneratingQuiz}
        llmStatus={llmStatus}
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

const generatedQuestionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      minItems: 10,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['prompt', 'options', 'answer'],
        properties: {
          prompt: { type: 'string' },
          answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['key', 'label'],
              properties: {
                key: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                label: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
} as const;

function buildQuizPrompt(config: LlmQuizConfig) {
  return [
    `Create exactly 10 multiple-choice quiz questions about "${config.topic.trim()}".`,
    `Difficulty: ${config.difficulty}.`,
    'Each question must have exactly four options labeled A, B, C, and D.',
    'Only one option may be correct.',
    'Use clear wording, concise answer choices, and avoid trick questions.',
    'Return only JSON that matches the requested schema.',
  ].join('\n');
}

async function generateOpenAiQuiz(config: LlmQuizConfig) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model.trim(),
      input: buildQuizPrompt(config),
      text: {
        format: {
          type: 'json_schema',
          name: 'quizora_generated_quiz',
          schema: generatedQuestionSchema,
          strict: true,
        },
      },
    }),
  });

  const payload = await parseApiResponse(response, 'OpenAI');
  return parseGeneratedQuestions(readOpenAiOutputText(payload));
}

async function generateGeminiQuiz(config: LlmQuizConfig) {
  const response = await postGeminiQuiz(config, 'legacy');
  let payload = await response.json().catch(() => null);

  if (!response.ok && shouldRetryGeminiWithModernFormat(payload)) {
    const retryResponse = await postGeminiQuiz(config, 'modern');
    payload = await parseApiResponse(retryResponse, 'Gemini');
  } else if (!response.ok) {
    throwApiError(payload, 'Gemini', response.status);
  }

  return parseGeneratedQuestions(payload?.candidates?.[0]?.content?.parts?.[0]?.text);
}

function postGeminiQuiz(config: LlmQuizConfig, format: 'legacy' | 'modern') {
  const generationConfig =
    format === 'legacy'
      ? {
          responseMimeType: 'application/json',
          responseJsonSchema: generatedQuestionSchema,
        }
      : {
          responseFormat: {
            text: {
              mimeType: 'application/json',
              schema: generatedQuestionSchema,
            },
          },
        };

  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      config.model.trim(),
    )}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.apiKey.trim(),
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildQuizPrompt(config) }],
          },
        ],
        generationConfig,
      }),
    },
  );
}

async function parseApiResponse(response: Response, providerName: string) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throwApiError(payload, providerName, response.status);
  }

  return payload;
}

function throwApiError(payload: unknown, providerName: string, status: number): never {
  const errorPayload = payload as { error?: { message?: string } } | null;
  const message = errorPayload?.error?.message ?? `${providerName} returned ${status}.`;
  throw new Error(message);
}

function shouldRetryGeminiWithModernFormat(payload: unknown) {
  const message = ((payload as { error?: { message?: string } } | null)?.error?.message ?? '').toLowerCase();
  return message.includes('responsejsonschema') || message.includes('responsemimetype') || message.includes('unknown name');
}

function formatLlmError(error: unknown) {
  if (error instanceof SyntaxError) {
    return 'The model returned invalid JSON. Try again, or choose a more specific topic.';
  }

  if (error instanceof TypeError) {
    return 'Could not reach the model API. Check your network, API key restrictions, and browser console for CORS errors.';
  }

  return error instanceof Error ? error.message : 'Could not generate a quiz.';
}

function readOpenAiOutputText(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const response = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
  };

  if (response.output_text) {
    return response.output_text;
  }

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? '')
    .join('\n');
}

function parseGeneratedQuestions(text: string | undefined): Question[] {
  if (!text) {
    throw new Error('The model did not return quiz JSON.');
  }

  const parsed = JSON.parse(text) as { questions?: Question[] };
  const questions = parsed.questions;

  if (!Array.isArray(questions) || questions.length !== 10) {
    throw new Error('The generated quiz must contain exactly 10 questions.');
  }

  return questions.map((question, index) => {
    const options = question.options ?? [];
    const keys = options.map((option) => option.key).join('');

    if (!question.prompt || options.length !== 4 || keys !== 'ABCD' || !options.some((option) => option.key === question.answer)) {
      throw new Error(`Generated question ${index + 1} is not in the expected format.`);
    }

    return {
      answer: question.answer,
      id: `llm-${Date.now()}-${index}-${question.prompt}`,
      options,
      prompt: question.prompt,
    };
  });
}

export default App;
