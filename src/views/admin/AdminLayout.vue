<template>
  <div class="admin-layout">
    <el-aside width="220px" class="admin-aside">
      <div class="admin-logo" @click="$router.push('/')">
        <el-icon size="24" color="#409eff"><DataLine /></el-icon>
        <span>PriceRadar Admin</span>
      </div>
      <el-menu :default-active="activeMenu" router class="admin-menu">
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/prices">
          <el-icon><TrendCharts /></el-icon>
          <span>价格监控</span>
        </el-menu-item>
        <el-menu-item index="/admin/config">
          <el-icon><Setting /></el-icon>
          <span>系统配置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <div class="admin-right">
      <div class="admin-topbar">
        <div class="topbar-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="topbar-actions">
          <el-tooltip content="刷新当前页" placement="bottom">
            <el-button circle :icon="Refresh" @click="handleRefresh" />
          </el-tooltip>
          <el-tooltip content="帮助" placement="bottom">
            <el-button circle :icon="QuestionFilled" @click="handleHelp" />
          </el-tooltip>
          <el-dropdown @command="handleUserCommand">
            <div class="topbar-user">
              <el-avatar :size="36" :src="userStore.avatar" :icon="UserFilled" />
              <span class="username">{{ userStore.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="home">返回前台首页</el-dropdown-item>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <el-main class="admin-main">
        <router-view :key="reloadKey" />
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { DataLine, DataAnalysis, User, Goods, TrendCharts, Setting, Refresh, QuestionFilled, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const activeMenu = computed(() => route.path)

const titleMap = {
  '/admin/dashboard': '数据概览',
  '/admin/users': '用户管理',
  '/admin/products': '商品管理',
  '/admin/prices': '价格监控',
  '/admin/config': '系统配置'
}
const currentTitle = computed(() => titleMap[route.path] || '控制台')

const reloadKey = ref(0)
const handleRefresh = () => { reloadKey.value++ }
const handleHelp = () => {
  ElMessage.info('帮助中心建设中，敬请期待')
}

const handleUserCommand = async (cmd) => {
  if (cmd === 'home') {
    router.push('/')
  } else if (cmd === 'profile') {
    router.push('/profile')
  } else if (cmd === 'logout') {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; background: #f0f2f5; }
.admin-aside { background: #001529; overflow-y: auto; }
.admin-logo {
  display: flex; align-items: center; gap: 8px; padding: 20px 16px;
  color: white; font-size: 16px; font-weight: bold; cursor: pointer;
}
.admin-menu { border-right: none; background: #001529; }
.admin-menu :deep(.el-menu-item) { color: #b0bec5; }
.admin-menu :deep(.el-menu-item:hover) { background: #0d2137; color: white; }
.admin-menu :deep(.el-menu-item.is-active) { background: #409eff; color: white; }
.admin-right { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.admin-topbar {
  height: 56px; background: #fff; border-bottom: 1px solid #e4e7ed;
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
}
.topbar-left { display: flex; align-items: center; gap: 12px; }
.topbar-actions { display: flex; align-items: center; gap: 12px; }
.topbar-user { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.username { color: #606266; font-size: 14px; }
.admin-main { padding: 16px; }
</style>
