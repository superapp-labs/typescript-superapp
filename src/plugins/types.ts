/**
 * Plugin system type definitions for @superapp/backend.
 *
 * A plugin is a plain object that contributes to one or more engine layers:
 * integrations, auth, permissions, roles, actions, middleware, and routes.
 * Plugins compose by merging — the engine concatenates arrays, unions objects,
 * and chains middleware in declaration order.
 */

// ---------------------------------------------------------------------------
// Re-exported domain types (these mirror the core engine types)
// ---------------------------------------------------------------------------

export interface JWTPayload {
  sub?: string
  [key: string]: unknown
}

export interface QueryBuilder {
  selectFrom(table: string): any
  [key: string]: any
}

export interface User {
  id: string
  email?: string
  role?: string
  [key: string]: unknown
}

export interface EnrichedUser extends User {
  org_ids?: string[]
  current_org_id?: string | null
}

export interface RouteHandler {
  (req: Request): Promise<Response> | Response
}

export interface AuthProvider {
  verifyToken(token: string): Promise<JWTPayload>
  findUser(payload: JWTPayload, db: QueryBuilder): Promise<User | null>
  resolveSession?(user: User, db: QueryBuilder): Promise<EnrichedUser>
  routes?: Record<string, RouteHandler>
}

export interface ConfigField {
  type: 'string' | 'number' | 'boolean'
  required?: boolean
  secret?: boolean
  default?: unknown
  description?: string
}

export interface TableSchema {
  name: string
  columns: {
    name: string
    type: string
    nullable: boolean
    primaryKey?: boolean
  }[]
}

export interface QueryRequest {
  table: string
  operation: 'select' | 'insert' | 'update' | 'delete'
  where?: Record<string, unknown>
  columns?: string[]
  values?: Record<string, unknown>
  limit?: number
  offset?: number
}

export interface QueryResult {
  rows: Record<string, unknown>[]
  count?: number
}

export interface IntegrationProvider {
  type: string
  capabilities: { read: boolean; write: boolean; transactions: boolean }
  configSchema: Record<string, ConfigField>
  testConnection: (config: Record<string, unknown>) => Promise<boolean>
  introspect: (config: Record<string, unknown>) => Promise<TableSchema[]>
  execute: (
    config: Record<string, unknown>,
    query: QueryRequest,
  ) => Promise<QueryResult>
}

export interface PermissionFilter {
  [field: string]: unknown
}

export interface PermissionCheck {
  [field: string]: unknown
}

export interface PermissionPreset {
  [field: string]: unknown
}

export type PermissionOperation = 'select' | 'insert' | 'update' | 'delete'

export interface MiddlewareContext {
  user: EnrichedUser
  db: QueryBuilder
  table: string
  operation: PermissionOperation
  columns: string[]
  query: { sql: string; params: unknown[] }
  input?: Record<string, unknown>
  filter?: PermissionFilter
}

export type MiddlewareNext = (overrides?: {
  filter?: PermissionFilter
  input?: Record<string, unknown>
  columns?: string[]
  db?: QueryBuilder
}) => Promise<Record<string, unknown>[]>

export interface Permission {
  name: string
  table: string
  operations: Partial<Record<PermissionOperation, boolean>>
  columns?: string[] | '*'
  filter?: PermissionFilter
  check?: PermissionCheck
  preset?: PermissionPreset
  middleware?: (ctx: MiddlewareContext, next: MiddlewareNext) => Promise<unknown>
}

export interface ActionDefinition<
  TInput = unknown,
  TOutput = unknown,
> {
  input: { parse: (data: unknown) => TInput }
  output?: { parse: (data: unknown) => TOutput }
  run: (
    ctx: { user: EnrichedUser; db: QueryBuilder },
    input: TInput,
  ) => Promise<TOutput>
}

// ---------------------------------------------------------------------------
// Pipeline middleware (wraps the entire request, not per-permission)
// ---------------------------------------------------------------------------

export interface PipelineContext {
  request: Request
  user?: EnrichedUser
  operation?: PermissionOperation
  table?: string
  sql?: string
  params?: unknown[]
}

export type PipelineNext = () => Promise<Response>

export type PipelineMiddleware = (
  ctx: PipelineContext,
  next: PipelineNext,
) => Promise<Response>

// ---------------------------------------------------------------------------
// Engine context passed to lifecycle hooks
// ---------------------------------------------------------------------------

export interface EngineContext {
  db: QueryBuilder
  connections: Record<string, unknown>
  config: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Plugin — the single concept developers learn
// ---------------------------------------------------------------------------

export interface Plugin {
  /** Unique name for this plugin. Used in error messages and debug logging. */
  name: string

  /**
   * Database integration providers contributed by this plugin.
   * Merged with other plugins' integrations and the engine's own `integrations` array.
   */
  integrations?: IntegrationProvider[]

  /**
   * Authentication provider. Only one plugin (or the engine config) can supply auth.
   * If multiple plugins provide `auth`, the engine throws at startup.
   */
  auth?: AuthProvider

  /**
   * Permission definitions contributed by this plugin.
   * Keys are permission slugs (snake_case). Merged with other plugins and the engine config.
   * Duplicate slugs across plugins cause a startup error.
   */
  permissions?: Record<string, Permission>

  /**
   * Role-to-permission mappings contributed by this plugin.
   * If two plugins define the same role, their permission arrays are unioned.
   */
  roles?: Record<string, string[]>

  /**
   * Server-side actions contributed by this plugin.
   * Merged with other plugins and the engine config.
   * Duplicate action names cause a startup error.
   */
  actions?: Record<string, ActionDefinition>

  /**
   * Pipeline middleware that wraps the entire request lifecycle.
   * Runs in declaration order (first plugin's middleware runs outermost).
   */
  middleware?: PipelineMiddleware[]

  /**
   * HTTP route handlers contributed by this plugin.
   * Keys are "METHOD /path" strings (e.g., "GET /my-plugin/health").
   * Duplicate routes across plugins cause a startup error.
   */
  routes?: Record<string, RouteHandler>

  // -------------------------------------------------------------------------
  // Lifecycle hooks
  // -------------------------------------------------------------------------

  /** Called once after the engine is fully initialized. Use for setup tasks. */
  onInit?: (ctx: EngineContext) => Promise<void> | void

  /** Called on every incoming request, before the pipeline starts. */
  onRequest?: (ctx: PipelineContext) => Promise<void> | void

  /** Called when an unhandled error occurs during request processing. */
  onError?: (error: Error, ctx: PipelineContext) => Promise<void> | void

  /** Called when the engine is shutting down. Use for cleanup. */
  onShutdown?: () => Promise<void> | void
}
