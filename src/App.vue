<template>
  <div id="app">
    <el-container class="main-container">
      <el-header class="header">
        <div class="logo">银行黑灰产可视化系统</div>
        <div class="nav">
          <el-menu 
            :default-active="activeIndex" 
            mode="horizontal" 
            @select="handleSelect"
            background-color="#0f1419"
            text-color="#e0e0e0"
            active-text-color="#4d80ff"
            router
          >
            <el-menu-item index="/graph">图谱分析</el-menu-item>
            <el-menu-item index="/account_list">账户列表</el-menu-item>
            <el-menu-item index="/rules">规则管理</el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeIndex = ref('/graph')

watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath === '/' ? '/' : newPath
  },
  { immediate: true }
)

const handleSelect = (key) => {
  activeIndex.value = key
}
</script>

<style src="./App.less" scoped></style>
