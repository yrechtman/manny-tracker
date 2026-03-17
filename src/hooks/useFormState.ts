'use client';

import { useReducer, useCallback } from 'react';
import { SectionConfig, SectionData } from '@/lib/types';

type FormState = Record<string, SectionData>;

type FormAction =
  | { type: 'SET_GATE'; sectionId: string; active: boolean }
  | { type: 'SET_FIELD'; sectionId: string; fieldId: string; value: unknown }
  | { type: 'RESET'; sections: SectionConfig[] }
  | { type: 'FILL_NORMAL_DAY'; sections: SectionConfig[] };

function initState(sections: SectionConfig[]): FormState {
  const state: FormState = {};
  for (const section of sections) {
    const fields: Record<string, unknown> = {};
    for (const field of section.fields) {
      switch (field.type) {
        case 'boolean':
          fields[field.id] = false;
          break;
        case 'multi_select':
        case 'quick_tags':
          fields[field.id] = [];
          break;
        case 'intensity_scale':
          fields[field.id] = null;
          break;
        default:
          fields[field.id] = '';
      }
    }
    state[section.id] = {
      active: section.alwaysVisible ?? false,
      fields,
    };
  }
  return state;
}

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_GATE':
      return {
        ...state,
        [action.sectionId]: {
          ...state[action.sectionId],
          active: action.active,
        },
      };
    case 'SET_FIELD':
      return {
        ...state,
        [action.sectionId]: {
          ...state[action.sectionId],
          fields: {
            ...state[action.sectionId].fields,
            [action.fieldId]: action.value,
          },
        },
      };
    case 'RESET':
      return initState(action.sections);
    case 'FILL_NORMAL_DAY': {
      const fresh = initState(action.sections);
      // Demand barking: no (gate off)
      if (fresh.demand_barking) {
        fresh.demand_barking.active = false;
      }
      // Reactivity: no (gate off)
      if (fresh.reactivity) {
        fresh.reactivity.active = false;
      }
      // Medication: baseline defaults
      if (fresh.medication) {
        fresh.medication.active = true;
        fresh.medication.fields.clomipramine_taken = true;
        fresh.medication.fields.clonidine_dose = 'baseline';
      }
      // Enrichment: normal level
      if (fresh.enrichment) {
        fresh.enrichment.active = true;
        fresh.enrichment.fields.level = 'normal';
      }
      if (fresh.notes) {
        fresh.notes.active = true;
      }
      return fresh;
    }
    default:
      return state;
  }
}

export function useFormState(sections: SectionConfig[]) {
  const [state, dispatch] = useReducer(reducer, sections, initState);

  const setGate = useCallback((sectionId: string, active: boolean) => {
    dispatch({ type: 'SET_GATE', sectionId, active });
  }, []);

  const setField = useCallback((sectionId: string, fieldId: string, value: unknown) => {
    dispatch({ type: 'SET_FIELD', sectionId, fieldId, value });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', sections });
  }, [sections]);

  const fillNormalDay = useCallback(() => {
    dispatch({ type: 'FILL_NORMAL_DAY', sections });
  }, [sections]);

  return { state, setGate, setField, reset, fillNormalDay };
}
