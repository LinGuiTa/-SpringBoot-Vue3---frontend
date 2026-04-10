<template>
  <div>
    <h2 style="margin-bottom:20px">价格监控</h2>
    <el-card style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span>批量刷新所有热门商品价格</span>
        <el-button type="primary" :loading="refreshing" @click="handleRefresh">批量刷新</el-button>
      </div>
    </el-card>
    <h3 style="margin-bottom:16px">各平台状态</h3>
    <el-table :data="platforms" v-loading="loading">
      <el-table-column prop="platformName" label="平台名称" />
      <el-table-column prop="productCount" label="商品覆盖数" width="120" />
      <el-table-column label="最近更新" width="200">
        <template #default="{ row }">
          {{ row.lastUpdateTime ? new Date(row.lastUpdateTime).toLocaleString('zh-CN') : '暂无' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default>
          <el-tag type="success" size="small">正常</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { batchRefreshPrices, getPriceMonitor } from '@/api/admin'
import { ElMessage } from 'element-plus'

const platforms = ref([])
const loading = ref(false)
const refreshing = ref(false)

const loadMonitor = async () => {
  loading.value = true
  try {
    const res = await getPriceMonitor()
    platforms.value = res.data?.platforms || []
  } catch(e) {
    platforms.value = []
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  try {
    await batchRefreshPrices()
    ElMessage.success('已触发批量刷新')
    await loadMonitor()
  } finally {
    refreshing.value = false
  }
}

onMounted(loadMonitor)
</script>
