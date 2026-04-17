---
description: "带清除按钮的输入框组件任务清单"
---

# 任务清单：带清除按钮的输入框组件

**输入**：`specs/001-clearable-input/` 下的设计文档
**前置条件**：plan.md（必须）、spec.md（必须）

**说明**：任务按用户故事分组，每个故事可独立实现和验收。

## 格式说明：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（不同文件，无依赖）
- **[Story]**：所属用户故事（US1、US2、US3）
- 描述中包含精确文件路径

---

## 第一阶段：项目初始化

**目的**：创建组件目录和基础文件结构

- [x] T001 创建组件目录 `src/components/ClearableInput/`
- [x] T002 创建组件文件 `src/components/ClearableInput/index.tsx`（空文件占位）
- [x] T003 创建测试文件 `src/components/ClearableInput/ClearableInput.test.ts`（空文件占位）

---

## 第二阶段：基础设施（阻塞前置）

**目的**：定义组件 Props 类型和基础结构，所有用户故事共用

⚠️ **关键**：此阶段完成前，任何用户故事的实现不得开始

- [x] T004 在 `src/components/ClearableInput/index.tsx` 中定义 `ClearableInputProps` 接口（包含 value、onChange、placeholder、disabled、className）
- [x] T005 在 `src/components/ClearableInput/index.tsx` 中搭建组件基础骨架（函数组件 + useRef + 返回基础 input 元素）

**检查点**：组件可渲染一个普通 input，无报错

---

## 第三阶段：用户故事 1 - 清除按钮显示与清除逻辑（优先级：P1）🎯 MVP

**目标**：输入内容时显示 × 按钮，点击后清空内容并归还焦点

**独立验收**：在页面放置组件，输入文字 → 出现 × → 点击 × → 内容清空 → 输入框聚焦

### 用户故事 1 实现

- [x] T006 [US1] 在 `src/components/ClearableInput/index.tsx` 中添加 `internalValue` state（非受控内部值）
- [x] T007 [US1] 在 `src/components/ClearableInput/index.tsx` 中实现 `currentValue` 派生值逻辑（受控时取 props.value，否则取 internalValue）
- [x] T008 [US1] 在 `src/components/ClearableInput/index.tsx` 中实现 `showClear` 派生值（`currentValue.length > 0`）
- [x] T009 [US1] 在 `src/components/ClearableInput/index.tsx` 中添加清除按钮 `<button type="button">` 及条件渲染（仅 showClear 为 true 时显示）
- [x] T010 [US1] 在 `src/components/ClearableInput/index.tsx` 中实现 `handleClear` 函数：非受控时 `setInternalValue('')`，清除后调用 `inputRef.current?.focus()`
- [x] T011 [US1] 在 `src/components/ClearableInput/index.tsx` 中实现 `handleChange`：非受控时更新 internalValue
- [x] T012 [US1] 在 `src/components/ClearableInput/index.tsx` 中添加基础样式：input 设置右侧 padding 为按钮留位，按钮绝对定位在右侧

**检查点**：用户故事 1 可完整独立验收，非受控模式清除功能正常

---

## 第四阶段：用户故事 2 - 受控模式支持（优先级：P2）

**目标**：支持外部传入 value + onChange，清除时调用 onChange('')

**独立验收**：父组件绑定 state，点击 × 后验证父组件 state 变为空字符串

### 用户故事 2 实现

- [x] T013 [US2] 在 `src/components/ClearableInput/index.tsx` 中更新 `handleChange`：受控模式时调用 `props.onChange(e.target.value)`
- [x] T014 [US2] 在 `src/components/ClearableInput/index.tsx` 中更新 `handleClear`：受控模式时调用 `props.onChange('')`（不修改 internalValue）

**检查点**：用户故事 1 和 2 均可独立验收，受控和非受控模式均正常

---

## 第五阶段：用户故事 3 - 禁用状态（优先级：P3）

**目标**：disabled 时输入框不可编辑，清除按钮不显示

**独立验收**：传入 disabled 属性，验证输入框不可交互，无清除按钮

### 用户故事 3 实现

- [x] T015 [US3] 在 `src/components/ClearableInput/index.tsx` 中更新 `showClear` 逻辑：追加 `&& !disabled` 条件
- [x] T016 [US3] 在 `src/components/ClearableInput/index.tsx` 中将 `disabled` prop 透传给 `<input>` 元素

**检查点**：全部三个用户故事均可独立验收

---

## 最终阶段：收尾与完善

**目的**：提升组件质量和可用性

- [x] T017 [P] 在 `src/components/ClearableInput/index.tsx` 中将 `placeholder` prop 透传给 `<input>`
- [x] T018 [P] 在 `src/components/ClearableInput/index.tsx` 中将 `className` prop 应用到容器元素
- [x] T019 在 `src/index.ts`（或 `src/index.tsx`）中导出 ClearableInput 组件
- [x] T020 运行 `bun run build` 确认构建通过

---

## 依赖与执行顺序

### 阶段依赖

- **第一阶段**：无依赖，可立即开始
- **第二阶段**：依赖第一阶段完成，阻塞所有用户故事
- **用户故事阶段（第三/四/五）**：依赖第二阶段完成
  - US1（P1）→ US2（P2）→ US3（P3）顺序推进
  - US2 依赖 US1 骨架，US3 依赖 showClear 逻辑
- **最终阶段**：依赖所有用户故事完成

### 并行机会

- T017、T018 可并行（不同属性，互不依赖）
- 第一阶段中 T002、T003 可并行（不同文件）

---

## 实现策略

### MVP 优先（仅用户故事 1）

1. 完成第一阶段：初始化
2. 完成第二阶段：基础骨架
3. 完成第三阶段：用户故事 1（清除核心功能）
4. **停下来验收**：非受控模式清除功能正常
5. 此时已可演示/交付 MVP

### 增量交付

1. 初始化 + 基础骨架 → 可渲染
2. 加 US1 → 清除功能 MVP ✅
3. 加 US2 → 受控模式 ✅
4. 加 US3 → 禁用状态 ✅
5. 收尾 → 完整组件 ✅

---

## 备注

- `[P]` 任务 = 不同文件，无依赖，可并行
- `[US?]` 标签追踪任务到具体用户故事
- 每个用户故事应可独立完成并验收
- 每完成一个阶段后提交一次 git commit
