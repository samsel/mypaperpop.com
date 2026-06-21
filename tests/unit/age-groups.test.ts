import { describe, it, expect } from 'vitest';
import {
  AGE_GROUPS,
  AGE_GROUP_OPTIONS,
  DEFAULT_AGE_GROUP,
  isValidAgeGroup,
  getAgeGroupModifier,
} from '@/lib/ai/age-groups';

describe('age-groups', () => {
  // -----------------------------------------------------------------------
  // Constants
  // -----------------------------------------------------------------------
  describe('AGE_GROUPS', () => {
    it('should have exactly 4 age brackets', () => {
      expect(Object.keys(AGE_GROUPS)).toHaveLength(4);
    });

    it('should contain the expected keys', () => {
      expect(Object.keys(AGE_GROUPS)).toEqual([
        'under-4',
        '4-7',
        '8-11',
        '12+',
      ]);
    });

    it('each group should have label, description, and promptModifier', () => {
      for (const [key, group] of Object.entries(AGE_GROUPS)) {
        expect(group.label, `${key} missing label`).toBeTruthy();
        expect(group.description, `${key} missing description`).toBeTruthy();
        expect(group.promptModifier, `${key} missing promptModifier`).toBeTruthy();
      }
    });

    it('promptModifiers should mention age-appropriate guidance', () => {
      expect(AGE_GROUPS['under-4'].promptModifier).toContain('toddler');
      expect(AGE_GROUPS['4-7'].promptModifier).toContain('young child');
      expect(AGE_GROUPS['8-11'].promptModifier).toContain('child');
      expect(AGE_GROUPS['12+'].promptModifier).toContain('preteen or teen');
    });
  });

  describe('DEFAULT_AGE_GROUP', () => {
    it('should default to 8-11', () => {
      expect(DEFAULT_AGE_GROUP).toBe('8-11');
    });

    it('should be a valid age group key', () => {
      expect(DEFAULT_AGE_GROUP in AGE_GROUPS).toBe(true);
    });
  });

  describe('AGE_GROUP_OPTIONS', () => {
    it('should have 4 options', () => {
      expect(AGE_GROUP_OPTIONS).toHaveLength(4);
    });

    it('each option should have value and label', () => {
      for (const opt of AGE_GROUP_OPTIONS) {
        expect(opt.value).toBeTruthy();
        expect(opt.label).toBeTruthy();
      }
    });

    it('options should be in same order as AGE_GROUPS keys', () => {
      const keys = Object.keys(AGE_GROUPS);
      const optionValues = AGE_GROUP_OPTIONS.map((o) => o.value);
      expect(optionValues).toEqual(keys);
    });

    it('labels should match the AGE_GROUPS labels', () => {
      for (const opt of AGE_GROUP_OPTIONS) {
        expect(opt.label).toBe(AGE_GROUPS[opt.value].label);
      }
    });
  });

  // -----------------------------------------------------------------------
  // isValidAgeGroup
  // -----------------------------------------------------------------------
  describe('isValidAgeGroup', () => {
    it('should return true for all valid keys', () => {
      for (const key of Object.keys(AGE_GROUPS)) {
        expect(isValidAgeGroup(key)).toBe(true);
      }
    });

    it('should return false for invalid keys', () => {
      expect(isValidAgeGroup('0-3')).toBe(false);
      expect(isValidAgeGroup('adult')).toBe(false);
      expect(isValidAgeGroup('')).toBe(false);
      expect(isValidAgeGroup('7-9')).toBe(false);
      expect(isValidAgeGroup('under4')).toBe(false);
    });

    it('should return false for old age group keys', () => {
      expect(isValidAgeGroup('5-6')).toBe(false);
      expect(isValidAgeGroup('7-8')).toBe(false);
      expect(isValidAgeGroup('9-10')).toBe(false);
      expect(isValidAgeGroup('11-13')).toBe(false);
      expect(isValidAgeGroup('13-18')).toBe(false);
    });

    it('should return false for keys with wrong casing', () => {
      expect(isValidAgeGroup('Under-4')).toBe(false);
      expect(isValidAgeGroup('UNDER-4')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // getAgeGroupModifier
  // -----------------------------------------------------------------------
  describe('getAgeGroupModifier', () => {
    it('should return the correct modifier for each valid age group', () => {
      for (const [key, group] of Object.entries(AGE_GROUPS)) {
        expect(getAgeGroupModifier(key)).toBe(group.promptModifier);
      }
    });

    it('should return the default modifier for invalid age groups', () => {
      const defaultModifier = AGE_GROUPS[DEFAULT_AGE_GROUP].promptModifier;
      expect(getAgeGroupModifier('invalid')).toBe(defaultModifier);
      expect(getAgeGroupModifier('')).toBe(defaultModifier);
      expect(getAgeGroupModifier('adult')).toBe(defaultModifier);
    });

    it('should fall back to default for old age group keys', () => {
      const defaultModifier = AGE_GROUPS[DEFAULT_AGE_GROUP].promptModifier;
      expect(getAgeGroupModifier('5-6')).toBe(defaultModifier);
      expect(getAgeGroupModifier('7-8')).toBe(defaultModifier);
      expect(getAgeGroupModifier('13-18')).toBe(defaultModifier);
    });

    it('under-4 modifier should emphasize thick outlines and simplicity', () => {
      const mod = getAgeGroupModifier('under-4');
      expect(mod).toContain('thick');
      expect(mod).toContain('simple');
    });

    it('12+ modifier should emphasize detail and complexity', () => {
      const mod = getAgeGroupModifier('12+');
      expect(mod).toContain('detailed');
      expect(mod).toContain('complex');
    });
  });
});
