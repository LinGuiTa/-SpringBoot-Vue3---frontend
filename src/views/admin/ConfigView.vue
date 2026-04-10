<template>
  <div>
    <h2 style="margin-bottom:20px">系统配置</h2>
    <el-table :data="configs" v-loading="loading">
      <el-table-column prop="configKey" label="配置项" width="200" />
      <el-table-column prop="description" label="说明" />
      <el-table-column label="配置值" width="200">
        <template #default="{ row }">
          <el-input
            v-model="row.editValue"
            size="small"
            @blur="handleSave(row)"
            @keyup.enter="handleSave(row)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getConfigs, updateConfig } from '@/api/admin'
import { ElMessage } from 'element-plus'

const configs = ref([])
const loading = ref(false)

const loadConfigs = async () => {
  loading.value = true
  try {
    const res = await getConfigs()
    configs.value = (res.data || []).map(c => ({ ...c, editValue: c.configValue }))
  } finally {
    loading.value = false
  }
}

const handleSave = async (row) => {
  if (row.editValue === row.configValue) return
  try {
    await updateConfig(row.configKey, row.editValue)
    row.configValue = row.editValue
    ElMessage.success(`${row.configKey} 已更新`)
  } catch(e) {
    row.editValue = row.configValue
  }
}

onMounted(loadConfigs)
</script>
