<template>
  <main class="page about-page">
    <header class="topbar panel">
      <div>
        <p class="eyebrow">Usage Guide</p>
        <h1>使用說明</h1>
      </div>
      <NuxtLink to="/" class="about-link">返回計算頁</NuxtLink>
    </header>

    <section class="panel about-section">
      <h2>為何做這個工具</h2>
      <p>
        這個專案的目標，是把傳統納音五行排盤流程做成可直接操作的網頁工具，
        讓使用者不用手動查表，也能快速看到四柱與五行分布。
      </p>
    </section>

    <section class="panel about-section">
      <h2>納音五行是什麼</h2>
      <p>
        納音是把六十甲子對應到五行與具體意象的一套傳統分類方法。
        在本工具中，系統會依照輸入的出生資訊計算年、月、日、時四柱，
        再對應出每一柱的納音名稱與五行屬性。
      </p>
    </section>

    <section class="panel about-section">
      <h2>如何使用本工具</h2>
      <p>1. 輸入出生日期、時間與時區。</p>
      <p>2. 選擇排盤模式（公曆直排或傳統規則）。</p>
      <p>3. 點擊開始計算，查看八卦五行盤與四柱結果。</p>
    </section>

    <section class="panel about-section">
      <h2>使用注意事項</h2>
      <p>
        本專案提供的是排盤與資訊整理，不提供命理斷語或人生決策建議。
        若出生時間不確定，可勾選未知時辰，只計算年、月、日三柱。
      </p>
    </section>
  </main>
</template>
