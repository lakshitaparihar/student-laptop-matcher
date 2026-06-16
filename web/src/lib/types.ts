export interface Laptop {
  id: number
  name: string
  brand: string
  model: string
  price_inr: number
  price_segment: 'Budget' | 'Mid Range' | 'Upper Mid' | 'Premium'
  cpu: string
  cpu_generation: string
  ram_gb: number
  ram_upgradeable: boolean
  storage: string
  storage_upgradeable: boolean
  gpu: string
  gpu_type: 'Dedicated' | 'Integrated'
  screen_size: number
  screen_resolution: string
  display_type: string
  refresh_rate: number
  battery_wh: number
  estimated_battery_score: number
  weight_kg: number
  estimated_portability_score: number
  gaming_score: number
  future_proof_score: number
  ai_ml_score: number
  coding_score: number
  mba_score: number
  marketing_score: number
  design_score: number
  mechanical_score: number
  civil_score: number
  electronics_score: number
  best_for: string
  pros: string
  cons: string
  india_availability: string
  purchase_links: string
  last_verified_date: string
  major_fit: string[]
  community_sentiment: 'Excellent' | 'Good' | 'Average' | 'Poor'
}

export type Major =
  | 'AI/ML'
  | 'Computer Science'
  | 'Data Science'
  | 'Electronics'
  | 'Mechanical'
  | 'Civil'
  | 'Chemical'
  | 'Biotechnology'
  | 'MBA'
  | 'Marketing'
  | 'Design'
  | 'Architecture'
  | 'Other'

export type Budget = 'Budget' | 'Mid Range' | 'Upper Mid' | 'Premium'

export type Priority =
  | 'battery'
  | 'display'
  | 'performance'
  | 'portability'
  | 'future_proof'
  | 'value'

export interface QuizState {
  major: Major | null
  budget: Budget | null
  priorities: Priority[]
}

export const MAJOR_SCORE_FIELD: Record<Major, keyof Laptop> = {
  'AI/ML':            'ai_ml_score',
  'Computer Science': 'coding_score',
  'Data Science':     'ai_ml_score',
  Electronics:        'electronics_score',
  Mechanical:         'mechanical_score',
  Civil:              'civil_score',
  Chemical:           'mechanical_score',
  Biotechnology:      'mechanical_score',
  MBA:                'mba_score',
  Marketing:          'marketing_score',
  Design:             'design_score',
  Architecture:       'design_score',
  Other:              'coding_score', // fallback only; computed as average in scoring
}

export const PRIORITY_SCORE_FIELD: Record<Priority, keyof Laptop> = {
  battery: 'estimated_battery_score',
  display: 'marketing_score',
  performance: 'gaming_score',
  portability: 'estimated_portability_score',
  future_proof: 'future_proof_score',
  value: 'future_proof_score',
}

export const SEGMENT_RANGE: Record<Budget, string> = {
  Budget: '₹30,000 – ₹45,000',
  'Mid Range': '₹45,000 – ₹75,000',
  'Upper Mid': '₹75,000 – ₹1,20,000',
  Premium: '₹1,20,000+',
}
