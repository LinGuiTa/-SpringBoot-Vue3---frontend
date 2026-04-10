<template>
  <div class="app-layout">
    <el-header class="app-header">
      <div class="header-content page-container">
        <div class="logo" @click="$router.push('/')">
          <el-icon size="28" color="#409eff"><DataLine /></el-icon>
          <span class="logo-text">PriceRadar</span>
        </div>
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称或品牌..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
            style="width: 400px"
          >
            <template #append>
              <el-button @click="handleSearch" :icon="Search" />
            </template>
          </el-input>
        </div>
        <div class="header-right">
          <el-badge :value="notificationStore.unreadCount" :hidden="notificationStore.unreadCount === 0">
            <el-button circle :icon="Bell" @click="showNotifications = true" />
          </el-badge>
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleUserCommand">
              <div class="user-avatar">
                <el-avatar :size="36" :src="userStore.avatar" :icon="UserFilled" />
                <span class="username">{{ userStore.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                  <el-dropdown-item command="alerts">降价提醒</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.isAdmin" command="admin">管理后台</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button @click="$router.push('/login')">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>
    <el-main class="app-main">
      <div class="page-container">
        <slot />
      </div>
    </el-main>

    <el-drawer v-model="showNotifications" title="消息通知" direction="rtl" size="400px">
      <div class="notification-header">
        <el-button size="small" @click="handleMarkAllRead" :disabled="notificationStore.unreadCount === 0">全部已读</el-button>
      </div>
      <div v-if="notificationStore.notifications.length === 0" class="empty-tip">暂无通知</div>
      <div
        v-for="item in notificationStore.notifications"
        :key="item.id"
        class="notification-item"
        :class="{ unread: !item.isRead }"
        @click="handleNotificationClick(item)"
      >
        <div class="notification-title">
          <span>{{ item.title }}</span>
          <el-tag v-if="!item.isRead" type="danger" size="small" round>新</el-tag>
        </div>
        <div class="notification-content">{{ item.content }}</div>
        <div class="notification-time">{{ formatTime(item.createdAt) }}</div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useNotificationStore } from '@/store/notification'
import { Search, Bell, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const searchKeyword = ref('')
const showNotifications = ref(false)

let pollTimer = null

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value.trim() } })
  }
}

const handleUserCommand = async (command) => {
  if (command === 'logout') {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } else if (command === 'admin') {
    router.push('/admin')
  } else {
    router.push(`/${command}`)
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead()
  await notificationStore.fetchNotifications()
}

const handleNotificationClick = async (item) => {
  if (!item.isRead) {
    await notificationStore.markAsRead(item.id)
    item.isRead = true
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    notificationStore.fetchUnreadCount()
    notificationStore.fetchNotifications()
    pollTimer = setInterval(() => {
      if (userStore.isLoggedIn) notificationStore.fetchUnreadCount()
    }, 30000)
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 64px;
}
.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 20px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}
.search-bar { flex: 1; display: flex; justify-content: center; }
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.username { font-size: 14px; color: #606266; }
.app-main { padding: 20px 0; flex: 1; }
.notification-header { padding: 0 0 12px; text-align: right; }
.notification-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}
.notification-item.unread { background: #f0f7ff; }
.notification-title { font-weight: bold; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.notification-content { color: #606266; font-size: 13px; margin-bottom: 4px; }
.notification-time { color: #909399; font-size: 12px; }
.empty-tip { text-align: center; color: #909399; padding: 40px; }
</style>
