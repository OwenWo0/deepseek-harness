/** One global sheet, mounted for exactly the owning plugin lifetime. */
import type { Context } from '@deepseek-ai/cordis'
import css from './chiikawa.css?inline'

/** Owner tag stamped on the injected element, for the inspector. */
const PLUGIN_ID = '@deepseek-ai/dsh-client-ui-chiikawa'

/**
 * Mount the room's stylesheet.
 * @param ctx - owning plugin context.
 */
export function installChiikawaStyles(ctx: Context): void {
  if (typeof document === 'undefined') return
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = PLUGIN_ID
    tag.textContent = css
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'ui-chiikawa: stylesheet')
}
