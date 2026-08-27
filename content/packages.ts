import type { Package } from './types'

export const buildPackages: Package[] = [
  { name: 'Starter', price: '$1,495', description: 'A professional web presence for a small business.', detail: 'Approximately 1–3 pages', features: ['Custom website', 'Mobile-first design', 'Accessibility foundation', 'Technical SEO + AI-search foundation', 'Contact form, analytics, and launch support'] },
  { name: 'Business', price: '$2,495', description: 'More room to tell your story and support local growth.', detail: 'Approximately 4–6 pages', featured: true, features: ['Everything in Starter', 'Expanded services and content', 'Stronger local-search structure', 'Google Business Profile integration', 'More space for business needs'] },
  { name: 'Custom', price: 'Starting at $4,000', description: 'For larger sites and projects with uncommon requirements.', detail: '7+ pages or custom scope', features: ['Custom functionality', 'Complex integrations', 'Larger content requirements', 'Unusual business needs', 'A project plan shaped around the work'] },
]

export const carePlan = { price: '$149/month', title: 'Website Care', items: ['Hosting coordination', 'Routine updates and small content changes', 'Form and uptime monitoring', 'Analytics and Search Console checks', 'Minor improvements and direct support'], note: 'Website Care is optional. Exact monthly scope and response expectations are set in the project agreement.' }

export const accessibilityPackages = [
  { title: 'Accessibility Audit', price: 'Starting at $750', description: 'A focused review with automated testing, keyboard and structural checks, form and contrast review, prioritized findings, and practical WCAG-based recommendations.' },
  { title: 'Accessibility Remediation', price: 'Starting at $1,500', description: 'Hands-on fixes for semantic structure, keyboard and focus issues, forms, labels, contrast, ARIA, and screen-reader usability. Scope depends on the site’s size and condition.' },
]
