#!/bin/bash
# init-db.sh

set -e

echo "等待 OceanBase 启动..."
echo "连接参数:"
echo "主机: ${DB_HOST:-oceanbase}"
echo "端口: ${DB_PORT:-2881}"
echo "租户: ${OB_TENANT_NAME:-school_forum}"
echo "用户: root@${OB_TENANT_NAME:-school_forum}"

# 等待 OceanBase 启动
attempt=1
max_attempts=30

until obclient -h${DB_HOST:-oceanbase} -P${DB_PORT:-2881} -uroot@${OB_TENANT_NAME:-school_forum} -e "SELECT 1" 2>&1
do
    exit_code=$?
    echo "[尝试 $attempt/$max_attempts] OceanBase 尚未就绪 (退出码: $exit_code)，等待 5 秒..."
    
    if [ $attempt -ge $max_attempts ]; then
        echo "超过最大尝试次数 ($max_attempts)，初始化失败"
        exit 1
    fi
    
    sleep 5
    attempt=$((attempt + 1))
done

echo "OceanBase 已启动，连接成功！开始执行初始化..."

# 执行 SQL 初始化脚本（带重试逻辑）
if [ -f "/docker-entrypoint-initdb.d/init.sql" ]; then
    echo "执行数据库初始化脚本..."
    
    # SQL 执行重试参数
    sql_attempt=1
    max_sql_attempts=5
    sql_retry_delay=3
    
    while [ $sql_attempt -le $max_sql_attempts ]; do
        echo "[SQL 尝试 $sql_attempt/$max_sql_attempts] 执行初始化SQL..."
        
        # 执行SQL并捕获输出
        if output=$(obclient -h${DB_HOST:-oceanbase} -P${DB_PORT:-2881} -uroot@${OB_TENANT_NAME:-school_forum} < /docker-entrypoint-initdb.d/init.sql 2>&1); then
            echo "数据库初始化成功完成"
            echo "执行输出: $output"
            break
        else
            exit_code=$?
            echo "[SQL 尝试 $sql_attempt/$max_sql_attempts] 初始化失败 (退出码: $exit_code)"
            echo "错误输出: $output"
            
            if [ $sql_attempt -ge $max_sql_attempts ]; then
                echo "超过最大SQL执行尝试次数 ($max_sql_attempts)，初始化失败"
                exit 1
            fi
            
            echo "等待 ${sql_retry_delay} 秒后重试..."
            sleep $sql_retry_delay
            sql_attempt=$((sql_attempt + 1))
        fi
    done
else
    echo "未找到初始化SQL文件: /docker-entrypoint-initdb.d/init.sql"
    exit 1
fi

echo "✅ 初始化脚本执行完毕"