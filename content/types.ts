export interface NavItem { label: string; href: string }
export interface Credential { value: string; label: string }
export interface Problem { number: string; title: string; description: string }
export interface Need { id: string; label: string; kicker: string; title: string; body: string; features: string[]; interest: string }
export interface Service { title: string; description: string; number: string }
export interface Package { name: string; price: string; description: string; detail: string; features: string[]; featured?: boolean }
