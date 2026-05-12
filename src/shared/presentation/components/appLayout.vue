<script setup>
import Header from './appHeader.vue'
import Sidebar from './appSidebar.vue'
</script>

<template>
  <div class="layout">
    <Header class="header" />
    <Sidebar class="side" />
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout{
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "header header"
    "sidebar content";
  min-height: 100svh;
}

.header { grid-area: header; }
.side   { grid-area: sidebar; }
.content{
  grid-area: content;
  padding: 24px;
  background: var(--p-surface-0);
  color: var(--p-text-color);
  border-left: 1px solid var(--p-surface-200);
}
</style>