// @ts-check

import { mainStore } from '../stores/main/main_store';

/**
 * Provides access to the main Pinia store for the interactive video app.
 * @returns {ReturnType<typeof mainStore>} The main store instance.
 */
export const useMainStore = mainStore;
