export const siteConfig = {
  name: "Local Service Finder",
  description: "On-demand local service marketplace connecting customers with vetted professionals.",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Browse Services", href: "/services" },
    { title: "Categories", href: "/categories" },
    { title: "Find Providers", href: "/providers" },
  ],
  roles: {
    CUSTOMER: "CUSTOMER",
    SERVICE_PROVIDER: "SERVICE_PROVIDER",
    ADMIN: "ADMIN",
  } as const,
};

export type UserRole = (typeof siteConfig.roles)[keyof typeof siteConfig.roles];

