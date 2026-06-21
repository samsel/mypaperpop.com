export const AGE_GROUPS = {
  'under-4': {
    label: 'Under 4',
    description: 'Extra simple, very thick outlines',
    promptModifier:
      'This is for a toddler (under 4 years old). Use very thick bold outlines (4-6px weight). Maximum 3-5 large elements total. Every shape should be extra-large with big open areas to color. Use rounded edges and soft cartoon curves — no sharp angles or pointed shapes. No overlapping elements. No background clutter — plain white background with just the main subject. No tiny details, no patterns, no textures. Think chunky, simple, and friendly.',
  },
  '4-7': {
    label: 'Ages 4\u20137',
    description: 'Thick outlines, simple shapes',
    promptModifier:
      'This is for a young child (ages 4-7). Use thick consistent outlines (3-4px weight). Keep the subject recognizable with expressive faces and friendly features. Use gentle curves over sharp angles. Include a simple ground line and 1-2 background elements maximum (a cloud, a flower, a sun). Large colorable areas with a few medium-sized details. No overlapping or hidden elements. No fine textures or patterns within shapes.',
  },
  '8-11': {
    label: 'Ages 8\u201311',
    description: 'Clear outlines, moderate detail',
    promptModifier:
      'This is for a child (ages 8-11). Use clear consistent outlines (2-3px weight). Include a background scene with multiple elements (ground, sky, environment details). Add visible textures like fur, scales, leaves, or fabric folds using simple line work. Characters can have dynamic poses and interact with objects. Mix large colorable areas with smaller detailed sections. Consistent outline weight throughout — no varying line thickness.',
  },
  '12+': {
    label: 'Ages 12+',
    description: 'Detailed, complex compositions',
    promptModifier:
      'This is for a preteen or teen (ages 12+). Use detailed fine outlines (1-2px weight). Include rich background environments with depth and perspective. Add intricate details: architectural elements, realistic anatomy, decorative patterns, dense foliage, fabric textures. Multiple characters or elements can overlap and interact. Include fine details like hair strands, feather barbs, brick patterns, and zentangle-style decorative fills in select areas. Use complex compositions with foreground, midground, and background layers.',
  },
} as const;

export type AgeGroup = keyof typeof AGE_GROUPS;
export const DEFAULT_AGE_GROUP: AgeGroup = '8-11';
export const AGE_GROUP_OPTIONS = Object.entries(AGE_GROUPS).map(([value, { label, description }]) => ({
  value: value as AgeGroup,
  label,
  description,
}));

export function isValidAgeGroup(value: string): value is AgeGroup {
  return value in AGE_GROUPS;
}

export function getAgeGroupModifier(value: string): string {
  if (isValidAgeGroup(value)) {
    return AGE_GROUPS[value].promptModifier;
  }
  return AGE_GROUPS[DEFAULT_AGE_GROUP].promptModifier;
}
