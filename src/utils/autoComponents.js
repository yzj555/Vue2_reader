import Vue from 'vue'
export default function registerComponents() {
    const requireComponent = require.context('@/components', true, /\.vue$/)
    for (const file of requireComponent.keys()) {
        // 获取组件配置
        const componentConfig = requireComponent(file)
        // 全局注册组件
        Vue.component(
            componentConfig.default.name,
            componentConfig.default || componentConfig
        )
    }
}

// const components = import.meta.globEager('../components/*.vue')

// export default function install (app) {
//     for (const [key, value] of Object.entries(components)) {
//         console.log(key)
//         // const name = key.split('/')[1]
//         // app.component(name, defineAsyncComponent(value))
//         app.component(value.default.name, value.default)
//     }
//     return app
// }