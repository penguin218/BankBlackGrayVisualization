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
          <div class="path-tracking">
            <el-select 
              v-model="pathTracking.startNode" 
              placeholder="起始节点" 
              class="node-select"
            >
              <el-option
                v-for="node in nodesList"
                :key="node.id"
                :label="node.id"
                :value="node.id"
              />
            </el-select>
            <el-select 
              v-model="pathTracking.endNode" 
              placeholder="终止节点" 
              class="node-select"
            >
              <el-option
                v-for="node in nodesList"
                :key="node.id"
                :label="node.id"
                :value="node.id"
              />
            </el-select>
            <el-button type="primary" @click="handlePathTracking">查询</el-button>
          </div>
        </div>
        
        <div class="control-group">
          <el-button @click="handleResetView">重置视图</el-button>
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
          <el-descriptions-item label="账户ID">{{ selectedNode.id }}</el-descriptions-item>
          <el-descriptions-item label="原始ID">{{ selectedNode.original_id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户角色">{{ selectedNode.role || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属组ID">{{ selectedNode.group_id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="节点类型">{{ selectedNode.isCore ? '核心节点' : '普通节点' }}</el-descriptions-item>
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
          <el-descriptions-item label="源节点">{{ selectedEdge.sourceNodeInfo?.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="目标节点">{{ selectedEdge.targetNodeInfo?.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="交易金额">¥{{ (selectedEdge.amount || 0).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="交易时间">{{ selectedEdge.time || '-' }}</el-descriptions-item>
          <el-descriptions-item label="交易类型">{{ selectedEdge.type || '转账' }}</el-descriptions-item>
          
        </el-descriptions>
      </div>
      <div class="detail-section">
        <h4>交易参与方信息</h4>
        <div class="participants-info">
          <div class="participant-card">
            <h5>源账户信息</h5>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="账户ID">{{ selectedEdge.sourceNodeInfo?.id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="所属机构">{{ selectedEdge.sourceNodeInfo?.institution || '-' }}</el-descriptions-item>
              <el-descriptions-item label="账户类型">{{ selectedEdge.sourceNodeInfo?.role || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="participant-card">
            <h5>目标账户信息</h5>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="账户ID">{{ selectedEdge.targetNodeInfo?.id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="所属机构">{{ selectedEdge.targetNodeInfo?.institution || '-' }}</el-descriptions-item>
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
  max: 100000
})

const timeRange = ref(['2025-11-01', '2025-11-30'])

const pathTracking = reactive({
  startNode: '',
  endNode: ''
})

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
    const relatedEdges = graphData.edges.filter(edge => 
      edge.source === d.id || edge.target === d.id
    );
    
    nodeDetail.relatedTransactions = relatedEdges.map(edge => {
      // 确定交易对手
      const counterparty = edge.source === d.id ? edge.target : edge.source;
      // 查找交易对手节点信息
      const counterpartyNode = graphData.nodes.find(node => node.id === counterparty);
      
      return {
        counterparty: counterpartyNode?.acct_id || counterparty,
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
  console.log('边点击事件触发:', edge);
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
  console.log('画布被点击，清除选中状态');
  // 清除选中节点和边
  selectedNode.value = null;
  selectedEdge.value = null;
  
  // 确保graphG.value存在
  if (!graphG.value) {
    console.warn('graphG.value is not initialized');
    return;
  }
  
  // 恢复所有节点和边的原始样式，添加动画效果
  graphG.value.selectAll('.node circle')
    .transition().duration(300)
    .attr('opacity', 1)
    .attr('r', d => d.size)
    .attr('stroke', d => d.isCore ? '#fff' : '#434d5c')
    .attr('stroke-width', d => d.isCore ? 3 : 1);
  
  graphG.value.selectAll('.links line')
    .transition().duration(300)
    .attr('opacity', 1)
    .attr('stroke', '#e2e2e2')
    .attr('stroke-width', 1.5);
};

// 高亮选中的节点
const highlightSelectedNode = (nodeId) => {
  if (!graphG.value) return;
  
  // 先恢复所有节点和边的原始样式
  graphG.value.selectAll('.node circle')
    .transition().duration(300)
    .attr('opacity', 0.4)
    .attr('r', d => d.size)
    .attr('stroke', d => d.isCore ? '#fff' : '#434d5c')
    .attr('stroke-width', d => d.isCore ? 3 : 1);
  
  graphG.value.selectAll('.links line')
    .transition().duration(300)
    .attr('opacity', 0.3)
    .attr('stroke', '#e2e2e2')
    .attr('stroke-width', 1.5);
  
  // 高亮选中的节点
  graphG.value.selectAll('.node circle')
    .filter(d => d.id === nodeId)
    .transition().duration(300)
    .attr('opacity', 1)
    .attr('r', 15)
    .attr('stroke', '#1890ff')
    .attr('stroke-width', 4);
  
  // 高亮与选中节点相连的边
  graphG.value.selectAll('.links line')
    .filter(d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      return sourceId === nodeId || targetId === nodeId;
    })
    .transition().duration(300)
    .attr('opacity', 1)
    .attr('stroke', '#1890ff')
    .attr('stroke-width', 1.5);
  
  // 高亮与选中节点相连的节点
  const relatedNodeIds = new Set();
  if (graphData && Array.isArray(graphData.edges)) {
    graphData.edges.forEach(edge => {
      if (edge.source === nodeId) relatedNodeIds.add(edge.target);
      if (edge.target === nodeId) relatedNodeIds.add(edge.source);
    });
  }
  
  graphG.value.selectAll('.node circle')
    .filter(d => relatedNodeIds.has(d.id))
    .transition().duration(300)
    .attr('opacity', 1)
    .attr('stroke', '#1890ff')
    .attr('stroke-width', 2);
};

// 高亮选中的边和两端节点
const highlightSelectedEdge = (edge) => {
  console.log('高亮边和节点:', edge);
  if (!graphG.value || !edge) return;
  
  // 获取边的source和target ID
  const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
  const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
  console.log('边端点ID:', sourceId, '->', targetId);
  
  // 恢复所有节点和边的原始样式
  graphG.value.selectAll('.links line').transition().duration(300)
    .attr('opacity', 0.4)
    .attr('stroke', '#e2e2e2')
    .attr('stroke-width', 1.5);
  
  graphG.value.selectAll('.node circle').transition().duration(300)
    .attr('opacity', 0.4)
    .attr('stroke', d => d.isCore ? '#fff' : '#434d5c')
    .attr('stroke-width', d => d.isCore ? 3 : 1);
  
  // 高亮选中的边 - 同时考虑正向和反向
  graphG.value.selectAll('.links line').filter(d => {
    const dSourceId = typeof d.source === 'object' ? d.source.id : d.source;
    const dTargetId = typeof d.target === 'object' ? d.target.id : d.target;
    return (dSourceId === sourceId && dTargetId === targetId) || 
           (dSourceId === targetId && dTargetId === sourceId);
  }).transition().duration(300)
    .attr('opacity', 1)
    .attr('stroke', '#ff0000') // 使用红色更醒目
    .attr('stroke-width', 3);
  
  // 高亮两端节点
  graphG.value.selectAll('.node circle').filter(d => {
    return d.id === sourceId || d.id === targetId;
  }).transition().duration(300)
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
  
  console.log('开始高亮处理，边数:', edgesToHighlight.length);
  
  // 收集所有需要高亮的节点ID
  const nodeIdsToHighlight = new Set();
  // 收集所有需要高亮的边标识
  const edgeIdsToHighlight = new Set();
  
  edgesToHighlight.forEach(edge => {
    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
    
    nodeIdsToHighlight.add(sourceId);
    nodeIdsToHighlight.add(targetId);
    
    // 存储边的唯一标识，考虑无向图的情况
    const edgeId1 = `${sourceId}-${targetId}`;
    const edgeId2 = `${targetId}-${sourceId}`;
    edgeIdsToHighlight.add(edgeId1);
    edgeIdsToHighlight.add(edgeId2);
    
    console.log('添加高亮边ID:', edgeId1, edgeId2, '边数据:', { source: sourceId, target: targetId, amount: edge.amount });
  });
  
  console.log('高亮边ID集合大小:', edgeIdsToHighlight.size);
  console.log('高亮节点ID集合大小:', nodeIdsToHighlight.size);
  
  // 恢复所有节点和边的原始样式
  graphG.value.selectAll('.node circle')
    .transition().duration(300)
    .attr('opacity', d => nodeIdsToHighlight.has(d.id) ? 1 : 0.6)
    .attr('r', d => nodeIdsToHighlight.has(d.id) ? 15 : d.size)
    .attr('stroke', d => nodeIdsToHighlight.has(d.id) ? '#1890ff' : d.isCore ? '#fff' : '#434d5c')
    .attr('stroke-width', d => nodeIdsToHighlight.has(d.id) ? 3 : d.isCore ? 3 : 1);
  
  // 高亮选中的边，完全隐藏不符合条件的边
  graphG.value.selectAll('.links line')
    .transition().duration(300)
    .attr('opacity', d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      const isHighlighted = edgeIdsToHighlight.has(edgeId1) || edgeIdsToHighlight.has(edgeId2);
      
      // 添加调试日志，跟踪每条边的透明度设置
      if (!isHighlighted) {
        console.log('边未高亮 (设置为透明):', edgeId1, '数据:', { source: sourceId, target: targetId, amount: d.amount });
      }
      
      // 完全隐藏不符合条件的边
      return isHighlighted ? 1 : 0;
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
      return edgeIdsToHighlight.has(edgeId1) || edgeIdsToHighlight.has(edgeId2) ? 2.5 : 1.5;
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
  
  console.log('开始金额筛选:', { minAmount, maxAmount });
  console.log('总边数:', graphData.edges.length);
  
  // 显示前几条边的数据结构，帮助调试
  if (graphData.edges.length > 0) {
    console.log('边数据结构示例:', graphData.edges.slice(0, 3));
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
    if (result) {
      console.log('保留边:', { source: edge.source, target: edge.target, amount: edge.amount });
    }
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
  
  // 确保起始节点和终止节点存在
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
  
  // 实现Dijkstra算法查找最短路径
  const shortestPath = findShortestPath(graphData, pathTracking.startNode, pathTracking.endNode)
  
  if (shortestPath.length > 0 && shortestPath[0] === pathTracking.startNode) {
    ElMessage.success(`找到从 ${pathTracking.startNode} 到 ${pathTracking.endNode} 的最短路径，长度: ${shortestPath.length - 1} 跳`)
    // 高亮显示路径，其他节点和边淡化
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
    .transition().duration(300)
    .attr('opacity', d => path.includes(d.id) ? 1 : 0.1)
    .attr('r', d => path.includes(d.id) ? 15 : d.size)
    .attr('stroke', d => path.includes(d.id) ? '#1890ff' : '#e2e2e2')
    .attr('stroke-width', d => path.includes(d.id) ? 4 : 1)
    .attr('fill', d => path.includes(d.id) ? d.color : d.color);
  
  // 处理所有边 - 修复source和target可能是字符串或对象的问题
  graphG.value.selectAll('.links line')
    .transition().duration(300)
    .attr('opacity', d => {
      // 获取source和target的ID，处理可能是对象或字符串的情况
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      return pathEdges.has(edgeId1) || pathEdges.has(edgeId2) ? 1 : 0.3;
    })
    .attr('stroke', d => {
      // 获取source和target的ID，处理可能是对象或字符串的情况
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const edgeId1 = `${sourceId}-${targetId}`;
      const edgeId2 = `${targetId}-${sourceId}`;
      return pathEdges.has(edgeId1) || pathEdges.has(edgeId2) ? '#1890ff' : '#e2e2e2';
    })
    .attr('stroke-width', d => {
      // 获取source和target的ID，处理可能是对象或字符串的情况
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
    // 从本地CSV文件加载数据
    const nodesResponse = await fetch('/src/data/group_nodes.csv');
    const edgesResponse = await fetch('/src/data/group_edges.csv');
    
    if (!nodesResponse.ok || !edgesResponse.ok) {
      throw new Error('加载CSV文件失败');
    }
    
    const nodesCsv = await nodesResponse.text();
    const edgesCsv = await edgesResponse.text();
    
    // 解析CSV数据
    const nodesData = parseCSV(nodesCsv);
    const edgesData = parseCSV(edgesCsv);
    
    // 定义组颜色映射
    const groupColors = {};
    const colorPalette = ['#52c41a', '#1890ff', '#faad14', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16', '#f5222d'];
    
    // 转换节点数据 - 只保留CSV中的字段
    const nodes = nodesData.map(node => {
      // 为每个group_id分配唯一颜色
      if (!groupColors[node.group_id]) {
        groupColors[node.group_id] = colorPalette[Object.keys(groupColors).length % colorPalette.length];
      }
      
      return {
        // 使用acct_id作为节点ID，因为边引用的是账户ID
        id: node.acct_id,
        // 保留原始CSV字段
        original_id: node.id,
        group_id: node.group_id,
        acct_id: node.acct_id,
        role: node.role,
        // D3相关属性
        isCore: node.role === 'core',
        size: node.role === 'core' ? 20 : 10, // 核心节点更大
        color: groupColors[node.group_id] // 同组节点使用相同颜色
      };
    });
    
    // 处理边数据并去重 - 只保留CSV中的字段
    const edgeMap = new Map();
    edgesData.forEach(edge => {
      const edgeKey = `${edge.source}-${edge.target}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          amount: parseFloat(edge.amount),
          txn_time: edge.txn_time,
          category: edge.category
        });
      }
    });
    const edges = Array.from(edgeMap.values());
    
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
    
    // 创建力导向模拟
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 5));
    
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
      .attr('stroke', d => d.isCore ? '#fff' : '#434d5c')
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
    
    // 更新模拟中的位置
    simulation.on('tick', () => {
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
