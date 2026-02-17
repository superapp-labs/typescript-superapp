/**
 * Resolves an array of plugins into a single, merged engine configuration.
 *
 * Merge strategy:
 *   - integrations  → concatenated
 *   - auth          → single provider (conflict = error)
 *   - permissions   → merged by slug (conflict = error)
 *   - roles         → merged by name, permission arrays unioned
 *   - actions       → merged by name (conflict = error)
 *   - middleware     → concatenated in declaration order
 *   - routes        → merged by key (conflict = error)
 *   - lifecycle     → all collected and called in order
 */

import type {
  Plugin,
  AuthProvider,
  IntegrationProvider,
  Permission,
  ActionDefinition,
  PipelineMiddleware,
  RouteHandler,
  EngineContext,
  PipelineContext,
} from './types'

// ---------------------------------------------------------------------------
// Resolved output — what the engine consumes after plugin resolution
// ---------------------------------------------------------------------------

export interface ResolvedPlugins {
  integrations: IntegrationProvider[]
  auth: AuthProvider | undefined
  permissions: Record<string, Permission>
  roles: Record<string, string[]>
  actions: Record<string, ActionDefinition>
  middleware: PipelineMiddleware[]
  routes: Record<string, RouteHandler>
  hooks: {
    onInit: Array<(ctx: EngineContext) => Promise<void> | void>
    onRequest: Array<(ctx: PipelineContext) => Promise<void> | void>
    onError: Array<(error: Error, ctx: PipelineContext) => Promise<void> | void>
    onShutdown: Array<() => Promise<void> | void>
  }
}

// ---------------------------------------------------------------------------
// Conflict error
// ---------------------------------------------------------------------------

class PluginConflictError extends Error {
  constructor(kind: string, key: string, pluginA: string, pluginB: string) {
    super(
      `Plugin conflict: ${kind} "${key}" is defined by both "${pluginA}" and "${pluginB}". ` +
        `Each ${kind} must be provided by exactly one plugin.`,
    )
    this.name = 'PluginConflictError'
  }
}

// ---------------------------------------------------------------------------
// resolve()
// ---------------------------------------------------------------------------

export function resolvePlugins(plugins: Plugin[]): ResolvedPlugins {
  const resolved: ResolvedPlugins = {
    integrations: [],
    auth: undefined,
    permissions: {},
    roles: {},
    actions: {},
    middleware: [],
    routes: {},
    hooks: {
      onInit: [],
      onRequest: [],
      onError: [],
      onShutdown: [],
    },
  }

  let authSource: string | undefined

  for (const plugin of plugins) {
    // -- integrations (concatenate) ----------------------------------------
    if (plugin.integrations) {
      resolved.integrations.push(...plugin.integrations)
    }

    // -- auth (single provider) --------------------------------------------
    if (plugin.auth) {
      if (resolved.auth) {
        throw new PluginConflictError('auth', 'auth', authSource!, plugin.name)
      }
      resolved.auth = plugin.auth
      authSource = plugin.name
    }

    // -- permissions (merge, no duplicates) --------------------------------
    if (plugin.permissions) {
      for (const [slug, permission] of Object.entries(plugin.permissions)) {
        if (resolved.permissions[slug]) {
          throw new PluginConflictError(
            'permission',
            slug,
            findOwner(plugins, 'permissions', slug, plugin.name),
            plugin.name,
          )
        }
        resolved.permissions[slug] = permission
      }
    }

    // -- roles (merge, union permission arrays) ----------------------------
    if (plugin.roles) {
      for (const [role, perms] of Object.entries(plugin.roles)) {
        if (!resolved.roles[role]) {
          resolved.roles[role] = []
        }
        for (const perm of perms) {
          if (!resolved.roles[role].includes(perm)) {
            resolved.roles[role].push(perm)
          }
        }
      }
    }

    // -- actions (merge, no duplicates) ------------------------------------
    if (plugin.actions) {
      for (const [name, action] of Object.entries(plugin.actions)) {
        if (resolved.actions[name]) {
          throw new PluginConflictError(
            'action',
            name,
            findOwner(plugins, 'actions', name, plugin.name),
            plugin.name,
          )
        }
        resolved.actions[name] = action
      }
    }

    // -- middleware (concatenate in order) ----------------------------------
    if (plugin.middleware) {
      resolved.middleware.push(...plugin.middleware)
    }

    // -- routes (merge, no duplicates) -------------------------------------
    if (plugin.routes) {
      for (const [route, handler] of Object.entries(plugin.routes)) {
        if (resolved.routes[route]) {
          throw new PluginConflictError(
            'route',
            route,
            findOwner(plugins, 'routes', route, plugin.name),
            plugin.name,
          )
        }
        resolved.routes[route] = handler
      }
    }

    // -- lifecycle hooks ---------------------------------------------------
    if (plugin.onInit) resolved.hooks.onInit.push(plugin.onInit)
    if (plugin.onRequest) resolved.hooks.onRequest.push(plugin.onRequest)
    if (plugin.onError) resolved.hooks.onError.push(plugin.onError)
    if (plugin.onShutdown) resolved.hooks.onShutdown.push(plugin.onShutdown)
  }

  return resolved
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find which earlier plugin owns a given key, for error messages. */
function findOwner(
  plugins: Plugin[],
  field: 'permissions' | 'actions' | 'routes',
  key: string,
  currentName: string,
): string {
  for (const p of plugins) {
    if (p.name === currentName) break
    const obj = p[field] as Record<string, unknown> | undefined
    if (obj && key in obj) return p.name
  }
  return 'engine config'
}
