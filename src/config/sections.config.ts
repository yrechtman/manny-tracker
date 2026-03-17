import { SectionConfig } from '@/lib/types';

export const SECTIONS: SectionConfig[] = [
  {
    id: 'demand_barking',
    name: 'Demand Barking',
    hasGate: true,
    gateLabel: 'Did demand barking occur?',
    defaultExpanded: true,
    fields: [
      {
        id: 'intensity',
        label: 'Intensity',
        type: 'intensity_scale',
        scaleMax: 3,
        scaleLabels: [
          '1 - Low (brief, easy to redirect)',
          '2 - Moderate (persistent, harder to redirect)',
          '3 - High (sustained, escalating, couldn\'t redirect)',
        ],
        required: true,
      },
    ],
  },
  {
    id: 'reactivity',
    name: 'Reactivity',
    hasGate: true,
    gateLabel: 'Did a reaction occur?',
    fields: [
      {
        id: 'trigger',
        label: 'Trigger',
        type: 'multi_select',
        options: [
          { value: 'dog', label: 'Dog' },
          { value: 'person', label: 'Person' },
          { value: 'kid', label: 'Kid' },
          { value: 'bike_skateboard', label: 'Bike/Skateboard' },
          { value: 'car', label: 'Car' },
          { value: 'cat', label: 'Cat' },
          { value: 'sound', label: 'Sound' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'intensity',
        label: 'Intensity',
        type: 'single_select',
        options: [
          { value: 'Green', label: 'Green (under threshold)', color: '#22c55e' },
          { value: 'Yellow', label: 'Yellow (approaching threshold)', color: '#eab308' },
          { value: 'Red', label: 'Red (over threshold)', color: '#ef4444' },
        ],
        required: true,
      },
    ],
  },
  {
    id: 'enrichment',
    name: 'Enrichment',
    hasGate: false,
    alwaysVisible: true,
    fields: [
      {
        id: 'level',
        label: 'Level',
        type: 'single_select',
        options: [
          { value: 'low', label: 'Low (slow feeder, lick mat)' },
          { value: 'normal', label: 'Normal (chew, light training, nose work)' },
          { value: 'high', label: 'High (intense training, long decompression walk)' },
        ],
      },
      {
        id: 'activities',
        label: 'Activities',
        type: 'quick_tags',
        options: [
          { value: 'slow_feeder', label: 'Slow feeder' },
          { value: 'lick_mat', label: 'Lick mat' },
          { value: 'chew', label: 'Chew' },
          { value: 'nose_work', label: 'Nose work' },
          { value: 'light_training', label: 'Light training' },
          { value: 'intense_training', label: 'Intense training' },
          { value: 'decompression_walk', label: 'Decompression walk' },
          { value: 'frozen_kong', label: 'Frozen Kong' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'medication',
    name: 'Medication',
    hasGate: false,
    alwaysVisible: true,
    defaultCollapsed: true,
    fields: [
      {
        id: 'clomipramine_taken',
        label: 'Clomipramine taken?',
        type: 'boolean',
      },
      {
        id: 'clonidine_dose',
        label: 'Clonidine',
        type: 'single_select',
        options: [
          { value: 'baseline', label: 'Baseline dose' },
          { value: 'increased', label: 'Increased dose' },
          { value: 'skipped', label: 'Skipped' },
        ],
      },
    ],
  },
  {
    id: 'notes',
    name: 'Notes',
    hasGate: false,
    alwaysVisible: true,
    fields: [
      {
        id: 'text',
        label: 'Notes',
        type: 'free_text',
        placeholder: 'Anything notable today? Good moments, concerns, etc.',
      },
    ],
  },
];
