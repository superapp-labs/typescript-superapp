import defaultComponents from 'fumadocs-ui/mdx'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import { TypeTable } from 'fumadocs-ui/components/type-table'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import {
  ConnectionManager,
  PermissionBuilder,
  LimitsConfigurator,
  AuditLogViewer,
  ActionRegistry,
  SecurityPanel,
  RoleOverview,
} from './components/admin-ui'
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    Tab,
    Tabs,
    TypeTable,
    Accordion,
    Accordions,
    Step,
    Steps,
    ConnectionManager,
    PermissionBuilder,
    LimitsConfigurator,
    AuditLogViewer,
    ActionRegistry,
    SecurityPanel,
    RoleOverview,
    ...components,
  }
}
