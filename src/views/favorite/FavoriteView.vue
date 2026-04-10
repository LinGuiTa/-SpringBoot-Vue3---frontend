<template>
  <AppLayout>
    <div class="favorite-page">
      <h2 style="margin-bottom:20px">我的收藏</h2>
      <div v-if="loading"><el-skeleton :rows="3" animated /></div>
      <div v-else-if="favorites.length === 0">
        <el-empty description="还没有收藏商品">
          <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
        </el-empty>
      </div>
      <div v-else class="fav-grid">
        <el-card v-for="item in favorites" :key="item.favoriteId" class="fav-card">
          <div class="fav-image" @click="$router.push(`/product/${item.productId}`)">
            <img :src="item.productImage || 'https://via.placeholder.com/200x200?text=暂无'" />
          </div>
          <div class="fav-info">
            <div class="fav-name" @click="$router.push(`/product/${item.productId}`)">{{ item.productName }}</div>
            <div class="fav-brand">{{ item.brand }}</div>
            <div class="fav-price">
              <span class="price-value">¥{{ item.lowestPrice }}</span>
              <span class="price-platform">{{ item.lowestPlatformName }}</span>
            </div>
            <div class="fav-actions">
              <el-button size="small" type="primary" @click="$router.push(`/product/${item.productId}`)">查看比价</el-button>
              <el-button size="small" type="danger" plain @click="handleRemove(item)">取消收藏</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'
import { getFavorites, removeFavorite } from '@/api/favorite'
import { ElMessage, ElMessageBox } from 'element-plus'

const favorites = ref([])
const loading = ref(false)

const loadFavorites = async () => {
  loading.value = true
  try {
    const res = await getFavorites()
    favorites.value = res.data || []
  } finally {
    loading.value = false
  }
}

const handleRemove = async (item) => {
  await ElMessageBox.confirm(`确定取消收藏「${item.productName}」？`, '提示')
  await removeFavorite(item.productId)
  favorites.value = favorites.value.filter(f => f.favoriteId !== item.favoriteId)
  ElMessage.success('已取消收藏')
}

onMounted(loadFavorites)
</script>

<style scoped>
.fav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.fav-card :deep(.el-card__body) { padding: 0; }
.fav-image { height: 160px; overflow: hidden; cursor: pointer; }
.fav-image img { width: 100%; height: 100%; object-fit: cover; }
.fav-info { padding: 12px; }
.fav-name { font-size: 14px; font-weight: 500; cursor: pointer; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-name:hover { color: #409eff; }
.fav-brand { color: #909399; font-size: 12px; margin-bottom: 8px; }
.fav-price { margin-bottom: 12px; }
.price-value { color: #f56c6c; font-size: 20px; font-weight: bold; margin-right: 8px; }
.price-platform { color: #909399; font-size: 12px; }
.fav-actions { display: flex; gap: 8px; }
</style>
