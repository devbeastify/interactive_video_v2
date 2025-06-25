export class Sequencer {
  screens = [];
  visibleScreens = [];
  currentScreen = null;

  /**
   * Add one or more screens to the sequencer
   */
  addScreen(screen) {
    Array.isArray(screen)
      ? this.screens.push(...screen)
      : this.screens.push(screen);
    this.visibleScreens = this.screens;
  }

  /**
   * Navigate to a screen by its ID
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
    // If currentScreen is null, don't move
    if (!this.currentScreen) {
      return;
    }

    const idx = this.visibleScreens.findIndex(
      (screen) => screen.id === this.currentScreen.id
    );
    
    // If currentScreen is not in visibleScreens, don't move
    if (idx === -1) {
      return;
    }

    const next = this.visibleScreens[idx + 1];
    if (next) this.currentScreen = next;
  }
}
