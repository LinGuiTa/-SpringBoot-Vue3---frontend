<template>
  <AppLayout>
    <div class="profile-page">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card>
            <div class="user-info">
              <el-avatar :size="80" :src="userStore.userInfo?.avatar" :icon="UserFilled" />
              <h3>{{ userStore.userInfo?.username }}</h3>
              <el-tag :type="userStore.userInfo?.role === 'ADMIN' ? 'danger' : 'primary'">
                {{ userStore.userInfo?.role === 'ADMIN' ? '管理员' : '普通用户' }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card header="基本信息">
            <el-form :model="profileForm" label-width="80px">
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="profileForm.phone" />
              </el-form-item>
              <el-form-item label="头像URL">
                <el-input v-model="profileForm.avatar" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUpdateProfile" :loading="profileLoading">保存修改</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          <el-card header="修改密码" style="margin-top:20px">
            <el-form :model="pwdForm" ref="pwdFormRef" label-width="100px">
              <el-form-item label="当前密码" prop="oldPassword" :rules="[{ required: true, message: '请输入当前密码', trigger: 'blur' }]">
                <el-input v-model="pwdForm.oldPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword" :rules="[{ required: true, min: 8, message: '新密码至少8个字符', trigger: 'blur' }]">
                <el-input v-model="pwdForm.newPassword" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUpdatePassword" :loading="pwdLoading">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'
import { useUserStore } from '@/store/user'
import { updateProfile, updatePassword } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'

const userStore = useUserStore()
const pwdFormRef = ref()
const profileLoading = ref(false)
const pwdLoading = ref(false)

const profileForm = ref({
  email: '',
  phone: '',
  avatar: ''
})

const pwdForm = ref({
  oldPassword: '',
  newPassword: ''
})

onMounted(async () => {
  await userStore.fetchProfile()
  const info = userStore.userInfo
  profileForm.value = {
    email: info?.email || '',
    phone: info?.phone || '',
    avatar: info?.avatar || ''
  }
})

const handleUpdateProfile = async () => {
  profileLoading.value = true
  try {
    await updateProfile(profileForm.value)
    await userStore.fetchProfile()
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    profileLoading.value = false
  }
}

const handleUpdatePassword = async () => {
  await pwdFormRef.value.validate()
  pwdLoading.value = true
  try {
    await updatePassword(pwdForm.value)
    ElMessage.success('密码修改成功')
    pwdForm.value = { oldPassword: '', newPassword: '' }
  } catch (e) {
    ElMessage.error(e?.message || '密码修改失败')
  } finally {
    pwdLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
}
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
}
.user-info h3 {
  font-size: 18px;
  margin: 0;
}
</style>
