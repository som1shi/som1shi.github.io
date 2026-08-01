export const profile = {
  name: 'Sarvagya',
  location: 'Berkeley, California',
  email: 'sarvagya@berkeley.edu',
  intro: 'I study electrical engineering and computer science at UC Berkeley, and build thoughtful software across systems, research, and the web.',
  about: [
    'I am pursuing a Bachelor of Science in Electrical Engineering and Computer Sciences at UC Berkeley, where I focus on building useful technology and learning how complex systems work.',
    'My work spans software development, machine learning, artificial intelligence, computer vision, graphics, and research. I care about clear ideas, careful engineering, and real-world applications.',
  ],
};

export const socialLinks = {
  os32: 'https://os32.vercel.app',
  linkedin: 'https://www.linkedin.com/in/sarvagyasomvanshi/',
  github: 'https://github.com/som1shi',
};

export const projects = [
  {
    id: 'os32',
    title: 'os32',
    technologies: ['OS', 'JavaScript', 'React', 'RESTful API', 'Python', 'Firebase'],
    description: 'A retro-themed web operating system with a file system, terminal, browser, applications, and games.',
    url: socialLinks.os32,
    featured: true,
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision Portfolio',
    technologies: ['Python', 'NumPy', 'OpenCV', 'Computer Vision'],
    description: 'Image alignment, filtering, hybrid images, frequency analysis, morphing, and computational photography.',
    url: 'https://som1shi.github.io/cs180/',
    featured: true,
  },
  {
    id: 'computer-graphics',
    title: 'Computer Graphics Portfolio',
    technologies: ['C++', 'OpenGL', 'GLSL', 'Ray Tracing'],
    description: 'Rasterization, Bézier surfaces, half-edge meshes, resampling, and physically based ray tracing.',
    url: 'https://som1shi.github.io/cs184/',
    featured: true,
  },
  {
    id: 'brand-semantics',
    title: 'AI Brand Semantics Analyzer',
    technologies: ['Node.js', 'Python', 'xAPI', 'Grok LLM', 'React'],
    description: 'A full-stack application that tracks and analyzes brand performance on X.',
    url: null,
  },
  {
    id: 'sales-ordering',
    title: 'Sales Ordering System',
    technologies: ['Full Stack', 'Database', 'API'],
    description: 'A product ordering system that streamlines order management from inception to fulfillment.',
    url: null,
  },
  {
    id: 'stock-prediction',
    title: 'Stock Prediction App',
    technologies: ['Python', 'Machine Learning', 'NLP'],
    description: 'A sentiment analysis application that forecasts stock trajectories from media headlines.',
    url: null,
  },
  {
    id: 'tutor-one',
    title: 'TutorOne',
    technologies: ['Flutter', 'Machine Learning', 'OCR'],
    description: 'A mobile application using optical character recognition to help children improve handwriting.',
    url: 'https://github.com/som1shi/TutorOne',
  },
  {
    id: 'haunted-hallows',
    title: 'Haunted Hallows: AR Video Game',
    technologies: ['Flutter', 'Google ML', 'AR'],
    description: 'A Halloween-themed game using machine learning to categorize real-world objects.',
    url: null,
  },
  {
    id: 'secure-files',
    title: 'Secure File Sharing System',
    technologies: ['Go', 'Cryptography'],
    description: 'A secure file storage and sharing system built around confidentiality and integrity.',
    url: null,
  },
  {
    id: 'discord-bot',
    title: 'Discord Bot',
    technologies: ['Discord API', 'Python'],
    description: 'A chatbot that brings useful text-based information from several APIs into Discord.',
    url: 'https://github.com/som1shi/Optima',
  },
  {
    id: 'megalib',
    title: 'MEGAlib Conversion Project',
    technologies: ['CMake', 'Data Analysis'],
    description: 'A CMake modernization of a modular data analysis library with roughly one thousand source files.',
    url: 'https://megalibtoolkit.com/home.html',
  },
];

export const research = [
  {
    id: 'algorithmic-media',
    title: 'Transformers for Social Media Trends and Algorithms',
    organization: 'Designing Algorithmic Media',
    date: 'January 2026 – Current',
    description: 'Research on transformer systems for modeling social media trends and algorithms.',
    url: 'https://arxiv.org/abs/2605.02358',
  },
  {
    id: 'regression-models',
    title: 'Transformer Architectures for Regression Models',
    organization: 'Deep Learning at Berkeley',
    date: 'September 2025 – February 2026',
    description: 'Transformer architectures and training methods for regression tasks.',
    url: 'https://arxiv.org/abs/2602.17171',
  },
  {
    id: 'journalism-llm',
    title: 'Journalism and LLM Research',
    organization: 'Alexander Spangher',
    date: 'May 2024 – September 2024',
    description: 'Large language model research at the intersection of journalism and newspaper bias.',
    url: null,
  },
  {
    id: 'haas-nlp',
    title: 'NLP Research at Haas School of Business',
    organization: 'Prof. Biwen Zhang',
    date: 'April 2024 – June 2024',
    description: 'Developed and fine-tuned BERT models for semantic categorization across large datasets.',
    url: null,
  },
  {
    id: 'ucsf-memory',
    title: 'Research Apprentice at UCSF Memory and Aging Center',
    organization: 'Dr. Jet Vonk',
    date: 'February 2024 – May 2024',
    description: 'Built linguistic pipeline units to quantify and interpret semantic richness in patient data.',
    url: null,
  },
  {
    id: 'berkeley-informatics',
    title: 'Research Apprentice at UC Berkeley School of Informatics',
    organization: 'Prof. Zachary Pardos',
    date: 'February 2023 – May 2023',
    description: 'Worked on OATutor to support mathematics education.',
    url: null,
  },
];

export const experiences = [
  { id: 'microsoft', company: 'Microsoft', role: 'Software Engineer Intern', date: 'Summer 2025', location: 'Redmond, WA' },
  { id: 'bentley', company: 'Bentley Systems', role: 'Contract Software Developer', date: 'Fall 2024', location: 'Berkeley, CA' },
  { id: 'sap', company: 'SAP SE', role: 'Development Intern', date: 'Summer 2024', location: 'Palo Alto, CA' },
  { id: 'posto', company: 'Posto-Social Inc.', role: 'Software Engineer Intern', date: 'Summer 2023', location: 'Berkeley, CA' },
  { id: 'bin95', company: 'Bin95 Industrial Training', role: 'Senior Contract Developer', date: '2023', location: 'Remote' },
  { id: 'taiyo', company: 'Taiyō.AI', role: 'Contract Developer', date: '2023', location: 'Remote' },
  { id: 'berkeley-it', company: 'Berkeley IT', role: 'Student IT Technician', date: '2022', location: 'Berkeley, CA' },
  { id: 'revocube', company: 'Revocube Technologies Limited', role: 'Software Developer Intern', date: '2022', location: 'Lagos, Nigeria' },
];

export const games = [
  { id: 'wordsweeper', title: 'WordSweeper', icon: '💣', description: 'The classic Minesweeper game with a twist.', route: '/wordsweeper' },
  { id: 'quantum-chess', title: 'Schrödinger’s Chess', icon: '♟', description: 'Chess pieces exist in superposition until observed.', route: '/quantum-chess' },
  { id: 'rotate-connect-four', title: 'Rotate Connect Four', icon: '◉', description: 'Connect Four with dice rolls and board rotations.', route: '/rotate-connect-four' },
  { id: 'refiner', title: 'Macrodata Refinement', icon: '⌁', description: 'Sort scary numbers in a Severance-inspired terminal.', route: '/refiner' },
  { id: 'wikiconnect', title: 'WikiConnect', icon: '↗', description: 'Connect two random articles by navigating Wikipedia.', route: '/wikiconnect' },
];

const photoNumbers = [
  2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42, 43, 44,
];

const uppercasePhotos = new Set([2, 3, 4, 5, 6, 13, 15, 16, 18, 20, 22, 23, 24, 26, 30, 32, 33, 34, 35, 37, 38, 40, 42, 44]);

export const photos = photoNumbers.map((number, index) => ({
  id: number,
  src: `/photos/${number}${uppercasePhotos.has(number) ? '.JPG' : '.jpg'}`,
  alt: `Sarvagya’s photograph ${index + 1}`,
}));
