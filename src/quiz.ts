export const STATS_KEY = 'quizora-stats-v6';

export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type QuizMode = 'classic' | 'timed' | 'survival';
export type Screen = 'setup' | 'library' | 'quiz' | 'results';
export type FinishReason = 'complete' | 'manual' | 'time' | 'survival';

export type QuizOption = {
  key: OptionKey;
  label: string;
};

export type Question = {
  answer: OptionKey;
  id: string;
  options: QuizOption[];
  prompt: string;
};

export type QuizSettings = {
  lives: number;
  mode: QuizMode;
  questionCount: number;
  secondsPerQuestion: number;
};

export type QuizPreset = {
  category: string;
  description: string;
  id: string;
  questions: Question[];
  title: string;
};

export type QuizStats = {
  bestPercent: number;
  quizzesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
};

export const defaultSettings: QuizSettings = {
  lives: 3,
  mode: 'classic',
  questionCount: 10,
  secondsPerQuestion: 30,
};

export const questionCountOptions = [5, 10, 15, 20];
export const timedSecondOptions = [15, 30, 45, 60];
export const survivalLifeOptions = [1, 3, 5];

export const defaultStats: QuizStats = {
  bestPercent: 0,
  quizzesPlayed: 0,
  totalCorrect: 0,
  totalWrong: 0,
};

const questionSizeSteps = [
  { minLength: 145, size: 'clamp(1.35rem, min(2.2vw, 3.8dvh), 2.2rem)' },
  { minLength: 95, size: 'clamp(1.55rem, min(2.65vw, 4.6dvh), 2.65rem)' },
  { minLength: 62, size: 'clamp(1.75rem, min(3.15vw, 5.2dvh), 3.05rem)' },
];
const questionPrefix = /^question\s*:/i;
const answerPrefix = /^answer\s*:/i;
const optionPrefix = /^[A-D]\)/i;
const optionPattern = /^([A-D])\)\s*(.+)$/i;

export const modes: Array<{
  id: QuizMode;
  title: string;
  kicker: string;
  description: string;
}> = [
  {
    id: 'classic',
    title: 'Classic',
    kicker: 'Browse freely',
    description: 'Move back and forward, reveal answers, and finish at your pace.',
  },
  {
    id: 'timed',
    title: 'Timed',
    kicker: 'Beat the clock',
    description: 'Pick your seconds per question and answer before time runs out.',
  },
  {
    id: 'survival',
    title: 'Survival',
    kicker: 'Limited lives',
    description: 'Wrong answers cost a life. Stay sharp until the deck runs dry.',
  },
];

function option(key: OptionKey, label: string): QuizOption {
  return { key, label };
}

function question(prompt: string, labels: [string, string, string, string], answer: OptionKey): Omit<Question, 'id'> {
  return {
    answer,
    options: [option('A', labels[0]), option('B', labels[1]), option('C', labels[2]), option('D', labels[3])],
    prompt,
  };
}

function makePreset(
  id: string,
  title: string,
  category: string,
  description: string,
  questions: Array<Omit<Question, 'id'>>,
): QuizPreset {
  return {
    category,
    description,
    id,
    questions: questions.map((item, index) => ({ ...item, id: `${id}-${index + 1}` })),
    title,
  };
}

export const quizPresets: QuizPreset[] = [
  makePreset('ancient-history', 'Ancient History', 'Civilizations', 'Empires, rulers, inventions, and old-world drama.', [
    question('Which river was central to Ancient Egyptian civilization?', ['Tigris', 'Nile', 'Indus', 'Danube'], 'B'),
    question('Who was the first emperor of a unified China?', ['Qin Shi Huang', 'Han Wudi', 'Kublai Khan', 'Sun Tzu'], 'A'),
    question('Which city-state is famous for its military society?', ['Athens', 'Corinth', 'Sparta', 'Thebes'], 'C'),
    question('The Code of Hammurabi comes from which civilization?', ['Babylonian', 'Roman', 'Mayan', 'Persian'], 'A'),
    question('Which empire built Persepolis?', ['Assyrian', 'Persian', 'Mauryan', 'Byzantine'], 'B'),
    question('Who was the Macedonian king who conquered much of Persia?', ['Philip II', 'Alexander the Great', 'Leonidas', 'Ptolemy'], 'B'),
    question('Which ancient people built Machu Picchu?', ['Aztec', 'Maya', 'Inca', 'Olmec'], 'C'),
    question('What writing system used wedge-shaped marks on clay tablets?', ['Hieroglyphics', 'Cuneiform', 'Sanskrit', 'Linear B'], 'B'),
    question('Which Roman leader was assassinated on the Ides of March?', ['Augustus', 'Julius Caesar', 'Nero', 'Trajan'], 'B'),
    question('Which ancient Indian emperor promoted Buddhism after the Kalinga War?', ['Ashoka', 'Chandragupta I', 'Harsha', 'Akbar'], 'A'),
    question('The Parthenon was dedicated to which goddess?', ['Hera', 'Athena', 'Artemis', 'Aphrodite'], 'B'),
    question('Which sea connected many ancient Mediterranean trade routes?', ['Baltic Sea', 'Red Sea', 'Mediterranean Sea', 'Caspian Sea'], 'C'),
    question('Who is known for the military treatise The Art of War?', ['Confucius', 'Sun Tzu', 'Laozi', 'Mencius'], 'B'),
    question('Which civilization developed a famous early democracy?', ['Athens', 'Carthage', 'Babylon', 'Memphis'], 'A'),
    question('The Rosetta Stone helped decode which script?', ['Runes', 'Hieroglyphics', 'Cuneiform', 'Phoenician'], 'B'),
    question('Which empire was ruled from the city of Tenochtitlan?', ['Inca', 'Aztec', 'Minoan', 'Hittite'], 'B'),
    question('Which Roman structure hosted gladiator games?', ['Pantheon', 'Colosseum', 'Forum', 'Aqueduct'], 'B'),
    question('Which ancient trade route linked China with the Mediterranean world?', ['Amber Road', 'Silk Road', 'Royal Road', 'Tea Road'], 'B'),
    question('Which civilization used oracle bones for divination?', ['Shang China', 'Gupta India', 'Old Kingdom Egypt', 'Classical Greece'], 'A'),
    question('Which city was buried by the eruption of Mount Vesuvius in 79 CE?', ['Pompeii', 'Troy', 'Knossos', 'Ur'], 'A'),
  ]),
  makePreset('games', 'Games', 'Play', 'Consoles, classics, characters, and gaming lore.', [
    question('Which company created the Mario franchise?', ['Sega', 'Nintendo', 'Sony', 'Valve'], 'B'),
    question('In Minecraft, what material is needed to craft a Nether portal frame?', ['End Stone', 'Obsidian', 'Bedrock', 'Granite'], 'B'),
    question('Which game features the character Master Chief?', ['Halo', 'Doom', 'Destiny', 'Mass Effect'], 'A'),
    question('What is the main collectible creature type in Pokemon?', ['Digimon', 'Monsters', 'Pokemon', 'Yo-kai'], 'C'),
    question('Which battle royale game is known for building mechanics?', ['Apex Legends', 'PUBG', 'Fortnite', 'Warzone'], 'C'),
    question('In The Legend of Zelda, what is the hero usually named?', ['Link', 'Zelda', 'Ganon', 'Navi'], 'A'),
    question('Which game is famous for the phrase "The cake is a lie"?', ['Portal', 'Half-Life', 'BioShock', 'Control'], 'A'),
    question('Which studio created The Witcher 3?', ['Bethesda', 'CD Projekt Red', 'FromSoftware', 'BioWare'], 'B'),
    question('What genre is Stardew Valley best known as?', ['Farming sim', 'Racing', 'Fighting', 'Horror'], 'A'),
    question('Which game series includes Ryu and Chun-Li?', ['Tekken', 'Street Fighter', 'Mortal Kombat', 'Virtua Fighter'], 'B'),
    question('What color is Sonic the Hedgehog?', ['Red', 'Blue', 'Green', 'Yellow'], 'B'),
    question('Which game features the city of Rapture?', ['BioShock', 'Dishonored', 'Prey', 'Fallout'], 'A'),
    question('In Among Us, players try to find which hidden role?', ['Builder', 'Impostor', 'Merchant', 'Pilot'], 'B'),
    question('Which company makes the PlayStation console?', ['Microsoft', 'Sony', 'Nintendo', 'Atari'], 'B'),
    question('Which game series is known for catching monsters in Pokeballs?', ['Persona', 'Pokemon', 'Monster Hunter', 'Dragon Quest'], 'B'),
    question('Which indie game features a fallen child in the Underground?', ['Celeste', 'Hades', 'Undertale', 'Hollow Knight'], 'C'),
    question('Which game has creepers that explode?', ['Terraria', 'Minecraft', 'Roblox', 'Valheim'], 'B'),
    question('Which racing series uses blue shells?', ['Need for Speed', 'Forza', 'Mario Kart', 'Gran Turismo'], 'C'),
    question('Which game popularized the battle pass model at massive scale?', ['Fortnite', 'Tetris', 'Skyrim', 'Portal 2'], 'A'),
    question('Which game series features the Triforce?', ['Final Fantasy', 'Zelda', 'Kingdom Hearts', 'Metroid'], 'B'),
  ]),
  makePreset('science', 'Science', 'Discovery', 'Space, biology, chemistry, physics, and Earth science.', [
    question('What planet is known as the Red Planet?', ['Venus', 'Mars', 'Jupiter', 'Mercury'], 'B'),
    question('What gas do plants absorb during photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], 'C'),
    question('What is H2O commonly known as?', ['Salt', 'Water', 'Hydrogen peroxide', 'Ozone'], 'B'),
    question('What force keeps planets in orbit around the Sun?', ['Magnetism', 'Gravity', 'Friction', 'Tension'], 'B'),
    question('Which organ pumps blood through the body?', ['Liver', 'Heart', 'Lung', 'Kidney'], 'B'),
    question('What particle has a negative electric charge?', ['Proton', 'Neutron', 'Electron', 'Photon'], 'C'),
    question('What is the boiling point of water at sea level?', ['50 C', '75 C', '100 C', '150 C'], 'C'),
    question('Which layer protects Earth from much ultraviolet radiation?', ['Troposphere', 'Ozone layer', 'Lithosphere', 'Core'], 'B'),
    question('What is the chemical symbol for gold?', ['Go', 'Gd', 'Au', 'Ag'], 'C'),
    question('Which scientist proposed the theory of general relativity?', ['Isaac Newton', 'Albert Einstein', 'Marie Curie', 'Niels Bohr'], 'B'),
    question('What is the basic unit of life?', ['Atom', 'Cell', 'Organ', 'Tissue'], 'B'),
    question('Which blood cells help fight infection?', ['Red blood cells', 'White blood cells', 'Platelets', 'Plasma'], 'B'),
    question('What type of energy does a moving object have?', ['Thermal', 'Kinetic', 'Chemical', 'Elastic'], 'B'),
    question('Which planet has the most prominent ring system?', ['Mars', 'Saturn', 'Earth', 'Venus'], 'B'),
    question('What scale measures earthquake magnitude?', ['Beaufort', 'Richter', 'Celsius', 'pH'], 'B'),
    question('Which vitamin is produced when skin is exposed to sunlight?', ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K'], 'C'),
    question('What is the center of an atom called?', ['Shell', 'Nucleus', 'Membrane', 'Core sample'], 'B'),
    question('What does DNA store?', ['Genetic information', 'Oxygen', 'Heat', 'Water'], 'A'),
    question('Which process turns a liquid into gas?', ['Freezing', 'Condensation', 'Evaporation', 'Deposition'], 'C'),
    question('Which animal group includes frogs and salamanders?', ['Reptiles', 'Amphibians', 'Mammals', 'Birds'], 'B'),
  ]),
  makePreset('pop-culture', 'Pop Culture', 'Entertainment', 'Movies, music, TV, icons, and fandom staples.', [
    question('Who is known as the King of Pop?', ['Prince', 'Michael Jackson', 'Elvis Presley', 'Bruno Mars'], 'B'),
    question('Which movie features the line "May the Force be with you"?', ['Star Wars', 'Avatar', 'The Matrix', 'Dune'], 'A'),
    question('Which superhero is also known as the Dark Knight?', ['Iron Man', 'Batman', 'Superman', 'Spider-Man'], 'B'),
    question('What fictional school does Harry Potter attend?', ['Hogwarts', 'Beauxbatons', 'Ilvermorny', 'Durmstrang'], 'A'),
    question('Which TV show features the coffee shop Central Perk?', ['Friends', 'Seinfeld', 'The Office', 'How I Met Your Mother'], 'A'),
    question('Which singer released the album 1989?', ['Adele', 'Taylor Swift', 'Billie Eilish', 'Rihanna'], 'B'),
    question('Which franchise features lightsabers?', ['Star Trek', 'Star Wars', 'Blade Runner', 'Alien'], 'B'),
    question('Who played Jack in Titanic?', ['Brad Pitt', 'Leonardo DiCaprio', 'Tom Cruise', 'Matt Damon'], 'B'),
    question('Which animated film features Elsa?', ['Moana', 'Frozen', 'Brave', 'Tangled'], 'B'),
    question('What is the name of the toy cowboy in Toy Story?', ['Buzz', 'Woody', 'Andy', 'Rex'], 'B'),
    question('Which streaming series features Hawkins, Indiana?', ['Stranger Things', 'Wednesday', 'Dark', 'Loki'], 'A'),
    question('Which band released Bohemian Rhapsody?', ['Queen', 'The Beatles', 'ABBA', 'Nirvana'], 'A'),
    question('Which Marvel hero uses a hammer called Mjolnir?', ['Thor', 'Hulk', 'Hawkeye', 'Vision'], 'A'),
    question('What color are the Simpsons usually drawn?', ['Blue', 'Yellow', 'Green', 'Pink'], 'B'),
    question('Which movie franchise features Dominic Toretto?', ['John Wick', 'Fast & Furious', 'Mission: Impossible', 'Transformers'], 'B'),
    question('Which artist is known for the song Bad Guy?', ['Lorde', 'Billie Eilish', 'Dua Lipa', 'Olivia Rodrigo'], 'B'),
    question('Which fantasy series features the One Ring?', ['Harry Potter', 'The Lord of the Rings', 'Narnia', 'Percy Jackson'], 'B'),
    question('Which character lives in a pineapple under the sea?', ['Patrick', 'SpongeBob', 'Squidward', 'Plankton'], 'B'),
    question('Which film features the song My Heart Will Go On?', ['Titanic', 'Moulin Rouge!', 'La La Land', 'Frozen'], 'A'),
    question('Which show is set at Dunder Mifflin?', ['Parks and Recreation', 'The Office', 'Brooklyn Nine-Nine', 'Community'], 'B'),
  ]),
  makePreset('geography', 'Geography', 'World', 'Capitals, landmarks, rivers, mountains, and maps.', [
    question('What is the capital of Japan?', ['Kyoto', 'Tokyo', 'Osaka', 'Nagoya'], 'B'),
    question('Which continent is the Sahara Desert in?', ['Asia', 'Africa', 'Australia', 'South America'], 'B'),
    question('What is the longest river in the world by common school convention?', ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], 'B'),
    question('Which country has the city of Barcelona?', ['Portugal', 'Spain', 'Italy', 'France'], 'B'),
    question('Mount Everest lies in which mountain range?', ['Andes', 'Alps', 'Himalayas', 'Rockies'], 'C'),
    question('Which ocean is the largest?', ['Atlantic', 'Indian', 'Pacific', 'Arctic'], 'C'),
    question('What is the capital of Canada?', ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], 'C'),
    question('Which country is shaped like a boot?', ['Greece', 'Italy', 'Chile', 'Norway'], 'B'),
    question('The Great Barrier Reef is near which country?', ['Brazil', 'Australia', 'India', 'Mexico'], 'B'),
    question('Which river flows through Paris?', ['Thames', 'Seine', 'Rhine', 'Danube'], 'B'),
    question('What is the capital of Egypt?', ['Cairo', 'Alexandria', 'Luxor', 'Giza'], 'A'),
    question('Which country has the most natural lakes?', ['Canada', 'India', 'Spain', 'Japan'], 'A'),
    question('Which U.S. state is known as the Sunshine State?', ['California', 'Florida', 'Texas', 'Arizona'], 'B'),
    question('Which desert covers much of Mongolia and northern China?', ['Gobi', 'Kalahari', 'Atacama', 'Mojave'], 'A'),
    question('Which city is home to the Colosseum?', ['Athens', 'Rome', 'Istanbul', 'Madrid'], 'B'),
    question('What is the capital of Brazil?', ['Rio de Janeiro', 'Sao Paulo', 'Brasilia', 'Salvador'], 'C'),
    question('Which sea separates Europe and Africa near Italy?', ['Caribbean Sea', 'Mediterranean Sea', 'Baltic Sea', 'Black Sea'], 'B'),
    question('Which country contains Machu Picchu?', ['Peru', 'Chile', 'Colombia', 'Bolivia'], 'A'),
    question('Which is the smallest continent?', ['Europe', 'Australia', 'Antarctica', 'South America'], 'B'),
    question('What is the capital of South Korea?', ['Busan', 'Seoul', 'Incheon', 'Daegu'], 'B'),
  ]),
  makePreset('technology', 'Technology', 'Digital', 'Computers, web basics, devices, and modern tech.', [
    question('What does CPU stand for?', ['Central Processing Unit', 'Computer Power Utility', 'Core Program Unit', 'Central Pixel Unit'], 'A'),
    question('Which language is primarily used for styling web pages?', ['HTML', 'CSS', 'SQL', 'Python'], 'B'),
    question('What does URL stand for?', ['Uniform Resource Locator', 'Universal Runtime Link', 'User Request Label', 'Unified Router List'], 'A'),
    question('Which company created the iPhone?', ['Google', 'Apple', 'Samsung', 'Nokia'], 'B'),
    question('What does RAM store?', ['Temporary working data', 'Printed pages', 'Battery charge', 'Screen brightness'], 'A'),
    question('Which protocol is commonly used for secure websites?', ['FTP', 'HTTP', 'HTTPS', 'SMTP'], 'C'),
    question('What is Git used for?', ['Image editing', 'Version control', 'Video streaming', 'Password cracking'], 'B'),
    question('Which database language is used for queries?', ['CSS', 'SQL', 'SVG', 'Bash'], 'B'),
    question('What does AI stand for?', ['Automated Input', 'Artificial Intelligence', 'Analog Interface', 'Applied Internet'], 'B'),
    question('Which file extension often contains JavaScript?', ['.jpg', '.js', '.mp3', '.zip'], 'B'),
    question('What does a browser do?', ['Runs websites', 'Prints circuits', 'Charges phones', 'Stores furniture'], 'A'),
    question('Which company developed Android?', ['Microsoft', 'Google', 'Sony', 'IBM'], 'B'),
    question('What is two-factor authentication used for?', ['Faster charging', 'Extra login security', 'Better graphics', 'File compression'], 'B'),
    question('Which device routes internet traffic in a home network?', ['Router', 'Monitor', 'Keyboard', 'Printer'], 'A'),
    question('What does HTML define?', ['Page structure', 'Database indexes', 'Battery health', 'Image resolution'], 'A'),
    question('Which cloud term means renting computing resources over the internet?', ['Cloud computing', 'Packet painting', 'Cable casting', 'Data drying'], 'A'),
    question('What is phishing?', ['A cyber scam', 'A graphics setting', 'A keyboard shortcut', 'A storage format'], 'A'),
    question('Which unit is larger?', ['Kilobyte', 'Megabyte', 'Byte', 'Bit'], 'B'),
    question('What is an API?', ['Application Programming Interface', 'Automatic Pixel Importer', 'Advanced Power Input', 'Audio Processing Icon'], 'A'),
    question('Which tool is used to inspect web page elements in browsers?', ['Developer tools', 'Paint bucket', 'Disk cleanup', 'Task scheduler'], 'A'),
  ]),
];

export function parseQuestions(text: string): Question[] {
  const blocks = text
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const questionLine = lines.find((line) => questionPrefix.test(line));
    const answerLine = lines.find((line) => answerPrefix.test(line));
    const optionLines = lines.filter((line) => optionPrefix.test(line));

    if (!questionLine || optionLines.length < 2 || !answerLine) {
      throw new Error(`Question block ${index + 1} is missing a question, options, or answer.`);
    }

    const options = optionLines.map((line) => {
      const match = line.match(optionPattern);

      if (!match) {
        throw new Error(`Question block ${index + 1} has an invalid option.`);
      }

      return {
        key: match[1].toUpperCase() as OptionKey,
        label: match[2],
      };
    });

    const answer = answerLine.replace(answerPrefix, '').trim().toUpperCase() as OptionKey;

    if (!options.some((item) => item.key === answer)) {
      throw new Error(`Question block ${index + 1} has an answer that does not match an option.`);
    }

    return {
      answer,
      id: `custom-${index + 1}-${questionLine}`,
      options,
      prompt: questionLine.replace(questionPrefix, '').trim(),
    };
  });
}

export function readStats(): QuizStats {
  try {
    const saved = window.localStorage.getItem(STATS_KEY);

    if (!saved) {
      return defaultStats;
    }

    return { ...defaultStats, ...JSON.parse(saved) };
  } catch {
    return defaultStats;
  }
}

export function countCorrect(questions: Question[], answers: Record<string, OptionKey>) {
  return questions.filter((item) => answers[item.id] === item.answer).length;
}

export function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

export function questionFontSize(prompt: string) {
  const length = prompt.trim().length;
  return questionSizeSteps.find((step) => length > step.minLength)?.size ?? 'clamp(2rem, min(3.8vw, 6dvh), 3.6rem)';
}

export function shuffleQuestions(questions: Question[]) {
  const nextQuestions = [...questions];

  for (let index = nextQuestions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextQuestions[index], nextQuestions[swapIndex]] = [nextQuestions[swapIndex], nextQuestions[index]];
  }

  return nextQuestions;
}

export function selectQuestions(questions: Question[], requestedCount: number) {
  return shuffleQuestions(questions).slice(0, Math.min(requestedCount, questions.length));
}
