<template>
  <div v-if="bestTime && bestTime.position30d !== undefined" class="best-time-badge" :class="badgeClass">
    <el-icon><Lightning v-if="isGoodTime" /><Warning v-else-if="isHighTime" /><InfoFilled v-else /></el-icon>
    <span>{{ suggestion }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Lightning, Warning, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({ bestTime: Object })

const isGoodTime = computed(() => props.bestTime?.position30d < 30)
const isHighTime = computed(() => props.bestTime?.position30d > 70)

const badgeClass = computed(() => {
  if (isGoodTime.value) return 'badge-good'
  if (isHighTime.value) return 'badge-high'
  return 'badge-normal'
})

const suggestion = computed(() => props.bestTime?.suggestion || '')
</script>

<style scoped>
.best-time-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}
.badge-good { background: #f0f9eb; color: #67c23a; border: 1px solid #c2e7b0; }
.badge-high { background: #fef0f0; color: #f56c6c; border: 1px solid #fcd3d3; }
.badge-normal { background: #f4f4f5; color: #909399; border: 1px solid #e9e9eb; }
</style>
