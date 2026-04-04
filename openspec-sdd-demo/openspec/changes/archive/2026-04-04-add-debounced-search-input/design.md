## Context

项目中需要一个可复用的搜索输入组件。当前无此组件，每个页面各自处理输入防抖和 loading 状态，存在重复逻辑。使用 React 18 + TypeScript，无状态管理库依赖。

## Goals / Non-Goals

**Goals:**
- 封装防抖逻辑，避免重复实现
- 统一 loading 状态的 UI 表现
- 支持受控与非受控两种使用模式
- 组件 API 简洁，易于接入

**Non-Goals:**
- 不包含下拉建议列表（autocomplete）
- 不处理搜索结果的展示
- 不引入额外 UI 组件库

## Decisions

### 防抖实现方式：自实现 vs 引入 lodash

选择使用 `useRef` + `setTimeout` 自实现防抖，不引入 lodash。

**理由**：组件逻辑简单，仅需一个 debounce，引入整个 lodash 或 lodash-es 不合算；自实现代码量少且易于理解。

**替代方案**：引入 `use-debounce` 库 —— 对于单一场景过重。

### 受控模式处理

通过判断 `value` prop 是否为 `undefined` 来区分受控/非受控模式，内部维护 `internalValue` state 用于非受控模式。

**理由**：与 React 原生 input 的 controlled/uncontrolled 语义保持一致。

### Loading 指示器

在 input 右侧展示一个旋转的 SVG spinner，`loading` 为 true 时显示，false 时隐藏（保留占位避免布局抖动）。

## Risks / Trade-offs

- [快速连续输入时组件卸载] → 在 `useEffect` cleanup 中清除定时器，避免内存泄漏
- [防抖期间 value 与显示不同步] → 输入框实时更新显示值，仅 `onSearch` 回调被防抖，不影响用户感知
