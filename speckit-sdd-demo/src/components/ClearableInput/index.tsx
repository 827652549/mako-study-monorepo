import { useRef, useState } from "react"

// 组件 Props 定义
interface ClearableInputProps {
  // 受控模式：外部传入 value + onChange
  value?: string
  onChange?: (value: string) => void
  // 通用属性
  placeholder?: string
  disabled?: boolean
  className?: string
}

// ClearableInput：带清除按钮的输入框组件
// 支持受控和非受控两种模式，输入内容时右侧显示清除按钮
export function ClearableInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: ClearableInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // 非受控模式下的内部状态
  const [internalValue, setInternalValue] = useState("")

  // 实际显示的值：受控时取外部 value，否则取内部状态
  const currentValue = value !== undefined ? value : internalValue

  // 是否显示清除按钮：有内容且未禁用
  const showClear = currentValue.length > 0 && !disabled

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (value !== undefined) {
      // 受控模式：通知外部
      onChange?.(newValue)
    } else {
      // 非受控模式：更新内部状态
      setInternalValue(newValue)
    }
  }

  // 处理清除操作
  const handleClear = () => {
    if (value !== undefined) {
      // 受控模式：通知外部清空
      onChange?.("")
    } else {
      // 非受控模式：清空内部状态
      setInternalValue("")
    }
    // 清除后归还焦点
    inputRef.current?.focus()
  }

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      className={className}
    >
      <input
        ref={inputRef}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{ paddingRight: showClear ? "2rem" : undefined }}
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: "absolute",
            right: "0.25rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0 0.25rem",
            lineHeight: 1,
          }}
          aria-label="清除输入内容"
        >
          ×
        </button>
      )}
    </div>
  )
}
