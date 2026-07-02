console.log('zhangjiaqi.info',
    'background-color: #ff00ff; color: white; font-size: 24px; font-weight: bold; padding: 10px;'
);
console.log('%c   /\\_/\\', 'color: #8B4513; font-size: 20px;');
console.log('%c  ( o.o )', 'color: #8B4513; font-size: 20px;');
console.log(' %c  > ^ <', 'color: #8B4513; font-size: 20px;');
console.log('  %c /  ~ \\', 'color: #8B4513; font-size: 20px;');
console.log('  %c/______\\', 'color: #8B4513; font-size: 20px;');

(function revealPageWhenReady() {
    var start = performance.now();
    var revealed = false;

    function reveal() {
        if (revealed) return;
        revealed = true;

        var delay = Math.max(0, 650 - (performance.now() - start));
        setTimeout(function () {
            requestAnimationFrame(function () {
                document.body.classList.remove('page-booting');
                document.body.classList.add('page-ready');
            });
        }, delay);
    }

    function fallbackReveal() {
        document.body.classList.remove('page-booting');
        document.body.classList.add('page-ready');
    }

    if (document.readyState === 'complete') {
        reveal();
    } else {
        window.addEventListener('load', reveal, { once: true });
    }

    setTimeout(reveal, 1400);
    setTimeout(fallbackReveal, 2200);
})();

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function handlePress(event) {
    this.classList.add('pressed');
}

function handleRelease(event) {
    this.classList.remove('pressed');
}

function handleCancel(event) {
    this.classList.remove('pressed');
}

var buttons = document.querySelectorAll('.projectItem');
buttons.forEach(function (button) {
    button.addEventListener('mousedown', handlePress);
    button.addEventListener('mouseup', handleRelease);
    button.addEventListener('mouseleave', handleCancel);
    button.addEventListener('touchstart', handlePress);
    button.addEventListener('touchend', handleRelease);
    button.addEventListener('touchcancel', handleCancel);
});

function toggleClass(selector, className) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        element.classList.toggle(className);
    });
}

function pop(imageURL) {
    var tcMainElement = document.querySelector(".tc-img");
    if (imageURL) {
        tcMainElement.src = imageURL;
    }
    toggleClass(".tc-main", "active");
    toggleClass(".tc", "active");
}

var tc = document.getElementsByClassName('tc');
var tc_main = document.getElementsByClassName('tc-main');
if (tc.length > 0) {
    tc[0].addEventListener('click', function (event) {
        pop();
    });
}
if (tc_main.length > 0) {
    tc_main[0].addEventListener('click', function (event) {
        event.stopPropagation();
    });
}

class MouseFollowTooltip {
    constructor() {
        this.tooltip = document.getElementById('mouseTooltip');
        this.currentTarget = null;
        this.isVisible = false;
        
        this.init();
    }

    init() {
        // 为标题元素添加data-tooltip属性和事件监听
        const titleElements = [
            { selector: '.title-site', text: '个人网站和项目展示平台' },
            { selector: '.title-project', text: '技术项目和开源作品' },
            { selector: '.title-skills', text: '掌握的编程语言和技术栈' }
        ];

        titleElements.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element) {
                element.setAttribute('data-tooltip', item.text);
                element.addEventListener('mouseenter', (e) => this.showTooltip(e));
                element.addEventListener('mousemove', (e) => this.moveTooltip(e));
                element.addEventListener('mouseleave', () => this.hideTooltip());
            }
        });
    }

    showTooltip(event) {
        const element = event.currentTarget;
        const tooltipText = element.getAttribute('data-tooltip');
        
        if (!tooltipText) return;
        
        this.currentTarget = element;
        this.tooltip.textContent = tooltipText;
        this.tooltip.style.opacity = '1';
        this.tooltip.style.visibility = 'visible';
        this.isVisible = true;
        
        // 初始位置设置
        this.updateTooltipPosition(event);
    }

    moveTooltip(event) {
        if (!this.isVisible || !this.currentTarget) return;
        
        this.updateTooltipPosition(event);
    }

    hideTooltip() {
        this.tooltip.style.opacity = '0';
        this.tooltip.style.visibility = 'hidden';
        this.currentTarget = null;
        this.isVisible = false;
    }

    updateTooltipPosition(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        // 获取提示框尺寸
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const tooltipWidth = tooltipRect.width;
        const tooltipHeight = tooltipRect.height;
        
        // 获取视口尺寸
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 计算提示框位置，默认在鼠标右下角
        let left = mouseX + 15;
        let top = mouseY + 15;
        
        // 边界检测和调整
        if (left + tooltipWidth > viewportWidth) {
            left = mouseX - tooltipWidth - 15; // 移到鼠标左侧
        }
        
        if (top + tooltipHeight > viewportHeight) {
            top = mouseY - tooltipHeight - 15; // 移到鼠标上方
        }
        
        // 确保不超出左边界和上边界
        left = Math.max(10, left);
        top = Math.max(10, top);
        
        // 应用位置
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }
}

// 粒子文字系统
class ParticleText {
    constructor(canvas, text) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.text = text;
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.avoidDistance = 20;
        this.particleCount = 5000;
        
        this.setupCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    createParticles() {
        this.particles = [];
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        
        tempCtx.fillStyle = '#ffffff';
        tempCtx.font = 'bold 85px system-ui, -apple-system, sans-serif';
        tempCtx.fontWeight = '800';
        tempCtx.textAlign = 'left';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(this.text, 0, tempCanvas.height / 2);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        
        const gap = 4;
        for (let y = 0; y < tempCanvas.height; y += gap) {
            for (let x = 0; x < tempCanvas.width; x += gap) {
                const index = (y * tempCanvas.width + x) * 4;
                const alpha = pixels[index + 3];
                
                if (alpha > 128) {
                    const particle = {
                        x: x,
                        y: y,
                        originalX: x,
                        originalY: y,
                        size: Math.random() * 1 + 1,
                        opacity: Math.random() * 0.8 + 0.8,
                        color: '#ffffff',
                        returnSpeed: 0.06 + Math.random() * 0.04
                    };
                    this.particles.push(particle);
                }
            }
        }
        
        if (this.particles.length > this.particleCount) {
            this.particles = this.particles
                .sort(() => Math.random() - 0.5)
                .slice(0, this.particleCount);
        }
    }
    
    bindEvents() {
        const container = this.canvas.parentElement;
        
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        container.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
        
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.setupCanvas();
                this.createParticles();
            }, 100);
        });
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.avoidDistance) {
                const angle = Math.atan2(dy, dx);
                const force = (this.avoidDistance - distance) / this.avoidDistance;
                const avoidX = particle.x - Math.cos(angle) * force * 10;
                const avoidY = particle.y - Math.sin(angle) * force * 10;
                
                particle.x += (avoidX - particle.x) * 0.1;
                particle.y += (avoidY - particle.y) * 0.1;
            } else {
                const returnX = particle.originalX - particle.x;
                const returnY = particle.originalY - particle.y;
                
                particle.x += returnX * particle.returnSpeed;
                particle.y += returnY * particle.returnSpeed;
            }
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    updateColor(color) {
        this.particles.forEach(p => p.color = color);
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

let particleTextInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('name-canvas');
    if (canvas) {
        setTimeout(() => {
            particleTextInstance = new ParticleText(canvas, '张佳琦');
        }, 500);
    }
    new MouseFollowTooltip();
});

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

// ---- realtime clock (robust) ----
function pad(n){ return String(n).padStart(2,'0'); }
function formatNow(){
  const d = new Date();
  return (
    d.getFullYear() + '-' +
    pad(d.getMonth()+1) + '-' +
    pad(d.getDate()) + ' ' +
    pad(d.getHours()) + ':' +
    pad(d.getMinutes()) + ':' +
    pad(d.getSeconds())
  );
}
function startClock(){
  let el = document.getElementById('clock');
  if (!el) return;
  function tick(){ el.textContent = formatNow(); }
  tick();
  return setInterval(tick, 1000);
}

document.addEventListener('DOMContentLoaded', function () {

    var html = document.querySelector('html');
    var themeState = getCookie("themeState") || "Light";
    var tanChiShe = document.getElementById("tanChiShe");
    
    try { startClock(); } catch (e) { console.error('Clock init failed:', e); }

    function changeTheme(theme) {
        if(tanChiShe) tanChiShe.src = "./static/svg/snake-" + theme + ".svg";
        html.dataset.theme = theme;
        setCookie("themeState", theme, 365);
        themeState = theme;
        
        // 粒子文字颜色跟随主题
        if (particleTextInstance) {
            particleTextInstance.updateColor(theme === 'Dark' ? '#2c3e50' : '#ffffff');
        }
    }

    var Checkbox = document.getElementById('myonoffswitch')
    if (Checkbox) {
        Checkbox.addEventListener('change', function () {
            if (themeState == "Dark") {
                changeTheme("Light");
            } else if (themeState == "Light") {
                changeTheme("Dark");
            } else {
                changeTheme("Dark");
            }
        });

        if (themeState == "Dark") {
            Checkbox.checked = false;
        }
    }

    changeTheme(themeState);

    var fpsElement = document.createElement('div');
    fpsElement.id = 'fps';
    fpsElement.style.zIndex = '10000';
    fpsElement.style.position = 'fixed';
    fpsElement.style.left = '0';
    document.body.insertBefore(fpsElement, document.body.firstChild);

    var showFPS = (function () {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        var fps = 0,
            last = Date.now(),
            offset, step, appendFps;

        step = function () {
            offset = Date.now() - last;
            fps += 1;

            if (offset >= 1000) {
                last += offset;
                appendFps(fps);
                fps = 0;
            }

            requestAnimationFrame(step);
        };

        appendFps = function (fpsValue) {
            fpsElement.textContent = 'FPS: ' + fpsValue;
        };

        step();
    })();
});

// ================= AI 客服组件 (DeepSeek 版) =================

const AI_BACKEND_ENDPOINT = '/api/deepseek/chat/completions';

// 定义 AI 的人设（System Prompt）
const SYSTEM_PROMPT = `
你叫“张佳琦的数字分身”，是运行在张佳琦个人网站上的智能助手。
请基于以下信息回答访客的问题。如果不清楚，就反馈给访客说还不了解这部分内容。

【关于张佳琦】
- 学历：南京航空航天大学 硕士在读 (2024.9-2027.6)，本科也毕业于南航。
- 标签：深度学习、大模型、996捍卫者、AI应用、全栈开发。
- 所在地：中国江苏。

【技术栈】
- 擅长：Deep Learning, LLM 微调与应用, Python, JavaScript, Full Stack。

【主要项目】
1. 基于LangStudio & LLM的RAG及联网搜索对答。
2. Easy Dataset × LLaMA Factory: 领域大模型微调工具。
3. 基于LangChain的Agent智能体开发。
4. Ollama & Chatbox 本地模型离线部署与交流可视化。
5. 个人网站：zhangjiaqi.info。

【链接】
- Github: https://github.com/Zjq1115
- CSDN: https://blog.csdn.net/dikaerhanshua
- 简历：https://www.qmjianli.com/cvs/23413NJPLAUTRKW8

请用专业、适当幽默且乐于助人的语气回答。
`;

// 聊天历史记录
let chatHistory = [
    { role: "system", content: SYSTEM_PROMPT }
];

// ===== Tab 切换 =====
function switchNavTab(tab) {
    document.querySelectorAll('.ai-nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ai-nav-tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`.ai-nav-tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab === 'nav' ? 'tabNav' : 'tabChat').classList.add('active');
    
    if (tab === 'chat') {
        setTimeout(() => {
            const input = document.getElementById('navChatInput');
            if (input) input.focus();
            const msgs = document.getElementById('navChatMessages');
            if (msgs) msgs.scrollTop = msgs.scrollHeight;
        }, 100);
    }
}

// ===== 导航面板内的 AI 对话 =====
async function sendNavChat() {
    const input = document.getElementById('navChatInput');
    const text = input.value.trim();
    if (!text) return;

    const container = document.getElementById('navChatMessages');

    // 添加用户消息
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-nav-chat-msg user';
    userDiv.textContent = text;
    container.appendChild(userDiv);
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // 显示 typing
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-nav-chat-typing';
    typingDiv.id = 'navChatTyping';
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;

    // 调用 DeepSeek
    chatHistory.push({ role: "user", content: text });
    if (chatHistory.length > 11) {
        chatHistory = [chatHistory[0], ...chatHistory.slice(-10)];
    }

    try {
        if (!AI_BACKEND_ENDPOINT) {
            throw new Error("AI service is not configured.");
        }

        const response = await fetch(AI_BACKEND_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: chatHistory,
                stream: true,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `API Error: ${response.status}`);
        }

        // 移除 typing
        const ti = document.getElementById('navChatTyping');
        if (ti) ti.remove();

        // 创建 AI 消息气泡
        const aiDiv = document.createElement('div');
        aiDiv.className = 'ai-nav-chat-msg ai';
        container.appendChild(aiDiv);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let aiFullText = "";
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine.startsWith('data: ')) continue;
                const jsonStr = trimmedLine.slice(6);
                if (jsonStr === '[DONE]') continue;

                try {
                    const data = JSON.parse(jsonStr);
                    const content = data.choices[0].delta.content || "";
                    if (content) {
                        aiFullText += content;
                        if (typeof marked !== 'undefined') {
                            aiDiv.innerHTML = marked.parse(aiFullText);
                        } else {
                            aiDiv.textContent = aiFullText;
                        }
                        container.scrollTop = container.scrollHeight;
                    }
                } catch (e) {
                    console.warn("JSON parsing error in stream:", e);
                }
            }
        }

        chatHistory.push({ role: "assistant", content: aiFullText });

    } catch (error) {
        const ti = document.getElementById('navChatTyping');
        if (ti) ti.remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'ai-nav-chat-msg ai';
        errDiv.textContent = "抱歉，服务器暂时无法响应，请稍后再试 🤖";
        container.appendChild(errDiv);
        console.error("AI Chat Error:", error);
    }
}

// ================= AI 智能导航面板 =================

// 面板常驻显示，无需开关

// 导航目标映射
const NAV_SECTION_MAP = {
    'projects': '.title-project',
    'sites': '.title-site',
    'skills': '.title-skills',
    'resume': '.left-time',
    'contact': '.iconContainer',
    'top': '.zyyo-main'
};

// 浏览足迹
const navHistoryList = [];

function addNavHistory(name) {
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    
    // 去重：如果最近一条相同就不加了
    if (navHistoryList.length > 0 && navHistoryList[navHistoryList.length - 1].name === name) return;
    
    navHistoryList.push({ name, time });
    if (navHistoryList.length > 8) navHistoryList.shift();
    
    renderNavHistory();
}

function renderNavHistory() {
    const container = document.getElementById('navHistory');
    if (!container) return;
    
    if (navHistoryList.length === 0) {
        container.innerHTML = '<div class="ai-nav-empty">还没有浏览记录</div>';
        return;
    }
    
    container.innerHTML = navHistoryList.slice().reverse().map(item =>
        `<div class="ai-nav-history-item">
            <span class="h-dot"></span>
            <span>${item.name}</span>
            <span class="h-time">${item.time}</span>
        </div>`
    ).join('');
}

// 滚动到指定板块 + 高亮
function navTo(target, label, e) {
    const selector = NAV_SECTION_MAP[target];
    if (!selector) return;
    
    const el = document.querySelector(selector);
    if (!el) return;
    
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 高亮动画
    el.classList.remove('nav-highlight-target');
    void el.offsetWidth; // 触发reflow重新播放动画
    el.classList.add('nav-highlight-target');
    setTimeout(() => el.classList.remove('nav-highlight-target'), 3000);
    
    // 按钮激活态
    document.querySelectorAll('.ai-nav-chip').forEach(c => c.classList.remove('active'));
    if (e && e.currentTarget) e.currentTarget.classList.add('active');
    setTimeout(() => {
        document.querySelectorAll('.ai-nav-chip').forEach(c => c.classList.remove('active'));
    }, 2000);
    
    // 记录足迹
    addNavHistory(label);
}

// AI 导航查询（调用 DeepSeek）
async function handleNavQuery() {
    const input = document.getElementById('navInput');
    const text = input.value.trim();
    if (!text) return;
    
    const responseDiv = document.getElementById('navResponse');
    
    // 显示loading
    responseDiv.className = 'ai-nav-response visible';
    responseDiv.innerHTML = `<div class="ai-nav-loading">
        <div class="ai-nav-loading-dot"></div>
        <div class="ai-nav-loading-dot"></div>
        <div class="ai-nav-loading-dot"></div>
    </div>`;
    
    input.value = '';
    
    try {
        if (!AI_BACKEND_ENDPOINT) {
            throw new Error("AI service is not configured.");
        }

        const response = await fetch(AI_BACKEND_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: `你是一个网站导航助手。根据用户的话判断他想看网站的哪个板块。
可用板块：projects(项目), sites(网站链接), skills(技能), resume(简历/教育经历), contact(联系方式), top(顶部)。
回复格式严格为：第一行是一句简短友好的引导语（不超过20字），第二行是 [NAV:板块ID]。
如果无法判断，第一行回复一句引导语，第二行写 [NAV:none]。
示例：
用户：想看你做了什么
回复：
带你去看看我的项目吧！
[NAV:projects]` },
                    { role: "user", content: text }
                ],
                temperature: 0.3,
                max_tokens: 60
            })
        });
        
        const data = await response.json();
        const reply = data.choices[0].message.content.trim();
        
        // 解析回复
        const navMatch = reply.match(/\[NAV:(\w+)\]/);
        const cleanText = reply.replace(/\n?\[NAV:\w+\]/, '').trim();
        
        if (navMatch && navMatch[1] !== 'none') {
            const target = navMatch[1];
            const labelMap = {
                'projects': '我的项目', 'sites': '我的网站', 'skills': '技能栈',
                'resume': '简历', 'contact': '联系方式', 'top': '页面顶部'
            };
            
            responseDiv.innerHTML = `<div class="nav-ai-text">${cleanText}</div>
                <div class="nav-jumping">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    正在跳转到「${labelMap[target] || target}」...
                </div>`;
            
            setTimeout(() => navTo(target, labelMap[target] || target), 600);
        } else {
            responseDiv.innerHTML = `<div class="nav-ai-text">${cleanText}</div>`;
        }
        
    } catch (err) {
        responseDiv.innerHTML = `<div class="nav-ai-text">抱歉，导航助手暂时无法响应 🤖</div>`;
        console.error('Nav AI Error:', err);
    }
}
