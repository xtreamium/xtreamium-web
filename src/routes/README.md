# Routes

Simple routing system for the Xtreamium web application.

## Files

- `app-routes.tsx` - Main routes component using `<Routes>` and `<Route>`
- `routes.ts` - Route constants and type definitions  
- `use-app-navigation.ts` - Navigation hook utility
- `index.tsx` - Barrel exports

## Usage

### Adding New Routes

1. Add to `routes.ts`:
```typescript
export const ROUTES = {
  NEW_ROUTE: "/new-route",
} as const;
```

2. Add to `app-routes.tsx`:
```tsx
<Route path="/new-route" element={<NewRoutePage />} />
```

### With Parameters
```tsx
<Route path="/category/:categoryId" element={<CategoryPage />} />
```

### Navigation
```tsx
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes";

<Link to={ROUTES.SETTINGS}>Settings</Link>
```