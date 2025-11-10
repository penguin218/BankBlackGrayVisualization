<template>
  <div class="rules-list">
<div class="filter-section">
  <el-form :model="filterForm" label-width="100px" class="filter-form">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="规则名称">
          <el-input v-model="filterForm.name" placeholder="请输入规则名称" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="规则状态">
          <el-select v-model="filterForm.status" placeholder="请选择规则状态" clearable>
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="风险等级">
          <el-select v-model="filterForm.riskLevel" placeholder="请选择风险等级" clearable>
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="filter-actions">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleExport" :loading="exportLoading">导出CSV</el-button>
        <el-button type="primary" @click="handleAddRule">新增规则</el-button>
      </el-col>
    </el-row>
  </el-form>
</div>

<div class="table-section">
  <el-table 
    :data="tableData" 
    style="width: 100%" 
    v-loading="loading"
    class="rules-table"
  >
    <el-table-column prop="id" label="规则ID" width="120" />
    <el-table-column prop="name" label="规则名称" width="200" />
    <el-table-column prop="description" label="规则描述" />
    <el-table-column prop="riskLevel" label="风险等级" width="100">
      <template #default="scope">
        <el-tag :type="getRiskTagType(scope.row.riskLevel)">
          {{ scope.row.riskLevel }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" width="100">
      <template #default="scope">
        <el-switch
          v-model="scope.row.status"
          active-value="enabled"
          inactive-value="disabled"
          @change="handleStatusChange(scope.row)"
        />
        <span :class="['status-text', scope.row.status]">
          {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="version" label="版本号" width="100" />
    <el-table-column prop="lastUpdate" label="最后更新" width="180" />
    <el-table-column label="操作" width="150">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

<!-- 规则编辑对话框 -->
<el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
  <el-form :model="ruleForm" :rules="rules" ref="ruleFormRef" label-width="100px">
    <el-form-item label="规则名称" prop="name">
      <el-input v-model="ruleForm.name" />
    </el-form-item>
    <el-form-item label="规则描述" prop="description">
      <el-input v-model="ruleForm.description" type="textarea" />
    </el-form-item>
    <el-form-item label="风险等级" prop="riskLevel">
      <el-select v-model="ruleForm.riskLevel" placeholder="请选择风险等级">
        <el-option label="高" value="high" />
        <el-option label="中" value="medium" />
        <el-option label="低" value="low" />
      </el-select>
    </el-form-item>
    <el-form-item label="规则表达式" prop="expression">
      <el-input v-model="ruleForm.expression" type="textarea" :rows="4" />
    </el-form-item>
    <el-form-item label="规则状态">
      <el-switch
        v-model="ruleForm.status"
        active-value="enabled"
        inactive-value="disabled"
      />
    </el-form-item>
  </el-form>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </span>
  </template>
</el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选表单
const filterForm = ref({
  name: '',
  status: '',
  riskLevel: ''
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

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 规则表单
const ruleForm = ref({
  id: '',
  name: '',
  description: '',
  riskLevel: 'medium',
  expression: '',
  status: 'enabled',
  version: '1.0.0',
  lastUpdate: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入规则描述', trigger: 'blur' }],
  riskLevel: [{ required: true, message: '请选择风险等级', trigger: 'change' }],
  expression: [{ required: true, message: '请输入规则表达式', trigger: 'blur' }]
}

const ruleFormRef = ref(null)

// 获取风险标签类型
const getRiskTagType = (level) => {
  const typeMap = {
'high': 'danger',
'medium': 'warning',
'low': 'success'
  }
  return typeMap[level] || 'info'
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
    id: `RULE${String(id).padStart(4, '0')}`,
    name: `规则${id}`,
    description: `这是规则${id}的详细描述信息`,
    riskLevel: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
    status: ['enabled', 'disabled'][Math.floor(Math.random() * 2)],
    version: `1.0.${Math.floor(Math.random() * 10)}`,
    lastUpdate: `2025-11-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} 10:30:25`
  })
}
tableData.value = mockData
pagination.value.total = 100
loading.value = false
  }, 500)
}

// 重置处理
const handleReset = () => {
  filterForm.value = {
name: '',
status: '',
riskLevel: ''
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

// 状态变更处理
const handleStatusChange = (row) => {
  ElMessage.success(`规则"${row.name}"已${row.status === 'enabled' ? '启用' : '禁用'}`)
}

// 新增规则
const handleAddRule = () => {
  dialogTitle.value = '新增规则'
  isEdit.value = false
  ruleForm.value = {
id: '',
name: '',
description: '',
riskLevel: 'medium',
expression: '',
status: 'enabled',
version: '1.0.0',
lastUpdate: ''
  }
  dialogVisible.value = true
}

// 编辑规则
const handleEdit = (row) => {
  dialogTitle.value = '编辑规则'
  isEdit.value = true
  ruleForm.value = { ...row }
  dialogVisible.value = true
}

// 保存规则
const handleSave = () => {
  ruleFormRef.value.validate((valid) => {
if (valid) {
  ElMessage.success(`${isEdit.value ? '编辑' : '新增'}规则成功`)
  dialogVisible.value = false
  handleSearch()
}
  })
}

// 删除规则
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除规则"${row.name}"吗？`, '提示', {
confirmButtonText: '确定',
cancelButtonText: '取消',
type: 'warning'
  }).then(() => {
ElMessage.success('删除成功')
handleSearch()
  }).catch(() => {
// 取消删除
  })
}

// 初始化数据
onMounted(() => {
  handleSearch()
})
</script>

<style src="./RulesList.less" scoped></style>
