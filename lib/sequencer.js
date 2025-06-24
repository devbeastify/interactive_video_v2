export class Sequencer {
  screens = [];
  visibleScreens = [];
  currentScreen = null;

  addScreen(screen) {
    Array.isArray(screen)
      ? this.screens.push(...screen)
      : this.screens.push(screen);
    this.visibleScreens = this.screens;
  }

  goToScreen(screenId) {
    const targetScreen = this.visibleScreens.find(
      (screen) => screen.id === screenId
    );
    if (targetScreen) {
      this.currentScreen = targetScreen;
    }
  }

  goToNextScreen() {
    const idx = this.visibleScreens.findIndex(
      (screen) => screen.id === this.currentScreen?.id
    );
    const next = this.visibleScreens[idx + 1];
    if (next) this.currentScreen = next;
  }
}
