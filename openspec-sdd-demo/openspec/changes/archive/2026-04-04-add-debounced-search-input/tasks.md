## 1. 组件创建

- [x] 1.1 创建 `src/components/SearchInput/SearchInput.tsx` 组件文件
- [x] 1.2 定义 `SearchInputProps` TypeScript 接口（`value`、`onChange`、`onSearch`、`loading`、`debounceDelay`、`placeholder`）
- [x] 1.3 实现受控/非受控模式判断逻辑（通过 `value` 是否为 undefined 区分）

## 2. 防抖核心逻辑

- [x] 2.1 使用 `useRef` 存储 `setTimeout` 的 timer id
- [x] 2.2 在输入变化时清除旧 timer 并设置新 timer，延迟调用 `onSearch`
- [x] 2.3 在 `useEffect` cleanup 中清除 timer，确保组件卸载时不触发回调

## 3. Loading 状态 UI

- [x] 3.1 实现内联 SVG spinner 图标（旋转动画用 CSS `animate-spin` 或内联 keyframe）
- [x] 3.2 在 `loading` 为 true 时显示 spinner，false 时用 `invisible` 隐藏（保留占位）
- [x] 3.3 调整 input 右侧 padding，避免文字与 spinner 重叠

## 4. 导出与集成

- [x] 4.1 创建 `src/components/SearchInput/index.js` 导出组件
- [x] 4.2 在 Demo 页面中引入 `SearchInput`，展示受控模式 + loading 状态的使用示例
