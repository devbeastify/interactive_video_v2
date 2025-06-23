// @ts-check

import { defineStore } from "pinia";
import { browserIsSafari } from "../../lib/safari_browser_check";

/**
 * @typedef ActionSettings
 * @property {boolean} useAutoPlay
 */

/**
 * @typedef VideoReference
 * @property {string} video_path
 * @property {string|null} english_subtitles_path
 * @property {string|null} foreign_subtitles_path
 * @property {string} foreign_language
 */

/**
 * @typedef QuickCheck
 * @property {number} offset
 * @property {number} gap
 * @property {string} type
 * @property {Object} quick_check_content
 */

/**
 * @typedef ActivityInfo
 * @property {string} topic
 * @property {string} sub_topic
 * @property {string} title
 * @property {Array<VideoReference>} reference
 * @property {Array<QuickCheck>} quick_checks
 */

/**
 * @typedef MainStoreState
 * @property {ActionSettings} actionSettings
 * @property {boolean} isInitialized
 * @property {ActivityInfo} activityInfo
 */

export const mainStore = defineStore("interactive_video_v2", {
  state: () => ({
    actionSettings: {
      useAutoPlay: false,
    },
    isInitialized: false,
    activityInfo: {
      topic: "",
      sub_topic: "",
      title: "",
      reference: [],
      quick_checks: [],
    },
  }),
  actions: {
    init() {
      getActivityInfo()
        .then((activityInfo) => parseActivityInfo(activityInfo))
        .then((activityInfo) => {
          this.activityInfo = activityInfo;
        })
        .catch((error) => console.error(error));

      this.initializeAutoPlaySetting();
      this.isInitialized = true;
    },

    initializeAutoPlaySetting() {
      const storedAutoPlay = localStorage.getItem("interactive_video_autoplay");

      if (storedAutoPlay !== null) {
        this.actionSettings.useAutoPlay = storedAutoPlay === "true";
      } else {
        this.actionSettings.useAutoPlay = !browserIsSafari();
      }
    },

    updateAutoPlaySetting(useAutoPlay) {
      this.actionSettings.useAutoPlay = useAutoPlay;
      localStorage.setItem(
        "interactive_video_autoplay",
        useAutoPlay.toString()
      );
    },
  },
});

/**
 * Gets the global that should appear within the activity.
 * @return {Promise<Element | null>}
 */
function getActivityInfo() {
  return Promise.resolve(document.querySelector(".js-program-tutorial"));
}

/**
 * Parses the global that should appear within the activity.
 * @param {Element} activityInfo
 * @return {Promise<ActivityInfo>}
 */
function parseActivityInfo(activityInfo) {
  const data = JSON.parse(activityInfo.innerHTML);
  return data[0];
}
