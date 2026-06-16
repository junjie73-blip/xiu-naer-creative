<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
  NCard,
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NPopconfirm,
  NSelect,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  type Staff,
} from '@/api/staff'

const message = useMessage()

const staff = ref<Staff[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  username: '',
  name: '',
  phone: '',
  password: '',
  status: 'active',
  role: 'staff',
})

const statusOptions = [
  { label: '在职', value: 'active' },
  { label: '停用', value: 'inactive' },
]

const columns: DataTableColumns<Staff> = [
  { title: '账号', key: 'username' },
  { title: '姓名', key: 'name' },
  { title: '电话', key: 'phone' },
  { title: '角色', key: 'role' },
  {
    title: '状态',
    key: 'status',
    render(row: Staff) {
      return row.status === 'active' ? '在职' : '停用'
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render(row: Staff) {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              { size: 'small', onClick: () => openEdit(row) },
              { default: () => '编辑' },
            ),
            h(
              NPopconfirm,
              { onPositiveClick: () => handleDelete(row.id) },
              {
                trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
                default: () => '确定删除该人员吗？',
              },
            ),
          ],
        },
      )
    },
  },
]

async function loadData() {
  loading.value = true
  try {
    staff.value = await listStaff()
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    username: '',
    name: '',
    phone: '',
    password: '',
    status: 'active',
    role: 'staff',
  }
  editingId.value = null
}

function openCreate() {
  resetForm()
  showModal.value = true
}

function openEdit(row: Staff) {
  form.value = {
    username: row.username,
    name: row.name,
    phone: row.phone || '',
    password: '',
    status: row.status,
    role: row.role,
  }
  editingId.value = row.id
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.username || !form.value.name) {
    message.warning('请填写账号和姓名')
    return
  }
  try {
    if (editingId.value) {
      const data: any = { ...form.value }
      if (!data.password) delete data.password
      await updateStaff(editingId.value, data)
      message.success('更新成功')
    } else {
      if (!form.value.password) {
        message.warning('请设置初始密码')
        return
      }
      await createStaff(form.value as any)
      message.success('创建成功')
    }
    showModal.value = false
    await loadData()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function handleDelete(id: string) {
  try {
    await deleteStaff(id)
    message.success('删除成功')
    await loadData()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(loadData)
</script>

<template>
  <n-card title="人员管理">
    <n-space
      vertical
      size="large"
    >
      <n-space>
        <n-button
          type="primary"
          @click="openCreate"
        >
          新增人员
        </n-button>
      </n-space>

      <n-data-table
        :columns="columns"
        :data="staff"
        :loading="loading"
        :bordered="false"
      />
    </n-space>

    <n-modal
      v-model:show="showModal"
      :title="editingId ? '编辑人员' : '新增人员'"
      preset="dialog"
      positive-text="保存"
      negative-text="取消"
      @positive-click="handleSubmit"
      @negative-click="showModal = false"
    >
      <n-form class="mt-4">
        <n-form-item label="账号">
          <n-input
            v-model:value="form.username"
            placeholder="请输入登录账号"
          />
        </n-form-item>
        <n-form-item label="姓名">
          <n-input
            v-model:value="form.name"
            placeholder="请输入姓名"
          />
        </n-form-item>
        <n-form-item label="电话">
          <n-input
            v-model:value="form.phone"
            placeholder="请输入电话"
          />
        </n-form-item>
        <n-form-item label="密码">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            v-model:value="form.status"
            :options="statusOptions"
          />
        </n-form-item>
      </n-form>
    </n-modal>
  </n-card>
</template>
