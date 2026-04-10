<template>
  <div>
    <h2 style="margin-bottom:20px">用户管理</h2>
    <div style="margin-bottom:16px;display:flex;gap:12px">
      <el-input v-model="keyword" placeholder="搜索用户名/邮箱" style="width:300px" clearable @keyup.enter="loadUsers" />
      <el-button type="primary" @click="loadUsers">搜索</el-button>
    </div>
    <el-table :data="users" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机号" width="140" />
      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'primary'" size="small">{{ row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="handleRoleChange(row)">
            {{ row.role === 'ADMIN' ? '设为用户' : '设为管理员' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="page"
      :page-size="10"
      :total="total"
      layout="total, prev, pager, next"
      @change="loadUsers"
      style="margin-top:16px;justify-content:center;display:flex"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, updateUserStatus, updateUserRole } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const total = ref(0)

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers({ keyword: keyword.value || undefined, page: page.value, size: 10 })
    users.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  await ElMessageBox.confirm(`确定${newStatus ? '启用' : '禁用'}用户「${row.username}」？`, '提示')
  await updateUserStatus(row.id, newStatus)
  row.status = newStatus
  ElMessage.success('操作成功')
}

const handleRoleChange = async (row) => {
  const newRole = row.role === 'ADMIN' ? 'USER' : 'ADMIN'
  await ElMessageBox.confirm(`确定将「${row.username}」设为${newRole}？`, '提示')
  await updateUserRole(row.id, newRole)
  row.role = newRole
  ElMessage.success('操作成功')
}

onMounted(loadUsers)
</script>
