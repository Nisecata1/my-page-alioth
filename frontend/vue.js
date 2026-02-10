
// JS 脚本部分
const { createApp } = Vue
createApp({  // 创建一个 Vue 应用实例
    
    data() {  // 状态仓库。定义了 loading、profile 等变量
        return {  // Vue 会监控这些变量，一变页面就自动刷
            currentTab: 'home', // 默认显示主页
            profile: null,
            loading: false,
            systemStatus: null,
        }
    },
    mounted() {  // 生命周期钩子, 相当于 Python 类的 __init__ 或“开机启动项”
        // 页面加载完那一瞬间，自动执行 fetchProfile() 去拉后端数据。
        this.fetchProfile()
    },
    methods: {  // 核心逻辑函数

        // 切换 Tab 的逻辑
        switchTab(tabName) {
            this.currentTab = tabName
            // 如果切换到了 'status' 且没有数据，才去通过fetchStatus()请求
            if (tabName === 'status' && !this.systemStatus) {
                this.fetchStatus()
            }
        },

        // 获取个人信息
        async fetchProfile() {
            try {
                const res = await fetch('/api/profile')
                if (res.ok) this.profile = await res.json()
            } catch (e) {
                console.error(e)
            }
        },

        // 获取系统状态 (点击 Tab 2 时触发)
        async fetchStatus() {
            this.systemStatus = null // 先清空，显示 loading
            try {
                const res = await fetch('/api/status')
                if (res.ok) {
                    this.systemStatus = await res.json()
                }
            } catch (e) {
                console.error("Status fetch failed", e)
            }
        },

        // 辅助函数：CPU 负载过高变红
        getLoadColor(percent) {
            if (percent > 80) return '#e74c3c' // 红
            if (percent > 50) return '#f39c12' // 橙
            return '#2ecc71' // 绿
        }

    }
}).mount('#app')