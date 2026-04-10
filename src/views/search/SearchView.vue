<template>
  <AppLayout>
    <div class="search-page">
      <div class="search-header">
        <span v-if="keyword">搜索 "<strong>{{ keyword }}</strong>" 的结果</span>
        <span v-else>全部商品</span>
        <span class="result-count">共 {{ total }} 件</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="5">
          <el-card header="商品分类">
            <el-menu :default-active="selectedCategory" @select="handleCategorySelect">
              <el-menu-item index="">全部分类</el-menu-item>
              <el-menu-item v-for="cat in categories" :key="cat.id" :index="String(cat.id)">
                {{ cat.name }}
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>
        <el-col :span="19">
          <div v-if="loading">
            <el-skeleton v-for="i in 5" :key="i" :rows="2" animated style="margin-bottom:16px" />
          </div>
          <div v-else-if="products.length === 0" class="empty-result">
            <el-empty description="没有找到相关商品" />
          </div>
          <div v-else>
            <div
              v-for="product in products"
              :key="product.id"
              class="product-list-item"
              @click="$router.push(`/product/${product.id}`)"
            >
              <img :src="product.imageUrl || 'https://via.placeholder.com/120x120?text=暂无'" class="item-image" />
              <div class="item-info">
                <div class="item-name">{{ product.name }}</div>
                <div class="item-brand">品牌：{{ product.brand || '未知' }}</div>
                <div class="item-category">{{ product.categoryName }}</div>
                <div class="item-barcode">条码：{{ product.barcode }}</div>
                <div class="item-lowest">
                  <span v-if="lowestMap[product.id] && lowestMap[product.id].price" class="lowest-price">
                    最低 ¥{{ lowestMap[product.id].price }}
                  </span>
                  <span v-else class="lowest-empty">最低价获取中...</span>
                  <span v-if="lowestMap[product.id] && lowestMap[product.id].platformName" class="lowest-platform">
                    {{ lowestMap[product.id].platformName }}
                  </span>
                </div>
              </div>
              <div class="item-action">
                <el-button type="primary">查看比价</el-button>
              </div>
            </div>
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @change="loadProducts"
              style="margin-top:20px;justify-content:center;display:flex"
            />
          </div>
        </el-col>
      </el-row>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/common/AppLayout.vue'
import { searchProducts, getCategories } from '@/api/product'
import { getLowestPrice } from '@/api/price'

const route = useRoute()
const router = useRouter()
const keyword = ref(route.query.keyword || '')
const products = ref([])
const categories = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const selectedCategory = ref('')
const lowestMap = ref({})

const loadLowestPrices = async (list) => {
  const ids = (list || []).map(p => p.id).filter(Boolean)
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

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await searchProducts({
      keyword: keyword.value || undefined,
      categoryId: selectedCategory.value || undefined,
      page: currentPage.value,
      size: pageSize.value
    })
    products.value = res.data.records || []
    total.value = res.data.total || 0
    loadLowestPrices(products.value)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  const res = await getCategories()
  categories.value = (res.data || []).filter(c => c.level === 1)
}

const handleCategorySelect = (index) => {
  selectedCategory.value = index
  currentPage.value = 1
  loadProducts()
}

watch(() => route.query.keyword, (val) => {
  keyword.value = val || ''
  currentPage.value = 1
  loadProducts()
})

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.search-page { }
.search-header { margin-bottom: 20px; font-size: 16px; }
.result-count { color: #909399; margin-left: 12px; }
.product-list-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.product-list-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
.item-image { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-right: 16px; }
.item-info { flex: 1; }
.item-name { font-size: 16px; font-weight: 500; margin-bottom: 8px; }
.item-brand, .item-category, .item-barcode { color: #909399; font-size: 13px; margin-bottom: 4px; }
.item-lowest { margin-top: 8px; display: flex; gap: 10px; align-items: baseline; }
.lowest-price { color: #f56c6c; font-weight: 700; }
.lowest-platform { color: #909399; font-size: 12px; }
.lowest-empty { color: #c0c4cc; font-size: 12px; }
.item-action { padding-left: 16px; }
.empty-result { padding: 60px 0; }
</style>
