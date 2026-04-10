<template>
  <div class="history-chart">
    <div class="chart-header">
      <h3>30天价格走势</h3>
      <div class="time-tabs">
        <el-radio-group v-model="days" @change="loadHistory" size="small">
          <el-radio-button :label="7">近7天</el-radio-button>
          <el-radio-button :label="14">近14天</el-radio-button>
          <el-radio-button :label="30">近30天</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div v-loading="loading" ref="chartRef" style="height:320px;width:100%"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getPriceHistory } from '@/api/price'

const props = defineProps({ productId: [Number, String] })

const chartRef = ref(null)
const days = ref(30)
const loading = ref(false)
let chart = null
let historyData = ref([])

const initChart = () => {
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
}

const renderChart = () => {
  if (!chart || !historyData.value.length) return

  const platforms = [...new Set(historyData.value.map(d => d.platformName))]
  const allDates = [...new Set(historyData.value.map(d => d.date))].sort()

  const series = platforms.map(platform => {
    const platformData = historyData.value.filter(d => d.platformName === platform)
    const dateMap = {}
    platformData.forEach(d => { dateMap[d.date] = d.price })
    return {
      name: platform,
      type: 'line',
      smooth: true,
      data: allDates.map(date => dateMap[date] || null),
      connectNulls: false
    }
  })

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        let html = `${params[0].axisValue}<br/>`
        params.forEach(p => {
          if (p.value !== null) {
            html += `${p.marker}${p.seriesName}: <b>¥${p.value}</b><br/>`
          }
        })
        return html
      }
    },
    legend: { data: platforms, top: 0 },
    grid: { left: '60px', right: '20px', top: '40px', bottom: '40px' },
    xAxis: {
      type: 'category',
      data: allDates,
      axisLabel: { formatter: val => val.slice(5) }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: val => `¥${val}` },
      scale: true
    },
    color: ['#409eff', '#f56c6c', '#67c23a', '#e6a23c'],
    series
  })
}

const loadHistory = async () => {
  if (!props.productId) return
  loading.value = true
  try {
    const res = await getPriceHistory(props.productId, { days: days.value })
    historyData.value = res.data || []
    renderChart()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  initChart()
  await loadHistory()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
})

watch(() => props.productId, loadHistory)
</script>

<style scoped>
.history-chart { }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-header h3 { font-size: 18px; }
</style>
