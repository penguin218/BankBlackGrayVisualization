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
                <el-option label="高风险 (0.7~1)" value="high" />
                <el-option label="中风险 (0.3~0.7)" value="medium" />
                <el-option label="低风险 (0~0.3)" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="账户类型">
              <el-select v-model="filterForm.accountType" placeholder="请选择账户类型" clearable>
                <el-option label="无关" value="safe" />
                <el-option label="灰名单" value="grey" />
                <el-option label="黑系" value="black" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否是核心账户">
              <el-select v-model="filterForm.isCore" placeholder="请选择" clearable>
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="团伙标签">
              <el-input v-model="filterForm.groupTag" placeholder="请输入团伙标签" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="12">
            <el-form-item label="" label-width="0">
              <div style="width:100%;display:flex;justify-content:flex-end;">
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
                <el-button type="success" @click="handleExport" :loading="exportLoading">导出CSV</el-button>
              </div>
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
        <el-table-column prop="id" label="账户ID" width="160" />
        <el-table-column prop="acct_risk_score" width="160" header-align="center">
          <template #header>
            <div style="display:flex;align-items:center;justify-content:center;">
              <span>风险分</span>
              <span style="margin-left:6px;display:flex;flex-direction:column;line-height:1;">
                <span :style="{ cursor: 'pointer', fontSize: '12px', color: sortOrder === 'asc' ? '#52c41a' : '#909399' }" @click.stop="setSort('asc')">↑</span>
                <span :style="{ cursor: 'pointer', fontSize: '12px', color: sortOrder === 'desc' ? '#52c41a' : '#909399' }" @click.stop="setSort('desc')">↓</span>
              </span>
            </div>
          </template>
          <template #default="scope">
            <span style="color:#000000">{{ Number(scope.row.acct_risk_score ?? 0).toFixed(3) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="acct_risk_level_name" label="账户类型" width="140">
          <template #default="scope">
            <el-tag :color="getRiskLevelTagColor(scope.row.acct_risk_level_name)" effect="dark" :style="{ color: '#ffffff' }">
              {{ getRiskLevelLabel(scope.row.acct_risk_level_name) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="acct_is_core" label="是否是核心账户" width="160">
          <template #default="scope">
            <el-tag :color="getCoreTagColor(scope.row.acct_is_core)" text-color="#ffffff">
              {{ isCoreLabel(scope.row.acct_is_core) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="group_id" label="团伙标签" width="160">
          <template #default="scope">
            <el-tag :color="getGroupTagColor(scope.row.group_id)" text-color="#ffffff">
              {{ scope.row.group_id }}
            </el-tag>
          </template>
        </el-table-column>
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
  accountType: '',
  isCore: '',
  groupTag: ''
})



// 表格数据
const tableData = ref([])
const allNodes = ref([])
const loading = ref(false)
const exportLoading = ref(false)
const sortOrder = ref('')
const setSort = (order) => {
  sortOrder.value = order
  pagination.value.currentPage = 1
  handleSearch()
}

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
    const response = await fetch('/src/data/frontend_nodes_ext_filtered_by_edges.csv')
    if (!response.ok) {
      throw new Error('Failed to load CSV file')
    }
    const csvText = await response.text()
    const nodes = parseCSV(csvText)
    
    // 转换为表格所需格式并添加额外信息
    allNodes.value = nodes.map(node => ({
      id: node.id,
      acct_risk_score: parseFloat(node.acct_risk_score),
      riskScore: Math.round(parseFloat(node.acct_risk_score || 0) * 100),
      acct_risk_level_name: node.acct_risk_level_name,
      acct_is_core: String(node.acct_is_core),
      group_id: node.group_id,
      groupTag: node.group_id
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

// 风险类型标签颜色
const getRiskLevelTagColor = (level) => {
  const v = String(level || '').toLowerCase()
  if (v === 'safe') return '#52c41a'
  if (v === 'grey') return '#8c8c8c'
  if (v === 'black') return '#000000'
  return '#909399'
}

// 风险类型中文标签
const getRiskLevelLabel = (level) => {
  const v = String(level || '').toLowerCase()
  if (v === 'safe') return '无关'
  if (v === 'grey') return '灰名单'
  if (v === 'black') return '黑系'
  return level || '未知'
}

// 核心账户中文映射
const isCoreLabel = (val) => {
  const v = String(val || '').toLowerCase()
  if (v === 'true' || v === '1') return '是'
  if (v === 'false' || v === '0') return '否'
  return val ? '是' : '否'
}

const getCoreTagColor = (val) => {
  const v = String(val || '').toLowerCase()
  if (v === 'true' || v === '1') return '#faad14'
  if (v === 'false' || v === '0') return '#909399'
  return '#909399'
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
        item.id === filterForm.value.accountId
      )
    }
    
    if (filterForm.value.groupTag) {
      filteredData = filteredData.filter(item => 
        item.groupTag === filterForm.value.groupTag
      )
    }

    if (filterForm.value.isCore) {
      const wantCore = filterForm.value.isCore === 'true'
      filteredData = filteredData.filter(item => {
        const s = String(item.acct_is_core).toLowerCase()
        const isCore = s === 'true' || s === '1'
        return isCore === wantCore
      })
    }
    
    // 风险等级筛选（依据 acct_risk_score 0~1）
    if (filterForm.value.riskLevel) {
      filteredData = filteredData.filter(item => {
        const r = parseFloat(item.acct_risk_score)
        if (isNaN(r)) return false
        if (filterForm.value.riskLevel === 'high') return r >= 0.7 && r <= 1
        if (filterForm.value.riskLevel === 'medium') return r >= 0.3 && r < 0.7
        if (filterForm.value.riskLevel === 'low') return r >= 0 && r < 0.3
        return true
      })
    }
    if (filterForm.value.accountType) {
      filteredData = filteredData.filter(item => {
        const v = String(item.acct_risk_level_name || '').toLowerCase()
        return v === filterForm.value.accountType
      })
    }
    
    if (sortOrder.value === 'asc') {
      filteredData.sort((a, b) => {
        const va = isNaN(a.acct_risk_score) ? 0 : a.acct_risk_score
        const vb = isNaN(b.acct_risk_score) ? 0 : b.acct_risk_score
        return va - vb
      })
    } else if (sortOrder.value === 'desc') {
      filteredData.sort((a, b) => {
        const va = isNaN(a.acct_risk_score) ? 0 : a.acct_risk_score
        const vb = isNaN(b.acct_risk_score) ? 0 : b.acct_risk_score
        return vb - va
      })
    }
    pagination.value.total = filteredData.length
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
    accountType: '',
    isCore: '',
    groupTag: ''
  }
  sortOrder.value = ''
  pagination.value.currentPage = 1
  handleSearch()
}

// 导出处理
const handleExport = () => {
  exportLoading.value = true
  try {
    let filteredData = [...allNodes.value]
    if (filterForm.value.accountId) {
      filteredData = filteredData.filter(item => item.id === filterForm.value.accountId)
    }
    if (filterForm.value.groupTag) {
      filteredData = filteredData.filter(item => item.groupTag === filterForm.value.groupTag)
    }
    if (filterForm.value.isCore) {
      const wantCore = filterForm.value.isCore === 'true'
      filteredData = filteredData.filter(item => {
        const s = String(item.acct_is_core).toLowerCase()
        const isCore = s === 'true' || s === '1'
        return isCore === wantCore
      })
    }
    if (filterForm.value.riskLevel) {
      filteredData = filteredData.filter(item => {
        const r = parseFloat(item.acct_risk_score)
        if (isNaN(r)) return false
        if (filterForm.value.riskLevel === 'high') return r >= 0.7 && r <= 1
        if (filterForm.value.riskLevel === 'medium') return r >= 0.3 && r < 0.7
        if (filterForm.value.riskLevel === 'low') return r >= 0 && r < 0.3
        return true
      })
    }
    if (filterForm.value.accountType) {
      filteredData = filteredData.filter(item => {
        const v = String(item.acct_risk_level_name || '').toLowerCase()
        return v === filterForm.value.accountType
      })
    }
    if (sortOrder.value === 'asc') {
      filteredData.sort((a, b) => {
        const va = isNaN(a.acct_risk_score) ? 0 : a.acct_risk_score
        const vb = isNaN(b.acct_risk_score) ? 0 : b.acct_risk_score
        return va - vb
      })
    } else if (sortOrder.value === 'desc') {
      filteredData.sort((a, b) => {
        const va = isNaN(a.acct_risk_score) ? 0 : a.acct_risk_score
        const vb = isNaN(b.acct_risk_score) ? 0 : b.acct_risk_score
        return vb - va
      })
    }

    const headers = ['ID','风险分','账户类型','是否是核心账户','团伙标签']
    const escape = (v) => {
      const s = String(v ?? '')
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
    }
    const rows = filteredData.map(item => [
      item.id,
      isNaN(item.acct_risk_score) ? '' : Number(item.acct_risk_score).toFixed(3),
      getRiskLevelLabel(item.acct_risk_level_name),
      isCoreLabel(item.acct_is_core),
      item.group_id
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const now = new Date()
    const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`
    const a = document.createElement('a')
    a.href = url
    a.download = `账户列表_${ts}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    console.error('导出失败:', e)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
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
