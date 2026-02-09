from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # 新增：用于处理跨域请求
from pydantic import BaseModel
import psutil  # 新增：用于获取系统信息
import time
import platform

app = FastAPI()

# 配置 CORS 允许前端访问: 允许跨域请求的中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源 (开发阶段方便)，生产环境需指定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------------------------

# --- 1. 数据模型 ---
class UserProfile(BaseModel):
    name: str
    role: str
    skills: list[str]

# --- 2. 静态数据 (Tab 1 用) ---
MY_PROFILE = UserProfile(
    name="小塔",
    role="Full Stack Developer",
    skills=["Python", "Linux", "FastAPI", "Vue.js"]
)

# --- 3. 路由定义 ---

# Tab 1: 获取个人简介
@app.get("/api/profile", response_model=UserProfile)
def get_profile():
    return MY_PROFILE

# Tab 2: 获取系统状态 (新增核心功能)
@app.get("/api/status")
def get_system_status():
    # 获取内存信息
    mem = psutil.virtual_memory()
    
    # 获取 CPU 温度 (Android/Termux 上可能获取不到，做个容错)
    temp = "N/A"
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            # 尝试获取第一个可用的温度传感器
            first_sensor = list(temps.values())[0]
            if first_sensor:
                temp = f"{first_sensor[0].current}°C"
    except Exception:
        pass

    # 计算开机时长 (Uptime)
    boot_time = psutil.boot_time()
    uptime_seconds = time.time() - boot_time
    # 格式化为 小时:分钟
    m, s = divmod(uptime_seconds, 60)
    h, m = divmod(m, 60)
    uptime_str = f"{int(h)}h {int(m)}m"

    return {
        "cpu_percent": psutil.cpu_percent(interval=1), # interval=1 会阻塞1秒以计算准确率
        "ram_percent": mem.percent,
        "ram_used": f"{mem.used / (1024**3):.1f} GB",
        "ram_total": f"{mem.total / (1024**3):.1f} GB",
        "temperature": temp,
        "uptime": uptime_str,
        "platform": f"{platform.system()} {platform.release()}"
    }


# 回根路由
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Laplas API backend!",
        "docs_url": "/docs",          # FastAPI 自动生成的文档地址
        "profile_url": "/api/profile"    # 数据接口地址
    }

