import React from 'react';
import { AzurillTemplate } from './AzurillTemplate';
import { BronzorTemplate } from './BronzorTemplate';
import { ChikoritaTemplate } from './ChikoritaTemplate';

// Template variants with different color schemes
const createTemplateVariant = (name, colorScheme) => {
  const colorMap = {
    gray: {
      bg: '#374151', // gray-700
      border: '#4b5563', // gray-600
      text200: '#e5e7eb', // gray-200
      text100: '#f3f4f6', // gray-100
      bg400: '#9ca3af', // gray-400
      bg100: '#f3f4f6', // gray-100
      text900: '#111827', // gray-900
      text700: '#374151', // gray-700
      text300: '#d1d5db', // gray-300
    },
    purple: {
      bg: '#581c87', // purple-800
      border: '#7c3aed', // purple-600
      text200: '#e9d5ff', // purple-200
      text100: '#f3e8ff', // purple-100
      bg400: '#a855f7', // purple-400
      bg100: '#f3e8ff', // purple-100
      text900: '#581c87', // purple-800
      text700: '#7c3aed', // purple-600
      text300: '#c4b5fd', // purple-300
    },
    slate: {
      bg: '#334155', // slate-700
      border: '#475569', // slate-600
      text200: '#e2e8f0', // slate-200
      text100: '#f1f5f9', // slate-100
      bg400: '#94a3b8', // slate-400
      bg100: '#f1f5f9', // slate-100
      text900: '#0f172a', // slate-900
      text700: '#334155', // slate-700
      text300: '#cbd5e1', // slate-300
    },
    amber: {
      bg: '#92400e', // amber-800
      border: '#d97706', // amber-600
      text200: '#fef3c7', // amber-200
      text100: '#fffbeb', // amber-100
      bg400: '#fbbf24', // amber-400
      bg100: '#fffbeb', // amber-100
      text900: '#78350f', // amber-900
      text700: '#d97706', // amber-600
      text300: '#fcd34d', // amber-300
    },
    red: {
      bg: '#991b1b', // red-800
      border: '#dc2626', // red-600
      text200: '#fecaca', // red-200
      text100: '#fef2f2', // red-100
      bg400: '#f87171', // red-400
      bg100: '#fef2f2', // red-100
      text900: '#7f1d1d', // red-900
      text700: '#dc2626', // red-600
      text300: '#fca5a5', // red-300
    },
    zinc: {
      bg: '#52525b', // zinc-700
      border: '#71717a', // zinc-600
      text200: '#e4e4e7', // zinc-200
      text100: '#fafafa', // zinc-100
      bg400: '#a1a1aa', // zinc-400
      bg100: '#fafafa', // zinc-100
      text900: '#18181b', // zinc-900
      text700: '#52525b', // zinc-700
      text300: '#d4d4d8', // zinc-300
    },
    yellow: {
      bg: '#a16207', // yellow-800
      border: '#ca8a04', // yellow-600
      text200: '#fef9c3', // yellow-200
      text100: '#fefce8', // yellow-100
      bg400: '#facc15', // yellow-400
      bg100: '#fefce8', // yellow-100
      text900: '#713f12', // yellow-900
      text700: '#ca8a04', // yellow-600
      text300: '#fde047', // yellow-300
    },
    stone: {
      bg: '#57534e', // stone-700
      border: '#78716c', // stone-600
      text200: '#e7e5e4', // stone-200
      text100: '#f5f5f4', // stone-100
      bg400: '#a8a29e', // stone-400
      bg100: '#f5f5f4', // stone-100
      text900: '#1c1917', // stone-900
      text700: '#57534e', // stone-700
      text300: '#d6d3d1', // stone-300
    },
    orange: {
      bg: '#ea580c', // orange-700
      border: '#f97316', // orange-500
      text200: '#fed7aa', // orange-200
      text100: '#fff7ed', // orange-100
      bg400: '#fb923c', // orange-400
      bg100: '#fff7ed', // orange-100
      text900: '#9a3412', // orange-900
      text700: '#ea580c', // orange-700
      text300: '#fdba74', // orange-300
    },
    cyan: {
      bg: '#0e7490', // cyan-800
      border: '#0891b2', // cyan-600
      text200: '#a5f3fc', // cyan-200
      text100: '#ecfeff', // cyan-100
      bg400: '#22d3ee', // cyan-400
      bg100: '#ecfeff', // cyan-100
      text900: '#164e63', // cyan-900
      text700: '#0e7490', // cyan-700
      text300: '#67e8f9', // cyan-300
    },
    lime: {
      bg: '#65a30d', // lime-700
      border: '#84cc16', // lime-500
      text200: '#d9f99d', // lime-200
      text100: '#f7fee7', // lime-100
      bg400: '#a3e635', // lime-400
      bg100: '#f7fee7', // lime-100
      text900: '#365314', // lime-900
      text700: '#65a30d', // lime-700
      text300: '#bef264', // lime-300
    },
    violet: {
      bg: '#6d28d9', // violet-700
      border: '#8b5cf6', // violet-500
      text200: '#ddd6fe', // violet-200
      text100: '#f5f3ff', // violet-100
      bg400: '#a78bfa', // violet-400
      bg100: '#f5f3ff', // violet-100
      text900: '#4c1d95', // violet-900
      text700: '#6d28d9', // violet-700
      text300: '#c4b5fd', // violet-300
    },
    pink: {
      bg: '#be185d', // pink-700
      border: '#ec4899', // pink-500
      text200: '#fce7f3', // pink-200
      text100: '#fdf2f8', // pink-100
      bg400: '#f472b6', // pink-400
      bg100: '#fdf2f8', // pink-100
      text900: '#831843', // pink-900
      text700: '#be185d', // pink-700
      text300: '#f9a8d4', // pink-300
    },
    indigo: {
      bg: '#4338ca', // indigo-700
      border: '#6366f1', // indigo-500
      text200: '#c7d2fe', // indigo-200
      text100: '#eef2ff', // indigo-100
      bg400: '#818cf8', // indigo-400
      bg100: '#eef2ff', // indigo-100
      text900: '#312e81', // indigo-900
      text700: '#4338ca', // indigo-700
      text300: '#a5b4fc', // indigo-300
    },
    rose: {
      bg: '#be123c', // rose-700
      border: '#f43f5e', // rose-500
      text200: '#fecdd3', // rose-200
      text100: '#fff1f2', // rose-100
      bg400: '#fb7185', // rose-400
      bg100: '#fff1f2', // rose-100
      text900: '#881337', // rose-900
      text700: '#be123c', // rose-700
      text300: '#fda4af', // rose-300
    },
    white: {
      bg: '#f8fafc', // slate-50
      border: '#e2e8f0', // slate-200
      text200: '#475569', // slate-600
      text100: '#334155', // slate-700
      bg400: '#64748b', // slate-500
      bg100: '#f1f5f9', // slate-100
      text900: '#0f172a', // slate-900
      text700: '#334155', // slate-700
      text300: '#64748b', // slate-500
    },
    black: {
      bg: '#0f172a', // slate-900
      border: '#1e293b', // slate-800
      text200: '#cbd5e1', // slate-300
      text100: '#e2e8f0', // slate-200
      bg400: '#64748b', // slate-500
      bg100: '#f1f5f9', // slate-100
      text900: '#f8fafc', // slate-50
      text700: '#cbd5e1', // slate-300
      text300: '#94a3b8', // slate-400
    },
  };

  const colors = colorMap[colorScheme] || colorMap.gray;

  return ({ cvData, columns = 1, isFirstPage = false }) => {
    return (
      <div className={`${name}-template`}>
        <style jsx>{`
          .${name}-template :global(.bg-emerald-900) {
            background-color: ${colors.bg} !important;
          }
          .${name}-template :global(.border-emerald-700) {
            border-color: ${colors.border} !important;
          }
          .${name}-template :global(.text-emerald-200) {
            color: ${colors.text200} !important;
          }
          .${name}-template :global(.text-emerald-100) {
            color: ${colors.text100} !important;
          }
          .${name}-template :global(.bg-emerald-400) {
            background-color: ${colors.bg400} !important;
          }
          .${name}-template :global(.bg-emerald-100) {
            background-color: ${colors.bg100} !important;
          }
          .${name}-template :global(.text-emerald-900) {
            color: ${colors.text900} !important;
          }
          .${name}-template :global(.text-emerald-700) {
            color: ${colors.text700} !important;
          }
          .${name}-template :global(.text-emerald-300) {
            color: ${colors.text300} !important;
          }
        `}</style>
        <AzurillTemplate cvData={cvData} columns={columns} isFirstPage={isFirstPage} />
      </div>
    );
  };
};

// Export all template variants
export const DittoTemplate = createTemplateVariant('ditto', 'gray');
export const GengarTemplate = createTemplateVariant('gengar', 'purple');
export const GlalieTemplate = createTemplateVariant('glalie', 'slate');
export const KakunaTemplate = createTemplateVariant('kakuna', 'amber');
export const LeafishTemplate = createTemplateVariant('leafish', 'green');
export const NosepassTemplate = createTemplateVariant('nosepass', 'stone');
export const OnyxTemplate = createTemplateVariant('onyx', 'zinc');
export const PikachuTemplate = createTemplateVariant('pikachu', 'yellow');
export const RhyhornTemplate = createTemplateVariant('rhyhorn', 'red');

// Additional templates for the 32 total
export const CharizardTemplate = createTemplateVariant('charizard', 'orange');
export const BlastoiseTemplate = createTemplateVariant('blastoise', 'cyan');
export const VenusaurTemplate = createTemplateVariant('venusaur', 'lime');
export const MewtwoTemplate = createTemplateVariant('mewtwo', 'violet');
export const MewTemplate = createTemplateVariant('mew', 'pink');
export const LugiaTemplate = createTemplateVariant('lugia', 'indigo');
export const HoOhTemplate = createTemplateVariant('ho-oh', 'rose');
export const RayquazaTemplate = createTemplateVariant('rayquaza', 'green');
export const DialgaTemplate = createTemplateVariant('dialga', 'blue');
export const PalkiaTemplate = createTemplateVariant('palkia', 'purple');
export const GiratinaTemplate = createTemplateVariant('giratina', 'gray');
export const ArceusTemplate = createTemplateVariant('arceus', 'amber');
export const ReshiramTemplate = createTemplateVariant('reshiram', 'white');
export const ZekromTemplate = createTemplateVariant('zekrom', 'black');
export const KyuremTemplate = createTemplateVariant('kyurem', 'gray');
export const XerneasTemplate = createTemplateVariant('xerneas', 'green');
export const YveltalTemplate = createTemplateVariant('yveltal', 'red');
export const ZygardeTemplate = createTemplateVariant('zygarde', 'green');
export const SolgaleoTemplate = createTemplateVariant('solgaleo', 'yellow');
export const LunalaTemplate = createTemplateVariant('lunala', 'purple');
export const NecrozmaTemplate = createTemplateVariant('necrozma', 'violet');
export const ZacianTemplate = createTemplateVariant('zacian', 'blue');
export const ZamazentaTemplate = createTemplateVariant('zamazenta', 'red');
export const EternatusTemplate = createTemplateVariant('eternatus', 'purple'); 