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
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import {
  listCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  type Community,
} from '@/api/communities'

const message = useMessage()

const communities = ref<Community[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref<Community>({
  id: '',
  name: '',
  region: '',
  address: '',
  contactName: '',
  contactPhone: '',
  qrCode: '',
})

const columns: DataTableColumns<Community> = [
  { title: '社区名称', key: 'name' },
  { title: '区域', key: 'region' },
  { title: '地址', key: 'address', ellipsis: { tooltip: true } },
  { title: '联系人', key: 'contactName' },
  { title: '联系电话', key: 'contactPhone' },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render(row: Community) {
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
                default: () => '确定删除该社区吗？',
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
    communities.value = await listCommunities()
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    id: '',
    name: '',
    region: '',
    address: '',
    contactName: '',
    contactPhone: '',
    qrCode: '',
  }
  editingId.value = null
}

function openCreate() {
  resetForm()
  showModal.value = true
}

function openEdit(row: Community) {
  form.value = { ...row }
  editingId.value = row.id
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.name) {
    message.warning('请输入社区名称')
    return
  }
  try {
    if (editingId.value) {
      await updateCommunity(editingId.value, form.value)
      message.success('更新成功')
    } else {
      await createCommunity(form.value)
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
    await deleteCommunity(id)
    message.success('删除成功')
    await loadData()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(loadData)
</script>

<template>
  <n-card title="社区管理">
    <n-space
      vertical
      size="large"
    >
      <n-space>
        <n-button
          type="primary"
          @click="openCreate"
        >
          新增社区
        </n-button>
      </n-space>

      <n-data-table
        :columns="columns"
        :data="communities"
        :loading="loading"
        :bordered="false"
      />
    </n-space>

    <n-modal
      v-model:show="showModal"
      :title="editingId ? '编辑社区' : '新增社区'"
      preset="dialog"
      positive-text="保存"
      negative-text="取消"
      @positive-click="handleSubmit"
      @negative-click="showModal = false"
    >
      <n-form class="mt-4">
        <n-form-item label="社区名称">
          <n-input
            v-model:value="form.name"
            placeholder="请输入社区名称"
          />
        </n-form-item>
        <n-form-item label="区域">
          <n-input
            v-model:value="form.region"
            placeholder="请输入区域"
          />
        </n-form-item>
        <n-form-item label="地址">
          <n-input
            v-model:value="form.address"
            placeholder="请输入地址"
          />
        </n-form-item>
        <n-form-item label="联系人">
          <n-input
            v-model:value="form.contactName"
            placeholder="请输入联系人"
          />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input
            v-model:value="form.contactPhone"
            placeholder="请输入联系电话"
          />
        </n-form-item>
        <n-form-item label="二维码链接">
          <n-input
            v-model:value="form.qrCode"
            placeholder="请输入二维码链接"
          />
        </n-form-item>
      </n-form>
    </n-modal>
  </n-card>
</template>
