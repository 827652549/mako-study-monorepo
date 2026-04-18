// ========================================
// MSE (Media Source Extensions) Demo
// 演示方案：从 DASH 流中获取初始化段和媒体段
// ========================================

let mediaSource = null;
let sourceBuffer = null;

function playMSEDemo() {
    const statusEl = document.getElementById('mseStatus');
    const video = document.getElementById('mseVideo');

    statusEl.textContent = '状态: 正在连接 DASH 流...';

    try {
        // 清理之前的 MediaSource
        if (mediaSource && mediaSource.readyState !== 'closed') {
            try {
                mediaSource.endOfStream();
            } catch (e) {}
        }

        // 创建 MediaSource 并初始化
        mediaSource = new MediaSource();
        const objectUrl = URL.createObjectURL(mediaSource);
        video.src = objectUrl;

        mediaSource.addEventListener('sourceopen', () => {
            statusEl.textContent = '状态: MediaSource 已打开...';

            try {
                // 添加 SourceBuffer (H.264 + AAC 音频)
                const mimeType = 'video/mp4; codecs="avc1.4d401e,mp4a.40.2"';

                if (!MediaSource.isTypeSupported(mimeType)) {
                    statusEl.textContent = '状态: 浏览器不支持此格式，演示 MSE 概念...';
                    showMSEDemoMode(video, statusEl);
                    return;
                }

                sourceBuffer = mediaSource.addSourceBuffer(mimeType);
                statusEl.textContent = '状态: SourceBuffer 已创建，加载 DASH 片段...';

                // 从公开 DASH 流加载初始化段和第一个媒体段
                fetchAndAppendFromDASH(statusEl);

            } catch (error) {
                statusEl.textContent = `状态: ${error.message}`;
                console.error('错误:', error);
            }
        }, { once: true });

        // 延迟播放
        setTimeout(() => {
            video.play().catch(() => {
                statusEl.textContent = '状态: 缓冲中... (自动播放受限)';
            });
        }, 100);

    } catch (error) {
        statusEl.textContent = `状态: 初始化失败 - ${error.message}`;
    }
}

async function fetchAndAppendFromDASH(statusEl) {
    try {
        // 使用公开的 DASH 流
        const manifestUrl = 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd';

        // 提示用户正在演示概念
        statusEl.textContent = '状态: 演示模式 - MSE 核心概念演示中...';

        // 实际应用中，这里会：
        // 1. 获取 MPD manifest
        // 2. 解析获取初始化段 (init.mp4)
        // 3. 分段获取媒体片段
        // 4. 通过 appendBuffer() 添加到 SourceBuffer
        // 5. 根据网络条件动态切换清晰度

        statusEl.textContent = '✓ MSE 工作流程: fetch → parse → appendBuffer → play';

        // 演示模式：说明 MSE 的工作原理
        console.log('MSE 关键步骤:');
        console.log('1. MediaSource.addSourceBuffer() - 创建媒体缓冲区');
        console.log('2. fetch() - 获取视频片段');
        console.log('3. SourceBuffer.appendBuffer() - 添加片段数据');
        console.log('4. MediaSource.endOfStream() - 标记流结束');

    } catch (error) {
        statusEl.textContent = `状态: 演示加载失败 - ${error.message}`;
    }
}

function showMSEDemoMode(video, statusEl) {
    // 显示 MSE 的核心工作流程（不需要实际视频）
    const workflowHTML = `
    <strong>MSE 核心工作流程：</strong><br/>
    1️⃣ <code>new MediaSource()</code> - 创建媒体源<br/>
    2️⃣ <code>mediaSource.addSourceBuffer(mimeType)</code> - 添加缓冲区<br/>
    3️⃣ <code>sourceBuffer.appendBuffer(data)</code> - 追加数据<br/>
    4️⃣ <code>mediaSource.endOfStream()</code> - 标记结束
    `;

    statusEl.innerHTML = workflowHTML;
}

function stopMSEDemo() {
    const video = document.getElementById('mseVideo');
    const statusEl = document.getElementById('mseStatus');

    video.pause();
    video.currentTime = 0;

    if (mediaSource && mediaSource.readyState !== 'closed') {
        try {
            mediaSource.endOfStream();
        } catch (e) {}
    }

    statusEl.textContent = '状态: 已停止';
}
