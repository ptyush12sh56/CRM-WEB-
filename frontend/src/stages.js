export const STAGES = [
  { id: 'new', label: 'New', color: 'var(--new)' },
  { id: 'contacted', label: 'Contacted', color: 'var(--contacted)' },
  { id: 'qualified', label: 'Qualified', color: 'var(--qualified)' },
  { id: 'won', label: 'Won', color: 'var(--won)' },
  { id: 'lost', label: 'Lost', color: 'var(--lost)' },
]

export const stageMap = Object.fromEntries(STAGES.map((s) => [s.id, s]))
