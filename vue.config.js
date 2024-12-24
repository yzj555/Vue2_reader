const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: "./",
  transpileDependencies: true,
  pluginOptions:{
    electronBuilder:{
      nodeIntegration:true
    }
  },
  transpileDependencies: [
    'vuetify'
  ]
})
