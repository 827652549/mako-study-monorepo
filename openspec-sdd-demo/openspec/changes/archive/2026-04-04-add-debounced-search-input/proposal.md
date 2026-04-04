## Why

搜索功能是常见的交互场景，但直接在每次输入时触发搜索会导致大量不必要的请求，影响性能和用户体验。需要一个封装好防抖逻辑并支持 loading 状态展示的搜索输入组件，方便复用。

## What Changes

- 新增 `SearchInput` 组件，内置防抖（debounce）逻辑，默认延迟 300ms
- 支持 `loading` prop，在搜索进行中展示加载指示器
- 支持自定义防抖延迟时间（`debounceDelay` prop）
- 支持 `onSearch` 回调，在防抖结束后触发
- 支持受控与非受控两种使用模式

## Capabilities

### New Capabilities

- `debounced-search-input`: 带防抖的搜索输入框组件，支持 loading 状态、自定义延迟、受控/非受控模式

### Modified Capabilities

## Impact

- 新增组件文件，无破坏性变更
- 依赖 React 内置 hooks（`useState`、`useEffect`、`useRef`），无额外外部依赖
- 适用于任何需要搜索功能的页面
