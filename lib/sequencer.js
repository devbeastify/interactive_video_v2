// @ts-check

/**
 * @typedef {Object} Screen
 * @property {string} id - Unique identifier for the screen
 * @property {string} name - Display name of the screen
 */

/**
 * Manages screen navigation and sequencing for interactive video components
 */
export class Sequencer {
  /** @type {Screen[]} */
  screens = [];
  /** @type {Screen[]} */
  visibleScreens = [];
  /** @type {Screen|null} */
  currentScreen = null;

  /**
   * Add one or more screens to the sequencer
   * @param {Screen|Screen[]} screen - Screen or array of screens to add
   */
  addScreen(screen) {
    Array.isArray(screen) ?
      this.screens.push(...screen) :
      this.screens.push(screen);
    this.visibleScreens = this.screens;
  }

  /**
   * Get the index of the current screen in the visible screens list
   * @return {number} Index of current screen, or -1 if not found
   */
  getCurrentScreenIndex() {
    if (!this.currentScreen) {
      return -1;
    }
    const currentScreen = this.currentScreen;
    return this.visibleScreens.findIndex(
      (screen) => screen.id === currentScreen.id
    );
  }

  /**
   * Navigate to a screen by its ID
   * @param {string} screenId - The ID of the screen to navigate to
   */
  goToScreen(screenId) {
    const targetScreen = this.visibleScreens.find(
      (screen) => screen.id === screenId
    );
    if (targetScreen) {
      this.currentScreen = targetScreen;
    }
  }

  /**
   * Move to the next screen in the sequence
   */
  goToNextScreen() {
    if (!this.currentScreenExists()) {
      return;
    }

    const currentScreenIndex = this.getCurrentScreenIndex();
    if (!this.screenInVisibleList(currentScreenIndex)) {
      return;
    }

    this.moveToNextScreen(currentScreenIndex);
  }

  /**
   * Check if the current screen exists in the visible screens list
   * @param {number} screenIndex - The index of the current screen
   * @return {boolean} True if screen is found in visible list
   */
  screenInVisibleList(screenIndex) {
    return screenIndex !== -1;
  }

  /**
   * Check if there is a current screen set
   * @return {boolean} True if currentScreen is not null
   */
  currentScreenExists() {
    return this.currentScreen !== null;
  }

  /**
   * Move to the next screen in the sequence
   * @param {number} currentIndex - The current screen index
   */
  moveToNextScreen(currentIndex) {
    const nextScreen = this.visibleScreens[currentIndex + 1];
    if (nextScreen) {
      this.currentScreen = nextScreen;
    }
  }
}