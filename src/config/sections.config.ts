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
      {
        id: 'context',
        label: 'Context',
        type: 'multi_select',
        options: [
          { value: 'wanted_attention', label: 'Wanted attention' },
          { value: 'wanted_food', label: 'Wanted food' },
          { value: 'wanted_out', label: 'Wanted to go out' },
          { value: 'visitor_present', label: 'Visitor present' },
          { value: 'during_mealtime', label: 'During mealtime' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'duration',
        label: 'Approximate duration',
        type: 'duration',
        options: [
          { value: '<1min', label: '< 1 min' },
          { value: '1-5min', label: '1-5 min' },
          { value: '5-15min', label: '5-15 min' },
          { value: '15+min', label: '15+ min' },
        ],
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
          { value: 'Green', label: 'Green (noticed but under threshold)', color: '#22c55e' },
          { value: 'Yellow', label: 'Yellow (approaching threshold, tense)', color: '#eab308' },
          { value: 'Red', label: 'Red (over threshold, barking/lunging)', color: '#ef4444' },
        ],
        required: true,
      },
      {
        id: 'context',
        label: 'Context',
        type: 'single_select',
        options: [
          { value: 'on_leash', label: 'On leash' },
          { value: 'off_leash', label: 'Off leash' },
          { value: 'at_home', label: 'At home' },
          { value: 'at_park', label: 'At park' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'recovery_time',
        label: 'Recovery time',
        type: 'duration',
        options: [
          { value: '<30sec', label: '< 30 sec' },
          { value: '30sec-2min', label: '30 sec - 2 min' },
          { value: '2-5min', label: '2-5 min' },
          { value: '5+min', label: '5+ min' },
        ],
      },
    ],
  },
  {
    id: 'settling',
    name: 'Settling',
    hasGate: true,
    gateLabel: 'Was there difficulty settling?',
    fields: [
      {
        id: 'severity',
        label: 'Severity',
        type: 'intensity_scale',
        scaleMax: 3,
        scaleLabels: [
          '1 - Mild (took longer than usual)',
          '2 - Moderate (needed multiple attempts)',
          '3 - Severe (could not settle)',
        ],
        required: true,
      },
      {
        id: 'context',
        label: 'Context',
        type: 'multi_select',
        options: [
          { value: 'home_no_visitors', label: 'At home, no visitors' },
          { value: 'home_visitors', label: 'At home, visitors present' },
          { value: 'after_walk', label: 'After walk' },
          { value: 'after_meal', label: 'After meal' },
          { value: 'nighttime', label: 'Nighttime' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'noise_sensitivity',
    name: 'Noise Sensitivity',
    hasGate: true,
    gateLabel: 'Was there a noise reaction?',
    fields: [
      {
        id: 'trigger',
        label: 'Trigger',
        type: 'single_select',
        options: [
          { value: 'thunder', label: 'Thunder' },
          { value: 'fireworks', label: 'Fireworks' },
          { value: 'construction', label: 'Construction' },
          { value: 'siren', label: 'Siren' },
          { value: 'doorbell', label: 'Doorbell' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'intensity',
        label: 'Intensity',
        type: 'single_select',
        options: [
          { value: 'Green', label: 'Green (noticed but under threshold)', color: '#22c55e' },
          { value: 'Yellow', label: 'Yellow (approaching threshold, tense)', color: '#eab308' },
          { value: 'Red', label: 'Red (over threshold, barking/lunging)', color: '#ef4444' },
        ],
      },
      {
        id: 'recovery_time',
        label: 'Recovery time',
        type: 'duration',
        options: [
          { value: '<30sec', label: '< 30 sec' },
          { value: '30sec-2min', label: '30 sec - 2 min' },
          { value: '2-5min', label: '2-5 min' },
          { value: '5+min', label: '5+ min' },
        ],
      },
    ],
  },
  {
    id: 'medication_enrichment',
    name: 'Medication & Enrichment',
    hasGate: false,
    alwaysVisible: true,
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
      {
        id: 'situational_clonidine',
        label: 'Situational clonidine given?',
        type: 'boolean',
      },
      {
        id: 'enrichment',
        label: 'Enrichment provided',
        type: 'quick_tags',
        options: [
          { value: 'puzzle_feeder', label: 'Puzzle feeder' },
          { value: 'sniff_walk', label: 'Sniff walk' },
          { value: 'free_work', label: 'Free work' },
          { value: 'frozen_kong', label: 'Frozen Kong' },
          { value: 'training_session', label: 'Training session' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'good_moments',
    name: 'Good Moments',
    hasGate: true,
    gateLabel: 'Anything positive to note?',
    fields: [
      {
        id: 'tags',
        label: 'Quick tags',
        type: 'quick_tags',
        options: [
          { value: 'settled_on_own', label: 'Settled on own' },
          { value: 'calm_on_walk', label: 'Calm on walk' },
          { value: 'good_sleep', label: 'Good sleep' },
          { value: 'relaxed_with_visitors', label: 'Relaxed with visitors' },
          { value: 'played_well', label: 'Played well' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'notes',
        label: 'Notes',
        type: 'free_text',
        placeholder: 'Describe the good moment...',
      },
    ],
  },
  {
    id: 'comments',
    name: 'Comments',
    hasGate: false,
    alwaysVisible: true,
    fields: [
      {
        id: 'text',
        label: 'Additional notes',
        type: 'free_text',
        placeholder: 'Anything else to note...',
      },
    ],
  },
];
