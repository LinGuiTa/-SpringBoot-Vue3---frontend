<template>
  <div class="price-compare">
    <div class="compare-header">
      <h3>各平台价格对比</h3>
      <el-button size="small" :icon="Refresh" :loading="refreshing" @click="$emit('refresh')">刷新价格</el-button>
    </div>
    <el-table :data="sortedPrices" style="width:100%" :row-class-name="rowClassName">
      <el-table-column label="平台" width="160">
        <template #default="{ row }">
          <div class="platform-cell">
            <img v-if="row.platformLogoUrl" :src="row.platformLogoUrl" class="platform-logo" />
            <span>{{ row.platformName }}</span>
            <span v-if="row.isLowest" class="lowest-badge">最低价</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="当前价格" width="140">
        <template #default="{ row }">
          <div class="price-cell">
            <span class="current-price">¥{{ row.price }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="原价" width="120">
        <template #default="{ row }">
          <span class="original-price">¥{{ row.originalPrice || row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣信息" prop="discountInfo" />
      <el-table-column label="库存" width="80">
        <template #default="{ row }">
          <el-tag :type="row.stockStatus ? 'success' : 'danger'" size="small">
            {{ row.stockStatus ? '有货' : '缺货' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="openUrl(row.url)"
            :disabled="!row.url"
          >去购买</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  prices: { type: Array, default: () => [] },
  refreshing: { type: Boolean, default: false }
})

defineEmits(['refresh'])

const sortedPrices = computed(() => {
  return [...props.prices].sort((a, b) => a.price - b.price)
})

const rowClassName = ({ row }) => {
  return row.isLowest ? 'lowest-row' : ''
}

const openUrl = (url) => {
  if (url) window.open(url, '_blank')
}
</script>

<style scoped>
.price-compare { }
.compare-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.compare-header h3 { font-size: 18px; }
.platform-cell { display: flex; align-items: center; gap: 8px; }
.platform-logo { width: 24px; height: 24px; object-fit: contain; }
.lowest-badge {
  background: linear-gradient(135deg, #f56c6c, #e6a23c);
  color: white;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 11px;
}
.current-price { color: #f56c6c; font-size: 18px; font-weight: bold; }
.original-price { color: #909399; text-decoration: line-through; font-size: 13px; }
</style>

<style>
.el-table .lowest-row { background-color: #fff5f5 !important; }
</style>
