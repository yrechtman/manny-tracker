'use client';

import { useState } from 'react';
import { SectionConfig, FieldConfig } from '@/lib/types';
import IntensityScale from './fields/IntensityScale';
import MultiSelect from './fields/MultiSelect';
import SingleSelect from './fields/SingleSelect';
import FreeText from './fields/FreeText';
import DurationPicker from './fields/DurationPicker';
import BooleanToggle from './fields/BooleanToggle';
import QuickTags from './fields/QuickTags';

interface Props {
  config: SectionConfig;
  active: boolean;
  fields: Record<string, unknown>;
  onGateChange: (active: boolean) => void;
  onFieldChange: (fieldId: string, value: unknown) => void;
}

function renderField(
  field: FieldConfig,
  value: unknown,
  onChange: (value: unknown) => void
) {
  switch (field.type) {
    case 'intensity_scale':
      return (
        <IntensityScale
          config={field}
          value={value as number | null}
          onChange={onChange}
        />
      );
    case 'multi_select':
      return (
        <MultiSelect
          config={field}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      );
    case 'single_select':
      return (
        <SingleSelect
          config={field}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );
    case 'free_text':
      return (
        <FreeText
          config={field}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );
    case 'duration':
      return (
        <DurationPicker
          config={field}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );
    case 'boolean':
      return (
        <BooleanToggle
          config={field}
          value={(value as boolean) || false}
          onChange={onChange}
        />
      );
    case 'quick_tags':
      return (
        <QuickTags
          config={field}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

export default function FormSection({
  config,
  active,
  fields,
  onGateChange,
  onFieldChange,
}: Props) {
  const [expanded, setExpanded] = useState(config.defaultExpanded ?? false);
  const showFields = config.alwaysVisible || active;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => {
          if (config.hasGate && !active) {
            onGateChange(true);
            setExpanded(true);
          } else if (config.alwaysVisible) {
            setExpanded(!expanded);
          } else {
            setExpanded(!expanded);
          }
        }}
        className="w-full min-h-[52px] px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="text-base font-semibold text-gray-900">
          {config.name}
        </span>
        <div className="flex items-center gap-2">
          {config.hasGate && active && (
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              Yes
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded && showFields ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {config.hasGate && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {config.gateLabel}
              </label>
              <div className="flex gap-2">
                {['Yes', 'No'].map((option) => {
                  const isYes = option === 'Yes';
                  const isSelected = isYes ? active : !active;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onGateChange(isYes)}
                      className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? isYes
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showFields &&
            config.fields.map((field) => (
              <div key={field.id}>
                {renderField(field, fields[field.id], (value) =>
                  onFieldChange(field.id, value)
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
