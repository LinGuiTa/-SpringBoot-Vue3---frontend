<template>
  <AppLayout>
    <div class="alert-page">
      <div class="page-header">
        <h2>降价提醒</h2>
        <el-button type="primary" :icon="Plus" @click="$router.push('/')">去设置提醒</el-button>
      </div>
      <div v-if="loading"><el-skeleton :rows="5" animated /></div>
      <div v-else-if="alerts.length === 0">
        <el-empty description="还没有设置降价提醒">
          <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
        </el-empty>
      </div>
      <el-table v-else :data="alerts" style="width:100%">
        <el-table-column label="商品" min-width="220">
          <template #default="{ row }">
            <div class="product-cell" @click="$router.push(`/product/${row.productId}`)">
              <img
                v-if="productMap[row.productId]?.imageUrl"
                :src="productMap[row.productId].imageUrl"
                class="product-thumb"
                @error="(e)=> e.target.src='/favicon.svg'"
              />
              <div>
                <div class="product-name">{{ productMap[row.productId]?.name || `商品 #${row.productId}` }}</div>
                <div class="product-brand">{{ productMap[row.productId]?.brand || '' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="目标价格" width="140">
          <template #default="{ row }">
            <span class="target-price">¥{{ row.targetPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提醒类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.alertType === 'ONCE' ? 'info' : 'warning'" size="small">
              {{ row.alertType === 'ONCE' ? '单次' : '持续' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="editAlert(row)" :disabled="row.status !== 'ACTIVE'">修改</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="editVisible" title="修改目标价格" width="400px">
        <el-form label-width="80px">
          <el-form-item label="商品">
            <span style="color:#606266">{{ productMap[editingProductId]?.name || `#${editingProductId}` }}</span>
          </el-form-item>
          <el-form-item label="目标价">
            <el-input-number v-model="editPrice" :min="0.01" :precision="2" :step="10" style="width:100%" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdate" :loading="updating">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'
import { getAlerts, deleteAlert, updateAlert } from '@/api/alert'
import { getById } from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const alerts = ref([])
const loading = ref(false)
const editVisible = ref(false)
const editPrice = ref(0)
const editingId = ref(null)
const editingProductId = ref(null)
const updating = ref(false)
const productMap = ref({})

const loadAlerts = async () => {
  loading.value = true
  try {
    const res = await getAlerts()
    alerts.value = res.data || []
    await loadProductInfo(alerts.value)
  } finally {
    loading.value = false
  }
}

const loadProductInfo = async (list) => {
  const ids = [...new Set(list.map(a => a.productId))]
  const pending = ids.filter(id => !productMap.value[id])
  await Promise.allSettled(
    pending.map(id =>
      getById(id).then(res => {
        productMap.value[id] = res.data
      }).catch(() => {})
    )
  )
}

const statusType = (s) => s === 'ACTIVE' ? 'success' : s === 'TRIGGERED' ? 'warning' : 'info'
const statusText = (s) => s === 'ACTIVE' ? '监控中' : s === 'TRIGGERED' ? '已触发' : '已取消'
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : ''

const editAlert = (row) => {
  editingId.value = row.id
  editingProductId.value = row.productId
  editPrice.value = row.targetPrice
  editVisible.value = true
}

const handleUpdate = async () => {
  updating.value = true
  try {
    await updateAlert(editingId.value, editPrice.value)
    editVisible.value = false
    ElMessage.success('修改成功')
    loadAlerts()
  } finally {
    updating.value = false
  }
}

const handleDelete = async (row) => {
  const name = productMap.value[row.productId]?.name || `商品 #${row.productId}`
  await ElMessageBox.confirm(`确定删除「${name}」的降价提醒？`, '提示')
  await deleteAlert(row.id)
  alerts.value = alerts.value.filter(a => a.id !== row.id)
  ElMessage.success('已删除')
}

onMounted(loadAlerts)
</script>

<style scoped>
.alert-page {}
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.target-price { color: #f56c6c; font-weight: bold; font-size: 16px; }
.product-cell { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.product-cell:hover .product-name { color: #409eff; }
.product-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
.product-name { font-size: 13px; font-weight: 500; }
.product-brand { color: #909399; font-size: 12px; margin-top: 2px; }
</style>
