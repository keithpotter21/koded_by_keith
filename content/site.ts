import type { Credential, NavItem, Need, Problem, Service } from './types'

export const site = {
  name: '<koded_by_keith/>',
  owner: 'Keith Potter',
  email: 'hello@keithpotter.net',
  title: 'Koded by Keith | Web Development for Small Businesses',
  description: 'Koded by Keith builds fast, accessible websites for small businesses with SEO, AI search optimization, Google Business Profile support and ongoing website management.',
  portrait: { src: '/images/keith-potter-hero.png', alt: 'Keith Potter, independent web developer and founder of Koded by Keith.' },
}

export const navigation: NavItem[] = [
  { label: 'Why Me', href: '#why-me' }, { label: 'What I Do', href: '#services' }, { label: 'Pricing', href: '#pricing' }, { label: 'Contact', href: '#contact' },
]

export const credentials: Credential[] = [
  { value: '20+ Years', label: 'Building websites' }, { value: 'Enterprise', label: 'Development experience' }, { value: 'Accessibility', label: 'Built in' }, { value: 'SEO + GEO', label: 'Search ready' }, { value: 'Direct', label: 'Work with me' },
]

export const problems: Problem[] = [
  { number: '01', title: 'Starting from zero', description: 'You need a professional home for your business—one that makes a strong first impression from day one.' },
  { number: '02', title: 'The DIY site got you started', description: 'The template did its job. Now your business needs a site that feels more capable and more like you.' },
  { number: '03', title: 'Your business outgrew the site', description: 'Your services, team, or reputation have moved forward. Your website should catch up.' },
  { number: '04', title: 'It needs the right fixes', description: 'Sometimes a rebuild is not the answer. A focused set of improvements can make a real difference.' },
  { number: '05', title: 'Visitors are not taking action', description: 'People may be landing on the site, but not calling, booking, or asking for a quote.' },
  { number: '06', title: 'You are done dealing with it', description: 'You have a business to run. The website needs a capable person in your corner.' },
]

export const needs: Need[] = [
  { id: 'new-website', label: 'I need a website', kicker: 'Starting from zero', title: 'Start with a site built for the way your business works.', body: 'We will turn what you do best into a clear, trustworthy online presence that gives customers an easy next step.', features: ['Clear service story', 'Mobile-first design', 'Contact path', 'Search-ready foundation'], interest: 'New Website' },
  { id: 'improvements', label: 'My current site needs work', kicker: 'Rebuild or improve', title: 'Make the site you have pull its weight.', body: 'We can assess what is holding the current site back, then decide whether focused improvements or a full rebuild makes more sense.', features: ['Practical assessment', 'Better customer flow', 'Performance fixes', 'Modern structure'], interest: 'Website Redesign / Improvements' },
  { id: 'visibility', label: 'I need better visibility', kicker: 'Google + AI search', title: 'Help search systems understand your business.', body: 'Good visibility starts with a useful, well-structured site. I can improve the technical and content signals that support local search.', features: ['Technical SEO', 'Structured content', 'Schema markup', 'Google profile alignment'], interest: 'SEO + AI Visibility' },
  { id: 'care', label: 'I need ongoing help', kicker: 'Updates & management', title: 'Have an experienced person handle the website.', body: 'Keep your site current and working while you focus on customers, crews, and the day-to-day work of the business.', features: ['Routine updates', 'Form monitoring', 'Small changes', 'Direct support'], interest: 'Website Care' },
]

export const services: Service[] = [
  { number: '01', title: 'Website Design & Development', description: 'Modern, mobile-first websites designed around your customers, your services, and the action you want people to take.' },
  { number: '02', title: 'SEO + AI Search Optimization', description: 'Technical SEO, structured content, schema, and thoughtful GEO practices that help search engines understand your business.' },
  { number: '03', title: 'Google Business Profile', description: 'Align your website and Google Business Profile so customers and search systems find consistent, useful information.' },
  { number: '04', title: 'Accessibility & Remediation', description: 'Audit, build, and improve websites with inclusive experiences, dependable forms, and usable interactions in mind.' },
  { number: '05', title: 'Ongoing Website Management', description: 'Updates, maintenance, monitoring, content changes, and steady improvements from a person who knows your site.' },
]
