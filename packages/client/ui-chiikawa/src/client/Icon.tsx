/** The sidebar entry icon: the packaged Chiikawa face art. */
import type { ReactNode } from 'react'
import { PREFIX } from './state.ts'

/** Presentation the global panel row supplies. */
export interface ChiikawaIconProps {
  /** Requested square edge in pixels. */
  readonly size: number
  /** Whether this panel is selected in the main column. */
  readonly active: boolean
}

/**
 * Render the entry icon at the requested size.
 * @param props - host-supplied icon presentation.
 * @returns the icon element.
 */
export function ChiikawaIcon({ size, active }: ChiikawaIconProps): ReactNode {
  return (
    <span
      className="cw-icon"
      style={{ width: `${size}px`, height: `${size}px`, opacity: active ? 1 : 0.72 }}
    >
      <img
        className="cw-icon-img"
        src={`${PREFIX}/assets/official-chiikawa-b.png`}
        alt=""
        draggable={false}
      />
    </span>
  )
}
