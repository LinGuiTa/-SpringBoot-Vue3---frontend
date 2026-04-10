<template>
  <div>
    <h2 style="margin-bottom:20px">商品管理</h2>
    <div style="margin-bottom:16px;display:flex;gap:12px">
      <el-input v-model="keyword" placeholder="搜索商品名称" style="width:300px" clearable @keyup.enter="loadProducts" />
      <el-button type="primary" @click="loadProducts">搜索</el-button>
      <el-button type="success" @click="showCreateDialog">新增商品</el-button>
    </div>
    <el-table :data="products" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="商品名称" min-width="200">
        <template #default="{ row }">
          <el-link @click="$router.push(`/product/${row.id}`)">{{ row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="barcode" label="条码" width="150" />
      <el-table-column prop="brand" label="品牌" width="120" />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">下架</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="page"
      :page-size="10"
      :total="total"
      layout="total, prev, pager, next"
      @change="loadProducts"
      style="margin-top:16px;justify-content:center;display:flex"
    />

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑商品' : '新增商品'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="条码"><el-input v-model="form.barcode" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="品牌"><el-input v-model="form.brand" /></el-form-item>
        <el-form-item label="分类ID"><el-input-number v-model="form.categoryId" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="图片URL"><el-input v-model="form.imageUrl" /></el-form-item>
        <el-form-item label="规格"><el-input v-model="form.spec" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const products = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const dialogVisible = ref(false)
const editing = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const form = ref({ barcode: '', name: '', brand: '', categoryId: 1, imageUrl: '', spec: '', description: '' })

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getAdminProducts({ keyword: keyword.value || undefined, page: page.value, size: 10 })
    products.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  editing.value = false
  form.value = { barcode: '', name: '', brand: '', categoryId: 1, imageUrl: '', spec: '', description: '' }
  dialogVisible.value = true
}

const showEditDialog = (row) => {
  editing.value = true
  editingId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (editing.value) {
      await updateProduct(editingId.value, form.value)
    } else {
      await createProduct(form.value)
    }
    dialogVisible.value = false
    ElMessage.success(editing.value ? '修改成功' : '新增成功')
    loadProducts()
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定下架「${row.name}」？`, '提示')
  await deleteProduct(row.id)
  ElMessage.success('已下架')
  loadProducts()
}

onMounted(loadProducts)
</script>
