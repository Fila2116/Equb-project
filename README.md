feat(branding): implement full branding configuration feature

- Add `BrandingConfig` Prisma model and migration
- Generate Prisma client for branding settings
- Create GET/POST (upsert) `/setting/branding-config` endpoints
- Add file upload endpoints for light/dark logos (`/upload/light`, `/upload/dark`) with Multer
- Register and protect all branding routes with staff-auth middleware & permissions
- Implement PATCH `/setting/branding-config/color` to update only primary/secondary colors
- Implement DELETE `/setting/branding-config` to reset branding config to defaults
- Ensure `public/uploads` directory exists and is served statically
- Create React `useBrandingConfig` hook for frontend consumption
- Apply theme (logos, colors, dark-mode) in `App.tsx` using hook and CSS variables

BREAKING CHANGE: Prisma schema now includes new `branding_configs` table; run migrations before deploying.
