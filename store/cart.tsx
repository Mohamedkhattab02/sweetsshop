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

import { buildGoogleMapsUrl } from '@/constants/maps';
import { notifyLocal } from '@/services/notifications';
import type { Product } from '@/store/products';

export type CartLine = {
  product: Product;
  quantity: number;
};

export type Customer = {
  name: string;
  phone: string;
  /** Optional — a customer can collect the order at the Nour Sweets counter. */
  address?: string;
  deliveryAddress?: DeliveryAddress;
};

export type DeliveryAddress = {
  street: string;
  houseNumber: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  formatted: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
};

export type FulfillmentMethod = 'pickup' | 'delivery';

export type DeliveryStatus =
  | 'unassigned'
  | 'claimed'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered';

export type CourierLocation = {
  latitude: number;
  longitude: number;
  updatedAt: number;
  label?: string;
};

export type Courier = {
  id: string;
  name: string;
  phone: string;
};

export const CURRENT_COURIER: Courier = {
  id: 'courier-nour',
  name: 'Nour Delivery',
  phone: '+972 50 555 0144',
};

export type NotificationAudience = 'customer' | 'owner' | 'courier';

export type AppNotification = {
  id: string;
  audience: NotificationAudience;
  title: string;
  message: string;
  createdAt: number;
  orderId?: string;
  read: boolean;
};

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'declined';

export type Order = {
  id: string;
  /** Short human-readable code shown on the confirmation screen. */
  reference: string;
  lines: CartLine[];
  total: number;
  itemCount: number;
  customer: Customer;
  placedAt: number;
  status: OrderStatus;
  fulfillment: FulfillmentMethod;
  deliveryStatus?: DeliveryStatus;
  courierId?: string;
  courierName?: string;
  courierLocation?: CourierLocation;
};

export const MAX_QUANTITY_PER_LINE = 99;

/* -------------------------------------------------------------------------- */
/*                                   Reducer                                  */
/* -------------------------------------------------------------------------- */

type State = {
  lines: CartLine[];
  orders: Order[];
  notifications: AppNotification[];
};

type Action =
  | { type: 'add'; product: Product; quantity: number }
  | { type: 'set-quantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'place-order'; order: Order }
  | { type: 'update-order-status'; orderId: string; status: OrderStatus }
  | { type: 'claim-delivery'; orderId: string; courier: Courier }
  | { type: 'update-delivery-status'; orderId: string; status: DeliveryStatus }
  | { type: 'update-courier-location'; orderId: string; location: CourierLocation }
  | { type: 'add-notifications'; notifications: AppNotification[] }
  | { type: 'mark-notifications-read'; audience: NotificationAudience };

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
      return { ...state, lines: [], orders: [action.order, ...state.orders] };

    case 'update-order-status':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId ? { ...order, status: action.status } : order
        ),
      };

    case 'claim-delivery':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId
            ? {
                ...order,
                courierId: action.courier.id,
                courierName: action.courier.name,
                deliveryStatus: 'claimed',
              }
            : order
        ),
      };

    case 'update-delivery-status':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId
            ? {
                ...order,
                deliveryStatus: action.status,
                status: action.status === 'delivered' ? 'completed' : order.status,
              }
            : order
        ),
      };

    case 'update-courier-location':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId ? { ...order, courierLocation: action.location } : order
        ),
      };

    case 'add-notifications':
      return {
        ...state,
        notifications: [...action.notifications, ...state.notifications].slice(0, 80),
      };

    case 'mark-notifications-read':
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.audience === action.audience ? { ...notification, read: true } : notification
        ),
      };
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
  placeOrder: (customer: Customer, fulfillment?: FulfillmentMethod) => Order;
  orders: Order[];
  pendingOrderCount: number;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  claimDelivery: (orderId: string, courier?: Courier) => void;
  updateDeliveryStatus: (orderId: string, status: DeliveryStatus) => void;
  updateCourierLocation: (orderId: string, location: CourierLocation) => void;
  availableDeliveries: Order[];
  courierOrders: Order[];
  notifications: AppNotification[];
  unreadNotificationCount: (audience: NotificationAudience) => number;
  markNotificationsRead: (audience: NotificationAudience) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

let orderCounter = 1040;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], orders: [], notifications: [] });

  const itemCount = useMemo(
    () => state.lines.reduce((total, line) => total + line.quantity, 0),
    [state.lines]
  );

  const subtotal = useMemo(
    () => state.lines.reduce((total, line) => total + line.product.price * line.quantity, 0),
    [state.lines]
  );

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (!product.available || product.stockQuantity <= 0) return;
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
    (customer: Customer, fulfillment: FulfillmentMethod = 'pickup') => {
      orderCounter += 1;
      const now = Date.now();
      const order: Order = {
        id: `order-${now}-${orderCounter}`,
        reference: `GLM-${orderCounter}`,
        lines: state.lines,
        total: subtotal,
        itemCount,
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.deliveryAddress?.formatted.trim() || customer.address?.trim() || undefined,
          deliveryAddress: customer.deliveryAddress
            ? {
                ...customer.deliveryAddress,
                street: customer.deliveryAddress.street.trim(),
                houseNumber: customer.deliveryAddress.houseNumber.trim(),
                floor: customer.deliveryAddress.floor?.trim() || undefined,
                apartment: customer.deliveryAddress.apartment?.trim() || undefined,
                notes: customer.deliveryAddress.notes?.trim() || undefined,
                formatted: customer.deliveryAddress.formatted.trim(),
                mapsUrl:
                  customer.deliveryAddress.mapsUrl ||
                  buildGoogleMapsUrl(
                    customer.deliveryAddress.latitude !== undefined && customer.deliveryAddress.longitude !== undefined
                      ? { latitude: customer.deliveryAddress.latitude, longitude: customer.deliveryAddress.longitude }
                      : undefined,
                    customer.deliveryAddress.formatted
                  ),
              }
            : undefined,
        },
        placedAt: now,
        status: 'pending',
        fulfillment,
        deliveryStatus: fulfillment === 'delivery' ? 'unassigned' : undefined,
      };
      dispatch({ type: 'place-order', order });
      const notifications: AppNotification[] = [
        makeNotification('owner', 'New order received', `${order.reference} is waiting in your order desk.`, order.id),
      ];
      if (fulfillment === 'delivery') {
        notifications.push(
          makeNotification('courier', 'New delivery request', `${order.reference} is ready for a courier to claim.`, order.id)
        );
      }
      dispatch({ type: 'add-notifications', notifications });
      void notifyLocal(
        fulfillment === 'delivery' ? 'New order + delivery' : 'New order received',
        `${order.reference} has been placed and is waiting for confirmation.`,
        { orderId: order.id }
      );
      return order;
    },
    [state.lines, subtotal, itemCount]
  );

  const getOrderById = useCallback(
    (id: string) => state.orders.find((order) => order.id === id),
    [state.orders]
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    const order = state.orders.find((candidate) => candidate.id === orderId);
    dispatch({ type: 'update-order-status', orderId, status });
    if (!order || order.status === status) return;

    const messageByStatus: Record<OrderStatus, string> = {
      pending: 'The shop is reviewing your order.',
      accepted: 'The shop confirmed your order.',
      preparing: 'Your sweets are being prepared now.',
      ready: order.fulfillment === 'delivery' ? 'Your order is ready for the courier.' : 'Your order is ready for collection.',
      completed: 'Your order has been completed. Enjoy every bite!',
      declined: 'The shop could not accept this order.',
    };
    const notifications: AppNotification[] = [
      makeNotification('customer', `Order ${status}`, messageByStatus[status], order.id),
    ];
    if (order.courierId) {
      notifications.push(makeNotification('courier', `Order ${status}`, messageByStatus[status], order.id));
    }
    dispatch({ type: 'add-notifications', notifications });
    void notifyLocal(`Order ${status}`, messageByStatus[status], { orderId });
  }, [state.orders]);

  const claimDelivery = useCallback(
    (orderId: string, courier: Courier = CURRENT_COURIER) => {
      const order = state.orders.find((candidate) => candidate.id === orderId);
      if (!order || order.fulfillment !== 'delivery' || order.courierId) return;
      dispatch({ type: 'claim-delivery', orderId, courier });
      dispatch({
        type: 'add-notifications',
        notifications: [
          makeNotification('customer', 'Courier assigned', `${courier.name} accepted ${order.reference}.`, order.id),
          makeNotification('owner', 'Delivery claimed', `${courier.name} accepted ${order.reference}.`, order.id),
        ],
      });
      void notifyLocal('Delivery claimed', `${courier.name} is taking ${order.reference} to the customer.`, { orderId });
    },
    [state.orders]
  );

  const updateDeliveryStatus = useCallback(
    (orderId: string, status: DeliveryStatus) => {
      const order = state.orders.find((candidate) => candidate.id === orderId);
      if (!order || order.fulfillment !== 'delivery' || !order.courierId) return;
      dispatch({ type: 'update-delivery-status', orderId, status });
      const messageByStatus: Record<DeliveryStatus, string> = {
        unassigned: 'A courier is still being assigned.',
        claimed: `${order.courierName ?? 'Your courier'} accepted the delivery.`,
        picked_up: 'Your order has been picked up from the shop.',
        on_the_way: 'Your courier is on the way to you.',
        delivered: 'Your order was handed to the customer.',
      };
      dispatch({
        type: 'add-notifications',
        notifications: [
          makeNotification('customer', 'Delivery update', messageByStatus[status], order.id),
          makeNotification('owner', 'Delivery update', `${order.reference}: ${messageByStatus[status]}`, order.id),
        ],
      });
      void notifyLocal('Delivery update', messageByStatus[status], { orderId });
    },
    [state.orders]
  );

  const updateCourierLocation = useCallback(
    (orderId: string, location: CourierLocation) => {
      const order = state.orders.find((candidate) => candidate.id === orderId);
      if (!order || order.fulfillment !== 'delivery' || !order.courierId) return;
      dispatch({ type: 'update-courier-location', orderId, location });
    },
    [state.orders]
  );

  const markNotificationsRead = useCallback((audience: NotificationAudience) => {
    dispatch({ type: 'mark-notifications-read', audience });
  }, []);

  const unreadNotificationCount = useCallback(
    (audience: NotificationAudience) =>
      state.notifications.filter((notification) => notification.audience === audience && !notification.read).length,
    [state.notifications]
  );

  const pendingOrderCount = useMemo(
    () => state.orders.filter((order) => order.status === 'pending').length,
    [state.orders]
  );

  const availableDeliveries = useMemo(
    () =>
      state.orders.filter(
        (order) =>
          order.fulfillment === 'delivery' &&
          !order.courierId &&
          order.status !== 'declined' &&
          order.status !== 'completed'
      ),
    [state.orders]
  );

  const courierOrders = useMemo(
    () => state.orders.filter((order) => order.courierId === CURRENT_COURIER.id),
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
      pendingOrderCount,
      getOrderById,
      updateOrderStatus,
      claimDelivery,
      updateDeliveryStatus,
      updateCourierLocation,
      availableDeliveries,
      courierOrders,
      notifications: state.notifications,
      unreadNotificationCount,
      markNotificationsRead,
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
      updateOrderStatus,
      pendingOrderCount,
      claimDelivery,
      updateDeliveryStatus,
      updateCourierLocation,
      availableDeliveries,
      courierOrders,
      state.notifications,
      unreadNotificationCount,
      markNotificationsRead,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function makeNotification(
  audience: NotificationAudience,
  title: string,
  message: string,
  orderId?: string
): AppNotification {
  return {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    audience,
    title,
    message,
    createdAt: Date.now(),
    orderId,
    read: false,
  };
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a <CartProvider>');
  }
  return context;
}
