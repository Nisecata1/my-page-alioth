const { createApp } = Vue

createApp({
    data() {
        return {
            profile: null,
            loading: true
        }
    },
    // 页面加载完成后自动执行
    mounted() {
        this.fetchProfile()
    },
    methods: {
        async fetchProfile() {
            this.loading = true
            this.profile = null
            try {
                // 优先走同源 API（由 Nginx /api/ 代理到后端），失败则回退到静态 JSON
                const candidates = ['/api/profile', './data/profile.json']

                for (const url of candidates) {
                    try {
                        const res = await fetch(url, { cache: 'no-store' })
                        if (res.ok) {
                            this.profile = await res.json()
                            return
                        }
                    } catch {
                        // ignore and try next candidate
                    }
                }
            } catch (error) {
                console.error("API Error:", error)
            } finally {
                this.loading = false
            }
        }
    }
}).mount('#app')
// 这里的 '#app' 是一个 CSS 选择器，意思是“找到页面上 id="app" 的那个元素，把 Vue 应用挂到它里面”。
