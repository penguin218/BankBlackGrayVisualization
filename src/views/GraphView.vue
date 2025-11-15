<template>
  <div class="graph-view">
    <div class="graph-container">
      <div class="graph-controls">
        <div class="control-group">
          <h4>金额过滤</h4>
          <div class="amount-filter">
            <el-input 
              v-model="amountFilter.min" 
              placeholder="最小金额" 
              type="number"
              class="amount-input"
            >
              <template #prepend>¥</template>
            </el-input>
            <span class="separator">-</span>
            <el-input 
              v-model="amountFilter.max" 
              placeholder="最大金额" 
              type="number"
              class="amount-input"
            >
              <template #prepend>¥</template>
            </el-input>
            <el-button type="primary" @click="handleAmountFilter">查询</el-button>
          </div>
        </div>
        
        <div class="control-group">
          <h4>时间筛选</h4>
          <div class="time-filter">
            <el-date-picker
              v-model="timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              class="date-picker"
            />
            <el-button type="primary" @click="handleTimeFilter">查询</el-button>
          </div>
        </div>
        
        <div class="control-group">
          <h4>路径追踪</h4>
          <div class="path-tracking" style="display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;gap:6px;">
            <el-input 
              v-model="pathTracking.startNode" 
              placeholder="起始节点" 
              class="node-input"
              style="width:140px"
            />
            <el-input 
              v-model="pathTracking.endNode" 
              placeholder="终止节点" 
              class="node-input"
              style="width:140px"
            />
            <el-button type="primary" @click="handlePathTracking">查询</el-button>
          </div>
        </div>
        
        <div class="control-group">
          <h4>规则过滤</h4>
          <div class="rule-filter">
            <div class="rule-section">
              <h5>团伙识别规则</h5>
              <div class="rule-row" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
                  <span style="color:#cdd7e1;font-size:12px;">最小团伙规模</span>
                  <el-input-number v-model="ruleFilter.minGroupSize" :min="1" :max="100" :step="1" />
                </div>
                <div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
                  <span style="color:#cdd7e1;font-size:12px;">社区风险均值下限</span>
                  <el-input-number v-model="ruleFilter.minRiskMean" :min="0" :max="1" :step="0.01" />
                </div>
                <div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
                  <span style="color:#cdd7e1;font-size:12px;">社区最大风险下限</span>
                  <el-input-number v-model="ruleFilter.minRiskMax" :min="0" :max="1" :step="0.01" />
                </div>
                <el-button type="danger" @click="applyGroupRules">应用规则</el-button>
              </div>
            </div>
            <div class="rule-section" style="margin-top:8px;">
              <h5>账户风险评估规则</h5>
              <div class="rule-row" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
                  <span style="color:#cdd7e1;font-size:12px;">风险分阈值</span>
                  <el-input-number v-model="ruleFilter.riskScoreThreshold" :min="0" :max="1" :step="0.01" />
                </div>
                <div class="preset-buttons" style="display:flex;gap:6px;">
                  <el-button size="small" @click="ruleFilter.riskScoreThreshold = 0.6">0.6</el-button>
                  <el-button size="small" @click="ruleFilter.riskScoreThreshold = 0.7">0.7</el-button>
                  <el-button size="small" @click="ruleFilter.riskScoreThreshold = 0.75">0.75</el-button>
                  <el-button size="small" @click="ruleFilter.riskScoreThreshold = 0.8">0.8</el-button>
                </div>
                <el-button type="danger" @click="applyAccountRule">应用规则</el-button>
              </div>
            </div>
            <div class="rule-section" style="margin-top:8px;">
              <h5>异常交易规则</h5>
              <div class="rule-row" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
                  <span style="color:#cdd7e1;font-size:12px;">筛选方式</span>
                  <el-select v-model="ruleFilter.edgeFilterMode" style="width:140px">
                    <el-option label="Top %" value="top_percent" />
                    <el-option label="按阈值" value="score_threshold" />
                  </el-select>
                </div>
                <template v-if="ruleFilter.edgeFilterMode === 'top_percent'">
                  <div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
                    <span style="color:#cdd7e1;font-size:12px;">Top 百分比</span>
                    <el-select v-model="ruleFilter.edgeTopPercent" style="width:120px">
                      <el-option label="Top 1%" value="1" />
                      <el-option label="Top 0.5%" value="0.5" />
                      <el-option label="Top 0.1%" value="0.1" />
                    </el-select>
                  </div>
                </template>
                <template v-else>
                  <div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
                    <span style="color:#cdd7e1;font-size:12px;">边风险分阈值</span>
                    <el-input-number v-model="ruleFilter.edgeScoreThreshold" :min="0" :max="1" :step="0.01" />
                  </div>
                </template>
                <el-button type="danger" @click="applyEdgeRule">应用规则</el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="control-group">
          <h4>重置视图</h4>
          <el-button type="primary" @click="handleResetView">重置视图</el-button>
        </div>
      </div>
      
      <div ref="graphCanvas" class="graph-canvas"></div>
    </div>
    
    <!-- 节点详情展示栏 -->
    <div class="node-detail" v-if="selectedNode">
      <div class="detail-header">
        <h3>节点详情</h3>
        <el-button @click="selectedNode = null" type="info" size="small" circle>
          <i class="el-icon-close"></i>
        </el-button>
      </div>
      <div class="detail-content">
        <div class="detail-section">
        <h4>基础信息</h4>
        <el-descriptions :column="1" size="small">
          <el-descriptions-item label="账户ID">{{ selectedNode.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="团伙ID">{{ selectedNode.group_id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="风险等级">{{ formatRiskLevelName(selectedNode.riskLevelName) }}</el-descriptions-item>
          <el-descriptions-item label="风险分">{{ Number(selectedNode.acct_risk_score ?? selectedNode.riskScoreRaw ?? 0).toFixed(3) }}</el-descriptions-item>
          <el-descriptions-item label="净流出金额">¥{{ Number(selectedNode.txn_net_out_amt || 0).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="出入账金额比">{{ selectedNode.txn_out_in_ratio ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="PageRank">{{ selectedNode.graph_pr ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="入度">{{ selectedNode.graph_in_deg ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="出度">{{ selectedNode.graph_out_deg ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="加权出度">{{ selectedNode.graph_weighted_out_deg ?? '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="detail-section">
        <h4>关联交易</h4>
        <el-table :data="selectedNode.relatedTransactions || []" size="small" class="transactions-table">
          <el-table-column prop="counterparty" label="交易对手" />
          <el-table-column prop="amount" label="金额" width="100" align="right">
            <template #default="scope">
              ¥{{ (scope.row.amount || 0).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间" width="150" />
        </el-table>
        <div v-if="!(selectedNode.relatedTransactions && selectedNode.relatedTransactions.length)" class="no-data">
          暂无交易记录
        </div>
      </div>
      </div>
    </div>
    
    <!-- 边详情展示栏 -->
    <div class="edge-detail" v-if="selectedEdge">
      <div class="detail-header">
        <h3>边详情</h3>
        <el-button @click="selectedEdge = null" type="info" size="small" circle>
          <i class="el-icon-close"></i>
        </el-button>
      </div>
      <div class="detail-content">
        <div class="detail-section">
        <h4>交易信息</h4>
        <el-descriptions :column="1" size="small">
          <el-descriptions-item label="交易ID">{{ selectedEdge.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="源节点">{{ (typeof selectedEdge.source === 'object' ? selectedEdge.source.id : selectedEdge.source) || selectedEdge.sourceNodeInfo?.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="目标节点">{{ (typeof selectedEdge.target === 'object' ? selectedEdge.target.id : selectedEdge.target) || selectedEdge.targetNodeInfo?.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="总交易金额">¥{{ Number(selectedEdge.amount || 0).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="最近一次交易时间">{{ selectedEdge.txn_time || '-' }}</el-descriptions-item>
          <el-descriptions-item label="交易笔数">{{ selectedEdge.txn_cnt ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="单笔最大金额">¥{{ Number(selectedEdge.amount_max || 0).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="单笔最小金额">¥{{ Number(selectedEdge.amount_min || 0).toLocaleString() }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="detail-section">
        <h4>交易参与方信息</h4>
        <div class="participants-info">
          <div class="participant-card">
            <h5>源账户信息</h5>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="账户ID">{{ selectedEdge.sourceNodeInfo?.id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="所属社区">{{ selectedEdge.sourceNodeInfo?.group_id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="账户类型">{{ selectedEdge.sourceNodeInfo?.role || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="participant-card">
            <h5>目标账户信息</h5>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="账户ID">{{ selectedEdge.targetNodeInfo?.id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="所属社区">{{ selectedEdge.targetNodeInfo?.group_id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="账户类型">{{ selectedEdge.targetNodeInfo?.role || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import * as d3 from 'd3'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

// 控制参数
const amountFilter = reactive({
  min: 0,
  max: 0
})

const timeRange = ref(['2025-11-01', '2025-11-30'])

const pathTracking = reactive({
  startNode: '',
  endNode: ''
})
const ruleFilter = reactive({
  minGroupSize: 5,
  minRiskMean: 0.65,
  minRiskMax: 0.85,
  riskScoreThreshold: 0.7,
  edgeFilterMode: 'top_percent',
  edgeTopPercent: '1',
  edgeScoreThreshold: 0.7
})
const strToBool = (v) => {
  const s = String(v || '').toLowerCase()
  return s === 'true' || s === '1'
}
const highlightNodesRed = (nodeIdsSet) => {
  if (!graphG.value) return
  graphG.value.selectAll('.node circle')
    .attr('opacity', d => nodeIdsSet.has(d.id) ? 1 : 0.1)
    .attr('r', d => nodeIdsSet.has(d.id) ? 15 : d.size)
    .attr('stroke', d => nodeIdsSet.has(d.id) ? '#ff0000' : '#e2e2e2')
    .attr('stroke-width', d => nodeIdsSet.has(d.id) ? 4 : 1)
    .attr('fill', d => d.color)
  graphG.value.selectAll('.links line')
    .attr('opacity', d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source
      const t = typeof d.target === 'object' ? d.target.id : d.target
      return nodeIdsSet.has(s) || nodeIdsSet.has(t) ? 1 : 0.3
    })
    .attr('stroke', d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source
      const t = typeof d.target === 'object' ? d.target.id : d.target
      return nodeIdsSet.has(s) || nodeIdsSet.has(t) ? '#ff0000' : '#e2e2e2'
    })
    .attr('stroke-width', d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source
      const t = typeof d.target === 'object' ? d.target.id : d.target
      return nodeIdsSet.has(s) || nodeIdsSet.has(t) ? 2 : 1.5
    })
}
const highlightEdgesRed = (edgesToHighlight) => {
  if (!graphG.value || !edgesToHighlight || edgesToHighlight.length === 0) {
    ElMessage.warning('没有符合的交易边')
    return
  }
  const nodeIdsToHighlight = new Set()
  const edgeIdsToHighlight = new Set()
  edgesToHighlight.forEach(edge => {
    const s = typeof edge.source === 'object' ? edge.source.id : edge.source
    const t = typeof edge.target === 'object' ? edge.target.id : edge.target
    nodeIdsToHighlight.add(s)
    nodeIdsToHighlight.add(t)
    edgeIdsToHighlight.add(`${s}-${t}`)
    edgeIdsToHighlight.add(`${t}-${s}`)
  })
  graphG.value.selectAll('.node circle')
    .attr('opacity', d => nodeIdsToHighlight.has(d.id) ? 1 : 0.1)
    .attr('r', d => nodeIdsToHighlight.has(d.id) ? 15 : d.size)
    .attr('stroke', d => nodeIdsToHighlight.has(d.id) ? '#ff0000' : '#e2e2e2')
    .attr('stroke-width', d => nodeIdsToHighlight.has(d.id) ? 4 : 1)
    .attr('fill', d => d.color)
  graphG.value.selectAll('.links line')
    .attr('opacity', d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source
      const t = typeof d.target === 'object' ? d.target.id : d.target
      const e1 = `${s}-${t}`
      const e2 = `${t}-${s}`
      return edgeIdsToHighlight.has(e1) || edgeIdsToHighlight.has(e2) ? 1 : 0.3
    })
    .attr('stroke', d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source
      const t = typeof d.target === 'object' ? d.target.id : d.target
      const e1 = `${s}-${t}`
      const e2 = `${t}-${s}`
      return edgeIdsToHighlight.has(e1) || edgeIdsToHighlight.has(e2) ? '#ff0000' : '#e2e2e2'
    })
    .attr('stroke-width', d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source
      const t = typeof d.target === 'object' ? d.target.id : d.target
      const e1 = `${s}-${t}`
      const e2 = `${t}-${s}`
      return edgeIdsToHighlight.has(e1) || edgeIdsToHighlight.has(e2) ? 2 : 1.5
    })
  ElMessage.success(`找到 ${edgesToHighlight.length} 条异常交易边`)
}
const applyGroupRules = () => {
  if (!graphData || !Array.isArray(graphData.nodes)) {
    ElMessage.error('图数据未加载')
    return
  }
  const stats = new Map()
  graphData.nodes.forEach(n => {
    const gid = n.group_id
    if (!gid) return
    const s = stats.get(gid) || { size: 0, sum: 0, max: 0 }
    const r = isNaN(n.acct_risk_score) ? 0 : n.acct_risk_score
    s.size += 1
    s.sum += r
    s.max = Math.max(s.max, r)
    stats.set(gid, s)
  })
  const flagged = new Set(graphData.nodes.filter(n => strToBool(n.group_is_high_risk)).map(n => n.group_id))
  const highGroups = new Set()
  stats.forEach((s, gid) => {
    const mean = s.sum / s.size
    if (s.size >= ruleFilter.minGroupSize && mean >= ruleFilter.minRiskMean && s.max >= ruleFilter.minRiskMax) highGroups.add(gid)
  })
  flagged.forEach(gid => highGroups.add(gid))
  const nodeIds = new Set(graphData.nodes.filter(n => highGroups.has(n.group_id)).map(n => n.id))
  if (nodeIds.size === 0) {
    ElMessage.warning('未找到高风险团伙')
    return
  }
  highlightNodesRed(nodeIds)
}
const applyAccountRule = () => {
  if (!graphData || !Array.isArray(graphData.nodes)) return
  const th = ruleFilter.riskScoreThreshold
  const nodeIds = new Set(graphData.nodes.filter(n => !isNaN(n.acct_risk_score) && n.acct_risk_score >= th).map(n => n.id))
  if (nodeIds.size === 0) {
    ElMessage.warning('未找到高风险账户')
    return
  }
  highlightNodesRed(nodeIds)
}
const applyEdgeRule = () => {
  if (!graphData || !Array.isArray(graphData.edges)) return
  const list = graphData.edges.map(e => {
    const sId = typeof e.source === 'object' ? e.source.id : e.source
    const tId = typeof e.target === 'object' ? e.target.id : e.target
    const sNode = graphData.nodes.find(n => n.id === sId)
    const tNode = graphData.nodes.find(n => n.id === tId)
    const sScore = sNode && !isNaN(sNode.acct_risk_score) ? sNode.acct_risk_score : 0
    const tScore = tNode && !isNaN(tNode.acct_risk_score) ? tNode.acct_risk_score : 0
    const edgeRisk = Math.max(sScore, tScore)
    const hasBlack = (sNode?.riskLevelName === 'black') || (tNode?.riskLevelName === 'black')
    return { e, edgeRisk, hasBlack }
  }).filter(x => x.hasBlack)
  let selected = []
  if (ruleFilter.edgeFilterMode === 'top_percent') {
    const p = parseFloat(ruleFilter.edgeTopPercent)
    const sorted = list.sort((a, b) => b.edgeRisk - a.edgeRisk)
    const cnt = Math.max(1, Math.floor(sorted.length * (p / 100)))
    selected = sorted.slice(0, cnt).map(x => x.e)
  } else {
    const th = ruleFilter.edgeScoreThreshold
    selected = list.filter(x => x.edgeRisk >= th).map(x => x.e)
  }
  if (selected.length === 0) {
    ElMessage.warning('未找到异常交易边')
    return
  }
  highlightEdgesRed(selected)
}

// 图相关引用
const graphCanvas = ref(null)
const graphSimulation = ref(null)
const graphSvg = ref(null)
const graphG = ref(null)
let graphData = { nodes: [], edges: [] }
// 自适应缩放标志，确保只在第一次加载时执行
const autoFitDone = ref(false)

// 选中节点
const selectedNode = ref(null)
// 选中边
const selectedEdge = ref(null)

// 节点列表
const nodesList = ref([])

// 处理节点点击事件
const handleNodeClick = (event, d) => {
  // 阻止事件冒泡，防止触发svg的点击事件
  if (event) {
    event.stopPropagation();
  }
  
  // 清除选中的边
  selectedEdge.value = null;
  
  // 复制节点数据并添加关联交易信息
  const nodeDetail = { ...d };
  
  // 添加关联交易信息（从边数据中提取）
  if (graphData.edges && Array.isArray(graphData.edges)) {
    const relatedEdges = graphData.edges.filter(edge => {
      const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
      return s === d.id || t === d.id;
    });
    
    nodeDetail.relatedTransactions = relatedEdges.map(edge => {
      const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
      const counterpartyId = s === d.id ? t : s;
      const counterpartyNode = graphData.nodes.find(node => node.id === counterpartyId);
      return {
        counterparty: counterpartyNode?.id || counterpartyId,
        amount: edge.amount || Math.floor(Math.random() * 100000) + 1000,
        time: edge.time || new Date().toLocaleString('zh-CN')
      };
    });
  }
  
  // 设置选中的节点
  selectedNode.value = nodeDetail;
  
  // 高亮选中的节点和相关边
  highlightSelectedNode(d.id);
};

// 处理边点击事件
const handleEdgeClick = (event, edge) => {

  // 阻止事件冒泡，防止触发svg的点击事件
  if (event) event.stopPropagation();
  
  // 清除选中的节点
  selectedNode.value = null;
  
  // 复制边数据并添加两端节点的详细信息
  const edgeDetail = { ...edge };
  
  // 获取source和target的ID，处理可能是对象或字符串的情况
  const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
  const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
  
  // 查找源节点和目标节点的详细信息
  if (graphData.nodes && Array.isArray(graphData.nodes)) {
    edgeDetail.sourceNodeInfo = graphData.nodes.find(node => node.id === sourceId) || {};
    edgeDetail.targetNodeInfo = graphData.nodes.find(node => node.id === targetId) || {};
  }
  
  // 确保必要的交易信息存在
  if (!edgeDetail.amount) {
    edgeDetail.amount = Math.floor(Math.random() * 100000) + 1000;
  }
  if (!edgeDetail.time && edgeDetail.txn_time) {
    edgeDetail.time = edgeDetail.txn_time;
  }
  if (!edgeDetail.time) {
    edgeDetail.time = new Date().toLocaleString('zh-CN');
  }
  if (!edgeDetail.type && edgeDetail.category) {
    edgeDetail.type = edgeDetail.category;
  }
  if (!edgeDetail.type) {
    edgeDetail.type = '转账';
  }
  if (!edgeDetail.status) {
    edgeDetail.status = '成功';
  }
  
  // 设置选中的边
  selectedEdge.value = edgeDetail;
  
  // 高亮选中的边和相关节点
  highlightSelectedEdge(edgeDetail);
};

// 处理画布点击事件
const handleCanvasClick = () => {
  selectedNode.value = null;
  selectedEdge.value = null;
  if (!graphG.value) {
    return;
  }
  graphG.value.selectAll('.node circle')
    .attr('opacity', 1)
    .attr('r', d => d.size)
    .attr('stroke', d => getStrokeByRisk(d.riskLevelName))
    .attr('stroke-width', d => d.isCore ? 3 : 1);
  graphG.value.selectAll('.links line')
    .attr('opacity', 1)
    .attr('stroke', '#e2e2e2')
    .attr('stroke-width', 1.5);
};

// 高亮选中的节点
const highlightSelectedNode = (nodeId) => {
  if (!graphG.value) return;
  graphG.value.selectAll('.node circle')
    .attr('opacity', 0.4)
    .attr('r', d => d.size)
    .attr('stroke', d => getStrokeByRisk(d.riskLevelName))
    .attr('stroke-width', d => d.isCore ? 3 : 1);
  graphG.value.selectAll('.links line')
    .attr('opacity', 0.3)
    .attr('stroke', '#e2e2e2')
    .attr('stroke-width', 1.5);
  graphG.value.selectAll('.node circle')
    .filter(d => d.id === nodeId)
    .attr('opacity', 1)
    .attr('r', 15)
    .attr('stroke', '#1890ff')
    .attr('stroke-width', 4);
  const relatedNodeIds = new Set();
  if (graphData && Array.isArray(graphData.edges)) {
    graphData.edges.forEach(edge => {
      if (edge.source === nodeId) relatedNodeIds.add(edge.target);
      if (edge.target === nodeId) relatedNodeIds.add(edge.source);
    });
  }
  graphG.value.selectAll('.links line')
    .filter(d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      return sourceId === nodeId || targetId === nodeId;
    })
    .attr('opacity', 1)
    .attr('stroke', '#1890ff')
    .attr('stroke-width', 1.5);
  graphG.value.selectAll('.node circle')
    .filter(d => relatedNodeIds.has(d.id))
    .attr('opacity', 1)
    .attr('stroke', '#1890ff')
    .attr('stroke-width', 2);
};

// 高亮选中的边和两端节点
const highlightSelectedEdge = (edge) => {
  if (!graphG.value || !edge) return;
  const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
  const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
  graphG.value.selectAll('.links line')
    .attr('opacity', 0.4)
    .attr('stroke', '#e2e2e2')
    .attr('stroke-width', 1.5);
  graphG.value.selectAll('.node circle')
    .attr('opacity', 0.4)
    .attr('stroke', d => getStrokeByRisk(d.riskLevelName))
    .attr('stroke-width', d => d.isCore ? 3 : 1);
  graphG.value.selectAll('.links line').filter(d => {
    const dSourceId = typeof d.source === 'object' ? d.source.id : d.source;
    const dTargetId = typeof d.target === 'object' ? d.target.id : d.target;
    return (dSourceId === sourceId && dTargetId === targetId) || 
           (dSourceId === targetId && dTargetId === sourceId);
  })
    .attr('opacity', 1)
    .attr('stroke', '#ff0000')
    .attr('stroke-width', 3);
  graphG.value.selectAll('.node circle').filter(d => d.id === sourceId || d.id === targetId)
    .attr('opacity', 1)
    .attr('stroke', '#ff0000')
    .attr('stroke-width', 3);
};

// 添加一个测试函数用于手动触发边点击
const testEdgeClick = () => {
  if (graphData && Array.isArray(graphData.edges) && graphData.edges.length > 0) {
    const firstEdge = graphData.edges[0];
    console.log('手动测试边点击:', firstEdge);
    handleEdgeClick(null, firstEdge);
  }
};
// 暴露测试函数给全局，方便在浏览器控制台调用
window.testEdgeClick = testEdgeClick;

// 获取风险颜色
const getRiskColor = (score) => {
  if (score >= 80) return '#ff4d4f'
  if (score >= 60) return '#faad14'
  return '#52c41a'
}

const getStrokeByRisk = (level) => {
  const v = String(level || '').toLowerCase()
  if (v === 'safe') return '#ffffff'
  if (v === 'grey') return '#8c8c8c'
  if (v === 'black') return '#ff4d4f'
  return '#e0e0e0'
}

const formatRiskLevelName = (v) => {
  const s = String(v || '').toLowerCase()
  if (s === 'safe') return '无关'
  if (s === 'grey') return '灰系'
  if (s === 'black') return '黑名单'
  return v || '-'
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

// 高亮多条边和相关节点的通用函数
const highlightEdges = (edgesToHighlight) => {
  if (!graphG.value || !edgesToHighlight || edgesToHighlight.length === 0) {
    ElMessage.warning('没有找到符合条件的交易边');
    return;
  }

  const nodeIdsToHighlight = new Set();
  const edgeIdsToHighlight = new Set();

  edgesToHighlight.forEach(edge => {
    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
    nodeIdsToHighlight.add(sourceId);
    nodeIdsToHighlight.add(targetId);
    edgeIdsToHighlight.add(`${sourceId}-${targetId}`);
    edgeIdsToHighlight.add(`${targetId}-${sourceId}`);
  });

  graphG.value.selectAll('.node circle')
    .attr('opacity', d => nodeIdsToHighlight.has(d.id) ? 1 : 0.1)
    .attr('r', d => nodeIdsToHighlight.has(d.id) ? 15 : d.size)
    .attr('stroke', d => nodeIdsToHighlight.has(d.id) ? '#1890ff' : '#e2e2e2')
    .attr('stroke-width', d => nodeIdsToHighlight.has(d.id) ? 4 : 1)
    .attr('fill', d => d.color);

  graphG.value.selectAll('.links line')
    .attr('opacity', d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      return edgeIdsToHighlight.has(edgeId1) || edgeIdsToHighlight.has(edgeId2) ? 1 : 0.3;
    })
    .attr('stroke', d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      return edgeIdsToHighlight.has(edgeId1) || edgeIdsToHighlight.has(edgeId2) ? '#1890ff' : '#e2e2e2';
    })
    .attr('stroke-width', d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      return edgeIdsToHighlight.has(edgeId1) || edgeIdsToHighlight.has(edgeId2) ? 2 : 1.5;
    });

  ElMessage.success(`找到 ${edgesToHighlight.length} 条符合条件的交易边`);
};

// 金额过滤处理
const handleAmountFilter = () => {
  // 清除之前的选中状态
  selectedNode.value = null;
  selectedEdge.value = null;
  
  // 验证输入
  const minAmount = parseFloat(amountFilter.min) || 0;
  const maxAmount = parseFloat(amountFilter.max) || Infinity;
  
  if (minAmount > maxAmount) {
    ElMessage.warning('最小金额不能大于最大金额');
    return;
  }
  
  // 检查graphData是否有效
  if (!graphData || !Array.isArray(graphData.edges)) {
    ElMessage.error('图数据未加载或格式无效');
    return;
  }
  

  
  // 严格按照边的amount字段进行过滤
  const filteredEdges = graphData.edges.filter(edge => {
    // 确保只使用amount字段，不使用其他备选字段
    if (edge.amount === undefined || edge.amount === null) {
      return false;
    }
    const edgeAmount = parseFloat(edge.amount);
    const result = !isNaN(edgeAmount) && edgeAmount >= minAmount && edgeAmount <= maxAmount;
    // 记录过滤过程

    return result;
  });
  
  console.log('筛选后边数:', filteredEdges.length);
  
  // 高亮显示过滤后的边和相关节点
  highlightEdges(filteredEdges);
}

// 时间筛选处理
const handleTimeFilter = () => {
  // 清除之前的选中状态
  selectedNode.value = null;
  selectedEdge.value = null;
  
  // 验证日期输入
  if (!timeRange.value || timeRange.value.length !== 2) {
    ElMessage.warning('请选择有效的时间范围');
    return;
  }
  
  const startTime = new Date(timeRange.value[0]);
  const endTime = new Date(timeRange.value[1]);
  
  if (startTime > endTime) {
    ElMessage.warning('开始时间不能晚于结束时间');
    return;
  }
  
  // 检查graphData是否有效
  if (!graphData || !Array.isArray(graphData.edges)) {
    ElMessage.error('图数据未加载或格式无效');
    return;
  }
  
  // 严格按照边的txn_time字段进行过滤
  const filteredEdges = graphData.edges.filter(edge => {
    // 只使用txn_time字段，不使用其他备选字段
    if (!edge.txn_time) {
      return false;
    }
    
    try {
      const edgeTime = new Date(edge.txn_time);
      
      // 确保时间解析有效
      if (isNaN(edgeTime.getTime())) {
        return false;
      }
      
      // 设置时间范围的边界
      const startDate = new Date(startTime);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(endTime);
      endDate.setHours(23, 59, 59, 999);
      
      // 判断边的时间是否在时间范围内
      return edgeTime >= startDate && edgeTime <= endDate;
    } catch (error) {
      console.warn('解析txn_time失败:', edge.txn_time, error);
      return false;
    }
  });
  
  // 高亮显示过滤后的边和相关节点
  highlightEdges(filteredEdges);
}

// 路径追踪处理
const handlePathTracking = () => {
  if (!pathTracking.startNode || !pathTracking.endNode) {
    ElMessage.warning('请选择起始节点和终止节点')
    return
  }
  
  // 检查graphData是否有效且包含必要的数组
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges) || graphData.nodes.length === 0) {
    ElMessage.error('图数据未加载或格式无效')
    return
  }
  
  // 确保起始节点和终止节点存在（按 acct_id 查询）
  const startNodeExists = graphData.nodes.some(node => node.id === pathTracking.startNode);
  const endNodeExists = graphData.nodes.some(node => node.id === pathTracking.endNode);
  
  if (!startNodeExists) {
    ElMessage.warning(`起始节点 ${pathTracking.startNode} 不存在`)
    return
  }
  if (!endNodeExists) {
    ElMessage.warning(`终止节点 ${pathTracking.endNode} 不存在`)
    return
  }
  
  // 实现Dijkstra算法查找最短路径（将输入的 acct_id 映射为内部节点 id）
  const startNodeObj = graphData.nodes.find(node => node.id === pathTracking.startNode);
  const endNodeObj = graphData.nodes.find(node => node.id === pathTracking.endNode);
  const startId = startNodeObj?.id;
  const endId = endNodeObj?.id;
  const shortestPath = findShortestPath(graphData, startId, endId);
  
  if (shortestPath.length > 0 && shortestPath[0] === startId) {
    const acctPath = shortestPath.map(id => {
      const n = graphData.nodes.find(node => node.id === id);
      return n?.id || id;
    });
    const pathDetails = acctPath.join(' -> ');
    ElMessage.success(`找到从 ${pathTracking.startNode} 到 ${pathTracking.endNode} 的最短路径，长度: ${shortestPath.length - 1} 跳\n路径: ${pathDetails}`)
    highlightPath(shortestPath)
  } else {
    ElMessage.warning(`未找到从 ${pathTracking.startNode} 到 ${pathTracking.endNode} 的路径`)
  }
}

// Dijkstra算法实现
const findShortestPath = (data, startId, endId) => {
  const { nodes, edges } = data
  
  // 构建邻接表
  const adjacencyList = {}
  nodes.forEach(node => {
    adjacencyList[node.id] = []
  })
  
  edges.forEach(edge => {
    // 获取source和target的ID，处理可能是对象或字符串的情况
    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
    
    // 确保source和target节点存在于邻接表中
    if (adjacencyList[sourceId]) {
      adjacencyList[sourceId].push({
        target: targetId,
        weight: 1 // 假设边权重为1，实际可以根据需要修改
      })
    }
    // 如果是无向图，也添加反向边
    if (adjacencyList[targetId]) {
      adjacencyList[targetId].push({
        target: sourceId,
        weight: 1
      })
    }
  })
  
  // Dijkstra算法
  const distances = {}
  const previous = {}
  const visited = new Set()
  const pq = []
  
  // 初始化距离
  nodes.forEach(node => {
    distances[node.id] = node.id === startId ? 0 : Infinity
    pq.push({ id: node.id, distance: distances[node.id] })
  })
  
  // 简单的优先队列实现
  pq.sort((a, b) => a.distance - b.distance)
  
  while (pq.length > 0) {
    const current = pq.shift()
    
    if (current.id === endId) break
    if (visited.has(current.id)) continue
    
    visited.add(current.id)
    
    // 确保邻接节点列表存在
    if (adjacencyList[current.id]) {
      adjacencyList[current.id].forEach(neighbor => {
        if (visited.has(neighbor.target)) return
        
        const newDistance = distances[current.id] + neighbor.weight
        if (newDistance < distances[neighbor.target]) {
          distances[neighbor.target] = newDistance
          previous[neighbor.target] = current.id
          
          // 更新优先队列
          const index = pq.findIndex(node => node.id === neighbor.target)
          if (index !== -1) {
            pq[index].distance = newDistance
            pq.sort((a, b) => a.distance - b.distance)
          }
        }
      })
    }
  }
  
  // 构建路径
  const path = []
  let currentNode = endId
  
  while (currentNode) {
    path.unshift(currentNode)
    currentNode = previous[currentNode]
  }
  
  // 验证路径是否有效
  if (path.length === 0 || path[0] !== startId || path[path.length - 1] !== endId) {
    return []
  }
  
  return path
}

// 高亮显示路径，增强视觉对比
const highlightPath = (path) => {
  if (!graphG.value) return
  
  // 收集路径上的边
  const pathEdges = new Set()
  for (let i = 0; i < path.length - 1; i++) {
    const source = path[i]
    const target = path[i + 1]
    // 存储边的唯一标识，考虑无向图的情况
    const edgeId1 = `${source}-${target}`
    const edgeId2 = `${target}-${source}`
    pathEdges.add(edgeId1)
    pathEdges.add(edgeId2)
  }
  
  // 处理所有节点 - 采用与单击节点相同的高亮样式
  graphG.value.selectAll('.node circle')
    .attr('opacity', d => path.includes(d.id) ? 1 : 0.1)
    .attr('r', d => path.includes(d.id) ? 15 : d.size)
    .attr('stroke', d => path.includes(d.id) ? '#1890ff' : '#e2e2e2')
    .attr('stroke-width', d => path.includes(d.id) ? 4 : 1)
    .attr('fill', d => path.includes(d.id) ? d.color : d.color);
  graphG.value.selectAll('.links line')
    .attr('opacity', d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      return pathEdges.has(edgeId1) || pathEdges.has(edgeId2) ? 1 : 0.3;
    })
    .attr('stroke', d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      return pathEdges.has(edgeId1) || pathEdges.has(edgeId2) ? '#1890ff' : '#e2e2e2';
    })
    .attr('stroke-width', d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      return pathEdges.has(edgeId1) || pathEdges.has(edgeId2) ? 2 : 1.5;
    });
}

// 重置视图 - 直接刷新页面
const handleResetView = () => {
  // 直接刷新页面，相当于跳转回图谱分析页面
  window.location.reload();
};

// CSV解析函数
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim() || '';
    });
    return obj;
  });
};

// 初始化图
const initGraph = async () => {
  if (!graphCanvas.value) return

  // 清除之前的图
  graphCanvas.value.innerHTML = ''

  // 设置容器样式
  graphCanvas.value.id = 'container'

  try {
    let nodesCsv = '';
    let edgesCsv = '';
    try {
      const [fn, fe] = await Promise.all([
        fetch('/src/data/frontend_nodes_ext_filtered_by_edges.csv'),
        fetch('/src/data/frontend_edges_ext.csv')
      ]);
      if (fn.ok && fe.ok) {
        nodesCsv = await fn.text();
        edgesCsv = await fe.text();
      } else {
        throw new Error('fallback');
      }
    } catch (e1) {
      try {
        const [gn, ge] = await Promise.all([
          fetch('/src/data/group_nodes.csv'),
          fetch('/src/data/group_edges.csv')
        ]);
        if (gn.ok && ge.ok) {
          nodesCsv = await gn.text();
          edgesCsv = await ge.text();
        } else {
          throw new Error('fallback');
        }
      } catch (e2) {
        const [nn, ne] = await Promise.all([
          fetch('/src/data/nodes.csv'),
          fetch('/src/data/edges.csv')
        ]);
        if (!nn.ok || !ne.ok) {
          throw new Error('加载CSV文件失败');
        }
        nodesCsv = await nn.text();
        edgesCsv = await ne.text();
      }
    }
    
    // 解析CSV数据
    const nodesData = parseCSV(nodesCsv);
    const edgesData = parseCSV(edgesCsv);
    
    // 定义组颜色映射
    const groupColors = {};
    const colorPalette = ['#52c41a', '#1890ff', '#faad14', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16', '#f5222d'];
    
    const nodes = nodesData.map(node => {
      if (!groupColors[node.group_id]) {
        groupColors[node.group_id] = colorPalette[Object.keys(groupColors).length % colorPalette.length];
      }
      const isCore = (String(node.role).toLowerCase() === 'core') || (String(node.acct_is_core).toLowerCase() === 'true') || (String(node.acct_is_core) === '1');
      const riskScore = parseFloat(node.acct_risk_score);
      const normalized = isNaN(riskScore) ? 0.5 : Math.min(1, Math.max(0, riskScore));
      const size = 8 + normalized * 20;
      return {
        id: String(node.id),
        original_id: node.acct_id,
        group_id: node.group_id,
        acct_id: node.acct_id,
        role: node.role,
        riskLevelName: node.acct_risk_level_name,
        acct_risk_score: riskScore,
        txn_net_out_amt: parseFloat(node.txn_net_out_amt),
        txn_out_in_ratio: parseFloat(node.txn_out_in_ratio),
        graph_pr: parseFloat(node.graph_pr),
        graph_in_deg: parseInt(node.graph_in_deg),
        graph_out_deg: parseInt(node.graph_out_deg),
        graph_weighted_out_deg: parseFloat(node.graph_weighted_out_deg),
        group_is_high_risk: node.group_is_high_risk,
        isCore,
        size,
        color: (String(node.role).toLowerCase() === 'normal') ? '#ffffff' : groupColors[node.group_id]
      };
    });
    
    // 处理边数据并去重 - 只保留CSV中的字段，并将acct_id映射为节点id
    const acctToId = new Map(nodesData.map(n => [String(n.acct_id), String(n.id)]));
    const edgeMap = new Map();
    edgesData.forEach(edge => {
      const srcId = acctToId.get(String(edge.source)) ?? String(edge.source);
      const tgtId = acctToId.get(String(edge.target)) ?? String(edge.target);
      const edgeKey = `${srcId}-${tgtId}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          id: edge.id,
          source: srcId,
          target: tgtId,
          amount: parseFloat(edge.amount),
          txn_time: edge.txn_time,
          txn_cnt: edge.txn_cnt ? parseInt(edge.txn_cnt) : undefined,
          amount_max: edge.amount_max ? parseFloat(edge.amount_max) : undefined,
          amount_min: edge.amount_min ? parseFloat(edge.amount_min) : undefined,
          last_txn_time: edge.last_txn_time || edge.txn_time,
          category: edge.category
        });
      }
    });
    const nodeIdSet = new Set(nodes.map(n => String(n.id)));
    const edges = Array.from(edgeMap.values()).filter(e => nodeIdSet.has(String(e.source)) && nodeIdSet.has(String(e.target)));
    
    // 构建图数据
    graphData = { nodes, edges };
    
    // 保存节点列表用于下拉选择
    nodesList.value = nodes;

    // 设置图的尺寸
    const width = graphCanvas.value.clientWidth;
    const height = graphCanvas.value.clientHeight;
    
    // 创建SVG
    const svg = d3.select(graphCanvas.value)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // 创建一个g元素用于容纳所有内容
    const g = svg.append('g');
    
    // 创建缩放行为
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        if (g) g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // 创建力导向模拟（增加按 group 聚类的 X/Y 牵引）
    const isLargeGraph = nodes.length > 1000 || edges.length > 2000;
    const uniqueGroups = Array.from(new Set(nodes.map(n => n.group_id))).filter(g => g !== undefined && g !== null);
    const groupCenterMap = new Map();
    const radius = Math.min(width, height) * (uniqueGroups.length > 1 ? 0.35 : 0.0);
    uniqueGroups.forEach((gid, i) => {
      const angle = (2 * Math.PI * i) / uniqueGroups.length;
      const gx = width / 2 + radius * Math.cos(angle);
      const gy = height / 2 + radius * Math.sin(angle);
      groupCenterMap.set(gid, { x: gx, y: gy });
    });
    const clusterStrength = isLargeGraph ? 0.06 : 0.12;

    const simulation = d3.forceSimulation(nodes)
      .alphaDecay(isLargeGraph ? 0.12 : 0.03)
      .velocityDecay(isLargeGraph ? 0.6 : 0.4)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(isLargeGraph ? 40 : 100).strength(isLargeGraph ? 0.6 : 1))
      .force('charge', d3.forceManyBody().strength(isLargeGraph ? -80 : -220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('clusterX', d3.forceX(d => (groupCenterMap.get(d.group_id)?.x ?? width / 2)).strength(clusterStrength))
      .force('clusterY', d3.forceY(d => (groupCenterMap.get(d.group_id)?.y ?? height / 2)).strength(clusterStrength))
      .force('collision', isLargeGraph ? null : d3.forceCollide().radius(d => d.size + 5));
    
    // 绘制边 - 确保edges是有效的数组
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(Array.isArray(edges) ? edges : [])
      .join('line')
      .attr('stroke', '#e2e2e2')
      .attr('stroke-width', 1.5)
      .on('click', handleEdgeClick);
    
    // 绘制节点 - 确保nodes是有效的数组
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(Array.isArray(nodes) ? nodes : [])
      .join('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // 为每个节点添加圆形
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('fill-opacity', d => String(d.role).toLowerCase() === 'normal' ? 0.6 : 1)
      .attr('stroke', d => getStrokeByRisk(d.riskLevelName))
      .attr('stroke-width', d => d.isCore ? 3 : 1)
      .on('click', handleNodeClick);
    
    // 定义拖拽行为函数
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    let tickCount = 0;
    simulation.on('tick', () => {
      tickCount++;
      if (isLargeGraph && (tickCount % 2 !== 0)) return;
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
    
    // 保存引用
    graphSimulation.value = simulation;
    graphSvg.value = svg;
    graphG.value = g;
    
    // 存储图数据
    graphData = { nodes, edges };
    
    // 设置点击空白区域的事件
    svg.on('click', handleCanvasClick);
    
    // 图初始化完成后实现自适应缩放 - 仅在第一次加载时执行
    if (!autoFitDone.value) {
      // 使用更可靠的方法：直接在数据加载完成后延迟一段时间执行
      // 这样可以确保节点已经有了初始位置
      setTimeout(() => {
        // 先停止力导向模拟，避免在缩放过程中节点继续移动
        if (simulation) {
          simulation.stop();
        }
        // 执行自适应缩放
        autoFitGraph(svg, g, nodes, width, height);
        // 标记自适应缩放已完成
        autoFitDone.value = true;
        // 重新启动力导向模拟，但设置较低的alpha值以保持稳定
        if (simulation) {
          simulation.alpha(0.1).restart();
        }
      }, 800); // 增加延迟时间，确保力导向模拟有足够时间布局
    }
    
    // 继续初始化其他功能...
    // 注意：setupGraphEvents 需要根据D3进行相应调整
    
  } catch (error) {
    console.error('加载图数据失败:', error)
    ElMessage.error('加载CSV数据失败，使用模拟数据')
    
  }
}

// 图自适应缩放函数 - 重新实现以确保正确工作
const autoFitGraph = (svg, g, nodes, containerWidth, containerHeight) => {
  console.log('执行自适应缩放...');
  
  // 参数检查
  if (!nodes || nodes.length === 0 || !g || !svg || !containerWidth || !containerHeight) {
    console.log('自适应缩放: 参数无效');
    return;
  }
  
  // 计算所有节点的边界框
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  nodes.forEach(node => {
    if (node.x !== undefined && node.y !== undefined) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    }
  });
  
  // 检查边界是否有效
  if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
    console.log('自适应缩放: 无法计算有效的边界框');
    // 如果边界无效，使用默认的缩放中心
    const defaultScale = 0.8;
    const defaultTranslateX = containerWidth / 2;
    const defaultTranslateY = containerHeight / 2;
    
    // 直接设置变换
    g.attr('transform', `translate(${defaultTranslateX}, ${defaultTranslateY}) scale(${defaultScale})`);
    return;
  }
  
  // 计算图的实际宽高
  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;
  
  console.log(`自适应缩放: 图边界 - 宽: ${graphWidth}, 高: ${graphHeight}, 容器宽: ${containerWidth}, 容器高: ${containerHeight}`);
  
  // 添加边距（留出10%的空间，确保图完全可见）
  const margin = 0.1;
  const availableWidth = containerWidth * (1 - margin * 2);
  const availableHeight = containerHeight * (1 - margin * 2);
  
  // 计算缩放比例
  let scale = 1;
  if (graphWidth > 0 && graphHeight > 0) {
    const scaleX = availableWidth / graphWidth;
    const scaleY = availableHeight / graphHeight;
    scale = Math.min(scaleX, scaleY, 1.2); // 最大放大到1.2倍
  }
  
  // 计算图的中心点
  const graphCenterX = (minX + maxX) / 2;
  const graphCenterY = (minY + maxY) / 2;
  
  // 计算平移量，使图居中
  const translateX = containerWidth / 2 - graphCenterX * scale;
  const translateY = containerHeight / 2 - graphCenterY * scale;
  
  console.log(`自适应缩放: 应用变换 - 缩放: ${scale.toFixed(2)}, 平移: (${translateX.toFixed(0)}, ${translateY.toFixed(0)})`);
  
  // 直接设置transform属性，确保立即生效
  g.transition().duration(700).attr('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
  
  // 同时更新缩放状态，确保后续的缩放操作基于当前变换
  const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
  svg.call(d3.zoom().transform, transform);
};

// 窗口大小调整 - 不再在调整大小时自动缩放，只更新SVG尺寸
const handleResize = () => {
  if (graphSvg.value && graphCanvas.value) {
    const width = graphCanvas.value.clientWidth;
    const height = graphCanvas.value.clientHeight;
    
    // 更新SVG尺寸
    graphSvg.value
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // 重新调整力导向模拟的中心点，但不重新执行自适应缩放
    if (graphSimulation.value) {
      graphSimulation.value
        .force('center', d3.forceCenter(width / 2, height / 2));
    }
  }
}

// 组件挂载
onMounted(() => {
  // 等待DOM加载完成
  setTimeout(() => {
    initGraph()
  }, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onBeforeUnmount(() => {
  // 停止力导向模拟
  if (graphSimulation.value) {
    graphSimulation.value.stop();
    graphSimulation.value = null;
  }
  
  // 清除SVG和相关引用
  if (graphSvg.value) {
    graphSvg.value.on('zoom', null);
    graphSvg.value.on('click', null);
    graphSvg.value = null;
  }
  
  graphG.value = null;
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})
</script>

<style src="./GraphView.less" scoped></style>
