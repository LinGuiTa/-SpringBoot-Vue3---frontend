<template>
  <div v-if="lowestPrice" class="rank-card">
    <div class="rank-label">🏆 当前最低价</div>
    <div class="rank-platform">
      <img v-if="lowestPrice.platformLogoUrl" :src="lowestPrice.platformLogoUrl" class="platform-logo" />
      {{ lowestPrice.platformName }}
    </div>
    <div class="rank-price">¥{{ lowestPrice.price }}</div>
    <div v-if="lowestPrice.originalPrice && lowestPrice.originalPrice > lowestPrice.price" class="rank-save">
      比原价省 ¥{{ (lowestPrice.originalPrice - lowestPrice.price).toFixed(2) }}
    </div>
    <div v-if="lowestPrice.discountInfo" class="rank-discount">{{ lowestPrice.discountInfo }}</div>
    <el-button type="danger" style="width:100%;margin-top:12px" @click="openUrl(lowestPrice.url)">
      去 {{ lowestPrice.platformName }} 购买
    </el-button>
  </div>
</template>

<script setup>
defineProps({ lowestPrice: Object })
const openUrl = (url) => { if (url) window.open(url, '_blank') }
</script>

<style scoped>
.rank-card {
  background: linear-gradient(135deg, #fff5f5, #fff);
  border: 2px solid #f56c6c;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.rank-label { color: #f56c6c; font-size: 14px; margin-bottom: 8px; font-weight: bold; }
.rank-platform { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; margin-bottom: 8px; }
.platform-logo { width: 28px; height: 28px; object-fit: contain; }
.rank-price { font-size: 36px; font-weight: bold; color: #f56c6c; margin-bottom: 8px; }
.rank-save { color: #67c23a; font-size: 14px; margin-bottom: 4px; }
.rank-discount { color: #e6a23c; font-size: 13px; background: #fdf6ec; padding: 2px 8px; border-radius: 4px; display: inline-block; }
</style>
