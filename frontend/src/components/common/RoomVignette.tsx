export type VignettePalette = [string, string, string, string, string]
export type VignetteVariant = 'sofa' | 'bed' | 'desk' | 'dining'

interface Props {
  /** [wall, floor, furniture, accent, light] */
  palette: VignettePalette
  variant?: VignetteVariant
}

/**
 * Flat illustrated room scene rendered entirely from a 5-color palette.
 * Deterministic and offline-safe — no external images.
 */
export default function RoomVignette({ palette, variant = 'sofa' }: Props) {
  const [wall, floor, main, accent, light] = palette

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: wall }} aria-hidden="true">
      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[32%]" style={{ background: floor }} />
      {/* window light wash */}
      <div className="absolute right-0 top-0 w-[45%] h-full opacity-25 pointer-events-none"
        style={{ background: `linear-gradient(245deg, ${light} 0%, transparent 55%)` }} />
      {/* wall art */}
      <div className="absolute left-[12%] top-[16%] w-[15%] h-[24%] rounded-[2px]"
        style={{ background: accent, boxShadow: `0 0 0 3px ${wall}, 0 0 0 4px rgba(0,0,0,0.12)` }} />

      {variant === 'sofa' && (
        <>
          <div className="absolute left-[34%] bottom-[24%] w-[36%]">
            <div className="h-[14px] rounded-t-md mx-[6%]" style={{ background: main, opacity: 0.85 }} />
            <div className="h-[18px] rounded-md" style={{ background: main }} />
            <div className="flex justify-between px-[10%]">
              <span className="w-[3px] h-[8px]" style={{ background: main, opacity: 0.7 }} />
              <span className="w-[3px] h-[8px]" style={{ background: main, opacity: 0.7 }} />
            </div>
          </div>
          <div className="absolute left-[39%] bottom-[33%] w-[8%] h-[10px] rounded-[3px] rotate-[8deg]"
            style={{ background: accent }} />
        </>
      )}

      {variant === 'bed' && (
        <>
          <div className="absolute left-[30%] bottom-[22%] w-[42%]">
            <div className="h-[22px] rounded-t-md mx-[2%] mb-[2px]" style={{ background: main, opacity: 0.55 }} />
            <div className="h-[16px] rounded-md" style={{ background: main }} />
            <div className="h-[8px] rounded-b-md mx-[3%]" style={{ background: floor, filter: 'brightness(0.9)' }} />
          </div>
          <div className="absolute left-[34%] bottom-[36%] w-[9%] h-[9px] rounded-[3px]" style={{ background: accent }} />
          <div className="absolute left-[45%] bottom-[36%] w-[9%] h-[9px] rounded-[3px]" style={{ background: accent, opacity: 0.8 }} />
        </>
      )}

      {variant === 'desk' && (
        <>
          <div className="absolute left-[36%] bottom-[26%] w-[34%]">
            <div className="h-[5px] rounded-full" style={{ background: main }} />
            <div className="flex justify-between px-[6%]">
              <span className="w-[3px] h-[26px]" style={{ background: main, opacity: 0.8 }} />
              <span className="w-[3px] h-[26px]" style={{ background: main, opacity: 0.8 }} />
            </div>
          </div>
          {/* monitor */}
          <div className="absolute left-[44%] bottom-[38%] w-[14%] h-[16px] rounded-[3px]"
            style={{ background: accent, boxShadow: `inset 0 0 0 2px rgba(0,0,0,0.15)` }} />
          {/* chair */}
          <div className="absolute left-[26%] bottom-[24%]">
            <div className="w-[16px] h-[20px] rounded-t-md" style={{ background: accent, opacity: 0.9 }} />
            <div className="w-[2px] h-[10px] mx-auto" style={{ background: main }} />
          </div>
        </>
      )}

      {variant === 'dining' && (
        <>
          <div className="absolute left-[32%] bottom-[26%] w-[36%]">
            <div className="h-[5px] rounded-full" style={{ background: main }} />
            <div className="flex justify-between px-[8%]">
              <span className="w-[3px] h-[24px]" style={{ background: main, opacity: 0.8 }} />
              <span className="w-[3px] h-[24px]" style={{ background: main, opacity: 0.8 }} />
            </div>
          </div>
          {/* chairs */}
          <div className="absolute left-[24%] bottom-[24%] w-[12px] h-[24px] rounded-t-md" style={{ background: accent, opacity: 0.9 }} />
          <div className="absolute right-[26%] bottom-[24%] w-[12px] h-[24px] rounded-t-md" style={{ background: accent, opacity: 0.9 }} />
          {/* pendant light */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center">
            <div className="w-[2px] h-[26px]" style={{ background: main, opacity: 0.6 }} />
            <div className="w-[18px] h-[10px] rounded-b-full" style={{ background: light }} />
          </div>
        </>
      )}

      {/* plant */}
      <div className="absolute left-[16%] bottom-[25%] flex flex-col items-center">
        <div className="flex gap-[2px] mb-[2px]">
          <span className="w-[6px] h-[16px] rounded-full -rotate-[20deg]" style={{ background: accent, opacity: 0.85 }} />
          <span className="w-[6px] h-[20px] rounded-full" style={{ background: accent }} />
          <span className="w-[6px] h-[16px] rounded-full rotate-[20deg]" style={{ background: accent, opacity: 0.85 }} />
        </div>
        <div className="w-[14px] h-[12px] rounded-b-[4px]" style={{ background: floor, filter: 'brightness(0.85)' }} />
      </div>
      {/* floor lamp */}
      <div className="absolute right-[14%] bottom-[26%] flex flex-col items-center">
        <div className="w-[22px] h-[14px] rounded-t-full" style={{ background: light }} />
        <div className="w-[2px] h-[34px]" style={{ background: main, opacity: 0.8 }} />
        <div className="w-[16px] h-[3px] rounded-full" style={{ background: main, opacity: 0.8 }} />
      </div>
      {/* rug */}
      <div className="absolute left-[30%] bottom-[10%] w-[44%] h-[9px] rounded-[50%]"
        style={{ background: accent, opacity: 0.35 }} />
    </div>
  )
}
