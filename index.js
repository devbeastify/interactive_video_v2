import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { createPinia } from "pinia";

// @ts-expect-error - Vue file
import InteractiveVideoApp from "./views/InteractiveVideoApp.vue";
// @ts-expect-error - Vue file
import InteractiveVideoIntro from "./views/InteractiveVideoIntro.vue";
// @ts-expect-error - Vue file
import InteractiveVideoPlayer from "./views/InteractiveVideoPlayer.vue";

/**
 * @typedef {import('vue-router').Router} Router
 */

/**
 * @typedef {import('vue-router').RouteRecordRaw} RouteRecordRaw
 */

/**
 * @typedef {import('vue-router').RouteParamValue} RouteParamValue
 */

/**
 * @type {Array<RouteRecordRaw>}
 */
const routes = [
  {
    path: "/intro",
    name: "interactive_video_intro",
    component: InteractiveVideoIntro,
    props: true,
    meta: {
      interstitial: true,
    },
  },
  {
    path: "/player",
    name: "interactive_video_player",
    component: InteractiveVideoPlayer,
    props: true,
  },
  {
    path: "/",
    redirect: "/intro",
  },
  {
    path: "/:pathMatch(.*)",
    name: "bad-path",
    redirect: "/intro",
  },
];

/**
 * This method returns router instance that can be used by a Vue app.
 * @return {Router}
 */
function getRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (from?.name) {
        return { el: ".intranav", top: 20 };
      }
    },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("interactive_video_v2");
  if (el) {
    const app = createApp(InteractiveVideoApp);
    app.use(getRouter());
    app.use(createPinia());
    app.mount(el);
  }
});
