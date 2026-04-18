// ========================================
// dash.js Demo
// ========================================

let dashPlayer = null;
let qualityIndex = 0;

function playDashDemo() {
    const statusEl = document.getElementById('dashStatus');
    const video = document.getElementById('dashVideo');

    try {
        // 检查 dash.js 是否加载
        if (typeof dashjs === 'undefined') {
            statusEl.textContent = '状态: dash.js 库未加载';
            return;
        }

        // 1. 创建播放器实例
        dashPlayer = dashjs.MediaPlayer().create();

        // 2. 初始化播放器
        // 参数: (videoElement, manifestUrl, autoPlay)
        const manifestUrl = 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd';
        dashPlayer.initialize(video, manifestUrl, true);

        // 3. 监听事件
        dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
            statusEl.textContent = '状态: 流已初始化，自动适应码率中...';
        });

        dashPlayer.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_REQUESTED, (e) => {
            statusEl.textContent = `状态: 清晰度已切换 (${e.newQualityIndex})`;
        });

        dashPlayer.on(dashjs.MediaPlayer.events.PLAYBACK_ENDED, () => {
            statusEl.textContent = '状态: 播放结束';
        });

        dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e) => {
            statusEl.textContent = `状态: 错误 - ${e.error.message}`;
        });

        statusEl.textContent = '状态: 正在连接流...';

    } catch (error) {
        statusEl.textContent = `状态: ${error.message}`;
    }
}

function changeDashQuality() {
    if (!dashPlayer) {
        document.getElementById('dashStatus').textContent = '状态: 播放器未初始化';
        return;
    }

    try {
        const statusEl = document.getElementById('dashStatus');

        // 尝试不同的 API 获取清晰度列表
        let bitrateList = null;

        // 尝试方法 1: getBitrateList()
        if (typeof dashPlayer.getBitrateList === 'function') {
            bitrateList = dashPlayer.getBitrateList('video');
        }
        // 尝试方法 2: getAvailableBitrates()
        else if (typeof dashPlayer.getAvailableBitrates === 'function') {
            bitrateList = dashPlayer.getAvailableBitrates();
        }
        // 尝试方法 3: getBitrateList() (无参数)
        else if (typeof dashPlayer.getBitrateList === 'function') {
            bitrateList = dashPlayer.getBitrateList();
        }

        if (!bitrateList || !Array.isArray(bitrateList) || bitrateList.length === 0) {
            statusEl.textContent = '状态: 无可用清晰度或播放器未就绪';
            return;
        }

        // 禁用自适应，启用手动切换
        dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: { video: false }
                }
            }
        });

        // 循环切换清晰度
        qualityIndex = (qualityIndex + 1) % bitrateList.length;

        // 尝试不同的 setQuality 方法
        if (typeof dashPlayer.setQualityFor === 'function') {
            dashPlayer.setQualityFor('video', qualityIndex);
        } else if (typeof dashPlayer.updateSettings === 'function') {
            dashPlayer.updateSettings({
                streaming: {
                    abr: {
                        autoSwitchBitrate: { video: false }
                    }
                }
            });
        }

        const selectedQuality = bitrateList[qualityIndex];
        const bitrate = selectedQuality.bitrate ? selectedQuality.bitrate / 1000 : '未知';
        statusEl.textContent = `状态: 已切换到清晰度 ${qualityIndex + 1}/${bitrateList.length} (${bitrate}kbps)`;

    } catch (error) {
        document.getElementById('dashStatus').textContent = `状态: 切换失败 - ${error.message}`;
        console.error('清晰度切换错误:', error, '播放器对象:', dashPlayer);
    }
}

// dash.js 核心概念说明
const dashJSConcepts = {
    // 1. 自适应码率 (ABR - Adaptive Bit Rate)
    abr: `
        // 自动根据网络条件切换码率
        dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: { video: true, audio: false }
                }
            }
        });
    `,

    // 2. 获取比特率列表
    bitrateList: `
        // 获取所有可用的视频清晰度
        const bitrateList = dashPlayer.getBitrateList('video');
        // 返回: [{ bitrate: 500000, width: 320, height: 180 }, ...]
    `,

    // 3. 手动切换清晰度
    setQuality: `
        // 禁用自适应，手动选择清晰度 (0 = 最低, n = 最高)
        dashPlayer.updateSettings({
            streaming: { abr: { autoSwitchBitrate: { video: false } } }
        });
        dashPlayer.setQualityFor('video', 2); // 切换到第 3 清晰度
    `,

    // 4. DASH Manifest 格式
    manifest: `
        <!-- DASH Manifest (MPD) 是 XML 格式，定义了视频的所有清晰度和片段信息 -->
        <MPD>
            <Period>
                <AdaptationSet mimeType="video/mp4">
                    <!-- 不同清晰度的视频 -->
                    <Representation id="v1" bandwidth="500000" width="320" height="180">
                        <BaseURL>segment1.m4s</BaseURL>
                    </Representation>
                    <Representation id="v2" bandwidth="1000000" width="640" height="360">
                        <BaseURL>segment2.m4s</BaseURL>
                    </Representation>
                </AdaptationSet>
            </Period>
        </MPD>
    `,

    // 5. 常用事件
    events: `
        // 流初始化完成
        dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {});

        // 清晰度改变
        dashPlayer.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_REQUESTED, (e) => {
            console.log('切换到清晰度:', e.newQualityIndex);
        });

        // 缓冲进度
        dashPlayer.on(dashjs.MediaPlayer.events.BUFFER_LEVEL_STATE_CHANGED, (e) => {
            console.log('缓冲状态:', e.state);
        });
    `
};

console.log('dash.js 核心 API:', dashJSConcepts);
