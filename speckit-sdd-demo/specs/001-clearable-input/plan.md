# 实现计划：带清除按钮的输入框组件

**分支**：`001-clearable-input` | **日期**：2026-04-16 | **规格**：[spec.md](./spec.md)
**输入**：`specs/001-clearable-input/spec.md` 中的功能规格

## 摘要

构建一个 React 输入框组件，内置清除按钮（×）。当输入框有内容时显示清除按钮，点击后清空内容并将焦点归还输入框。支持受控和非受控两种使用模式，支持禁用状态。

## 技术上下文

**语言/版本**：TypeScript 5.x
**主要依赖**：React 19（无额外第三方库）
**存储**：N/A（纯 UI 组件，无持久化）
**测试**：bun test
**目标平台**：Web 浏览器
**项目类型**：前端 React 组件
**性能目标**：清除按钮显示/隐藏与输入同步，无感知延迟
**约束**：不引入图标库，使用纯文本「×」；不依赖第三方组件库

## 宪法检查

*关卡：必须在第 0 阶段研究前通过，设计完成后再次复查。*

- [x] 符合「规格先行」原则——spec.md 已存在且完整
- [x] 符合「简单优先」原则——无第三方依赖，实现最小化
- [x] 符合技术栈约束——使用 React 19，Bun 运行时
- [x] 中文优先——注释、文档使用中文

**结论**：全部通过，可进入 Phase 0。

## Phase 0：研究结论

> **research.md** 内容（此组件无复杂外部依赖，直接内联）

### 决策 1：受控 vs 非受控双模式实现

- **决策**：使用「非受控优先」模式——当外部不传 `value` 时用内部 `useState` 管理；当外部传入 `value` 时切换为受控模式
- **依据**：React 官方模式，与原生 `<input>` 行为一致，方便接入各类表单库
- **备选方案**：强制受控（弃选，使用门槛高）

### 决策 2：清除按钮实现方式

- **决策**：使用 `<button type="button">` + 纯文本「×」，绝对定位在输入框内右侧
- **依据**：无图标库依赖，语义化，可访问性好（button 元素天然可聚焦）
- **备选方案**：`::after` 伪元素（弃选，不可点击）；SVG 图标（弃选，增加依赖）

### 决策 3：焦点管理

- **决策**：清除后通过 `inputRef.current?.focus()` 手动归还焦点
- **依据**：符合 FR-004，提升用户体验，避免用户需重新点击输入框

## Phase 1：设计与接口

### 组件 Props 接口

```typescript
interface ClearableInputProps {
  // 受控模式
  value?: string
  onChange?: (value: string) => void
  // 通用
  placeholder?: string
  disabled?: boolean
  className?: string
}
```

### 状态设计

| 状态 | 类型 | 说明 |
|------|------|------|
| `internalValue` | `string` | 非受控模式下的内部值 |
| 显示清除按钮 | 派生值 | `currentValue.length > 0 && !disabled` |

**实际值（currentValue）** = 受控时取 `props.value`，非受控时取 `internalValue`

### 目录结构

```text
specs/001-clearable-input/
├── plan.md          # 本文件
├── spec.md          # 功能规格
└── tasks.md         # 任务清单（/speckit-tasks 生成）

src/
└── components/
    └── ClearableInput/
        ├── index.tsx          # 组件实现
        └── ClearableInput.test.ts  # 单元测试
```

### 关键行为说明

1. **清除逻辑**：
   - 受控模式：调用 `onChange('')`，不修改内部状态
   - 非受控模式：`setInternalValue('')`
   - 清除后：`inputRef.current?.focus()`

2. **按钮显示逻辑**：
   - `showClear = currentValue.length > 0 && !disabled`

3. **输入处理**：
   - 受控：调用 `onChange(e.target.value)`
   - 非受控：`setInternalValue(e.target.value)`

## 复杂度说明

> 无宪法违规，此处不填。
