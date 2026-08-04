/**
 * In-memory product store.
 *
 * This is a sample app, so there is no database or network layer: products live
 * in React state for the lifetime of the session. Everything the screens need
 * (the catalogue, the category filter, adding a product) is exposed through a
 * single context so the two tabs stay in sync.
 */

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import type { CategoryId } from '@/constants/market';

export type Unit = 'each' | 'kg' | 'lb' | 'bunch';

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  /** Price in the market's currency, per `unit`. */
  price: number;
  /** Remote URL for seeded products, or a local `file://` URI for uploads. */
  image: string;
  unit: Unit;
  description?: string;
  /** Products added during this session are badged as "New" in the list. */
  isNew: boolean;
};

export type NewProductInput = {
  name: string;
  category: CategoryId;
  price: number;
  image: string;
  unit?: Unit;
  description?: string;
};

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`;

const SEED_PRODUCTS: Product[] = [
  // Fruits
  { id: 'p-apples', name: 'Red Apples', category: 'fruits', price: 3.4, unit: 'kg', isNew: false, image: img('photo-1560806887-1e4cd0b6cbd6'), description: 'Crisp and sweet, picked this week from local orchards.' },
  { id: 'p-bananas', name: 'Bananas', category: 'fruits', price: 1.9, unit: 'kg', isNew: false, image: img('photo-1571771894821-ce9b6c11b08e'), description: 'Fairtrade bananas, sold by the bunch or by weight.' },
  { id: 'p-watermelon', name: 'Watermelon', category: 'fruits', price: 5.5, unit: 'each', isNew: false, image: img('photo-1587049352846-4a222e784d38'), description: 'Seedless summer watermelon, roughly 4 kg each.' },
  { id: 'p-mangoes', name: 'Mangoes', category: 'fruits', price: 4.75, unit: 'kg', isNew: false, image: img('photo-1601493700631-2b16ec4b4716'), description: 'Ripe Ataulfo mangoes, ready to eat.' },
  { id: 'p-tropical-mix', name: 'Tropical Fruit Mix', category: 'fruits', price: 8.9, unit: 'kg', isNew: false, image: img('photo-1610832958506-aa56368176cf'), description: 'Papaya, kiwi, citrus and avocado in one selection box.' },

  // Vegetables
  { id: 'p-tomatoes', name: 'Vine Tomatoes', category: 'vegetables', price: 2.95, unit: 'kg', isNew: false, image: img('photo-1592924357228-91a4daadcfea'), description: 'Still on the vine, grown in the greenhouse next door.' },
  { id: 'p-carrots', name: 'Bunched Carrots', category: 'vegetables', price: 2.2, unit: 'bunch', isNew: false, image: img('photo-1598170845058-32b9d6a5da37'), description: 'Sweet young carrots with the tops left on.' },
  { id: 'p-veg-box', name: 'Seasonal Vegetable Box', category: 'vegetables', price: 14.0, unit: 'each', isNew: false, image: img('photo-1518843875459-f738682238a6'), description: "A mixed box of whatever's best this week." },

  // Dairy
  { id: 'p-milk', name: 'Whole Milk', category: 'dairy', price: 1.65, unit: 'each', isNew: false, image: img('photo-1550583724-b2692b85b150'), description: 'Non-homogenised whole milk in a returnable 1 L bottle.' },
  { id: 'p-cheese', name: 'Aged Farmhouse Cheese', category: 'dairy', price: 22.0, unit: 'kg', isNew: false, image: img('photo-1486297678162-eb2a19b0a32d'), description: 'Matured for 12 months, cut to order from the wheel.' },

  // Bakery
  { id: 'p-sourdough', name: 'Sourdough Loaf', category: 'bakery', price: 4.2, unit: 'each', isNew: false, image: img('photo-1509440159596-0249088772ff'), description: 'Baked each morning with a 24-hour slow ferment.' },
  { id: 'p-pasta', name: 'Fresh Egg Pasta', category: 'bakery', price: 6.3, unit: 'kg', isNew: false, image: img('photo-1447279506476-3faec8071eee'), description: 'Rolled and cut by hand at the counter every day.' },

  // Meat & seafood
  { id: 'p-meat-box', name: "Butcher's Mixed Cuts", category: 'meat', price: 18.5, unit: 'kg', isNew: false, image: img('photo-1607623814075-e51df1bdc82f'), description: 'A butcher-selected mix of steak, mince and sausages.' },
  { id: 'p-salmon', name: 'Atlantic Salmon Fillet', category: 'seafood', price: 26.0, unit: 'kg', isNew: false, image: img('photo-1519708227418-c8fd9a32b7a2'), description: 'Skin-on fillets, filleted fresh at the fish counter.' },

  // Beverages & snacks
  { id: 'p-coolers', name: 'Citrus Coolers', category: 'beverages', price: 3.8, unit: 'each', isNew: false, image: img('photo-1544145945-f90425340c7e'), description: 'Chilled lime and grapefruit pressés, no added sugar.' },
  { id: 'p-cookies', name: 'Chocolate Chip Cookies', category: 'snacks', price: 5.25, unit: 'each', isNew: false, image: img('photo-1558961363-fa8fdf82db35'), description: 'A bag of six, still soft in the middle.' },
  { id: 'p-fruit-bowl', name: 'Fruit & Chocolate Bowl', category: 'snacks', price: 7.4, unit: 'each', isNew: false, image: img('photo-1490474418585-ba9bad8fd0ea'), description: 'Ready-to-eat fruit bowl with dark chocolate on the side.' },
];

/* -------------------------------------------------------------------------- */
/*                                   Reducer                                  */
/* -------------------------------------------------------------------------- */

type State = {
  products: Product[];
  selectedCategories: CategoryId[];
};

type Action =
  | { type: 'add-product'; product: Product }
  | { type: 'toggle-category'; category: CategoryId }
  | { type: 'clear-categories' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add-product':
      // Newest first, so an upload is immediately visible at the top.
      return { ...state, products: [action.product, ...state.products] };

    case 'toggle-category': {
      const isSelected = state.selectedCategories.includes(action.category);
      return {
        ...state,
        selectedCategories: isSelected
          ? state.selectedCategories.filter((id) => id !== action.category)
          : [...state.selectedCategories, action.category],
      };
    }

    case 'clear-categories':
      return { ...state, selectedCategories: [] };
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */

type ProductsContextValue = {
  /** Every product in the market. */
  products: Product[];
  /** Products matching the current category selection. */
  visibleProducts: Product[];
  selectedCategories: CategoryId[];
  isCategorySelected: (category: CategoryId) => boolean;
  toggleCategory: (category: CategoryId) => void;
  clearCategories: () => void;
  addProduct: (input: NewProductInput) => Product;
  getProductById: (id: string) => Product | undefined;
  /** How many products sit in a category, for the filter chip counts. */
  countByCategory: Record<CategoryId, number>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

let nextId = 0;

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    products: SEED_PRODUCTS,
    selectedCategories: [],
  });

  const addProduct = useCallback((input: NewProductInput) => {
    nextId += 1;
    const product: Product = {
      id: `p-user-${Date.now()}-${nextId}`,
      name: input.name.trim(),
      category: input.category,
      price: input.price,
      image: input.image,
      unit: input.unit ?? 'each',
      description: input.description?.trim() || undefined,
      isNew: true,
    };
    dispatch({ type: 'add-product', product });
    return product;
  }, []);

  const toggleCategory = useCallback((category: CategoryId) => {
    dispatch({ type: 'toggle-category', category });
  }, []);

  const clearCategories = useCallback(() => {
    dispatch({ type: 'clear-categories' });
  }, []);

  // No categories selected means "show everything" rather than "show nothing" —
  // an empty filter should not empty the market.
  const visibleProducts = useMemo(() => {
    if (state.selectedCategories.length === 0) return state.products;
    return state.products.filter((product) => state.selectedCategories.includes(product.category));
  }, [state.products, state.selectedCategories]);

  const countByCategory = useMemo(() => {
    return state.products.reduce(
      (acc, product) => ({ ...acc, [product.category]: (acc[product.category] ?? 0) + 1 }),
      {} as Record<CategoryId, number>
    );
  }, [state.products]);

  const getProductById = useCallback(
    (id: string) => state.products.find((product) => product.id === id),
    [state.products]
  );

  const isCategorySelected = useCallback(
    (category: CategoryId) => state.selectedCategories.includes(category),
    [state.selectedCategories]
  );

  const value = useMemo<ProductsContextValue>(
    () => ({
      products: state.products,
      visibleProducts,
      selectedCategories: state.selectedCategories,
      isCategorySelected,
      toggleCategory,
      clearCategories,
      addProduct,
      getProductById,
      countByCategory,
    }),
    [
      state.products,
      state.selectedCategories,
      visibleProducts,
      isCategorySelected,
      toggleCategory,
      clearCategories,
      addProduct,
      getProductById,
      countByCategory,
    ]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used inside a <ProductsProvider>');
  }
  return context;
}
