/**
 * Chiikawa room, browser half.
 *
 * Contributes the sidebar entry and the main-panel page. The page is registered
 * through `createElement` because this package's client-bundle entry is the
 * fixed `src/client/index.ts`, which no JSX transform reaches; every JSX
 * component lives in its own `.tsx`.
 */
import { createElement } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { ChiikawaIcon } from './Icon.tsx'
import { ChiikawaRoom } from './Room.tsx'
import { installChiikawaStyles } from './styles.ts'

/** Required service: the slot registry. */
export const inject = ['slots'] as const

/**
 * Register the room's sidebar entry and main-panel page.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
  installChiikawaStyles(ctx)

  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
    { name: 'sidebar.panellist', id: 'chiikawa', order: 40, label: 'ちいかわ' },
    ChiikawaIcon,
  ))

  ctx.slots.inject('main', () => ctx.slots.register(
    { name: 'main', key: 'chiikawa' },
    () => createElement(ChiikawaRoom),
  ))
}
