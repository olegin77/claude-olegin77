# Mobile Development — React Native + Expo

> Read this file when mobile/react-native/expo/app keywords detected.

## Stack
- React Native 0.76+ (New Architecture enabled)
- Expo SDK 52+ with Expo Router v4
- TypeScript strict mode
- Zustand (client state) + React Query / TanStack Query (server state)
- EAS Build + EAS Update (OTA hotfixes)

## Project Structure
```
mobile-app/
├── app/                    # Expo Router (file-based navigation)
│   ├── (tabs)/            # Tab navigator group
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Home tab
│   │   └── profile.tsx    # Profile tab
│   ├── (auth)/            # Auth flow group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404
├── components/            # Shared components
│   ├── ui/               # Design system primitives
│   └── features/         # Feature-specific components
├── hooks/                 # Custom hooks
├── services/              # API layer (React Query)
├── stores/                # Zustand stores
├── constants/             # Theme, config, colors
├── utils/                 # Pure utility functions
└── assets/                # Images, fonts, animations
```

## Key Patterns

### Navigation (Expo Router)
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### State Management
```typescript
// stores/auth.store.ts — Client state (Zustand)
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: 'auth', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// services/api.ts — Server state (React Query)
import { useQuery, useMutation } from '@tanstack/react-query';

export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  });

export const useCreateOrder = () =>
  useMutation({
    mutationFn: (data: OrderInput) =>
      fetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  });
```

### Platform-Specific Code
```
component.tsx          # Shared (default)
component.ios.tsx      # iOS-only override (when needed)
component.android.tsx  # Android-only override (when needed)
```

### API Integration
```typescript
// services/client.ts
const API_BASE = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.myapp.com';

export const apiClient = {
  get: async <T>(path: string): Promise<T> => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  },
};
```

## Testing
- **Unit**: Jest + React Native Testing Library
- **Component**: `@testing-library/react-native`
- **E2E**: Maestro (recommended) or Detox
- **Coverage target**: 80%+

```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react-native';
import { ProductCard } from '@/components/ProductCard';

test('displays product name and price', () => {
  render(<ProductCard name="Widget" price={29.99} />);
  expect(screen.getByText('Widget')).toBeTruthy();
  expect(screen.getByText('$29.99')).toBeTruthy();
});
```

## Build & Deploy
```bash
# Development
npx expo start

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# OTA update (hotfix without app store review)
eas update --branch production --message "fix: critical bug"

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Performance
- Hermes JS engine (enabled by default in Expo SDK 52+)
- Use `FlatList` or `FlashList` for long lists (never `ScrollView` with map)
- Lazy load screens: `expo-router` does this automatically
- Image optimization: `expo-image` (not `Image` from react-native)
- Minimize re-renders: `React.memo`, `useMemo`, `useCallback` where measured

## Project-Specific Mobile Needs

| Project | Mobile App | Key Features |
|---------|-----------|-------------|
| P2P | Buyer/seller marketplace | Chat, listings, payments |
| NAVR.uz | Customer portal | Booking, notifications |
| WeddingUz | Event booking | Gallery, RSVP, vendor chat |
| New projects | Mobile-first by default | TBD per project |
