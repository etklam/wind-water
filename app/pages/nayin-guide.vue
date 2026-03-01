<script setup>
import { computed } from 'vue'
import { groupNayinGuideByElement } from '../utils/nayin-guide.js'

const groups = computed(() => groupNayinGuideByElement())

const elementMeta = {
  wood: {
    label: '木',
    title: '木行納音',
    summary: '木主生發與成長，常見於擴展、學習與向外延伸。'
  },
  fire: {
    label: '火',
    title: '火行納音',
    summary: '火主光明與推進，常見於表現、熱情與行動速度。'
  },
  earth: {
    label: '土',
    title: '土行納音',
    summary: '土主承載與整合，常見於穩定、責任與資源管理。'
  },
  metal: {
    label: '金',
    title: '金行納音',
    summary: '金主收斂與決斷，常見於規範、品質與執行力。'
  },
  water: {
    label: '水',
    title: '水行納音',
    summary: '水主流動與智慧，常見於調度、彈性與連結能力。'
  }
}
</script>

<template>
  <main class="page guide-page">
    <header class="topbar panel">
      <div>
        <p class="eyebrow">Nayin Element Guide</p>
        <h1>納音五行說明</h1>
      </div>
      <NuxtLink to="/" class="about-link">返回計算頁</NuxtLink>
    </header>

    <section class="panel about-section">
      <h2>如何閱讀這頁</h2>
      <p>本頁把六十甲子的 30 組納音，依五行分成木、火、土、金、水五類。</p>
      <p>你可以從首頁「計算結果」中的納音，直接跳轉到這裡的對應條目。</p>
    </section>

    <section v-for="group in groups" :key="group.element" class="panel guide-section">
      <header class="guide-section-header">
        <h2>{{ elementMeta[group.element].title }}</h2>
        <p>{{ elementMeta[group.element].summary }}</p>
      </header>

      <div class="guide-list">
        <article v-for="item in group.items" :id="item.id" :key="item.id" class="guide-item">
          <h3>
            <span class="guide-item-name">{{ item.name }}</span>
            <span class="guide-item-tag">{{ elementMeta[group.element].label }}</span>
          </h3>
          <p>{{ item.summary }}</p>
        </article>
      </div>
    </section>
  </main>
</template>
