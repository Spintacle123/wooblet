'use client';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { z } from 'zod';
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api';
const rawQuery = fetchBaseQuery({ baseUrl: API_URL, credentials: 'include' });
let refreshPromise: Promise<unknown> | null = null;
const api = createApi({
  reducerPath: 'api', tagTypes: ['Resource'],
  baseQuery: async (args, ctx, extra) => {
    if (refreshPromise) await refreshPromise;
    let result = await rawQuery(args, ctx, extra);
    const url = typeof args === 'string' ? args : args.url;
    if (result.error?.status === 401 && !['auth/login', 'auth/register', 'auth/refresh'].includes(url)) {
      if (!refreshPromise) refreshPromise = Promise.resolve(rawQuery({ url: 'auth/refresh', method: 'POST' }, ctx, extra)).finally(() => { refreshPromise = null; });
      const refreshed = await refreshPromise as { data?: unknown };
      if (refreshed.data) result = await rawQuery(args, ctx, extra);
    }
    return result;
  },
  endpoints: build => ({
    resource: build.query<any, string>({ query: path => path, providesTags: ['Resource'] }),
    action: build.mutation<any, { path: string; method?: string; body?: unknown }>({
      query: ({ path, method = 'POST', body }) => ({ url: path, method, body }),
      invalidatesTags: ['Resource'],
    }),
  }),
});
const CartSchema = z.object({
  key: z.string(), productId: z.string(), name: z.string(), slug: z.string(), design: z.string(), price: z.number().positive(), quantity: z.number().int().min(1).max(20),
  // rimColor is optional so bags saved before the rim picker still load.
  customization: z.object({ primaryColor: z.string(), secondaryColor: z.string(), rimColor: z.string().optional(), petName: z.string().min(1).max(16), font: z.string() }),
});
export type CartItem = z.infer<typeof CartSchema>;
const cartSlice = createSlice({ name: 'cart', initialState: { items: [] as CartItem[] }, reducers: {
  load(state, action: PayloadAction<CartItem[]>) { state.items = action.payload; },
  add(state, action: PayloadAction<CartItem>) { const found = state.items.find(i => i.key === action.payload.key); if (found) found.quantity = Math.min(20, found.quantity + action.payload.quantity); else state.items.push(action.payload); },
  remove(state, action: PayloadAction<string>) { state.items = state.items.filter(i => i.key !== action.payload); },
  quantity(state, action: PayloadAction<{ key: string; quantity: number }>) { const item = state.items.find(i => i.key === action.payload.key); if (item) item.quantity = Math.max(1, Math.min(20, action.payload.quantity)); },
  clear(state) { state.items = []; },
} });
function makeStore() { return configureStore({ reducer: { [api.reducerPath]: api.reducer, cart: cartSlice.reducer }, middleware: get => get().concat(api.middleware) }); }
type Store = ReturnType<typeof makeStore>;
export const useAppDispatch = useDispatch.withTypes<Store['dispatch']>();
export const useAppSelector = useSelector.withTypes<ReturnType<Store['getState']>>();
export const cartActions = cartSlice.actions;
export const { useResourceQuery, useActionMutation } = api;
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  useEffect(() => {
    try { const parsed = z.array(CartSchema).max(100).safeParse(JSON.parse(localStorage.getItem('wooblet-cart') ?? '[]')); if (parsed.success) store.dispatch(cartActions.load(parsed.data)); } catch { /* Ignore corrupted browser storage. */ }
    return store.subscribe(() => { try { localStorage.setItem('wooblet-cart', JSON.stringify(store.getState().cart.items)); } catch { /* Shopping remains available without persistent storage. */ } });
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
export function errorMessage(error: any): string {
  const message = error?.data?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string') return message;
  if (error?.status === 'FETCH_ERROR') return 'Unable to connect. Please check your connection and try again.';
  if (error?.status === 429) return 'Too many requests. Please wait a moment and try again.';
  return 'Something went wrong. Please try again.';
}
export const money = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(amount);
export const date = (value: string) => new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(value));
