/**
 * In-memory shopping cart and order history.
 *
 * Cart lines hold a snapshot of the product rather than just its id, so an
 * order keeps the name and price it was placed at — which is what you would
 * want from a real backend too.
 *
 * Like the product store, nothing here is persisted: this is a sample app.
 */

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import type { Product } from '@/store/products';

export type CartLine = {
  product: Product;
  quantity: number;
};

export type Customer = {
  name: string;
  phone: string;
  /** Optional — a customer can collect the order at the market instead. */
  address?: string;
};

export type Order = {
  id: string;
  /** Short human-readable code shown on the confirmation screen. */
  reference: string;
  lines: CartLine[];
  total: number;
  itemCount: number;
  customer: Customer;
  placedAt: number;
};

export const MAX_QUANTITY_PER_LINE = 99;

/* -------------------------------------------------------------------------- */
/*                                   Reducer                                  */
/* -------------------------------------------------------------------------- */

type State = {
  lines: CartLine[];
  orders: Order[];
};

type Action =
  | { type: 'add'; product: Product; quantity: number }
  | { type: 'set-quantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'place-order'; order: Order };

const clampQuantity = (quantity: number) =>
  Math.max(0, Math.min(MAX_QUANTITY_PER_LINE, Math.round(quantity)));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const existing = state.lines.find((line) => line.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.product.id === action.product.id
              ? { ...line, quantity: clampQuantity(line.quantity + action.quantity) }
              : line
          ),
        };
      }
      const quantity = clampQuantity(action.quantity);
      if (quantity === 0) return state;
      return { ...state, lines: [...state.lines, { product: action.product, quantity }] };
    }

    case 'set-quantity': {
      const quantity = clampQuantity(action.quantity);
      // Dropping to zero removes the line rather than leaving an empty row.
      if (quantity === 0) {
        return { ...state, lines: state.lines.filter((l) => l.product.id !== action.productId) };
      }
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.product.id === action.productId ? { ...line, quantity } : line
        ),
      };
    }

    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.product.id !== action.productId) };

    case 'clear':
      return { ...state, lines: [] };

    case 'place-order':
      return { lines: [], orders: [action.order, ...state.orders] };
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */

type CartContextValue = {
  lines: CartLine[];
  /** Total number of individual items, used for the tab badge. */
  itemCount: number;
  subtotal: number;
  isEmpty: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  /** How many of this product are already in the cart (0 if none). */
  getQuantity: (productId: string) => number;
  placeOrder: (customer: Customer) => Order;
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
};

const CartContext = createContext<CartContextValue | null>(null);

let orderCounter = 1040;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], orders: [] });

  const itemCount = useMemo(
    () => state.lines.reduce((total, line) => total + line.quantity, 0),
    [state.lines]
  );

  const subtotal = useMemo(
    () => state.lines.reduce((total, line) => total + line.product.price * line.quantity, 0),
    [state.lines]
  );

  const addToCart = useCallback((product: Product, quantity = 1) => {
    dispatch({ type: 'add', product, quantity });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'set-quantity', productId, quantity });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'remove', productId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const getQuantity = useCallback(
    (productId: string) =>
      state.lines.find((line) => line.product.id === productId)?.quantity ?? 0,
    [state.lines]
  );

  const placeOrder = useCallback(
    (customer: Customer) => {
      orderCounter += 1;
      const order: Order = {
        id: `order-${Date.now()}-${orderCounter}`,
        reference: `GLM-${orderCounter}`,
        lines: state.lines,
        total: subtotal,
        itemCount,
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address?.trim() || undefined,
        },
        placedAt: Date.now(),
      };
      dispatch({ type: 'place-order', order });
      return order;
    },
    [state.lines, subtotal, itemCount]
  );

  const getOrderById = useCallback(
    (id: string) => state.orders.find((order) => order.id === id),
    [state.orders]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      itemCount,
      subtotal,
      isEmpty: state.lines.length === 0,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      getQuantity,
      placeOrder,
      orders: state.orders,
      getOrderById,
    }),
    [
      state.lines,
      state.orders,
      itemCount,
      subtotal,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      getQuantity,
      placeOrder,
      getOrderById,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a <CartProvider>');
  }
  return context;
}
