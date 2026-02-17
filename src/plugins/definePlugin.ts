/**
 * Identity function that provides type checking and autocomplete for plugin authors.
 *
 * Usage:
 *   import { definePlugin } from '@superapp/backend/plugins'
 *
 *   export default definePlugin({
 *     name: 'my-plugin',
 *     permissions: { ... },
 *   })
 */

import type { Plugin } from './types'

export function definePlugin(plugin: Plugin): Plugin {
  return plugin
}
