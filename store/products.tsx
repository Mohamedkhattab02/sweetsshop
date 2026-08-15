/**
 * In-memory catalog for Nour Sweets.
 *
 * The sample app intentionally keeps the catalog local, but the shape mirrors
 * what a production sweets shop API would return: sell-by unit, pack weight,
 * stock availability, and a customer-facing description all live together.
 */

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import type { CategoryId } from '@/constants/market';

export type Unit = 'each' | 'kg' | 'lb' | 'bunch';

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  /** Price in the shop's currency, per `unit`. */
  price: number;
  /** Remote URL for seeded products, or a local URI for uploads. */
  image: string;
  unit: Unit;
  /** Helpful customer-facing pack or serving detail, e.g. "500 g box". */
  weight?: string;
  description?: string;
  /** Whether this item can currently be added to a new order. */
  available: boolean;
  /** Current stock expressed in the product's sell-by unit. */
  stockQuantity: number;
  /** Products added during this session are badged as "New" in the list. */
  isNew: boolean;
};

export type NewProductInput = {
  name: string;
  category: CategoryId;
  price: number;
  image: string;
  unit?: Unit;
  weight?: string;
  description?: string;
  available?: boolean;
  stockQuantity?: number;
};

const inStock = (stockQuantity: number) => ({ available: true, stockQuantity });

const SEED_PRODUCTS: Product[] = [
  {
    id: 'p-knafeh-nabulsiya',
    name: 'Nabulsi Knafeh',
    category: 'knafeh',
    price: 68,
    unit: 'each',
    weight: '500 g tray · serves 4–6',
    image: 'https://ca-times.brightspotcdn.com/dims4/default/49d4602/2147483647/strip/true/crop/3583x2239%2B0%2B75/resize/1200x750%21/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fc6%2Fd2%2F53e3dd554c00a6dfdc06d6de3211%2F557139-fo-0618-palestinian-mrt-023.jpg',
    description: 'Golden kataifi, warm Nabulsi cheese, orange blossom syrup and roasted pistachios.',
    ...inStock(12),
    isNew: false,
  },
  {
    id: 'p-knafeh-cream',
    name: 'Cream Knafeh Cups',
    category: 'knafeh',
    price: 42,
    unit: 'each',
    weight: '4 cups · 320 g',
    image: 'https://www.ashefaa.com/upload/food/ashefaa1560445627959.jpg',
    description: 'Individual crispy kunafa nests filled with ashta cream and finished with pistachio.',
    ...inStock(18),
    isNew: true,
  },
  {
    id: 'p-baklava-pistachio',
    name: 'Pistachio Baklava',
    category: 'baklava',
    price: 88,
    unit: 'kg',
    weight: 'Sold by weight · 1 kg box',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/F%C4%B1st%C4%B1kl%C4%B1_Baklava.jpg/1280px-F%C4%B1st%C4%B1kl%C4%B1_Baklava.jpg',
    description: 'Delicate filo layered with premium Aleppo pistachios and a light rose-scented syrup.',
    ...inStock(9),
    isNew: false,
  },
  {
    id: 'p-baklava-assortment',
    name: 'Baklava Assortment',
    category: 'baklava',
    price: 72,
    unit: 'each',
    weight: '500 g gift box · 20 pieces',
    image: 'https://www.afamiabakery.com/cdn/shop/files/20231128-003701.jpg?v=1742482795&width=1946',
    description: 'A generous mix of pistachio fingers, walnut rolls and cashew diamonds for sharing.',
    ...inStock(16),
    isNew: false,
  },
  {
    id: 'p-mabroumeh-pistachio',
    name: 'Mabroumeh Pistachio',
    category: 'baklava',
    price: 92,
    unit: 'each',
    weight: '500 g box · 12 rolls',
    image: 'https://thebaklava.se/cdn/shop/files/IMG_2856.jpg?v=1717958161&width=3840',
    description: 'Hand-rolled kunafa strands wrapped around Aleppo pistachios, finished with ghee and syrup.',
    ...inStock(8),
    isNew: true,
  },
  {
    id: 'p-maamoul-date',
    name: 'Date Maamoul',
    category: 'maamoul',
    price: 54,
    unit: 'each',
    weight: '400 g box · 16 pieces',
    image: 'https://feelgoodfoodie.net/wp-content/uploads/2023/03/Maamoul-23.jpg',
    description: 'Buttery semolina shortbread filled with slow-cooked Medjool dates and mahlab.',
    ...inStock(20),
    isNew: false,
  },
  {
    id: 'p-maamoul-pistachio',
    name: 'Pistachio Maamoul',
    category: 'maamoul',
    price: 64,
    unit: 'each',
    weight: '400 g box · 16 pieces',
    image: 'https://www.cookinwithmima.com/wp-content/uploads/2025/02/pistachio-maamoul.jpg',
    description: 'Tender, lightly spiced maamoul with a fragrant pistachio and sugar filling.',
    ...inStock(14),
    isNew: true,
  },
  {
    id: 'p-warbat-ashta',
    name: 'Warbat Bil Ashta',
    category: 'warbat',
    price: 46,
    unit: 'each',
    weight: '6 pieces · 300 g',
    image: 'https://falasteenifoodie.com/wp-content/uploads/2025/03/Warbat-Bil-Ashta.jpg',
    description: 'Crisp filo parcels filled with ashta, soaked in orange blossom syrup and topped with pistachio.',
    ...inStock(11),
    isNew: false,
  },
  {
    id: 'p-qatayef-walnut',
    name: 'Walnut Qatayef',
    category: 'qatayef',
    price: 48,
    unit: 'each',
    weight: '8 pieces · 360 g',
    image: 'https://thenational-the-national-prod.cdn.arcpublishing.com/resizer/v2/RHWRLQTFXD2IKU4FEZVBW7TVNI.jpg?auth=39d8b21ee15d56201f771e5f0d606851e04935eeae12ec53bd9a45f62408b6f0&height=542&smart=true&width=800',
    description: 'Soft folded pancakes filled with toasted walnuts, cinnamon and a touch of blossom water.',
    ...inStock(13),
    isNew: false,
  },
  {
    id: 'p-qatayef-cheese',
    name: 'Cheese Qatayef',
    category: 'qatayef',
    price: 52,
    unit: 'each',
    weight: '8 pieces · 360 g',
    image: 'https://mission-food.com/wp-content/uploads/2011/07/Qatayef-Asafiri-Atayef-bil-Ashta-10.jpg',
    description: 'Golden-baked qatayef filled with sweet cheese and served with a small bottle of syrup.',
    available: false,
    stockQuantity: 0,
    isNew: true,
  },
  {
    id: 'p-halawet-el-jibn',
    name: 'Halawet El Jibn',
    category: 'cheese-desserts',
    price: 58,
    unit: 'each',
    weight: '500 g tray · serves 4',
    image: 'https://www.wmadaat.com/upload/06-2021/article/60d82dc459998.jpg',
    description: 'Soft cheese rolls filled with ashta, scented with rose water and crowned with pistachio.',
    ...inStock(10),
    isNew: false,
  },
  {
    id: 'p-basima',
    name: 'Coconut Basima',
    category: 'traditional',
    price: 44,
    unit: 'each',
    weight: '450 g tray · serves 6',
    image: 'https://www.cookinwithmima.com/wp-content/uploads/2019/05/Namoura-3.jpg',
    description: 'Moist coconut semolina cake baked until golden and soaked in a gentle vanilla syrup.',
    ...inStock(15),
    isNew: false,
  },
  {
    id: 'p-znoud-el-sit',
    name: 'Znoud El Sit',
    category: 'traditional',
    price: 48,
    unit: 'each',
    weight: '6 rolls · 300 g',
    image: 'https://www.hungrypaprikas.com/wp-content/uploads/2021/06/Znoud-El-Sit-3-683x1024.jpg',
    description: 'Crisp phyllo rolls filled with ashta, finished with rose syrup and crushed pistachios.',
    ...inStock(12),
    isNew: true,
  },
  {
    id: 'p-umm-ali',
    name: 'Umm Ali',
    category: 'puddings',
    price: 42,
    unit: 'each',
    weight: '500 g baking dish · serves 4',
    image: 'https://amiraspantry.com/wp-content/uploads/2023/02/om-ali-rc-300x300.jpeg',
    description: 'Warm Egyptian puff pastry pudding with sweet milk, cream, raisins, coconut and nuts.',
    ...inStock(9),
    isNew: false,
  },
  {
    id: 'p-mafroukeh',
    name: 'Pistachio Mafroukeh',
    category: 'puddings',
    price: 62,
    unit: 'each',
    weight: '4 glass cups · 400 g',
    image: 'https://images.arla.com/recordid/48252504-D24E-4E58-85C70D20AA52B097/mafroukeh.jpg?format=webp&height=938&mode=crop&width=750',
    description: 'A Levantine pistachio and semolina sweet layered with ashta cream and orange blossom syrup.',
    ...inStock(10),
    isNew: false,
  },
  {
    id: 'p-barazek',
    name: 'Damascus Barazek',
    category: 'cookies',
    price: 46,
    unit: 'each',
    weight: '350 g box · 18 cookies',
    image: 'https://www.edarabia.com/ar/wp-content/uploads/2017/09/how-to-make-pistachio-sesame-cookies-barazek-01.jpg',
    description: 'Thin, crisp Syrian cookies covered in toasted sesame and dotted with pistachios.',
    ...inStock(18),
    isNew: false,
  },
  {
    id: 'p-ghraybeh',
    name: 'Lebanese Ghraybeh',
    category: 'cookies',
    price: 44,
    unit: 'each',
    weight: '350 g box · 16 cookies',
    image: 'https://www.cookinwithmima.com/wp-content/uploads/2022/04/Easy-Graybeh-Cookies.jpg',
    description: 'Delicate, melt-in-the-mouth butter cookies finished with a whole pistachio.',
    ...inStock(17),
    isNew: false,
  },
  {
    id: 'p-rose-lokum',
    name: 'Rose & Pistachio Lokum',
    category: 'candies',
    price: 58,
    unit: 'each',
    weight: '400 g box',
    image: 'https://www.themediterraneandish.com/wp-content/uploads/2022/11/turkish-delight-FINAL-36.jpg',
    description: 'Soft rosewater lokum with pistachios, dusted lightly for a fragrant coffee-time bite.',
    ...inStock(14),
    isNew: true,
  },
  {
    id: 'p-awameh',
    name: 'Awameh',
    category: 'traditional',
    price: 40,
    unit: 'each',
    weight: '400 g box · serves 4',
    image: 'https://hadiaslebanesecuisine.com/blog/wp-content/uploads/2024/10/balls.jpg',
    description: 'Golden Lebanese doughnut balls, twice-fried for crunch and glazed with blossom syrup.',
    ...inStock(11),
    isNew: false,
  },
  {
    id: 'p-mixed-gift-box',
    name: 'Nour Celebration Box',
    category: 'gift-boxes',
    price: 145,
    unit: 'each',
    weight: '1.2 kg · 36 assorted pieces',
    image: 'https://www.afamiabakery.com/cdn/shop/files/20231128-003952.jpg?v=1701136027&width=1946',
    description: 'Our signature gift box with baklava, maamoul, warbat and seasonal bites, ribbon ready.',
    ...inStock(7),
    isNew: false,
  },
  {
    id: 'p-arabic-coffee',
    name: 'Cardamom Arabic Coffee',
    category: 'coffee-tea',
    price: 38,
    unit: 'each',
    weight: '250 g pouch',
    image: 'https://jumanah.co.uk/cdn/shop/products/Gahwa-2-B_1200x1200.jpg?v=1679305523',
    description: 'Lightly roasted coffee with cardamom, blended to pair with every box of sweets.',
    ...inStock(24),
    isNew: false,
  },
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
  products: Product[];
  visibleProducts: Product[];
  selectedCategories: CategoryId[];
  isCategorySelected: (category: CategoryId) => boolean;
  toggleCategory: (category: CategoryId) => void;
  clearCategories: () => void;
  addProduct: (input: NewProductInput) => Product;
  getProductById: (id: string) => Product | undefined;
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
      weight: input.weight?.trim() || undefined,
      description: input.description?.trim() || undefined,
      available: input.available ?? true,
      stockQuantity: input.stockQuantity ?? 20,
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

  const visibleProducts = useMemo(() => {
    if (state.selectedCategories.length === 0) return state.products;
    return state.products.filter((product) => state.selectedCategories.includes(product.category));
  }, [state.products, state.selectedCategories]);

  const countByCategory = useMemo(
    () =>
      state.products.reduce(
        (acc, product) => ({ ...acc, [product.category]: (acc[product.category] ?? 0) + 1 }),
        {} as Record<CategoryId, number>
      ),
    [state.products]
  );

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
  if (!context) throw new Error('useProducts must be used inside a <ProductsProvider>');
  return context;
}
