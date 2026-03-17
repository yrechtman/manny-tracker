export type FieldType =
  | 'intensity_scale'
  | 'multi_select'
  | 'single_select'
  | 'free_text'
  | 'duration'
  | 'boolean'
  | 'quick_tags';

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  scaleMax?: number;
  scaleLabels?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface SectionConfig {
  id: string;
  name: string;
  hasGate: boolean;
  gateLabel?: string;
  defaultExpanded?: boolean;
  alwaysVisible?: boolean;
  defaultCollapsed?: boolean;
  fields: FieldConfig[];
}

export interface SectionData {
  active: boolean;
  fields: Record<string, unknown>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  date: string;
  logger: 'Yoni' | 'Zoe';
  entryType: string;
  sections: Record<string, SectionData>;
}

export interface AiInsightResponse {
  analysis: string;
  queriesRemainingToday: number;
}
