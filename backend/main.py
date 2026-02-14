from datetime import datetime, timezone
import json
import platform
from pathlib import Path
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 用于处理跨域请求
import psutil                                       # 用于获取系统信息
from pydantic import BaseModel


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

# 现在开始这些更改需要好好看看

SERVICE_NAME = "laplas-backend"
SERVICE_PROFILE_PATH = Path(__file__).with_name("service_profile.json")

# 后端信息获取失败的兜底
def make_fallback_service_profile() -> dict:
    return {
        "name": "Backend Profile Load Failed",
        "role": "Cannot read backend/service_profile.json",
        "skills": []
    }


def load_service_profile() -> dict:
    fallback = make_fallback_service_profile()

    try:
        raw_text = SERVICE_PROFILE_PATH.read_text(encoding="utf-8")
        data = json.loads(raw_text)
    except Exception:
        return fallback

    if not isinstance(data, dict):
        return fallback

    name = data.get("name")
    role = data.get("role")
    skills = data.get("skills")

    normalized_name = name.strip() if isinstance(name, str) and name.strip() else fallback["name"]
    normalized_role = role.strip() if isinstance(role, str) and role.strip() else fallback["role"]
    normalized_skills = []

    if isinstance(skills, list):
        normalized_skills = [skill for skill in skills if isinstance(skill, str) and skill.strip()]

    return {
        "name": normalized_name,
        "role": normalized_role,
        "skills": normalized_skills
    }

# --------------------------------------






# --- 3. 路由定义 ---

# 首页连通性: 返回健康状态 + 后端 profile
@app.get("/api/health")
def get_health():
    timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    return {
        "ok": True,
        "service": SERVICE_NAME,
        "timestamp": timestamp,
        "profile": load_service_profile()
    }


# Tab 2: 获取系统状态
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
        "health_url": "/api/health",
        "profile_url": "/api/profile"    # 数据接口地址
    }
