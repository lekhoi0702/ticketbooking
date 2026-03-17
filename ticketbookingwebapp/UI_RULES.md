# UI Stability Rules (TicketBooking WebApp)

Muc tieu cua bo rules nay la giu nguyen giao dien da thiet ke, tranh thay doi ngoai y muon khi chinh sua code.

## 1) UI Contract bat buoc

Khong duoc thay doi cac gia tri nen tang sau neu chua co task "UI redesign" duoc phe duyet:

- `src/theme/AntdThemeConfig.js`
  - `colorPrimary: '#2DC275'`
  - `borderRadius: 8`
  - `Button.controlHeight: 40`
- `src/theme/DarkThemeConfig.js`
  - `colorPrimary: '#2dc275'`
  - `colorBgLayout: 'rgb(39, 39, 42)'`
  - `borderRadius: 14`
  - `Button.controlHeight: 44`
- `src/index.css`
  - token dark theme: `--tb-primary`, `--tb-bg`, `--tb-surface`, `--tb-border`, `--tb-text`
  - body dark-theme phải tiep tuc duoc scope boi class `.dark-theme`
- `src/App.jsx`
  - User route phai tiep tuc duoc bọc boi `ConfigProvider theme={DarkThemeConfig}`.

Neu can doi cac gia tri tren, phai cap nhat tai lieu nay va cap nhat UI contract script cung commit.

## 2) Quy tac thay doi giao dien

- Khong doi theme token bang hard-code mau trong page/component moi.
- Uu tien dung token tu `src/index.css` va `src/theme/*ThemeConfig.js`.
- Khong doi global reset (`*`, `body`, scrollbar) neu khong co ly do bat buoc.
- Khong doi structure layout shell:
  - User: `Header -> Content -> Footer`
  - Organizer: `Sider fixed + Header sticky + Content margin`
  - Admin: `Sider + Header sticky + Content wrapper`
- Khi them CSS, scope theo feature/component, tranh selector qua rong gay side effect.
- Bat ky thay doi visual lon (spacing, radius, font-size, color system, header/footer/sider) phai co PR note ro "UI change approved".

## 3) Quy trinh truoc khi merge

Chay day du:

```bash
npm run lint
npm run ui:contract
```

Neu `ui:contract` fail, xem lai thay doi co lam lech giao dien goc hay khong.

## 4) Rule review cho team

- Neu PR co sua file theme/global CSS/layout shell, bat buoc review UI.
- Uu tien check cac man hinh:
  - User: `/`, `/events`, `/event/:id`, `/profile`
  - Organizer: `/organizer/events`, `/organizer/orders`
  - Admin: `/admin/statistics`, `/admin/events`
- Khong approve neu co thay doi giao dien nhung khong duoc mo ta ro trong PR.
