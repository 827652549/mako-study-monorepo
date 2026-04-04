## Requirements

### Requirement: 防抖搜索触发
组件 SHALL 在用户停止输入后，经过指定延迟（默认 300ms）才触发 `onSearch` 回调，而非每次按键都触发。

#### Scenario: 用户连续输入后停止
- **WHEN** 用户在输入框中连续输入字符，然后停止输入超过防抖延迟时间
- **THEN** `onSearch` 回调被触发一次，参数为当前输入值

#### Scenario: 用户在防抖延迟内继续输入
- **WHEN** 用户在防抖延迟未到期前继续输入
- **THEN** 之前的防抖计时器被重置，`onSearch` 不触发

#### Scenario: 自定义防抖延迟
- **WHEN** 传入 `debounceDelay` prop（如 500）
- **THEN** 组件使用该值作为防抖延迟，而非默认的 300ms

### Requirement: Loading 状态展示
组件 SHALL 在 `loading` prop 为 `true` 时，在输入框内部右侧展示旋转加载指示器。

#### Scenario: loading 为 true
- **WHEN** 父组件传入 `loading={true}`
- **THEN** 输入框右侧显示旋转的加载指示器图标

#### Scenario: loading 为 false
- **WHEN** 父组件传入 `loading={false}` 或不传
- **THEN** 加载指示器不可见，布局保持稳定（无抖动）

### Requirement: 受控模式
组件 SHALL 支持受控模式，当传入 `value` 和 `onChange` props 时，由父组件控制输入值。

#### Scenario: 受控模式下的值更新
- **WHEN** 父组件传入 `value` prop 并更新该值
- **THEN** 输入框显示最新的 `value` 值

#### Scenario: 受控模式下的用户输入
- **WHEN** 用户在受控模式下输入字符
- **THEN** `onChange` 回调被调用，携带新的输入值

### Requirement: 非受控模式
组件 SHALL 支持非受控模式，不传入 `value` prop 时，组件内部维护输入状态。

#### Scenario: 非受控模式下的用户输入
- **WHEN** 未传入 `value` prop，用户在输入框中输入
- **THEN** 输入框实时显示用户输入的内容，并在防抖延迟后触发 `onSearch`

### Requirement: 组件卸载清理
组件 SHALL 在卸载时清除未触发的防抖定时器，避免内存泄漏或在已卸载组件上调用回调。

#### Scenario: 组件在防抖期间卸载
- **WHEN** 用户输入后，在防抖延迟未到期前，组件被卸载
- **THEN** `onSearch` 回调不被触发，无内存泄漏警告
