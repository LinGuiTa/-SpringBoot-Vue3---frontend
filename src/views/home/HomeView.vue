<template>
  <AppLayout>
    <div class="home-page">
      <div class="hero-section">
        <h1 class="hero-title">扫一扫，找最低价</h1>
        <p class="hero-subtitle">聚合京东、淘宝、拼多多、苏宁等主流平台，实时比价</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" :icon="Camera" @click="openScanner">扫码比价</el-button>
          <el-input
            v-model="barcodeInput"
            placeholder="或输入条码..."
            size="large"
            style="width:200px"
            @keyup.enter="searchByBarcode"
          >
            <template #append>
              <el-button @click="searchByBarcode">查询</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div class="hot-section">
        <div class="section-header">
          <h2>热门商品</h2>
          <el-link type="primary" @click="$router.push('/search')">查看更多 →</el-link>
        </div>
        <div v-if="loading" class="loading-wrap">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else class="product-grid">
          <div
            v-for="product in hotProducts"
            :key="product.id"
            class="product-card"
            @click="$router.push(`/product/${product.id}`)"
          >
            <div class="product-image">
              <img :src="product.imageUrl || 'https://via.placeholder.com/200x200?text=暂无图片'" :alt="product.name" />
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-brand">{{ product.brand }}</div>
              <div class="product-lowest">
                <span v-if="lowestMap[product.id] && lowestMap[product.id].price" class="lowest-price">
                  ¥{{ lowestMap[product.id].price }}
                </span>
                <span v-else class="lowest-empty">暂无最低价</span>
                <span v-if="lowestMap[product.id] && lowestMap[product.id].platformName" class="lowest-platform">
                  {{ lowestMap[product.id].platformName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-dialog v-model="scannerVisible" title="扫码比价" width="500px" @close="stopScanner">
        <div id="qr-reader" style="width:100%"></div>
        <div v-if="scanError" class="scan-error">{{ scanError }}</div>
        <template #footer>
          <el-button @click="stopScanner(); scannerVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/common/AppLayout.vue'
import { getHotProducts, getByBarcode } from '@/api/product'
import { getLowestPrice } from '@/api/price'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import { Html5Qrcode } from 'html5-qrcode'

const router = useRouter()
const hotProducts = ref([])
const loading = ref(false)
const barcodeInput = ref('')
const scannerVisible = ref(false)
const scanError = ref('')
const lowestMap = ref({})
let html5Qrcode = null

const loadLowestPrices = async (products) => {
  const ids = (products || []).map(p => p.id).filter(Boolean)
  const pending = ids.filter(id => !lowestMap.value[id])
  if (!pending.length) return

  await Promise.allSettled(
    pending.map(id =>
      getLowestPrice(id)
        .then(res => { lowestMap.value[id] = res.data || null })
        .catch(() => { lowestMap.value[id] = null })
    )
  )
}

const loadHotProducts = async () => {
  loading.value = true
  try {
    const res = await getHotProducts(12)
    hotProducts.value = res.data || []
    await loadLowestPrices(hotProducts.value)
  } finally {
    loading.value = false
  }
}

const searchByBarcode = async () => {
  if (!barcodeInput.value.trim()) return
  try {
    const res = await getByBarcode(barcodeInput.value.trim())
    router.push(`/product/${res.data.id}`)
  } catch (e) {
    ElMessage.error('未找到该条码对应商品')
  }
}

const openScanner = async () => {
  scannerVisible.value = true
  scanError.value = ''
  await nextTick()
  html5Qrcode = new Html5Qrcode('qr-reader')
  html5Qrcode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 150 } },
    async (decodedText) => {
      await stopScanner()
      scannerVisible.value = false
      barcodeInput.value = decodedText
      await searchByBarcode()
    },
    () => {}
  ).catch(() => {
    scanError.value = '无法访问摄像头，请检查权限设置'
  })
}

const stopScanner = async () => {
  if (html5Qrcode) {
    try { await html5Qrcode.stop() } catch (e) {}
    html5Qrcode = null
  }
}

onMounted(loadHotProducts)
</script>

<style scoped>
.home-page { padding: 0; }
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  color: white;
  margin-bottom: 40px;
}
.hero-title { font-size: 36px; font-weight: bold; margin-bottom: 12px; }
.hero-subtitle { font-size: 16px; opacity: 0.9; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 12px; justify-content: center; align-items: center; flex-wrap: wrap; }
.hot-section { }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { font-size: 22px; }
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.product-image { height: 160px; overflow: hidden; }
.product-image img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 12px; }
.product-name { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.product-brand { color: #909399; font-size: 12px; margin-top: 4px; }
.product-lowest { margin-top: 10px; display: flex; align-items: baseline; gap: 8px; }
.lowest-price { color: #f56c6c; font-weight: 700; font-size: 16px; }
.lowest-platform { color: #909399; font-size: 12px; }
.lowest-empty { color: #c0c4cc; font-size: 12px; }
.loading-wrap { padding: 20px 0; }
.scan-error { color: #f56c6c; text-align: center; margin-top: 12px; }
</style>
