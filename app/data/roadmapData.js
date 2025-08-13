import dataset from './dataset.json';

// Helper to extract skills and tools by goal from dataset.json
const extractSkillsAndTools = (goalObj) => {
  const skills = [];
  const tools = [];
  Object.entries(goalObj.skills).forEach(([skillName, skillData]) => {
    // Skill entry
    skills.push({
      name: skillName,
      level: skillData.level,
    });
    // Tool entries (if any)
    if (skillData.tools) {
      skillData.tools.forEach(tool => {
        tools.push({
          name: tool,
          parentSkill: skillName,
          level: skillData.level,
        });
      });
    }
  });
  return { skills, tools };
};

export const roadmapData = {
  categories: {
    skills: dataset.map(goalObj => ({
      goal: goalObj.goal,
      items: extractSkillsAndTools(goalObj).skills,
    })),
    tools: dataset.map(goalObj => ({
      goal: goalObj.goal,
      items: extractSkillsAndTools(goalObj).tools,
    })),
  },
  
  technologies: [
    // Frontend Technologies
    {
      id: 'internet',
      name: 'Internet',
      category: 'networking',
      level: 'beginner',
      prerequisites: [],
      nextSteps: ['html', 'css'],
      description: 'Understanding of internet protocols and web fundamentals',
      popularity: 100,
    },
    {
      id: 'html',
      name: 'HTML',
      category: 'frontend',
      level: 'beginner',
      prerequisites: ['internet'],
      nextSteps: ['css', 'javascript'],
      description: 'HyperText Markup Language - the standard markup language for web pages',
      popularity: 95,
    },
    {
      id: 'css',
      name: 'CSS',
      category: 'frontend',
      level: 'beginner',
      prerequisites: ['html'],
      nextSteps: ['javascript', 'sass', 'tailwindcss'],
      description: 'Cascading Style Sheets - styling and layout for web pages',
      popularity: 90,
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      category: 'frontend',
      level: 'beginner',
      prerequisites: ['html', 'css'],
      nextSteps: ['react', 'vue', 'angular', 'nodejs'],
      description: 'Programming language for web development',
      popularity: 95,
    },
    {
      id: 'react',
      name: 'React',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['javascript', 'html', 'css'],
      nextSteps: ['nextjs', 'typescript', 'redux'],
      description: 'JavaScript library for building user interfaces',
      popularity: 90,
    },
    {
      id: 'vue',
      name: 'Vue.js',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['javascript', 'html', 'css'],
      nextSteps: ['nuxtjs', 'typescript', 'vuex'],
      description: 'Progressive JavaScript framework',
      popularity: 75,
    },
    {
      id: 'angular',
      name: 'Angular',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['javascript', 'html', 'css', 'typescript'],
      nextSteps: ['rxjs', 'ngrx'],
      description: 'Platform for building mobile and desktop web applications',
      popularity: 70,
    },
    {
      id: 'svelte',
      name: 'Svelte',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['javascript', 'html', 'css'],
      nextSteps: ['sveltekit'],
      description: 'Modern frontend framework with compile-time optimization',
      popularity: 65,
    },
    {
      id: 'solidjs',
      name: 'SolidJS',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['javascript', 'html', 'css'],
      nextSteps: ['solidstart'],
      description: 'Declarative JavaScript UI library',
      popularity: 60,
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['javascript'],
      nextSteps: ['react', 'angular', 'nodejs'],
      description: 'Typed superset of JavaScript',
      popularity: 85,
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['react', 'javascript'],
      nextSteps: ['vercel', 'prisma'],
      description: 'React framework for production',
      popularity: 80,
    },
    {
      id: 'astro',
      name: 'Astro',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['javascript', 'html', 'css'],
      nextSteps: ['vercel', 'netlify'],
      description: 'Static site generator with component islands',
      popularity: 70,
    },
    {
      id: 'nuxtjs',
      name: 'Nuxt.js',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['vue', 'javascript'],
      nextSteps: ['vercel', 'netlify'],
      description: 'Vue.js framework for universal applications',
      popularity: 70,
    },
    {
      id: 'tailwindcss',
      name: 'TailwindCSS',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['css'],
      nextSteps: ['postcss'],
      description: 'Utility-first CSS framework',
      popularity: 85,
    },
    {
      id: 'sass',
      name: 'Sass',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['css'],
      nextSteps: ['postcss'],
      description: 'CSS preprocessor with advanced features',
      popularity: 80,
    },
    {
      id: 'postcss',
      name: 'PostCSS',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['css'],
      nextSteps: ['tailwindcss', 'sass'],
      description: 'CSS transformation tool',
      popularity: 75,
    },
    {
      id: 'graphql',
      name: 'GraphQL',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['javascript', 'rest'],
      nextSteps: ['apollo', 'relay'],
      description: 'Query language for APIs',
      popularity: 75,
    },
    
    // Backend Technologies
    {
      id: 'intranet',
      name: 'Intranet',
      category: 'networking',
      level: 'beginner',
      prerequisites: [],
      nextSteps: ['javascript', 'python', 'java'],
      description: 'Private network infrastructure',
      popularity: 85,
    },
    {
      id: 'python',
      name: 'Python',
      category: 'backend',
      level: 'beginner',
      prerequisites: [],
      nextSteps: ['django', 'flask', 'fastapi', 'pandas'],
      description: 'High-level programming language',
      popularity: 90,
    },
    {
      id: 'java',
      name: 'Java',
      category: 'backend',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['spring', 'hibernate', 'maven'],
      description: 'Object-oriented programming language',
      popularity: 80,
    },
    {
      id: 'php',
      name: 'PHP',
      category: 'backend',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['laravel', 'wordpress', 'symfony'],
      description: 'Server-side scripting language',
      popularity: 75,
    },
    {
      id: 'go',
      name: 'Go',
      category: 'backend',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['gin', 'echo', 'kubernetes'],
      description: 'Statically typed compiled language',
      popularity: 80,
    },
    {
      id: 'ruby',
      name: 'Ruby',
      category: 'backend',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['rails', 'sinatra'],
      description: 'Dynamic object-oriented language',
      popularity: 70,
    },
    {
      id: 'csharp',
      name: 'C#',
      category: 'backend',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['.net', 'aspnet', 'entity-framework'],
      description: 'Object-oriented programming language by Microsoft',
      popularity: 75,
    },
    {
      id: 'rust',
      name: 'Rust',
      category: 'backend',
      level: 'advanced',
      prerequisites: [],
      nextSteps: ['actix', 'rocket', 'tokio'],
      description: 'Systems programming language',
      popularity: 70,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['javascript'],
      nextSteps: ['express', 'mongodb', 'postgresql'],
      description: 'JavaScript runtime for server-side development',
      popularity: 85,
    },
    {
      id: 'express',
      name: 'Express.js',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['nodejs'],
      nextSteps: ['mongodb', 'postgresql', 'jwt'],
      description: 'Web application framework for Node.js',
      popularity: 85,
    },
    {
      id: 'django',
      name: 'Django',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['python'],
      nextSteps: ['postgresql', 'redis', 'celery'],
      description: 'High-level Python web framework',
      popularity: 75,
    },
    {
      id: 'flask',
      name: 'Flask',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['python'],
      nextSteps: ['sqlalchemy', 'postgresql'],
      description: 'Lightweight Python web framework',
      popularity: 70,
    },
    {
      id: 'rest',
      name: 'REST',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['javascript', 'python'],
      nextSteps: ['graphql', 'jwt'],
      description: 'Representational State Transfer architecture',
      popularity: 90,
    },
    {
      id: 'json-apis',
      name: 'JSON APIs',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['javascript', 'rest'],
      nextSteps: ['graphql'],
      description: 'Application Programming Interfaces using JSON',
      popularity: 85,
    },
    {
      id: 'server-side',
      name: 'Server Side',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['javascript', 'python'],
      nextSteps: ['client-side', 'cdn'],
      description: 'Server-side rendering and processing',
      popularity: 80,
    },
    {
      id: 'client-side',
      name: 'Client Side',
      category: 'frontend',
      level: 'intermediate',
      prerequisites: ['javascript', 'html', 'css'],
      nextSteps: ['server-side', 'cdn'],
      description: 'Client-side rendering and processing',
      popularity: 80,
    },
    {
      id: 'websockets',
      name: 'WebSockets',
      category: 'backend',
      level: 'intermediate',
      prerequisites: ['javascript', 'nodejs'],
      nextSteps: ['socket.io'],
      description: 'Real-time bidirectional communication',
      popularity: 75,
    },
    {
      id: 'api-design',
      name: 'API Design',
      category: 'backend',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['rest', 'json-apis'],
      description: 'Designing robust APIs for backend systems',
      popularity: 80,
    },
    
    // Database Technologies
    {
      id: 'mongodb',
      name: 'MongoDB',
      category: 'database',
      level: 'intermediate',
      prerequisites: ['javascript'],
      nextSteps: ['mongoose', 'redis'],
      description: 'NoSQL document database',
      popularity: 80,
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      level: 'intermediate',
      prerequisites: ['sql'],
      nextSteps: ['prisma', 'typeorm'],
      description: 'Advanced open-source relational database',
      popularity: 85,
    },
    {
      id: 'mysql',
      name: 'MySQL',
      category: 'database',
      level: 'intermediate',
      prerequisites: ['sql'],
      nextSteps: ['sequelize', 'typeorm'],
      description: 'Open-source relational database management system',
      popularity: 80,
    },
    {
      id: 'mariadb',
      name: 'MariaDB',
      category: 'database',
      level: 'intermediate',
      prerequisites: ['sql'],
      nextSteps: ['mysql'],
      description: 'Open-source relational database',
      popularity: 70,
    },
    {
      id: 'sqlite',
      name: 'SQLite',
      category: 'database',
      level: 'intermediate',
      prerequisites: ['sql'],
      nextSteps: ['postgresql', 'mysql'],
      description: 'Lightweight file-based database',
      popularity: 75,
    },
    {
      id: 'oracle',
      name: 'Oracle',
      category: 'database',
      level: 'advanced',
      prerequisites: ['sql'],
      nextSteps: ['plsql'],
      description: 'Enterprise relational database management system',
      popularity: 70,
    },
    {
      id: 'redis',
      name: 'Redis',
      category: 'database',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['nodejs', 'python'],
      description: 'In-memory data structure store',
      popularity: 75,
    },
    {
      id: 'firebase',
      name: 'Firebase',
      category: 'database',
      level: 'intermediate',
      prerequisites: ['javascript'],
      nextSteps: ['firestore', 'authentication'],
      description: 'Google\'s mobile and web application platform',
      popularity: 80,
    },
    {
      id: 'cassandra',
      name: 'Cassandra',
      category: 'database',
      level: 'advanced',
      prerequisites: ['sql'],
      nextSteps: ['spark'],
      description: 'Distributed NoSQL database',
      popularity: 65,
    },
    {
      id: 'elasticsearch',
      name: 'ElasticSearch',
      category: 'database',
      level: 'advanced',
      prerequisites: ['json'],
      nextSteps: ['kibana', 'logstash'],
      description: 'Distributed search and analytics engine',
      popularity: 70,
    },
    
    // DevOps Technologies
    {
      id: 'docker',
      name: 'Docker',
      category: 'devops',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['kubernetes', 'docker-compose'],
      description: 'Containerization platform',
      popularity: 85,
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      category: 'devops',
      level: 'advanced',
      prerequisites: ['docker'],
      nextSteps: ['helm', 'istio'],
      description: 'Container orchestration platform',
      popularity: 75,
    },
    {
      id: 'aws',
      name: 'AWS',
      category: 'devops',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['ec2', 's3', 'lambda'],
      description: 'Cloud computing platform',
      popularity: 90,
    },
    {
      id: 'git',
      name: 'Git',
      category: 'devops',
      level: 'beginner',
      prerequisites: [],
      nextSteps: ['github', 'gitlab', 'ci-cd'],
      description: 'Version control system',
      popularity: 95,
    },
    {
      id: 'github',
      name: 'Github',
      category: 'devops',
      level: 'beginner',
      prerequisites: ['git'],
      nextSteps: ['gitlab', 'bitbucket'],
      description: 'Git-based code hosting platform',
      popularity: 90,
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      category: 'devops',
      level: 'beginner',
      prerequisites: ['git'],
      nextSteps: ['github', 'bitbucket'],
      description: 'Git-based DevOps platform',
      popularity: 80,
    },
    {
      id: 'bitbucket',
      name: 'BitBucket',
      category: 'devops',
      level: 'beginner',
      prerequisites: ['git'],
      nextSteps: ['github', 'gitlab'],
      description: 'Git-based code hosting platform by Atlassian',
      popularity: 75,
    },
    {
      id: 'cicd',
      name: 'CI/CD',
      category: 'devops',
      level: 'intermediate',
      prerequisites: ['git', 'github'],
      nextSteps: ['jenkins', 'github-actions'],
      description: 'Continuous Integration and Continuous Deployment',
      popularity: 80,
    },
    {
      id: 'kafka',
      name: 'Kafka',
      category: 'devops',
      level: 'advanced',
      prerequisites: ['java'],
      nextSteps: ['zookeeper'],
      description: 'Distributed streaming platform',
      popularity: 70,
    },
    {
      id: 'apache',
      name: 'Apache',
      category: 'devops',
      level: 'intermediate',
      prerequisites: [],
      nextSteps: ['nginx'],
      description: 'Web server software',
      popularity: 75,
    },
    
    // Mobile Development
    {
      id: 'react-native',
      name: 'React Native',
      category: 'mobile',
      level: 'intermediate',
      prerequisites: ['react', 'javascript'],
      nextSteps: ['expo', 'firebase'],
      description: 'Mobile app development framework',
      popularity: 80,
    },
    {
      id: 'flutter',
      name: 'Flutter',
      category: 'mobile',
      level: 'intermediate',
      prerequisites: ['dart'],
      nextSteps: ['firebase', 'bloc'],
      description: 'UI toolkit for building natively compiled applications',
      popularity: 75,
    },
    
    // Development Tools
    {
      id: 'npm',
      name: 'npm',
      category: 'tools',
      level: 'beginner',
      prerequisites: ['javascript'],
      nextSteps: ['pnpm', 'yarn'],
      description: 'Node.js package manager',
      popularity: 90,
    },
    {
      id: 'pnpm',
      name: 'pnpm',
      category: 'tools',
      level: 'intermediate',
      prerequisites: ['npm'],
      nextSteps: ['yarn'],
      description: 'Fast, disk space efficient package manager',
      popularity: 70,
    },
    {
      id: 'yarn',
      name: 'yarn',
      category: 'tools',
      level: 'intermediate',
      prerequisites: ['npm'],
      nextSteps: ['pnpm'],
      description: 'Fast, reliable, and secure dependency management',
      popularity: 75,
    },
    {
      id: 'prettier',
      name: 'Prettier',
      category: 'tools',
      level: 'intermediate',
      prerequisites: ['javascript'],
      nextSteps: ['eslint'],
      description: 'Code formatter',
      popularity: 85,
    },
    {
      id: 'eslint',
      name: 'ESLint',
      category: 'tools',
      level: 'intermediate',
      prerequisites: ['javascript'],
      nextSteps: ['prettier'],
      description: 'JavaScript linting utility',
      popularity: 85,
    },
    {
      id: 'vite',
      name: 'Vite',
      category: 'tools',
      level: 'intermediate',
      prerequisites: ['javascript'],
      nextSteps: ['esbuild'],
      description: 'Next generation frontend tooling',
      popularity: 80,
    },
    {
      id: 'esbuild',
      name: 'ESBuild',
      category: 'tools',
      level: 'intermediate',
      prerequisites: ['javascript'],
      nextSteps: ['vite'],
      description: 'Extremely fast JavaScript bundler',
      popularity: 75,
    },
    {
      id: 'vitest',
      name: 'Vitest',
      category: 'testing',
      level: 'intermediate',
      prerequisites: ['javascript', 'vite'],
      nextSteps: ['jest'],
      description: 'Unit testing framework for Vite',
      popularity: 70,
    },
    
    // Security & Authentication
    {
      id: 'jwt',
      name: 'JWT',
      category: 'security',
      level: 'intermediate',
      prerequisites: ['javascript', 'json'],
      nextSteps: ['oauth'],
      description: 'JSON Web Tokens for authentication',
      popularity: 85,
    },
    {
      id: 'oauth',
      name: 'OAuth',
      category: 'security',
      level: 'intermediate',
      prerequisites: ['jwt'],
      nextSteps: ['openid-connect'],
      description: 'Open standard for authorization',
      popularity: 80,
    },
    {
      id: 'basic-authentication',
      name: 'Basic Authentication',
      category: 'security',
      level: 'beginner',
      prerequisites: ['http'],
      nextSteps: ['jwt', 'oauth'],
      description: 'Simple authentication scheme',
      popularity: 75,
    },
    {
      id: 'token-authentication',
      name: 'Token Authentication',
      category: 'security',
      level: 'intermediate',
      prerequisites: ['jwt'],
      nextSteps: ['oauth'],
      description: 'Token-based authentication system',
      popularity: 80,
    },
    {
      id: 'authentication-strategies',
      name: 'Authentication Strategies',
      category: 'security',
      level: 'intermediate',
      prerequisites: ['jwt', 'oauth'],
      nextSteps: ['saml', 'openid-connect'],
      description: 'Various authentication methods and patterns',
      popularity: 75,
    },
    {
      id: 'cors',
      name: 'CORS',
      category: 'security',
      level: 'intermediate',
      prerequisites: ['http', 'javascript'],
      nextSteps: ['authentication-strategies'],
      description: 'Cross-Origin Resource Sharing',
      popularity: 80,
    },
    {
      id: 'https',
      name: 'HTTPS',
      category: 'security',
      level: 'intermediate',
      prerequisites: ['http', 'ssl'],
      nextSteps: ['tls'],
      description: 'Secure HTTP protocol',
      popularity: 85,
    },
    {
      id: 'md5',
      name: 'MD5',
      category: 'security',
      level: 'intermediate',
      prerequisites: ['cryptography'],
      nextSteps: ['sha'],
      description: 'Cryptographic hash function',
      popularity: 70,
    },
    {
      id: 'sha',
      name: 'SHA',
      category: 'security',
      level: 'intermediate',
      prerequisites: ['cryptography'],
      nextSteps: ['bcrypt'],
      description: 'Secure Hash Algorithm family',
      popularity: 75,
    },
    
    // Testing
    {
      id: 'integration-testing',
      name: 'Integration Testing',
      category: 'testing',
      level: 'intermediate',
      prerequisites: ['unit-testing'],
      nextSteps: ['functional-testing'],
      description: 'Testing integration between components',
      popularity: 80,
    },
    {
      id: 'unit-testing',
      name: 'Unit Testing',
      category: 'testing',
      level: 'intermediate',
      prerequisites: ['javascript', 'python'],
      nextSteps: ['integration-testing'],
      description: 'Testing individual units of code',
      popularity: 85,
    },
    {
      id: 'functional-testing',
      name: 'Functional Testing',
      category: 'testing',
      level: 'intermediate',
      prerequisites: ['integration-testing'],
      nextSteps: ['e2e-testing'],
      description: 'Testing application functionality',
      popularity: 75,
    },
    
    // Networking & Infrastructure
    {
      id: 'cdn',
      name: 'CDN',
      category: 'networking',
      level: 'intermediate',
      prerequisites: ['http'],
      nextSteps: ['cloudflare'],
      description: 'Content Delivery Network',
      popularity: 80,
    },
    {
      id: 'architectural-pattern',
      name: 'Architectural Pattern',
      category: 'backend',
      level: 'advanced',
      prerequisites: ['design-patterns'],
      nextSteps: ['microservices'],
      description: 'Software architecture patterns',
      popularity: 75,
    },
  ],
  
  // Default roadmaps for different career paths
  defaultRoadmaps: [
    {
      id: 'frontend-developer',
      name: 'Frontend Developer',
      description: 'Complete path to become a frontend developer',
      technologies: ['html', 'css', 'javascript', 'react', 'typescript', 'nextjs'],
    },
    {
      id: 'fullstack-developer',
      name: 'Full Stack Developer',
      description: 'Complete path to become a full stack developer',
      technologies: ['html', 'css', 'javascript', 'react', 'nodejs', 'express', 'mongodb', 'postgresql'],
    },
    {
      id: 'backend-developer',
      name: 'Backend Developer',
      description: 'Complete path to become a backend developer',
      technologies: ['python', 'django', 'postgresql', 'redis', 'docker', 'aws'],
    },
    {
      id: 'mobile-developer',
      name: 'Mobile Developer',
      description: 'Complete path to become a mobile developer',
      technologies: ['javascript', 'react', 'react-native', 'firebase'],
    },
  ],
};

// Helper functions
export const getTechnologyById = (id) => {
  return roadmapData.technologies.find(tech => tech.id === id);
};

export const getCategoryById = (id) => {
  return roadmapData.categories.skills.find(cat => cat.goal === id) || roadmapData.categories.tools.find(cat => cat.goal === id);
};

export const getPrerequisites = (technologyId) => {
  const tech = getTechnologyById(technologyId);
  return tech ? tech.prerequisites.map(id => getTechnologyById(id)) : [];
};

export const getNextSteps = (technologyId) => {
  const tech = getTechnologyById(technologyId);
  return tech ? tech.nextSteps.map(id => getTechnologyById(id)) : [];
};

export const getTechnologiesByCategory = (categoryId) => {
  return roadmapData.technologies.filter(tech => tech.category === categoryId);
};

export const generateSuggestions = (currentTechnologies) => {
  const suggestions = [];
  const currentIds = currentTechnologies.map(tech => tech.id);
  
  // Find next steps for current technologies
  currentTechnologies.forEach(tech => {
    const nextSteps = getNextSteps(tech.id);
    if (nextSteps && nextSteps.length > 0) {
      nextSteps.forEach(nextTech => {
        if (nextTech && nextTech.id && !currentIds.includes(nextTech.id) && !suggestions.find(s => s.id === nextTech.id)) {
          suggestions.push({
            ...nextTech,
            reason: `Next step after ${tech.name}`,
            priority: 'high',
          });
        }
      });
    }
  });
  
  // Find missing prerequisites
  currentTechnologies.forEach(tech => {
    const prerequisites = getPrerequisites(tech.id);
    if (prerequisites && prerequisites.length > 0) {
      prerequisites.forEach(prereq => {
        if (prereq && prereq.id && !currentIds.includes(prereq.id) && !suggestions.find(s => s.id === prereq.id)) {
          suggestions.push({
            ...prereq,
            reason: `Prerequisite for ${tech.name}`,
            priority: 'critical',
          });
        }
      });
    }
  });
  
  return suggestions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}; 