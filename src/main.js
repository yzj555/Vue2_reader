import Vue from 'vue'
import router from './router/router.js'
import App from './App.vue'
import registerComponents from './utils/autoComponents.js'
import vuetify from './plugins/vuetify'

import { DATA_KEY } from './utils/dataKey.js'
import { DBObj } from './utils/IndexDB.js'

Vue.config.productionTip = false

Vue.prototype.DataKey = DATA_KEY
Vue.prototype.DBObj = DBObj
//初始化全局调用，打开数据库
DBObj.openDB()
//全局自动化注册组件
registerComponents()

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
