import { z } from "zod";

// Technology mappings for icons
export const mappings = {
  // Frontend Frameworks & Libraries
  react: "react",
  "react.js": "react",
  reactjs: "react",
  vue: "vue",
  "vue.js": "vue",
  vuejs: "vue",
  angular: "angular",
  "angular.js": "angular",
  angularjs: "angular",
  svelte: "svelte",
  "svelte.js": "svelte",
  ember: "ember",
  "ember.js": "ember",
  next: "nextdotjs",
  "next.js": "nextdotjs",
  nextjs: "nextdotjs",
  nuxt: "nuxtdotjs",
  "nuxt.js": "nuxtdotjs",
  nuxtjs: "nuxtdotjs",

  // Backend Frameworks & Runtime
  node: "nodedotjs",
  "node.js": "nodedotjs",
  nodejs: "nodedotjs",
  express: "express",
  "express.js": "express",
  expressjs: "express",
  koa: "koa",
  "koa.js": "koa",
  koajs: "koa",
  fastify: "fastify",
  hapi: "hapi",
  nest: "nestjs",
  nestjs: "nestjs",
  deno: "deno",
  bun: "bun",

  // Programming Languages
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  python: "python",
  py: "python",
  java: "openjdk",
  kotlin: "kotlin",
  swift: "swift",
  dart: "dart",
  go: "go",
  golang: "go",
  rust: "rust",
  c: "c",
  "c++": "cplusplus",
  "c#": "csharp",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  scala: "scala",
  clojure: "clojure",
  elixir: "elixir",
  erlang: "erlang",
  haskell: "haskell",
  lua: "lua",
  perl: "perl",
  r: "r",
  matlab: "matlab",
  julia: "julia",

  // Mobile Development
  "react native": "react",
  flutter: "flutter",
  ionic: "ionic",
  xamarin: "xamarin",
  "android studio": "androidstudio",
  xcode: "xcode",

  // Databases
  mongodb: "mongodb",
  mongo: "mongodb",
  postgresql: "postgresql",
  postgres: "postgresql",
  mysql: "mysql",
  sqlite: "sqlite",
  redis: "redis",
  elasticsearch: "elasticsearch",
  cassandra: "apachecassandra",
  dynamodb: "amazondynamodb",
  firebase: "firebase",
  supabase: "supabase",
  planetscale: "planetscale",
  prisma: "prisma",

  // CSS & Styling
  css: "css3",
  "css3": "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  stylus: "stylus",
  tailwind: "tailwindcss",
  "tailwind css": "tailwindcss",
  tailwindcss: "tailwindcss",
  bootstrap: "bootstrap",
  "material ui": "mui",
  mui: "mui",
  "ant design": "antdesign",
  chakra: "chakraui",
  "chakra ui": "chakraui",

  // Build Tools & Bundlers
  webpack: "webpack",
  vite: "vite",
  rollup: "rollupdotjs",
  parcel: "parcel",
  esbuild: "esbuild",
  turbopack: "turbo",

  // Version Control & DevOps
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  docker: "docker",
  kubernetes: "kubernetes",
  "k8s": "kubernetes",
  jenkins: "jenkins",
  "github actions": "githubactions",
  "gitlab ci": "gitlab",
  terraform: "terraform",
  ansible: "ansible",
  vagrant: "vagrant",

  // Cloud Platforms
  aws: "amazonaws",
  "amazon web services": "amazonaws",
  azure: "microsoftazure",
  "microsoft azure": "microsoftazure",
  gcp: "googlecloud",
  "google cloud": "googlecloud",
  "google cloud platform": "googlecloud",
  heroku: "heroku",
  vercel: "vercel",
  netlify: "netlify",
  digitalocean: "digitalocean",
  linode: "linode",

  // Testing & Quality
  jest: "jest",
  cypress: "cypress",
  playwright: "playwright",
  selenium: "selenium",
  mocha: "mocha",
  jasmine: "jasmine",
  karma: "karma",
  vitest: "vitest",
  eslint: "eslint",
  prettier: "prettier",
  sonarqube: "sonarqube",

  // Package Managers
  npm: "npm",
  yarn: "yarn",
  pnpm: "pnpm",
  pip: "pypi",
  composer: "composer",
  maven: "apachemaven",
  gradle: "gradle",
  nuget: "nuget",

  // APIs & Communication
  graphql: "graphql",
  rest: "rest",
  grpc: "grpc",
  websocket: "websocket",
  socketio: "socketdotio",
  "socket.io": "socketdotio",

  // AI & Machine Learning
  tensorflow: "tensorflow",
  pytorch: "pytorch",
  "scikit-learn": "scikitlearn",
  keras: "keras",
  pandas: "pandas",
  numpy: "numpy",
  jupyter: "jupyter",
  opencv: "opencv",

  // CMS & E-commerce
  wordpress: "wordpress",
  drupal: "drupal",
  strapi: "strapi",
  contentful: "contentful",
  shopify: "shopify",
  magento: "magento",
  woocommerce: "woocommerce",

  // Message Queues & Streaming
  rabbitmq: "rabbitmq",
  "apache kafka": "apachekafka",
  kafka: "apachekafka",
  "redis streams": "redis",
  pulsar: "apachepulsar",

  // Monitoring & Analytics
  datadog: "datadog",
  "new relic": "newrelic",
  splunk: "splunk",
  grafana: "grafana",
  prometheus: "prometheus",
  kibana: "kibana",
  "google analytics": "googleanalytics",

  // Others
  postman: "postman",
  insomnia: "insomnia",
  figma: "figma",
  sketch: "sketch",
  "adobe xd": "adobexd",
  slack: "slack",
  discord: "discord",
  jira: "jira",
  confluence: "confluence",
  notion: "notion",
  trello: "trello",
  asana: "asana",

  // Additional mappings for common variations
  "aws amplify": "amplify",
};

// Feedback schema for AI generation
export const feedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),
  categoryScores: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100),
    comment: z.string()
  })),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string()
});

// Interviewer configuration for VAPI
export const interviewer = {
  name: "Interviewer",
  firstMessage: "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate's questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

export const viewInterviewer = {
  name: "Interviewer",
  firstMessage: "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "hana",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate's questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

// Interview cover images
export const interviewCovers = ["/defold.png", "/captain-america.png", "/iron-man.png"];
