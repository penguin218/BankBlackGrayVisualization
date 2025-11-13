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
                <el-option v-for="tag in groupTagOptions" :key="tag.value" :label="tag.label" :value="tag.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="" class="filter-actions">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="success" @click="handleExport" :loading="exportLoading">导出CSV</el-button>
            </el-form-item>
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
        <el-table-column prop="role" label="账户类型" width="100">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ getRoleLabel(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="groupTag" label="团伙标签" width="120">
          <template #default="scope">
            <el-tag :color="getGroupTagColor(scope.row.groupTag)" text-color="#ffffff">
              {{ scope.row.groupTag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerIp" label="注册IP" width="150" />
        <el-table-column prop="deviceId" label="设备ID" width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <!-- 最后更新时间列已移除 -->
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 筛选表单
const filterForm = ref({
  accountId: '',
  riskLevel: '',
  groupTag: ''
})

// 团伙标签选项列表
const groupTagOptions = ref([])

// 表格数据
const tableData = ref([])
const allNodes = ref([])
const loading = ref(false)
const exportLoading = ref(false)

// 解析CSV数据
const parseCSV = (csvString) => {
  const lines = csvString.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : ''
    })
    return row
  })
}

// 读取CSV文件
const loadCSVData = async () => {
  try {
    const response = await fetch('/src/data/group_nodes.csv')
    if (!response.ok) {
      throw new Error('Failed to load CSV file')
    }
    const csvText = await response.text()
    const nodes = parseCSV(csvText)
    
    // 转换为表格所需格式并添加额外信息
    allNodes.value = nodes.map(node => ({
      id: node.acct_id,
      groupTag: node.group_id,
      riskScore: Math.floor(Math.random() * 100), // 模拟风险分数
      registerIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, // 模拟IP
      deviceId: `DEVICE${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`, // 模拟设备ID
      phone: `1${Math.floor(Math.random() * 9) + 3}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`, // 模拟手机号
      role: node.role // 从CSV中直接读取的账户类型
    }))
    
    // 从CSV数据中提取唯一的团伙标签并设置到下拉选项中
    const uniqueGroupTags = [...new Set(nodes.map(node => node.group_id))]
    groupTagOptions.value = uniqueGroupTags.map(tag => ({
      label: tag,
      value: tag
    }))
  } catch (error) {
    console.error('Error loading CSV data:', error)
    ElMessage.error('加载数据失败')
  }
}

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
  // 预设颜色数组，为不同的团伙提供丰富的颜色选项
  const colors = [
    '#f5222d', // 红色
    '#fa8c16', // 橙色
    '#faad14', // 黄色
    '#52c41a', // 绿色
    '#1890ff', // 蓝色
    '#722ed1', // 紫色
    '#eb2f96', // 粉色
    '#13c2c2', // 青色
    '#fa541c', // 橘红色
    '#2f54eb'  // 深蓝色
  ]
  
  // 如果是groupA/B/C这样的标签，保持原有映射
  const legacyMap = {
    'groupA': '#52c41a',
    'groupB': '#1890ff',
    'groupC': '#faad14'
  }
  
  if (legacyMap[tag]) {
    return legacyMap[tag]
  }
  
  // 为CSV中的G20251108xx格式的团伙ID生成颜色
  // 提取ID的最后几位作为索引，或者使用简单的哈希算法
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // 确保索引在颜色数组范围内
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

// 获取账户类型标签样式
const getRoleTagType = (role) => {
  const typeMap = {
    'core': 'primary',
    'member': 'success'
  }
  return typeMap[role] || 'info'
}

// 获取账户类型显示文本
const getRoleLabel = (role) => {
  const labelMap = {
    'core': '核心账户',
    'member': '成员账户'
  }
  return labelMap[role] || '未知类型'
}

// 查询处理
const handleSearch = () => {
  loading.value = true
  // 模拟API调用延迟
  setTimeout(() => {
    let filteredData = [...allNodes.value]
    
    // 应用筛选条件
    if (filterForm.value.accountId) {
      filteredData = filteredData.filter(item => 
        item.id.toLowerCase().includes(filterForm.value.accountId.toLowerCase())
      )
    }
    
    if (filterForm.value.groupTag) {
      filteredData = filteredData.filter(item => 
        item.groupTag.includes(filterForm.value.groupTag)
      )
    }
    
    // 风险等级筛选（根据风险分数）
    if (filterForm.value.riskLevel) {
      if (filterForm.value.riskLevel === 'high') {
        filteredData = filteredData.filter(item => item.riskScore >= 80)
      } else if (filterForm.value.riskLevel === 'medium') {
        filteredData = filteredData.filter(item => item.riskScore >= 60 && item.riskScore < 80)
      } else if (filterForm.value.riskLevel === 'low') {
        filteredData = filteredData.filter(item => item.riskScore < 60)
      }
    }
    
    // 更新分页信息
    pagination.value.total = filteredData.length
    
    // 应用分页
    const startIndex = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const endIndex = startIndex + pagination.value.pageSize
    tableData.value = filteredData.slice(startIndex, endIndex)
    
    loading.value = false
  }, 300)
}

// 重置处理
const handleReset = () => {
  filterForm.value = {
    accountId: '',
    riskLevel: '',
    groupTag: ''
  }
  pagination.value.currentPage = 1
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
onMounted(async () => {
  loading.value = true
  await loadCSVData()
  handleSearch()
})
</script>

<style src="./AccountList.less" scoped></style>
