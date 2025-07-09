// @ts-check

import { buildScreensForActivity } from './screens';

/**
 * @typedef {Object} ActivityInfo
 * @property {string} [topic]
 * @property {string} [sub_topic]
 * @property {string} [title]
 * @property {Array} [reference]
 * @property {Array} [quick_checks]
 */

/**
 * Creates a basic activity info object for testing
 * @param {Partial<ActivityInfo>} overrides
 * @return {ActivityInfo}
 */
function createActivityInfo(overrides = {}) {
  return {
    topic: 'Test Topic',
    sub_topic: 'Test Sub Topic',
    title: 'Test Title',
    reference: [],
    quick_checks: [],
    ...overrides,
  };
}

/**
 * Creates a complete activity info object for testing
 * @return {ActivityInfo}
 */
function createCompleteActivityInfo() {
  return {
    topic: 'Complete Topic',
    sub_topic: 'Complete Sub Topic',
    title: 'Complete Title',
    reference: [
      {
        video_path: 'video.mp4',
        english_subtitles_path: 'en.vtt',
        foreign_subtitles_path: 'fr.vtt',
        foreign_language: 'fr',
      },
    ],
    quick_checks: [
      {
        offset: 10,
        gap: 5,
        type: 'multiple_choice',
        quick_check_content: {},
      },
    ],
  };
}

/**
 * Validates screen structure
 * @param {Array} screens
 */
function validateScreenStructure(screens) {
  screens.forEach((screen) => {
    expect(screen).toHaveProperty('id');
    expect(screen).toHaveProperty('name');
    expect(typeof screen.id).toBe('string');
    expect(typeof screen.name).toBe('string');
  });
}

/**
 * Validates screen uniqueness
 * @param {Array} screens
 */
function validateScreenUniqueness(screens) {
  const ids = screens.map((screen) => screen.id);
  const names = screens.map((screen) => screen.name);
  const uniqueIds = [...new Set(ids)];
  const uniqueNames = [...new Set(names)];

  expect(ids).toEqual(uniqueIds);
  expect(names).toEqual(uniqueNames);
}

describe('#buildScreensForActivity', () => {
  it('Returns an array.', () => {
    const result = buildScreensForActivity({});

    expect(Array.isArray(result)).toBe(true);
  });

  it('Returns the correct screen structure.', () => {
    const activityInfo = createActivityInfo();

    const result = buildScreensForActivity(activityInfo);

    expect(result).toEqual([
      { id: 'intro', name: 'intro' },
      { id: 'player', name: 'player' },
    ]);
  });

  it('Returns intro screen with correct properties.', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    const introScreen = result.find((screen) => screen.id === 'intro');
    expect(introScreen).toBeDefined();
    expect(introScreen.id).toBe('intro');
    expect(introScreen.name).toBe('intro');
  });

  it('Returns player screen with correct properties.', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    const playerScreen = result.find((screen) => screen.id === 'player');
    expect(playerScreen).toBeDefined();
    expect(playerScreen.id).toBe('player');
    expect(playerScreen.name).toBe('player');
  });

  it('Returns screens in correct order.', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    expect(result[0].id).toBe('intro');
    expect(result[1].id).toBe('player');
  });

  it('Works with empty activity info.', () => {
    const result = buildScreensForActivity({});

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('intro');
    expect(result[1].id).toBe('player');
  });

  it('Works with complete activity info.', () => {
    const activityInfo = createCompleteActivityInfo();

    const result = buildScreensForActivity(activityInfo);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('intro');
    expect(result[1].id).toBe('player');
  });

  it('Returns the same structure regardless of activity info content.', () => {
    const activityInfo1 = {};
    const activityInfo2 = createActivityInfo({
      topic: 'Test',
      reference: [{ video_path: 'test.mp4' }],
      quick_checks: [{ offset: 10, type: 'multiple_choice' }],
    });

    const result1 = buildScreensForActivity(activityInfo1);
    const result2 = buildScreensForActivity(activityInfo2);

    expect(result1).toEqual(result2);
  });

  it('Each screen has both id and name properties.', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    validateScreenStructure(result);
  });

  it('Screen ids are unique.', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    validateScreenUniqueness(result);
  });
});
