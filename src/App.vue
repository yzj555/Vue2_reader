<template>
  <div id="app">
    <!-- <div class="theme_bg"></div> -->
    <!-- <Header></Header>
    <Content></Content>
    <Footer></footer> -->
    <RouterView />
  </div>
</template>
<!-- <script src="./utils/sakura.js"></script> -->

<script>
import { RouterView } from 'vue-router';


export default {
  name: 'App',
  components: { RouterView },
  data() {
    return {
      // bgOpacity: 0.5,
    }
  },
  mounted(){
    this.$router.push("/")
  },
  methods: {
    // hiddenApp() {
    //   console.log('鼠标移出')
    //   this.bgOpacity = 0
    // },
    // showApp() {
    //   console.log('鼠标移入')
    //   this.bgOpacity = 1
    // },
  }
}
</script>

<style>
body {
  margin: auto;
}

/* 整个滚动条 */
::-webkit-scrollbar {
  width: 0px;
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: #888;
}

/* 滚动条滑块hover效果 */
::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  /* font-family: Helvetica, 'Hiragino Sans GB', 'Microsoft Yahei', '微软雅黑', Arial, sans-serif !important; */
  font-family: "楷体", "楷体_GB2312";
  /* 针对WebKit浏览器 */
  -webkit-font-smoothing: antialiased;
  /* 针对Firefox浏览器 */
  -moz-osx-font-smoothing: grayscale;
  /* 文字渲染优化 */
  text-rendering: optimizeLegibility;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
  width: 100%;
  height: 100vh;
  padding: auto;
  /* user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: drag; */
}

</style>
