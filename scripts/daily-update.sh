#!/bin/bash
# What is War - 数据更新脚本
# 每天中国时间早上8点执行 (UTC 0:00)

cd /home/ubuntu/.openclaw/workspace-coder/projects/what-is-war

echo "=== [$(date)] 开始更新 what-is-war 数据 ==="

# 抓取 GDELT 数据
echo "抓取 GDELT 数据..."
python3 scripts/fetch_gdelt.py 2>&1

# 抓取 ACLED 数据（如果配置了 API Key）
echo "抓取 ACLED 数据..."
python3 scripts/fetch_acled.py 2>&1

# 生成每日统计
echo "生成每日统计..."
python3 scripts/generate_stats.py 2>&1

# 检查是否有变更
git diff --stat data/

if [ $? -eq 0 ]; then
    echo "有数据更新，提交并推送..."
    git add data/
    git commit -m "data: update $(date '+%Y-%m-%d')"
    # 推送带重试：网络抖动/TLS 错误时最多重试 3 次，间隔 10 秒
    for attempt in 1 2 3; do
        if git push origin main 2>&1; then
            echo "推送成功 (第 ${attempt} 次尝试)"
            break
        fi
        echo "推送失败 (第 ${attempt} 次)，10 秒后重试..."
        # GnuTLS/连接超时常见于 HTTP/2 协商问题，降级为 HTTP/1.1
        git config http.version HTTP/1.1
        sleep 10
    done
    echo "=== 更新完成 ==="
else
    echo "没有新数据，退出"
fi
