<template>
  <div v-if="statistics" class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">30天最低价</div>
      <div class="stat-value low">¥{{ statistics.minPrice }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">30天最高价</div>
      <div class="stat-value high">¥{{ statistics.maxPrice }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">30天均价</div>
      <div class="stat-value avg">¥{{ statistics.avgPrice }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">当前最低价</div>
      <div class="stat-value current">¥{{ statistics.currentPrice }}</div>
      <div class="stat-trend" :class="trendClass">
        {{ trendIcon }} {{ trend?.trendDescription || '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  statistics: Object,
  trend: Object
})

const trendClass = computed(() => {
  const t = props.trend?.trend
  if (t === 'FALLING') return 'trend-down'
  if (t === 'RISING') return 'trend-up'
  return 'trend-stable'
})

const trendIcon = computed(() => {
  const t = props.trend?.trend
  if (t === 'FALLING') return '↓'
  if (t === 'RISING') return '↑'
  return '→'
})
</script>

<style scoped>
.stats-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.stat-label { color: #909399; font-size: 13px; margin-bottom: 8px; }
.stat-value { font-size: 22px; font-weight: bold; }
.stat-value.low { color: #67c23a; }
.stat-value.high { color: #f56c6c; }
.stat-value.avg { color: #e6a23c; }
.stat-value.current { color: #409eff; }
.stat-trend { font-size: 12px; margin-top: 4px; }
.trend-up { color: #f56c6c; }
.trend-down { color: #67c23a; }
.trend-stable { color: #909399; }
</style>
