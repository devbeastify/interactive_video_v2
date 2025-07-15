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
 * Creates a basic activity info object for testing.
 *
 * @param {Partial<ActivityInfo>} overrides - Optional overrides for the activity info.
 * @return {ActivityInfo} The created activity info object.
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
 * Creates a complete activity info object for testing.
 *
 * @return {ActivityInfo} The complete activity info object.
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

describe('#buildScreensForActivity', () => {
  it('returns an array', () => {
    const result = buildScreensForActivity({});

    expect(Array.isArray(result)).toBe(true);
  });

  it('returns intro and player screens in correct order', () => {
    const activityInfo = createActivityInfo();

    const result = buildScreensForActivity(activityInfo);

    expect(result).toEqual([
      { id: 'intro', name: 'intro' },
      { id: 'player', name: 'player' },
      { id: 'diagnostic', name: 'diagnostic' },
    ]);
  });

  it('includes intro screen with correct id', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    const introScreen = result.find((screen) => screen.id === 'intro');

    expect(introScreen.id).toBe('intro');
  });

  it('includes intro screen with correct name', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    const introScreen = result.find((screen) => screen.id === 'intro');

    expect(introScreen.name).toBe('intro');
  });

  it('includes player screen with correct id', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    const playerScreen = result.find((screen) => screen.id === 'player');

    expect(playerScreen.id).toBe('player');
  });

  it('includes player screen with correct name', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    const playerScreen = result.find((screen) => screen.id === 'player');

    expect(playerScreen.name).toBe('player');
  });

  it('places intro screen first in the array', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    expect(result[0].id).toBe('intro');
  });

  it('places player screen second in the array', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    expect(result[1].id).toBe('player');
  });

  it('returns exactly three screens for empty activity info', () => {
    const result = buildScreensForActivity({});

    expect(result).toHaveLength(3);
  });

  it('returns exactly three screens for complete activity info', () => {
    const activityInfo = createCompleteActivityInfo();

    const result = buildScreensForActivity(activityInfo);

    expect(result).toHaveLength(3);
  });

  it('returns identical structure for different activity info content', () => {
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

  it('ensures each screen has an id property', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    result.forEach((screen) => {
      expect(screen).toHaveProperty('id');
    });
  });

  it('ensures each screen has a name property', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    result.forEach((screen) => {
      expect(screen).toHaveProperty('name');
    });
  });

  it('ensures screen ids are strings', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    result.forEach((screen) => {
      expect(typeof screen.id).toBe('string');
    });
  });

  it('ensures screen names are strings', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    result.forEach((screen) => {
      expect(typeof screen.name).toBe('string');
    });
  });

  it('ensures screen ids are unique', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    const ids = result.map((screen) => screen.id);
    const uniqueIds = [...new Set(ids)];

    expect(ids).toEqual(uniqueIds);
  });

  it('ensures screen names are unique', () => {
    const activityInfo = {};

    const result = buildScreensForActivity(activityInfo);

    const names = result.map((screen) => screen.name);
    const uniqueNames = [...new Set(names)];

    expect(names).toEqual(uniqueNames);
  });
});
