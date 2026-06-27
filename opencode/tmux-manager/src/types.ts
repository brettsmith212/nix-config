export const STATES = ['working', 'waiting', 'idle'] as const;
export type State = (typeof STATES)[number];

export function isState(value: unknown): value is State {
  return typeof value === 'string' && (STATES as readonly string[]).includes(value);
}

export interface Session {
  name: string;
  state: State | null;
  stateAt: number | null;
  path: string;
  origin: string | null;
}

export interface Shell {
  (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

export interface PluginInput {
  $: Shell;
}

export interface PluginEvent {
  type: string;
  properties?: Record<string, unknown>;
}

export interface PluginHooks {
  event?: (ctx: { event: PluginEvent }) => Promise<void> | void;
}

export type Plugin = (input: PluginInput) => Promise<PluginHooks>;
