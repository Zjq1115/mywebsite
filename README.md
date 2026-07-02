# zhangjiaqi.info 个人网站

这是部署在 `https://zhangjiaqi.info` 的个人主页项目，用于展示个人简介、技术项目、常用链接、技能栈和 AI 导航/问答能力。项目主体是原生 HTML、CSS、JavaScript 静态页面，线上通过阿里云 ECS + Nginx + Let's Encrypt 提供 HTTPS 访问，DeepSeek 调用通过服务器端 Node.js 代理完成，避免 API Key 暴露在前端。

## 网站概述

- 线上域名：`https://zhangjiaqi.info`
- 备用域名：`https://www.zhangjiaqi.info`
- ICP 备案号：`苏ICP备2026044124号`
- GitHub 仓库：`https://github.com/Zjq1115/mywebsite`
- 部署服务器：阿里云 ECS，Ubuntu 22.04，Nginx

## 主要模块

- 首屏个人信息：头像、昵称、身份标签、社交入口和基础介绍。
- 项目展示：展示 RAG、数据集微调、本地模型部署等技术项目入口。
- 网站链接：展示 GitHub、CSDN、简历等外部链接。
- 技能栈：以 SVG 图形展示主要技能和工具栈。
- 主题与动效：支持明暗主题、卡片悬停、加载动画和响应式布局。
- AI 智能导航：根据用户输入跳转到项目、网站、技能、简历、联系方式等页面区域。
- AI 问答助手：通过服务器端 DeepSeek 代理回答访客问题。
- 备案页脚：展示并链接到工信部备案系统。

## 技术栈

前端：

- HTML5
- CSS3
- JavaScript
- SVG
- 自托管字体：`Pacifico-Regular.ttf`、`Ubuntu-Regular.ttf`

后端代理：

- Node.js
- 原生 `http` / `https` 模块
- DeepSeek Chat Completions API

线上服务：

- Ubuntu 22.04
- Nginx
- Certbot / Let's Encrypt
- systemd
- GitHub

## 项目结构

```text
.
├── index.html                    # 网站入口页面
├── README.md                     # 项目说明文档
├── Caddyfile                     # Caddy 部署配置，当前线上使用 Nginx
├── Dockerfile                    # Docker 构建文件，当前线上未使用
├── docker-compose.yaml           # Docker Compose 配置，当前线上未使用
├── server/
│   └── deepseek-proxy.js          # DeepSeek API 服务器端代理
└── static/
    ├── css/
    │   ├── root.css              # 主题变量
    │   └── style.css             # 页面样式
    ├── fonts/                    # 字体文件
    ├── img/                      # 图片资源
    ├── js/
    │   └── script.js             # 页面交互与 AI 调用逻辑
    └── svg/                      # SVG 资源
```

## 本地开发

本项目主体是静态页面，直接用浏览器打开 `index.html` 即可预览基础页面。

推荐在项目目录启动一个本地静态服务：

```powershell
cd E:\CodeX_Projects\MyWebsite\wwwroot
python -m http.server 8080
```

然后访问：

```text
http://127.0.0.1:8080
```

注意：AI 功能依赖服务器端代理 `/api/deepseek/chat/completions`，本地只开静态服务时 AI 请求不会正常工作。需要本地调试 AI 时，可单独启动 `server/deepseek-proxy.js` 并配置反向代理或调整前端接口地址。

## DeepSeek 安全配置

不要把 DeepSeek API Key 写入 `static/js/script.js`，也不要提交到 GitHub。前端只请求：

```text
/api/deepseek/chat/completions
```

线上由 Nginx 转发到本机 Node.js 代理：

```text
127.0.0.1:8787
```

服务器上的 Key 存放在：

```text
/etc/mywebsite/deepseek.env
```

示例内容：

```env
DEEPSEEK_API_KEY=你的 DeepSeek API Key
HOST=127.0.0.1
PORT=8787
```

该文件权限应设置为：

```bash
chmod 600 /etc/mywebsite/deepseek.env
```

## 服务器首次配置流程

以下流程适用于阿里云 ECS Ubuntu 22.04。

### 1. 安装基础依赖

```bash
apt update
apt install -y git nginx certbot python3-certbot-nginx nodejs
```

### 2. 拉取代码

```bash
cd /opt
git clone https://github.com/Zjq1115/mywebsite.git /opt/mywebsite
```

如果服务器上已有旧目录：

```bash
mv /opt/mywebsite /opt/mywebsite.bak.$(date +%Y%m%d%H%M%S)
git clone https://github.com/Zjq1115/mywebsite.git /opt/mywebsite
```

### 3. 配置 Nginx

```bash
cat > /etc/nginx/sites-available/mywebsite <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name zhangjiaqi.info www.zhangjiaqi.info;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name zhangjiaqi.info www.zhangjiaqi.info;

    ssl_certificate /etc/letsencrypt/live/zhangjiaqi.info/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zhangjiaqi.info/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /opt/mywebsite;
    index index.html;

    location /api/deepseek/ {
        proxy_pass http://127.0.0.1:8787/;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

ln -sf /etc/nginx/sites-available/mywebsite /etc/nginx/sites-enabled/mywebsite
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx
```

### 4. 申请 HTTPS 证书

首次申请证书时，域名 DNS 需要已解析到 ECS 公网 IP，安全组需要开放 `80` 和 `443`。

```bash
certbot --nginx -d zhangjiaqi.info -d www.zhangjiaqi.info
```

按提示填写邮箱、同意协议，并选择 HTTP 自动跳转 HTTPS。

证书会自动续期，可用以下命令测试：

```bash
certbot renew --dry-run
```

### 5. 配置 DeepSeek 代理环境变量

```bash
install -d -m 700 /etc/mywebsite

read -rsp "DeepSeek API Key: " DEEPSEEK_API_KEY
echo

printf 'DEEPSEEK_API_KEY=%s\nHOST=127.0.0.1\nPORT=8787\n' "$DEEPSEEK_API_KEY" > /etc/mywebsite/deepseek.env
chmod 600 /etc/mywebsite/deepseek.env
unset DEEPSEEK_API_KEY
```

### 6. 创建 systemd 服务

```bash
cat > /etc/systemd/system/deepseek-proxy.service <<'EOF'
[Unit]
Description=DeepSeek proxy for mywebsite
After=network.target

[Service]
WorkingDirectory=/opt/mywebsite
EnvironmentFile=/etc/mywebsite/deepseek.env
ExecStart=/usr/bin/node /opt/mywebsite/server/deepseek-proxy.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now deepseek-proxy
systemctl status deepseek-proxy
```

## DNS 配置

在阿里云云解析 DNS 中添加：

```text
主机记录  记录类型  记录值
@         A         ECS 公网 IP
www       A         ECS 公网 IP
```

当前服务器公网 IP：

```text
47.99.244.181
```

如更换服务器，需要同步修改 DNS 记录和 Nginx 部署。

## 安全组配置

阿里云 ECS 安全组入方向至少开放：

```text
TCP 22    SSH 远程连接
TCP 80    HTTP，证书申请和跳转 HTTPS
TCP 443   HTTPS
ICMP      可选，用于 ping 检测
```

Ubuntu 不需要 `RDP(3389)`，如存在建议删除。

## 日常更新流程

### 1. 本地修改并推送

```powershell
cd E:\CodeX_Projects\MyWebsite\wwwroot
git status
git add .
git commit -m "Update website"
git push
```

### 2. 服务器拉取并重载

```bash
cd /opt/mywebsite
git pull
nginx -t
systemctl reload nginx
systemctl restart deepseek-proxy
```

如果只修改 HTML/CSS/图片，通常 `systemctl reload nginx` 即可。如果修改了 `server/deepseek-proxy.js`，需要重启 `deepseek-proxy`。

## 常用检查命令

检查网站 HTTP/HTTPS：

```bash
curl -I http://zhangjiaqi.info
curl -I https://zhangjiaqi.info
curl -I https://www.zhangjiaqi.info
```

检查 Nginx：

```bash
nginx -t
systemctl status nginx
journalctl -u nginx -n 100 --no-pager
```

检查 AI 代理：

```bash
systemctl status deepseek-proxy
journalctl -u deepseek-proxy -n 100 --no-pager
```

检查证书：

```bash
certbot certificates
certbot renew --dry-run
```

检查代码中是否误提交密钥：

```bash
grep -R "sk-" /opt/mywebsite || echo "No secret found"
```

本地也可以检查：

```powershell
cd E:\CodeX_Projects\MyWebsite\wwwroot
rg "sk-"
```

## 故障排查

### 域名无法访问

- 检查阿里云 DNS 是否有 `@` 和 `www` 的 A 记录。
- 检查 ECS 安全组是否开放 `80` 和 `443`。
- 检查 Nginx 是否运行：`systemctl status nginx`。
- 检查站点目录是否存在：`ls /opt/mywebsite`。

### HTTPS 证书申请失败

- 确认 DNS 已解析到服务器公网 IP。
- 确认 `http://zhangjiaqi.info` 能返回 `200` 或 `301`。
- 等 DNS 完全生效后重试。
- 查看日志：`/var/log/letsencrypt/letsencrypt.log`。

### AI 功能不可用

- 检查 `deepseek-proxy` 服务是否运行。
- 检查 `/etc/mywebsite/deepseek.env` 是否存在且包含有效 `DEEPSEEK_API_KEY`。
- 检查 Nginx 是否配置了 `/api/deepseek/` 反向代理。
- 查看代理日志：`journalctl -u deepseek-proxy -n 100 --no-pager`。

## 注意事项

- 不要把 API Key、证书私钥、`.env` 文件提交到 GitHub。
- 前端代码中不要直接请求 DeepSeek 并携带 API Key。
- 修改备案号、域名、服务器 IP 后，需要同步更新页面、DNS 和 Nginx 配置。
- 网站开通后应按要求完成公安联网备案。

