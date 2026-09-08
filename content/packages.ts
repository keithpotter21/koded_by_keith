import type { Package } from './types'

export const buildPackages: Package[] = [
  { name: 'The Basics', price: '$1,500', description: 'One custom, polished page for the essentials.', detail: 'Starting at', features: ['One custom, polished page', 'Your business, services, and contact information', 'Works on phones (because that’s where people are)', 'Contact form and useful links', 'Basic search setup', 'One round of revisions', 'Launched and ready to do its job'] },
  { name: 'The Works', price: '$3,000', description: 'A little more room, without the unnecessary nonsense.', detail: 'Starting at', featured: true, features: ['Custom 3–5 page website', 'Services, about, contact, etc.', 'Works on all devices', 'Contact forms, maps, links', 'Basic search setup', 'One round of revisions', 'Launched and ready to do its job'] },
  { name: 'The Whole Enchilada', price: '$5,000', description: 'The full website. All of it. Yes, the whole thing.', detail: 'Starting at', features: ['Custom 6–10 page website', 'Services, team, testimonials, FAQs, galleries, and more', 'A site structure that makes sense', 'Works on all devices', 'Contact forms, maps, links', 'Basic search setup across the site', 'Two rounds of revisions', 'Launched and ready to do its job'] },
]

export const carePlan = { price: '$299/month', title: 'Website Care', items: ['Website hosting, maintenance, and updates', 'Google Business Profile management', 'AI tools when they’re genuinely useful', 'Text-message follow-up and customer-retention tools', 'Ongoing help as your business changes'], note: 'Website Care is optional. Exact monthly scope and response expectations are set in the project agreement.' }

export const accessibilityPackages = [
  { title: 'Accessibility Audit', price: 'Starting at $750', description: 'A focused review with automated testing, keyboard and structural checks, form and contrast review, prioritized findings, and practical WCAG-based recommendations.' },
  { title: 'Accessibility Remediation', price: 'Starting at $1,500', description: 'Hands-on fixes for semantic structure, keyboard and focus issues, forms, labels, contrast, ARIA, and screen-reader usability. Scope depends on the site’s size and condition.' },
]
