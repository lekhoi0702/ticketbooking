# Repository Agent Rules

## UI Protection (ticketbookingwebapp)

When you edit any file under `ticketbookingwebapp`, you must preserve the existing UI design contract.

1. Read `ticketbookingwebapp/UI_RULES.md` first.
2. Do not change core visual tokens in:
   - `ticketbookingwebapp/src/theme/AntdThemeConfig.js`
   - `ticketbookingwebapp/src/theme/DarkThemeConfig.js`
   - `ticketbookingwebapp/src/index.css`
3. Do not change layout shell structure in:
   - `ticketbookingwebapp/src/features/user/components/UserLayout.jsx`
   - `ticketbookingwebapp/src/features/organizer/components/OrganizerLayout.jsx`
   - `ticketbookingwebapp/src/features/admin/components/AdminLayout.jsx`
4. Before finishing, run:
   - `npm run ui:contract` (inside `ticketbookingwebapp`)
5. If UI change is intentional, explicitly note "UI change approved" and update `ticketbookingwebapp/UI_RULES.md` in the same commit.
