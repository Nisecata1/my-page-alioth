
// JS 脚本部分

// 下面的写法是 JavaScript (ES6) 的通用标准：叫“解构赋值”。
const { createApp, ref, reactive, onMounted, computed } = Vue;  
// 意思是从 vue 脚本里掏出来几个方法：比如ref()、createApp()等直接赋值给同名变量，省的vue.ref()，直接用ref()就行

createApp({  // 创建 Vue 应用实例

    setup() {  // Vue 3 的“大脑”，所有逻辑都写在这里
        
        // 🏗️ 模块 1: 个人档案逻辑 (原有功能)
        const currentTab = ref('home');
        const profile = ref(null);

        // 定义切换 Tab 的函数
        const switchTab = (tab) => {
            currentTab.value = tab;
        };

        // 获取个人信息的函数
        const fetchProfile = async () => {
            try {
                // 这里的 api 路径要确保正确
                const res = await fetch('/api/profile');
                if (res.ok) {
                    profile.value = await res.json();
                } else {
                    // 如果后端没通，给个假数据方便测试布局
                    profile.value = { name: "Alioth", role: "DevOps Engineer (Offline Mode)" };
                }
            } catch (e) {
                console.error("API Error:", e);
                profile.value = { name: "Alioth", role: "Network Error" };
            }
        };

        // 🎵 模块 2: 音乐播放器逻辑 (新功能)
        const isMusicPlaying = ref(false); // 记录播放状态
        const audioPlayer = ref(null);     // 对应 HTML 里的 ref="audioPlayer"

        const toggleAudio = () => {
            const player = audioPlayer.value;
            if (!player) return; // 找不到元素就退出

            if (isMusicPlaying.value) {
                player.pause(); // 暂停
            } else {
                player.volume = 0.3; // 设置音量 30%
                // 尝试播放 (处理浏览器自动播放策略)
                player.play().catch(err => {
                    console.warn("自动播放被拦截:", err);
                    alert("请先点击页面任意位置！");
                });
            }
            // 状态取反
            isMusicPlaying.value = !isMusicPlaying.value;
        };

        // 🚀 初始化: 页面加载后自动执行
        onMounted(() => {
            fetchProfile(); // 页面一加载就去拉取个人信息
            console.log("App mounted!");
        });

        // 📦 暴露给 HTML: 这里列出的变量才能在 HTML 里用
        return {
            // 档案模块
            currentTab,
            profile,
            switchTab,
            // 音乐模块
            isMusicPlaying,
            audioPlayer,
            toggleAudio
        };
    }
}).mount('#app'); // 挂载到 index.html 里的 <div id="app">

