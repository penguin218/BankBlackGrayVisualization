<template>
  <div class="account-list">
    <div class="filter-section">
      <el-form :model="filterForm" label-width="100px" class="filter-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="账户ID">
              <el-input v-model="filterForm.accountId" placeholder="请输入账户ID" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="风险等级">
              <el-select v-model="filterForm.riskLevel" placeholder="请选择风险等级" clearable>
                <el-option label="高风险" value="high" />
                <el-option label="中风险" value="medium" />
                <el-option label="低风险" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="团伙标签">
              <el-select v-model="filterForm.groupTag" placeholder="请选择团伙标签" clearable>
                <el-option label="团伙A" value="groupA" />
                <el-option label="团伙B" value="groupB" />
                <el-option label="团伙C" value="groupC" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="交易时间">
              <el-date-picker
                v-model="filterForm.tradeTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="filter-actions">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleExport" :loading="exportLoading">导出CSV</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="table-section">
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        @row-click="handleRowClick"
        v-loading="loading"
        class="account-table"
      >
        <el-table-column prop="id" label="账户ID" width="180" />
        <el-table-column prop="riskScore" label="风险评分" width="100" sortable>
          <template #default="scope">
            <el-tag :type="getRiskTagType(scope.row.riskScore)">
              {{ scope.row.riskScore }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="groupTag" label="团伙标签" width="120">
          <template #default="scope">
            <el-tag :color="getGroupTagColor(scope.row.groupTag)">
              {{ scope.row.groupTag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerIp" label="注册IP" width="150" />
        <el-table-column prop="deviceId" label="设备ID" width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="lastUpdate" label="最后更新时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click.stop="viewDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 筛选表单
const filterForm = ref({
  accountId: '',
  riskLevel: '',
  groupTag: '',
  tradeTime: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const exportLoading = ref(false)

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 获取风险标签类型
const getRiskTagType = (score) => {
  if (score >= 80) return 'danger'
  if (score >= 60) return 'warning'
  return 'success'
}

// 获取团伙标签颜色
const getGroupTagColor = (tag) => {
  const colorMap = {
    'groupA': '#52c41a',
    'groupB': '#1890ff',
    'groupC': '#faad14'
  }
  return colorMap[tag] || '#722ed1'
}

// 查询处理
const handleSearch = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    // 模拟数据
    const mockData = []
    for (let i = 0; i < pagination.value.pageSize; i++) {
      const id = (pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1
      mockData.push({
        id: `ACC${String(id).padStart(6, '0')}`,
        riskScore: Math.floor(Math.random() * 100),
        groupTag: ['groupA', 'groupB', 'groupC'][Math.floor(Math.random() * 3)],
        registerIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        deviceId: `DEVICE${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
        phone: `1${Math.floor(Math.random() * 9) + 3}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        lastUpdate: `2025-11-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} 10:30:25`
      })
    }
    tableData.value = mockData
    pagination.value.total = 1000
    loading.value = false
  }, 500)
}

// 重置处理
const handleReset = () => {
  filterForm.value = {
    accountId: '',
    riskLevel: '',
    groupTag: '',
    tradeTime: ''
  }
  handleSearch()
}

// 导出处理
const handleExport = () => {
  exportLoading.value = true
  // 模拟导出过程
  setTimeout(() => {
    exportLoading.value = false
    ElMessage.success('导出成功')
  }, 1000)
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  handleSearch()
}

// 行点击处理
const handleRowClick = (row) => {
  router.push(`/account/${row.id}`)
}

// 查看详情
const viewDetail = (row) => {
  router.push(`/account/${row.id}`)
}

// 初始化数据
onMounted(() => {
  handleSearch()
})
</script>

<style src="./AccountList.less" scoped></style>
