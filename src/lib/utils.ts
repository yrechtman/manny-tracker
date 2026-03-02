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

// Internal column keys (used for parsing rows back into LogEntry)
export function getSheetKeys(sections: SectionConfig[]): string[] {
  const keys = ['id', 'timestamp', 'date', 'logger', 'entry_type'];

  for (const section of sections) {
    if (section.hasGate) {
      keys.push(`${section.id}_active`);
    }
    for (const field of section.fields) {
      keys.push(`${section.id}__${field.id}`);
    }
  }

  return keys;
}

// Resolve a value to its display label using field config
function toDisplayValue(value: unknown, field: FieldConfig): string {
  if (value === undefined || value === null || value === '') return '';

  if (Array.isArray(value)) {
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

export function parseSheetRow(
  row: string[],
  _headers: string[],
  sections: SectionConfig[]
): LogEntry {
  // Parse by position rather than header name, since headers are now human-readable
  const keys = getSheetKeys(sections);

  const getValue = (key: string) => {
    const idx = keys.indexOf(key);
    return idx >= 0 ? row[idx] || '' : '';
  };

  const entry: LogEntry = {
    id: getValue('id'),
    timestamp: getValue('timestamp'),
    date: getValue('date'),
    logger: getValue('logger') as 'Yoni' | 'Zoe',
    entryType: getValue('entry_type') as 'Incident' | 'End of Day',
    sections: {},
  };

  for (const section of sections) {
    const active = section.hasGate
      ? getValue(`${section.id}_active`).toLowerCase() === 'yes'
      : true;

    const fields: Record<string, unknown> = {};
    for (const field of section.fields) {
      const raw = getValue(`${section.id}__${field.id}`);

      if (!raw) {
        fields[field.id] = field.type === 'boolean' ? false : field.type === 'multi_select' || field.type === 'quick_tags' ? [] : '';
        continue;
      }

      switch (field.type) {
        case 'boolean':
          fields[field.id] = raw.toLowerCase() === 'yes';
          break;
        case 'multi_select':
        case 'quick_tags':
          // Values are stored as display labels now, split by comma
          fields[field.id] = raw.split(', ').filter(Boolean).map((label) => {
            const opt = field.options?.find((o) => o.label === label);
            return opt?.value || label;
          });
          break;
        case 'intensity_scale': {
          // Stored as "1 - Low (...)", extract number
          const match = raw.match(/^(\d+)/);
          fields[field.id] = match ? Number(match[1]) : raw;
          break;
        }
        case 'single_select':
        case 'duration': {
          // Stored as display label, map back to value
          const opt = field.options?.find((o) => o.label === raw);
          fields[field.id] = opt?.value || raw;
          break;
        }
        default:
          fields[field.id] = raw;
      }
    }

    entry.sections[section.id] = { active, fields };
  }

  return entry;
}
