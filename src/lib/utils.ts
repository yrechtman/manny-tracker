import { v4 as uuidv4 } from 'uuid';
import { LogEntry, SectionConfig } from './types';
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

export function getSheetHeaders(sections: SectionConfig[]): string[] {
  const headers = ['id', 'timestamp', 'date', 'logger', 'entry_type'];

  for (const section of sections) {
    if (section.hasGate) {
      headers.push(`${section.id}_active`);
    }
    for (const field of section.fields) {
      headers.push(`${section.id}__${field.id}`);
    }
  }

  return headers;
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
      row.push(active ? 'yes' : 'no');
    }

    for (const field of section.fields) {
      if (!active && section.hasGate) {
        row.push('');
        continue;
      }

      const value = sectionData?.fields[field.id];

      if (value === undefined || value === null || value === '') {
        row.push('');
      } else if (Array.isArray(value)) {
        row.push(value.join('|'));
      } else if (typeof value === 'boolean') {
        row.push(value ? 'yes' : 'no');
      } else {
        row.push(String(value));
      }
    }
  }

  return row;
}

export function parseSheetRow(
  row: string[],
  headers: string[],
  sections: SectionConfig[]
): LogEntry {
  const getValue = (header: string) => {
    const idx = headers.indexOf(header);
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
      ? getValue(`${section.id}_active`) === 'yes'
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
          fields[field.id] = raw === 'yes';
          break;
        case 'multi_select':
        case 'quick_tags':
          fields[field.id] = raw.split('|').filter(Boolean);
          break;
        default:
          fields[field.id] = raw;
      }
    }

    entry.sections[section.id] = { active, fields };
  }

  return entry;
}
