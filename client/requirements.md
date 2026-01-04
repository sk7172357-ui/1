## Packages
framer-motion | Complex animations and page transitions
recharts | Analytics charts for bot activity and user stats
date-fns | Date formatting for logs and timestamps
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes

## Notes
The dashboard assumes the existence of standard CRUD endpoints for Users and Messages to support the "Human Handover" feature, even if only Status/Logs were explicitly defined in the initial manifest.
- GET /api/users (for list view)
- GET /api/users/:id/messages (for chat history)
- POST /api/config (for setting bot token)
