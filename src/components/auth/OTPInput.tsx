import { useRef, useCallback, useEffect } from 'react'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

/**
 * 6-box OTP input with auto-advance and backspace navigation.
 */
export default function OTPInput({ value, onChange, autoFocus = false }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  const handleChange = useCallback(
    (index: number, raw: string) => {
      // Allow only digits; support pasting full OTP
      const digits = raw.replace(/\D/g, '').slice(0, 6 - index)
      if (!digits) return

      const arr = (value + '      ').slice(0, 6).split('')
      for (let i = 0; i < digits.length; i++) {
        arr[index + i] = digits[i]
      }
      const next = arr.join('').replace(/ /g, '').slice(0, 6)
      onChange(next)

      // Advance focus
      const nextIndex = Math.min(index + digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
    },
    [value, onChange]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (value[index]) {
          const arr = value.split('')
          arr[index] = ''
          onChange(arr.join(''))
        } else if (index > 0) {
          const arr = value.split('')
          arr[index - 1] = ''
          onChange(arr.join(''))
          inputRefs.current[index - 1]?.focus()
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowRight' && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [value, onChange]
  )

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  return (
    <div className="flex gap-2.5 justify-center" role="group" aria-label="OTP input">
      {Array.from({ length: 6 }).map((_, i) => {
        const digit = value[i] ?? ''
        const isFilled = digit !== ''
        return (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            id={`otp-digit-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onFocus={handleFocus}
            aria-label={`Digit ${i + 1}`}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-black rounded-xl transition-all duration-150 outline-none select-all"
            style={{
              background: isFilled
                ? 'rgba(99,102,241,0.25)'
                : 'rgba(255,255,255,0.08)',
              border: isFilled
                ? '2px solid rgba(99,102,241,0.8)'
                : '2px solid rgba(255,255,255,0.12)',
              color: '#fff',
              boxShadow: isFilled ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
            }}
          />
        )
      })}
    </div>
  )
}
