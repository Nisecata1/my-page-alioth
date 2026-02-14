// JS 脚本部分
const { createApp, ref, onMounted } = Vue;

const appConfig = {
    setup() {
        const currentTab = ref("home");
        const profile = ref(null);

        // Status 页签数据
        const systemStatus = ref(null);
        const statusError = ref("");

        // Home 底部后端连通卡片数据
        const backendLoading = ref(true);
        const backendHealth = ref(null);
        const backendProfile = ref(null);
        const backendError = ref("");

        const makeFallbackProfile = () => ({
            name: "Profile Load Failed",
            role: "Cannot read profile.json",
            skills: [],
            github_url: ""
        });

        const makeFallbackBackendProfile = () => ({
            name: "Backend Profile Unavailable",
            role: "Cannot read backend/service profile",
            skills: []
        });

        const switchTab = (tab) => {
            currentTab.value = tab;
        };

        const fetchProfile = async () => {
            try {
                const res = await fetch("./profile.json");
                if (res.ok) {
                    const data = await res.json();
                    profile.value = {
                        ...data,
                        skills: Array.isArray(data?.skills) ? data.skills : [],
                        github_url: typeof data?.github_url === "string" ? data.github_url : ""
                    };
                } else {
                    profile.value = makeFallbackProfile();
                }
            } catch (e) {
                profile.value = makeFallbackProfile();
            }
        };

        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/status");
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                systemStatus.value = await res.json();
                statusError.value = "";
            } catch (e) {
                systemStatus.value = null;
                statusError.value = "Cannot read /api/status";
            }
        };

        const getLoadColor = (cpuPercent) => {
            const load = Number(cpuPercent);
            if (Number.isNaN(load)) {
                return "#2c3e50";
            }
            if (load >= 80) {
                return "#d32f2f";
            }
            if (load >= 50) {
                return "#f57c00";
            }
            return "#2e7d32";
        };

        const fetchBackendHealth = async () => {
            backendLoading.value = true;
            backendError.value = "";

            try {
                const res = await fetch("/api/health");
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();
                const rawProfile = data?.profile ?? {};

                backendHealth.value = {
                    ok: data?.ok === true,
                    service: typeof data?.service === "string" ? data.service : "laplas-backend",
                    timestamp: typeof data?.timestamp === "string" ? data.timestamp : ""
                };

                backendProfile.value = {
                    name: typeof rawProfile?.name === "string" && rawProfile.name.trim()
                        ? rawProfile.name
                        : "Backend Profile Unavailable",
                    role: typeof rawProfile?.role === "string" && rawProfile.role.trim()
                        ? rawProfile.role
                        : "No backend role description",
                    skills: Array.isArray(rawProfile?.skills)
                        ? rawProfile.skills.filter((skill) => typeof skill === "string" && skill.trim())
                        : []
                };

                if (!backendHealth.value.ok) {
                    backendError.value = "Backend health check returned not-ok.";
                }
            } catch (e) {
                backendHealth.value = null;
                backendProfile.value = makeFallbackBackendProfile();
                backendError.value = "Cannot connect to /api/health";
            } finally {
                backendLoading.value = false;
            }
        };

        onMounted(() => {
            fetchProfile();
            fetchStatus();
            fetchBackendHealth();
        });

        return {
            currentTab,
            profile,
            switchTab,
            systemStatus,
            statusError,
            fetchStatus,
            getLoadColor,
            backendLoading,
            backendHealth,
            backendProfile,
            backendError,
            fetchBackendHealth
        };
    }
};

createApp(appConfig).mount("#app");
