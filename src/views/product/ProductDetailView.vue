<template>
  <AppLayout>
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="8" animated />
    </div>
    <div v-else-if="product" class="detail-page">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product.categoryName }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row :gutter="24" style="margin-top:20px">
        <el-col :span="8">
          <el-card :body-style="{ padding: '0' }">
            <img
              :src="product.imageUrl || 'https://via.placeholder.com/400x400?text=暂无图片'"
              style="width:100%;border-radius:8px 8px 0 0"
            />
            <div style="padding:16px">
              <div style="font-size:20px;font-weight:bold;margin-bottom:8px">{{ product.name }}</div>
              <div style="color:#909399;margin-bottom:4px">品牌：{{ product.brand }}</div>
              <div style="color:#909399;margin-bottom:4px">条码：{{ product.barcode }}</div>
              <div style="color:#909399;margin-bottom:4px">规格：{{ product.spec }}</div>
              <div style="color:#606266;margin-top:12px;font-size:13px">{{ product.description }}</div>
              <div style="display:flex;gap:12px;margin-top:20px">
                <el-button
                  :type="isFavorited ? 'warning' : 'default'"
                  :icon="isFavorited ? StarFilled : Star"
                  @click="toggleFavorite"
                  :loading="favoriteLoading"
                >{{ isFavorited ? '已收藏' : '收藏' }}</el-button>
                <el-button :icon="Bell" @click="showAlertDialog = true">降价提醒</el-button>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="16">
          <el-row :gutter="16" style="margin-bottom:16px">
            <el-col :span="8">
              <PriceRankCard :lowestPrice="lowestPrice" />
            </el-col>
            <el-col :span="16">
              <BestTimeBadge :bestTime="bestTime" />
              <PriceStatisticsCards :statistics="statistics" :trend="trendData" />
            </el-col>
          </el-row>

          <el-card style="margin-bottom:16px">
            <PriceCompareTable :prices="prices" :refreshing="refreshing" @refresh="handleRefresh" />
          </el-card>

          <el-card>
            <PriceHistoryChart :productId="productId" ref="chartRef" />
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div v-else class="not-found">
      <el-result icon="error" title="商品不存在" sub-title="该商品可能已下架或不存在">
        <template #extra>
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </template>
      </el-result>
    </div>

    <el-dialog v-model="showAlertDialog" title="设置降价提醒" width="400px">
      <el-form label-width="100px">
        <el-form-item label="商品名称">{{ product?.name }}</el-form-item>
        <el-form-item label="目标价格">
          <el-input-number v-model="alertTargetPrice" :min="0.01" :precision="2" :step="10" style="width:100%" />
        </el-form-item>
        <el-form-item label="提醒类型">
          <el-radio-group v-model="alertType">
            <el-radio label="ONCE">提醒一次</el-radio>
            <el-radio label="ALWAYS">持续提醒</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAlertDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateAlert" :loading="alertLoading">确认设置</el-button>
      </template>
    </el-dialog>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/common/AppLayout.vue'
import PriceCompareTable from '@/components/price/PriceCompareTable.vue'
import PriceRankCard from '@/components/price/PriceRankCard.vue'
import PriceHistoryChart from '@/components/price/PriceHistoryChart.vue'
import PriceStatisticsCards from '@/components/price/PriceStatisticsCards.vue'
import BestTimeBadge from '@/components/price/BestTimeBadge.vue'
import { getById } from '@/api/product'
import { comparePrices, getLowestPrice, refreshPrices, getPriceStatistics, getPriceTrend, getBestBuyTime } from '@/api/price'
import { addFavorite, removeFavorite, getFavoriteStatus } from '@/api/favorite'
import { createAlert } from '@/api/alert'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { Star, StarFilled, Bell } from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()
const productId = computed(() => route.params.id)

const product = ref(null)
const prices = ref([])
const lowestPrice = ref(null)
const statistics = ref(null)
const trendData = ref(null)
const bestTime = ref(null)
const loading = ref(false)
const refreshing = ref(false)
const isFavorited = ref(false)
const favoriteLoading = ref(false)
const showAlertDialog = ref(false)
const alertTargetPrice = ref(0)
const alertType = ref('ONCE')
const alertLoading = ref(false)

const loadAll = async () => {
  loading.value = true
  try {
    const [productRes, priceRes, lowestRes, statsRes, trendRes, bestTimeRes] = await Promise.allSettled([
      getById(productId.value),
      comparePrices(productId.value),
      getLowestPrice(productId.value),
      getPriceStatistics(productId.value),
      getPriceTrend(productId.value),
      getBestBuyTime(productId.value)
    ])
    if (productRes.status === 'fulfilled') product.value = productRes.value.data
    if (priceRes.status === 'fulfilled') prices.value = priceRes.value.data || []
    if (lowestRes.status === 'fulfilled') {
      lowestPrice.value = lowestRes.value.data
      alertTargetPrice.value = lowestRes.value.data?.price || 0
    }
    if (statsRes.status === 'fulfilled') statistics.value = statsRes.value.data
    if (trendRes.status === 'fulfilled') trendData.value = trendRes.value.data
    if (bestTimeRes.status === 'fulfilled') bestTime.value = bestTimeRes.value.data

    if (userStore.isLoggedIn) {
      const favRes = await getFavoriteStatus(productId.value)
      isFavorited.value = favRes.data
    }
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  try {
    await refreshPrices(productId.value)
    const res = await comparePrices(productId.value)
    prices.value = res.data || []
    ElMessage.success('价格已刷新')
  } finally {
    refreshing.value = false
  }
}

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  favoriteLoading.value = true
  try {
    if (isFavorited.value) {
      await removeFavorite(productId.value)
      isFavorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite(productId.value)
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } finally {
    favoriteLoading.value = false
  }
}

const handleCreateAlert = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  alertLoading.value = true
  try {
    await createAlert({
      productId: Number(productId.value),
      targetPrice: alertTargetPrice.value,
      alertType: alertType.value
    })
    showAlertDialog.value = false
    ElMessage.success('降价提醒设置成功')
  } finally {
    alertLoading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.detail-page { }
.loading-wrap { padding: 40px 0; }
.not-found { padding: 80px 0; }
</style>
