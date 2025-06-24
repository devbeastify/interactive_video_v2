<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" @resetindex="resetIndex" />
  </router-view>
</template>

<script setup>
import { useMainStore } from '../composables/use_main_store';
import { useQuickCheckStore } from '../stores/main/quick_check_store';

const store = useMainStore();
const quickCheckStore = useQuickCheckStore();

store.init();

const resetIndex = () => {
  quickCheckStore.reset();
};
</script>
