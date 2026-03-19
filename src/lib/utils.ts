import { v4 as uuidv4 } from 'uuid';
import { LogEntry, SectionConfig, FieldConfig } from './types';
import { SECTIONS } from '@/config/sections.config';

export function generateId(): string {
  return uuidv4();
}

export function formatTimestamp(date: Date): string {
  return date.toISOString();
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Human-readable headers for the Google Sheet
export function getSheetHeaders(sections: SectionConfig[]): string[] {
  const headers = ['ID', 'Timestamp', 'Date', 'Logger', 'Entry Type'];

  for (const section of sections) {
    if (section.hasGate) {
      headers.push(`${section.name}?`);
    }
    for (const field of section.fields) {
      headers.push(`${section.name} - ${field.label}`);
    }
  }

  return headers;
}

// Resolve a value to its display label using field config
function toDisplayValue(value: unknown, field: FieldConfig): string {
  if (value === undefined || value === null || value === '') return '';

  if (Array.isArray(value)) {
    // Intensity scale arrays use " | " separator (labels contain commas)
    if (field.type === 'intensity_scale' && field.scaleLabels) {
      const labels = value.map((v) => {
        const idx = Number(v) - 1;
        return field.scaleLabels![idx] || String(v);
      });
      return labels.join(' | ');
    }
    const labels = value.map((v) => {
      const opt = field.options?.find((o) => o.value === v);
      return opt?.label || v;
    });
    return labels.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (field.type === 'intensity_scale' && field.scaleLabels) {
    const idx = Number(value) - 1;
    return field.scaleLabels[idx] || String(value);
  }

  if (field.options) {
    const opt = field.options.find((o) => o.value === value);
    return opt?.label || String(value);
  }

  return String(value);
}

export function flattenLogEntry(entry: LogEntry, sections?: SectionConfig[]): string[] {
  const sectionConfigs = sections || SECTIONS;
  const row: string[] = [
    entry.id,
    entry.timestamp,
    entry.date,
    entry.logger,
    entry.entryType,
  ];

  for (const section of sectionConfigs) {
    const sectionData = entry.sections[section.id];
    const active = sectionData?.active ?? false;

    if (section.hasGate) {
      row.push(active ? 'Yes' : 'No');
    }

    for (const field of section.fields) {
      if (!active && section.hasGate) {
        row.push('');
        continue;
      }

      const value = sectionData?.fields[field.id];
      row.push(toDisplayValue(value, field));
    }
  }

  return row;
}

// Map from old header names to new section.field paths for backward compat
const OLD_HEADER_ALIASES: Record<string, { sectionId: string; type: 'gate' | 'field'; fieldId?: string }> = {
  // Old medication_enrichment section → new medication + enrichment sections
  'Medication & Enrichment - Clomipramine taken?': { sectionId: 'medication', type: 'field', fieldId: 'clomipramine_taken' },
  'Medication & Enrichment - Clonidine': { sectionId: 'medication', type: 'field', fieldId: 'clonidine_dose' },
  'Medication & Enrichment - Enrichment provided': { sectionId: 'enrichment', type: 'field', fieldId: 'activities' },
  // Old enrichment label → new label
  'Enrichment - Enrichment provided': { sectionId: 'enrichment', type: 'field', fieldId: 'activities' },
  // Old comments section → new notes section
  'Comments - Additional notes': { sectionId: 'notes', type: 'field', fieldId: 'text' },
};

function parseFieldValue(raw: string, field: FieldConfig): unknown {
  if (!raw) {
    if (field.type === 'boolean') return false;
    if (field.type === 'multi_select' || field.type === 'quick_tags') return [];
    return '';
  }

  switch (field.type) {
    case 'boolean':
      return raw.toLowerCase() === 'yes';
    case 'multi_select':
    case 'quick_tags':
      return raw.split(', ').filter(Boolean).map((label) => {
        const opt = field.options?.find((o) => o.label === label);
        return opt?.value || label;
      });
    case 'intensity_scale': {
      // Multiple incidents stored with " | " separator
      if (raw.includes(' | ')) {
        return raw.split(' | ').map((part) => {
          const match = part.trim().match(/^(\d+)/);
          return match ? Number(match[1]) : part;
        });
      }
      const match = raw.match(/^(\d+)/);
      return match ? Number(match[1]) : raw;
    }
    case 'single_select':
    case 'duration': {
      const opt = field.options?.find((o) => o.label === raw);
      return opt?.value || raw;
    }
    default:
      return raw;
  }
}

// Find a field config by id across all current sections
function findFieldConfig(sections: SectionConfig[], sectionId: string, fieldId: string): FieldConfig | undefined {
  const section = sections.find((s) => s.id === sectionId);
  return section?.fields.find((f) => f.id === fieldId);
}

// --- Merge helpers ---

function mergeText(existing: string, incoming: string, timestamp: string): string {
  if (!incoming) return existing;
  if (!existing) return incoming;
  const time = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${existing}\n[${time}] ${incoming}`;
}

function mergeArrays(existing: unknown, incoming: unknown): unknown[] {
  const a = Array.isArray(existing) ? existing : [];
  const b = Array.isArray(incoming) ? incoming : [];
  return [...new Set([...a, ...b])];
}

function mergeIntensity(existing: unknown, incoming: unknown): unknown {
  // Normalize both to arrays, then combine
  const a = existing == null ? [] : Array.isArray(existing) ? existing : [existing];
  const b = incoming == null ? [] : Array.isArray(incoming) ? incoming : [incoming];
  const combined = [...a, ...b].filter((v) => v != null && v !== '');
  if (combined.length === 0) return null;
  if (combined.length === 1) return combined[0];
  return combined;
}

function hasValue(val: unknown): boolean {
  if (val === undefined || val === null || val === '') return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}

export function mergeLogEntries(
  existing: LogEntry,
  incoming: LogEntry,
  sections: SectionConfig[]
): LogEntry {
  const merged: LogEntry = {
    id: existing.id,
    timestamp: incoming.timestamp,
    date: existing.date,
    logger: existing.logger,
    entryType: existing.entryType,
    sections: {},
  };

  for (const section of sections) {
    const existData = existing.sections[section.id];
    const incData = incoming.sections[section.id];

    // Gate: OR — if either submission activated it, it stays active
    const active = (existData?.active ?? false) || (incData?.active ?? false);

    const fields: Record<string, unknown> = {};
    for (const field of section.fields) {
      const existVal = existData?.fields[field.id];
      const incVal = incData?.fields[field.id];

      // Only merge incoming if the section was active in this submission
      const incActive = incData?.active ?? false;

      switch (field.type) {
        case 'free_text':
          fields[field.id] = incActive
            ? mergeText(existVal as string, incVal as string, incoming.timestamp)
            : existVal;
          break;
        case 'multi_select':
        case 'quick_tags':
          fields[field.id] = incActive
            ? mergeArrays(existVal, incVal)
            : (existVal ?? []);
          break;
        case 'intensity_scale':
          fields[field.id] = incActive
            ? mergeIntensity(existVal, incVal)
            : existVal;
          break;
        default:
          // boolean, single_select: latest non-empty value wins
          fields[field.id] = (incActive && hasValue(incVal)) ? incVal : existVal;
          break;
      }
    }

    merged.sections[section.id] = { active, fields };
  }

  return merged;
}

export function parseSheetRow(
  row: string[],
  headers: string[],
  sections: SectionConfig[]
): LogEntry {
  // Build header-to-index map
  const headerIndex: Record<string, number> = {};
  for (let i = 0; i < headers.length; i++) {
    headerIndex[headers[i]] = i;
  }

  const getByHeader = (header: string): string => {
    const idx = headerIndex[header];
    return idx !== undefined ? row[idx] || '' : '';
  };

  const entry: LogEntry = {
    id: getByHeader('ID') || row[0] || '',
    timestamp: getByHeader('Timestamp') || row[1] || '',
    date: getByHeader('Date') || row[2] || '',
    logger: (getByHeader('Logger') || row[3] || '') as 'Yoni' | 'Zoe',
    entryType: getByHeader('Entry Type') || row[4] || 'Daily Log',
    sections: {},
  };

  for (const section of sections) {
    // Check gate via current header name
    const gateHeader = `${section.name}?`;
    let active: boolean;
    if (section.hasGate) {
      active = getByHeader(gateHeader).toLowerCase() === 'yes';
    } else {
      active = true;
    }

    const fields: Record<string, unknown> = {};
    for (const field of section.fields) {
      const currentHeader = `${section.name} - ${field.label}`;
      let raw = getByHeader(currentHeader);

      // If not found under current header, check old aliases
      if (!raw) {
        for (const [oldHeader, mapping] of Object.entries(OLD_HEADER_ALIASES)) {
          if (mapping.sectionId === section.id && mapping.type === 'field' && mapping.fieldId === field.id) {
            raw = getByHeader(oldHeader);
            break;
          }
        }
      }

      fields[field.id] = parseFieldValue(raw, field);
    }

    entry.sections[section.id] = { active, fields };
  }

  return entry;
}
