<template>
  <div class="dashboard">
    <h2 style="margin-bottom:20px">数据概览</h2>
    <el-row :gutter="16">
      <el-col :span="6" v-for="item in statCards" :key="item.label">
        <el-card shadow="hover" :body-style="{ display: 'flex', alignItems: 'center', gap: '16px' }">
          <el-icon :size="40" :color="item.color"><component :is="item.icon" /></el-icon>
          <div>
            <div style="color:#909399;font-size:13px">{{ item.label }}</div>
            <div style="font-size:28px;font-weight:bold">{{ item.value }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard } from '@/api/admin'
import { User, Goods, Bell, ChatLineSquare } from '@element-plus/icons-vue'

const data = ref({})

const statCards = ref([
  { label: '用户总数', value: 0, icon: User, color: '#409eff' },
  { label: '商品总数', value: 0, icon: Goods, color: '#67c23a' },
  { label: '活跃提醒', value: 0, icon: Bell, color: '#e6a23c' },
  { label: '未读通知', value: 0, icon: ChatLineSquare, color: '#f56c6c' }
])

onMounted(async () => {
  try {
    const res = await getDashboard()
    data.value = res.data || {}
    statCards.value[0].value = data.value.totalUsers || 0
    statCards.value[1].value = data.value.totalProducts || 0
    statCards.value[2].value = data.value.activeAlerts || 0
    statCards.value[3].value = data.value.unreadNotifications || 0
  } catch(e) {}
})
</script>
