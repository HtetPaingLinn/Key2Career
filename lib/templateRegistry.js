// Template Registry - Manages all available CV templates
// This system allows easy addition of new templates and maintains consistency

import { AzurillTemplate } from '@/components/templates/AzurillTemplate';
import { BronzorTemplate } from '@/components/templates/BronzorTemplate';
import { ChikoritaTemplate } from '@/components/templates/ChikoritaTemplate';
import {
  DittoTemplate,
  GengarTemplate,
  GlalieTemplate,
  KakunaTemplate,
  LeafishTemplate,
  NosepassTemplate,
  OnyxTemplate,
  PikachuTemplate,
  RhyhornTemplate,
} from '@/components/templates/TemplateVariants';

// Template metadata and configuration
export const templateConfigs = [
  // Original 12 templates (based on Reactive-Resume)
  {
    id: 'azurill',
    name: 'Azurill',
    category: 'Modern',
    description: 'Clean and modern design with sidebar layout',
    thumbnail: '/templates/jpg/azurill.jpg',
    component: AzurillTemplate,
    tags: ['modern', 'sidebar', 'clean', 'professional'],
    difficulty: 'beginner',
    colorScheme: 'emerald',
  },
  {
    id: 'bronzor',
    name: 'Bronzor',
    category: 'Classic',
    description: 'Traditional layout with elegant typography',
    thumbnail: '/templates/jpg/bronzor.jpg',
    component: BronzorTemplate,
    tags: ['classic', 'traditional', 'elegant', 'professional'],
    difficulty: 'beginner',
    colorScheme: 'blue',
  },
  {
    id: 'chikorita',
    name: 'Chikorita',
    category: 'Creative',
    description: 'Creative design with unique visual elements',
    thumbnail: '/templates/jpg/chikorita.jpg',
    component: ChikoritaTemplate,
    tags: ['creative', 'unique', 'modern', 'artistic'],
    difficulty: 'intermediate',
    colorScheme: 'green',
  },
  {
    id: 'ditto',
    name: 'Ditto',
    category: 'Minimalist',
    description: 'Minimalist design focusing on content',
    thumbnail: '/templates/jpg/ditto.jpg',
    component: DittoTemplate,
    tags: ['minimalist', 'clean', 'simple', 'modern'],
    difficulty: 'beginner',
    colorScheme: 'gray',
  },
  {
    id: 'gengar',
    name: 'Gengar',
    category: 'Dark',
    description: 'Dark theme with bold typography',
    thumbnail: '/templates/jpg/gengar.jpg',
    component: GengarTemplate,
    tags: ['dark', 'bold', 'modern', 'tech'],
    difficulty: 'intermediate',
    colorScheme: 'purple',
  },
  {
    id: 'glalie',
    name: 'Glalie',
    category: 'Professional',
    description: 'Professional layout with structured sections',
    thumbnail: '/templates/jpg/glalie.jpg',
    component: GlalieTemplate,
    tags: ['professional', 'structured', 'corporate', 'formal'],
    difficulty: 'beginner',
    colorScheme: 'slate',
  },
  {
    id: 'kakuna',
    name: 'Kakuna',
    category: 'Simple',
    description: 'Simple and straightforward design',
    thumbnail: '/templates/jpg/kakuna.jpg',
    component: KakunaTemplate,
    tags: ['simple', 'straightforward', 'clean', 'basic'],
    difficulty: 'beginner',
    colorScheme: 'amber',
  },
  {
    id: 'leafish',
    name: 'Leafish',
    category: 'Nature',
    description: 'Nature-inspired design with organic elements',
    thumbnail: '/templates/jpg/leafish.jpg',
    component: LeafishTemplate,
    tags: ['nature', 'organic', 'creative', 'unique'],
    difficulty: 'intermediate',
    colorScheme: 'emerald',
  },
  {
    id: 'nosepass',
    name: 'Nosepass',
    category: 'Geometric',
    description: 'Geometric design with structured layout',
    thumbnail: '/templates/jpg/nosepass.jpg',
    component: NosepassTemplate,
    tags: ['geometric', 'structured', 'modern', 'architectural'],
    difficulty: 'intermediate',
    colorScheme: 'stone',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    category: 'Elegant',
    description: 'Elegant design with sophisticated typography',
    thumbnail: '/templates/jpg/onyx.jpg',
    component: OnyxTemplate,
    tags: ['elegant', 'sophisticated', 'luxury', 'premium'],
    difficulty: 'advanced',
    colorScheme: 'zinc',
  },
  {
    id: 'pikachu',
    name: 'Pikachu',
    category: 'Energetic',
    description: 'Energetic design with vibrant colors',
    thumbnail: '/templates/jpg/pikachu.jpg',
    component: PikachuTemplate,
    tags: ['energetic', 'vibrant', 'youthful', 'creative'],
    difficulty: 'intermediate',
    colorScheme: 'yellow',
  },
  {
    id: 'rhyhorn',
    name: 'Rhyhorn',
    category: 'Strong',
    description: 'Strong and bold design for impact',
    thumbnail: '/templates/jpg/rhyhorn.jpg',
    component: RhyhornTemplate,
    tags: ['strong', 'bold', 'impactful', 'powerful'],
    difficulty: 'intermediate',
    colorScheme: 'red',
  },
];

// Template categories for filtering (updated to only include categories that have templates)
export const templateCategories = [
  { name: 'All', icon: 'GlobeAltIcon' },
  { name: 'Modern', icon: 'SparklesIcon' },
  { name: 'Classic', icon: 'AcademicCapIcon' },
  { name: 'Creative', icon: 'PaintBrushIcon' },
  { name: 'Minimalist', icon: 'MinusIcon' },
  { name: 'Dark', icon: 'MoonIcon' },
  { name: 'Professional', icon: 'BriefcaseIcon' },
  { name: 'Simple', icon: 'DocumentIcon' },
  { name: 'Nature', icon: 'LeafIcon' },
  { name: 'Geometric', icon: 'Square3Stack3DIcon' },
  { name: 'Elegant', icon: 'StarIcon' },
  { name: 'Energetic', icon: 'BoltIcon' },
  { name: 'Strong', icon: 'FireIcon' },
];

// Get template by ID
export const getTemplateById = (id) => {
  return templateConfigs.find(template => template.id === id);
};

// Get templates by category
export const getTemplatesByCategory = (category) => {
  if (category === 'All') return templateConfigs;
  return templateConfigs.filter(template => template.category === category);
};

// Get templates by difficulty
export const getTemplatesByDifficulty = (difficulty) => {
  return templateConfigs.filter(template => template.difficulty === difficulty);
};

// Get templates by tags
export const getTemplatesByTags = (tags) => {
  return templateConfigs.filter(template => 
    tags.some(tag => template.tags.includes(tag))
  );
};

// Search templates
export const searchTemplates = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return templateConfigs.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Get random templates
export const getRandomTemplates = (count = 4) => {
  const shuffled = [...templateConfigs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get featured templates (templates marked as popular or recommended)
export const getFeaturedTemplates = () => {
  return templateConfigs.filter(template => 
    ['azurill', 'onyx', 'ditto', 'gengar'].includes(template.id)
  );
}; 