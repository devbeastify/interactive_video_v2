// @ts-check

import './styles/_utilities.scss';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import InteractiveVideoApp from './views/InteractiveVideoApp.vue';

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('interactive_video_v2');
  if (el) {
    const app = createApp(InteractiveVideoApp);
    app.use(createPinia());
    app.mount(el);
  }
});
