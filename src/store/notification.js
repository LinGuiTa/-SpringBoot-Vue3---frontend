import { defineStore } from 'pinia'
import { getUnreadCount, getNotifications, markRead, markAllRead } from '@/api/notification'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    unreadCount: 0,
    notifications: [],
    loading: false
  }),
  actions: {
    async fetchUnreadCount() {
      try {
        const res = await getUnreadCount()
        this.unreadCount = res.data
      } catch(e) {}
    },
    async fetchNotifications(page = 1, size = 20) {
      this.loading = true
      try {
        const res = await getNotifications({ page, size })
        this.notifications = res.data.records || []
      } finally {
        this.loading = false
      }
    },
    async markAsRead(id) {
      await markRead(id)
      await this.fetchUnreadCount()
    },
    async markAllAsRead() {
      await markAllRead()
      this.unreadCount = 0
    }
  }
})
