# Web 播放器学习 Demo

## 📚 学习目标

理解现代网络视频播放的两个核心技术：
1. **MSE (Media Source Extensions)** - 浏览器底层 API
2. **dash.js** - 高级流媒体播放库

---

## 🎯 MSE (Media Source Extensions) 详解

### 什么是 MSE？

MSE 是浏览器的**低级 API**，让 JavaScript 代码可以**动态生成视频流**，而不需要完整的视频文件。

```javascript
// 核心流程：
1. 创建 MediaSource 对象
2. 将其绑定到 <video> 元素
3. 创建 SourceBuffer (指定视频编码格式)
4. 分段调用 appendBuffer() 追加视频数据
5. 所有数据添加后调用 endOfStream()
```

### MSE 的核心 API

```javascript
// 1. 创建 MediaSource
const mediaSource = new MediaSource();
const url = URL.createObjectURL(mediaSource);
video.src = url;

// 2. 等待 sourceopen 事件
mediaSource.addEventListener('sourceopen', () => {
    // 3. 添加 SourceBuffer (需指定 MIME 类型和编码)
    const mimeType = 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"';
    const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

    // 4. 追加视频数据（通常是 HTTP 请求的结果）
    sourceBuffer.appendBuffer(arrayBuffer);

    // 5. 标记流结束
    mediaSource.endOfStream();
});
```

### MSE 的使用场景

| 场景 | 说明 |
|------|------|
| **直播流** | 分段接收直播数据，实时播放 |
| **自适应码率** | 根据网络条件动态切换清晰度 |
| **点播** | 用户可以快速定位视频的任何位置 |
| **自定义播放器** | 完全控制视频播放行为 |

### MSE 的工作流程

```
┌─────────────────────────────────────────────────────────┐
│                  浏览器 <video> 元素                      │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
                   MediaSource API
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    SourceBuffer      SourceBuffer       SourceBuffer
      (video)          (audio)           (subtitle)
        │                  │                  │
        ▼                  ▼                  ▼
    appendBuffer()   appendBuffer()    appendBuffer()
        │                  │                  │
        ◄──────────────────┼──────────────────►
                   JavaScript Code
```

### 关键概念

- **初始化段 (Initialization Segment)**：包含视频编码信息的特殊段
- **媒体段 (Media Segment)**：实际的视频/音频数据
- **TimeRange**：已缓冲的时间范围，可通过 `sourceBuffer.buffered` 获取
- **SourceBuffer 状态**：`updating` 状态时不能添加新数据

---

## 🎬 dash.js 详解

### 什么是 dash.js？

dash.js 是基于 MSE 的**开源流媒体播放库**，实现了 DASH 标准，提供：
- ✅ 自动码率适应 (ABR)
- ✅ 清晰度切换
- ✅ 缓冲管理
- ✅ 错误恢复

### DASH 简介

**DASH** = Dynamic Adaptive Streaming over HTTP

关键特点：
- 使用 **MPD (Media Presentation Description)** 文件描述视频
- 将视频分成多个片段 (Segment)
- 每个片段有多个清晰度版本
- 播放器根据网络条件自动选择清晰度

### dash.js 快速开始

```html
<video id="video" controls></video>
<script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>

<script>
    const player = dashjs.MediaPlayer().create();
    player.initialize(
        document.getElementById('video'),
        'https://example.com/video.mpd',  // DASH Manifest URL
        true  // autoPlay
    );
</script>
```

### dash.js 核心 API

#### 1. 获取可用清晰度

```javascript
// 获取所有可用的视频清晰度
const bitrateList = dashPlayer.getBitrateList('video');

// 输出示例：
// [
//   { bitrate: 500000, width: 320, height: 180, ... },
//   { bitrate: 1000000, width: 640, height: 360, ... },
//   { bitrate: 2000000, width: 1280, height: 720, ... }
// ]
```

#### 2. 手动切换清晰度

```javascript
// 禁用自适应码率，启用手动切换
dashPlayer.updateSettings({
    streaming: {
        abr: {
            autoSwitchBitrate: { video: false }
        }
    }
});

// 切换到第 1 个清晰度 (索引从 0 开始)
dashPlayer.setQualityFor('video', 0);  // 最低质量
dashPlayer.setQualityFor('video', 2);  // 第 3 个清晰度
```

#### 3. 获取当前清晰度信息

```javascript
// 获取当前比特率
const currentBitrate = dashPlayer.getBitrateList('video')
    [dashPlayer.getQualityFor('video')];

console.log(`当前清晰度: ${currentBitrate.bitrate / 1000}kbps`);
console.log(`分辨率: ${currentBitrate.width}x${currentBitrate.height}`);
```

#### 4. 自动码率适应 (ABR)

```javascript
// 启用自动码率适应（默认启用）
dashPlayer.updateSettings({
    streaming: {
        abr: {
            autoSwitchBitrate: { video: true }
            // ABR 算法会根据缓冲和网络条件自动调整码率
        }
    }
});
```

### dash.js 重要事件

```javascript
// 流初始化完成，可以获取清晰度列表
dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
    console.log('可用清晰度:', dashPlayer.getBitrateList('video').length);
});

// 清晰度改变事件
dashPlayer.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_REQUESTED, (e) => {
    console.log('清晰度改变为:', e.newQualityIndex);
});

// 缓冲状态改变
dashPlayer.on(dashjs.MediaPlayer.events.BUFFER_LEVEL_STATE_CHANGED, (e) => {
    console.log('缓冲状态:', e.state);  // 'bufferStalled', 'bufferLoaded', etc
});

// 播放错误
dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e) => {
    console.error('播放错误:', e.error);
});
```

### DASH Manifest (MPD) 文件结构

```xml
<?xml version="1.0" encoding="utf-8"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" type="static" duration="PT10M">
  <Period>
    <!-- 视频流 -->
    <AdaptationSet mimeType="video/mp4">
      <!-- 清晰度 1: 320x180 @ 500kbps -->
      <Representation id="video-1" bandwidth="500000" width="320" height="180">
        <BaseURL>video-1/init.mp4</BaseURL>
        <SegmentList>
          <Initialization sourceURL="video-1/init.mp4"/>
          <SegmentURL media="video-1/segment-1.m4s"/>
          <SegmentURL media="video-1/segment-2.m4s"/>
        </SegmentList>
      </Representation>

      <!-- 清晰度 2: 640x360 @ 1000kbps -->
      <Representation id="video-2" bandwidth="1000000" width="640" height="360">
        <!-- ... -->
      </Representation>
    </AdaptationSet>

    <!-- 音频流 -->
    <AdaptationSet mimeType="audio/mp4">
      <Representation id="audio-1" bandwidth="128000">
        <!-- ... -->
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>
```

---

## 🔄 MSE vs dash.js 对比

| 特性 | MSE | dash.js |
|------|-----|---------|
| **抽象层级** | 底层 API | 高层库 |
| **学习曲线** | 陡峭 | 平缓 |
| **自动码率** | 需自己实现 | ✅ 内置 |
| **清晰度切换** | 需自己实现 | ✅ 简单 API |
| **错误恢复** | 需自己实现 | ✅ 内置 |
| **灵活性** | 最高 | 受限制 |
| **使用场景** | 自定义播放器 | 快速集成 DASH |
| **代码量** | 数百行 | 几行 |

---

## 📖 推荐学习路径

### 阶段 1: MSE 基础
1. 理解 MediaSource 和 SourceBuffer 的关系
2. 学会追加 H.264 视频数据
3. 处理 BufferedRange

### 阶段 2: DASH 标准
1. 理解 MPD manifest 格式
2. 学会解析清晰度和片段信息
3. 了解初始化段和媒体段

### 阶段 3: dash.js 实战
1. 集成 dash.js 到项目
2. 实现清晰度切换 UI
3. 处理网络错误和重连

### 阶段 4: 高级功能
1. 自定义 ABR 算法
2. 实现广告插入
3. 支持字幕和字幕轨道

---

## 🚀 本地运行

```bash
# 直接用浏览器打开 index.html
# 推荐使用 Python 简单 HTTP 服务器避免跨域问题
python3 -m http.server 8000

# 或用 Node.js http-server
npx http-server
```

然后访问：`http://localhost:8000`

---

## 📚 参考资源

- [MDN: Media Source Extensions](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API)
- [DASH Industry Forum](https://dashif.org/)
- [dash.js GitHub](https://github.com/Dash-Industry-Forum/dash.js)
- [MPEG DASH Specification](https://standards.iso.org/ittf/PubliclyAvailableStandards/c057623_ISO_IEC_23009-1_2022(E).zip)
