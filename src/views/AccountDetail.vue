<template>
  <div class="account-detail">
<div class="detail-header">
  <el-page-header @back="goBack">
    <template #content>
      <span class="account-title">账户详情 - {{ account.acct_id || account.id }}</span>
    </template>
  </el-page-header>
</div>

<div class="detail-content">
  <el-row :gutter="20">
    <el-col :span="16">
      <div class="info-section">
        <h3>基础信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="账户ID">{{ account.acct_id || account.id }}</el-descriptions-item>
          <el-descriptions-item label="风险评分">
            <span :style="{color: getRiskColor(account.riskScore)}">{{ account.riskScore }}分</span>
          </el-descriptions-item>
          <el-descriptions-item label="账户类型">{{ account.role === 'core' ? '核心成员' : '普通成员' }}</el-descriptions-item>
          <el-descriptions-item label="团伙标签">{{ account.group_id || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="info-section">
        <h3>风险评分拆解</h3>
        <div class="risk-score-overview">
          <div class="total-score">
            <el-progress 
              type="circle" 
              :percentage="account.riskScore" 
              :width="120"
              :color="getRiskColor(account.riskScore)"
            />
            <div class="score-label">总风险评分</div>
            <div class="score-value">{{ account.riskScore }}分</div>
          </div>
          <div class="score-breakdown">
            <div class="breakdown-item">
              <span>交易频次</span>
              <el-rate v-model="account.riskFactors.frequency" :max="5" disabled />
              <span class="score">{{ account.riskFactors.frequency * 20 }}分</span>
            </div>
            <div class="breakdown-item">
              <span>关联账户数</span>
              <el-rate v-model="account.riskFactors.connections" :max="5" disabled />
              <span class="score">{{ account.riskFactors.connections * 20 }}分</span>
            </div>
            <div class="breakdown-item">
              <span>异常模式</span>
              <el-rate v-model="account.riskFactors.patterns" :max="5" disabled />
              <span class="score">{{ account.riskFactors.patterns * 20 }}分</span>
            </div>
            <div class="breakdown-item">
              <span>历史记录</span>
              <el-rate v-model="account.riskFactors.history" :max="5" disabled />
              <span class="score">{{ account.riskFactors.history * 20 }}分</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-header">
          <h3>命中规则</h3>
          <el-tag type="danger">版本号: {{ account.ruleVersion }}</el-tag>
        </div>
        <el-table :data="account.rules" style="width: 100%" class="rules-table">
          <el-table-column prop="id" label="规则ID" width="120" />
          <el-table-column prop="name" label="规则名称" />
          <el-table-column prop="description" label="规则描述" />
          <el-table-column prop="triggerTime" label="触发时间" width="180" />
          <el-table-column prop="level" label="风险等级" width="100">
            <template #default="scope">
              <el-tag :type="getRuleLevelType(scope.row.level)">
                {{ scope.row.level }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>

    <el-col :span="8">
      <div class="info-section">
        <div class="section-header">
          <h3>关联交易图谱</h3>
          <el-tag type="warning">生成时间: {{ account.graphGeneratedTime }}</el-tag>
        </div>
        <div ref="transactionGraph" class="transaction-graph"></div>
        <div class="graph-legend">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #ff4d4f;"></div>
            <span>当前账户</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #1890ff;"></div>
            <span>关联账户</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #52c41a;"></div>
            <span>核心账户</span>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import * as d3 from 'd3'

const props = defineProps({
  id: {
type: String,
required: true
  }
})

const router = useRouter()

// 账户数据
const account = ref({
  id: props.id,
  acct_id: '',
  group_id: '',
  role: 'member',
  riskScore: 60,
  institution: '核心银行001',
  registerTime: '2023-05-15',
  balance: 1250000,
  riskFactors: {
frequency: 3,
connections: 3,
patterns: 3,
history: 3
  },
  ruleVersion: 'v2.3.1',
  graphGeneratedTime: '2025-11-09 14:30:25',
  rules: [
{ id: 'RULE0001', name: '高频交易模式', description: '账户在短时间内发生大量交易', triggerTime: '2025-11-09 10:25:45', level: '高' },
{ id: 'RULE0012', name: '异常资金流向', description: '资金流向多个高风险账户', triggerTime: '2025-11-08 16:42:18', level: '高' },
{ id: 'RULE0045', name: '多账户关联', description: '与10个以上账户存在频繁交易', triggerTime: '2025-11-07 09:15:33', level: '中' },
{ id: 'RULE0078', name: '夜间交易模式', description: '在深夜时段发生大额交易', triggerTime: '2025-11-06 23:55:22', level: '中' }
  ]
})

// 交易数据存储
const accountTransactions = ref([])

// 生成风险评分（根据角色生成不同范围的评分）
const generateRiskScore = (role) => {
  if (role === 'core') {
    // 核心成员风险评分较高
    return Math.floor(Math.random() * 30) + 70 // 70-99
  } else {
    // 普通成员风险评分中等
    return Math.floor(Math.random() * 40) + 40 // 40-79
  }
}

// 从CSV文件加载账户数据和交易数据
const loadAccountData = async () => {
  try {
    // 同时加载节点数据和交易数据
    const [nodesResponse, edgesResponse] = await Promise.all([
      fetch('/src/data/group_nodes.csv'),
      fetch('/src/data/group_edges.csv')
    ]);
    
    if (!nodesResponse.ok || !edgesResponse.ok) {
      throw new Error(`HTTP error! nodes: ${nodesResponse.status}, edges: ${edgesResponse.status}`);
    }
    
    const nodesText = await nodesResponse.text();
    const edgesText = await edgesResponse.text();
    
    // 解析CSV数据
    const parseCSV = (csvText) => {
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      return lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
    };
    
    const nodesData = parseCSV(nodesText);
    const edgesData = parseCSV(edgesText);
    
    // 查找与当前账户ID匹配的记录
    const accountRecord = nodesData.find(record => record.acct_id === props.id);
    
    if (accountRecord) {
      // 更新账户数据
      account.value = {
        ...account.value,
        acct_id: accountRecord.acct_id,
        group_id: accountRecord.group_id,
        role: accountRecord.role,
        riskScore: generateRiskScore(accountRecord.role)
      };
      
      // 根据风险评分更新风险因素
      const baseScore = Math.floor(account.value.riskScore / 20);
      account.value.riskFactors = {
        frequency: Math.min(5, baseScore + Math.floor(Math.random() * 2)),
        connections: Math.min(5, baseScore + Math.floor(Math.random() * 2)),
        patterns: Math.min(5, baseScore + Math.floor(Math.random() * 2)),
        history: Math.min(5, baseScore + Math.floor(Math.random() * 2))
      };
    }
    
    // 存储交易数据
    accountTransactions.value = edgesData;
    
  } catch (error) {
    console.error('加载数据时出错:', error);
    // 如果CSV文件加载失败，使用默认模拟数据
    console.log('使用默认模拟数据');
  }
}

// 图相关
const transactionGraph = ref(null)
let svg = null
let simulation = null

// 获取风险颜色
const getRiskColor = (score) => {
  if (score >= 80) return '#ff4d4f'
  if (score >= 60) return '#faad14'
  return '#52c41a'
}

// 获取规则等级类型
const getRuleLevelType = (level) => {
  const typeMap = {
'高': 'danger',
'中': 'warning',
'低': 'success'
  }
  return typeMap[level] || 'info'
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 初始化交易图谱
const initTransactionGraph = () => {
  if (!transactionGraph.value || accountTransactions.value.length === 0) return

  // 清除之前的图
  d3.select(transactionGraph.value).selectAll("*").remove()

  // 设置SVG
  const width = transactionGraph.value.clientWidth
  const height = 300

  svg = d3.select(transactionGraph.value)
.append("svg")
.attr("width", width)
.attr("height", height)

  // 创建模拟器
  simulation = d3.forceSimulation()
.force("link", d3.forceLink().id(d => d.id).distance(80))
.force("charge", d3.forceManyBody().strength(-200))
.force("center", d3.forceCenter(width / 2, height / 2))

  // 从真实交易数据构建图谱数据
  const currentAccountId = account.value.acct_id || account.value.id;
  
  // 筛选与当前账户相关的交易
  const relatedTransactions = accountTransactions.value.filter(tx => 
    tx.source === currentAccountId || tx.target === currentAccountId
  );
  
  // 获取所有涉及的账户ID
  const accountIds = new Set([currentAccountId]);
  relatedTransactions.forEach(tx => {
    accountIds.add(tx.source);
    accountIds.add(tx.target);
  });
  
  // 构建节点数据
  const nodes = Array.from(accountIds).map(id => {
    return {
      id: id,
      isCurrent: id === currentAccountId,
      isCore: id === currentAccountId ? account.value.role === 'core' : false // 简化处理，只对当前账户判断是否为core
    };
  });
  
  // 构建边数据
  const links = relatedTransactions.map(tx => ({
    source: tx.source,
    target: tx.target,
    amount: parseFloat(tx.amount)
  }));
  
  const graphData = { nodes, links };
  
  // 如果没有相关交易，使用模拟数据作为备选
  if (links.length === 0) {
    graphData.nodes = [
      { id: currentAccountId, isCurrent: true, isCore: account.value.role === 'core' },
      { id: "ACC000012", isCurrent: false, isCore: false },
      { id: "ACC000045", isCurrent: false, isCore: true },
      { id: "ACC000078", isCurrent: false, isCore: false }
    ];
    graphData.links = [
      { source: currentAccountId, target: "ACC000012", amount: 50000 },
      { source: currentAccountId, target: "ACC000045", amount: 75000 }
    ];
  }

  // 绘制边
  const link = svg.append("g")
.attr("class", "links")
.selectAll("line")
.data(graphData.links)
.enter()
.append("line")
.attr("stroke", "#434d5c")
.attr("stroke-width", 1.5)

  // 绘制节点
  const node = svg.append("g")
.attr("class", "nodes")
.selectAll("circle")
.data(graphData.nodes)
.enter()
.append("circle")
.attr("r", d => d.isCurrent ? 12 : (d.isCore ? 10 : 8))
.attr("fill", d => {
  if (d.isCurrent) return "#ff4d4f"
  if (d.isCore) return "#52c41a"
  return "#1890ff"
})
.attr("stroke", d => d.isCurrent ? "#ff4d4f" : "#434d5c")
.attr("stroke-width", d => d.isCurrent ? 3 : 1)
.call(drag(simulation))
.on("click", (event, d) => {
  if (!d.isCurrent) {
    // 在新标签页中打开关联账户详情
    const routeData = router.resolve({ name: 'AccountDetail', params: { id: d.id } })
    window.open(routeData.href, '_blank')
  }
})

  // 节点标签
  const text = svg.append("g")
.attr("class", "labels")
.selectAll("text")
.data(graphData.nodes)
.enter()
.append("text")
.text(d => d.id)
.attr("font-size", 10)
.attr("dx", 12)
.attr("dy", 4)
.attr("fill", "#e0e0e0")

  // 更新位置
  simulation
.nodes(graphData.nodes)
.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)

  text
    .attr("x", d => d.x)
    .attr("y", d => d.y)
})

  simulation.force("link")
.links(graphData.links)
}

// 拖拽功能
const drag = (simulation) => {
  function dragstarted(event) {
if (!event.active) simulation.alphaTarget(0.3).restart()
event.subject.fx = event.subject.x
event.subject.fy = event.subject.y
  }

  function dragged(event) {
event.subject.fx = event.x
event.subject.fy = event.y
  }

  function dragended(event) {
if (!event.active) simulation.alphaTarget(0)
event.subject.fx = null
event.subject.fy = null
  }

  return d3.drag()
.on("start", dragstarted)
.on("drag", dragged)
.on("end", dragended)
}

// 窗口大小调整
const handleResize = () => {
  if (svg) {
const width = transactionGraph.value.clientWidth
const height = 300
svg.attr("width", width).attr("height", height)
simulation.force("center", d3.forceCenter(width / 2, height / 2))
simulation.alpha(0.3).restart()
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  try {
    await loadAccountData()
    
    // 等待交易数据加载完成后初始化交易图谱
    const checkTransactionsReady = () => {
      if (accountTransactions.value.length > 0) {
        setTimeout(() => {
          initTransactionGraph()
        }, 100)
      } else {
        // 如果交易数据还没加载完成，等待100ms后重试
        setTimeout(checkTransactionsReady, 100)
      }
    }
    checkTransactionsReady()
  } catch (error) {
    console.error('初始化组件时出错:', error)
  }
  
  window.addEventListener('resize', handleResize)
})

// 组件卸载前
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (simulation) {
simulation.stop()
  }
})
</script>

<style src="./AccountDetail.less" scoped></style>
