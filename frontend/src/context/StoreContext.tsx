import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type User = {
  id?: string;
  name?: string;
  email: string;
  gmail?: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  quantity: number;
};

type StoreContextValue = {
  user: User | null;
  cartItems: CartItem[];
  cartCount: number;
  setAuthenticatedUser: (user: User) => void;
  logout: () => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);
const currentUserKey = "memory-magnets-current-user-supabase";
const legacyCurrentUserKey = "memory-magnets-current-user";
const cartKeyPrefix = "memory-magnets-cart";

const getCartKey = (email: string) => `${cartKeyPrefix}-${email}`;

function readStoredUser() {
  window.localStorage.removeItem(legacyCurrentUserKey);

  const storedUser = window.localStorage.getItem(currentUserKey);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

function readStoredCart(user: User | null) {
  if (!user) {
    return [];
  }

  const storedCart = window.localStorage.getItem(getCartKey(user.email));

  if (!storedCart) {
    return [];
  }

  try {
    return JSON.parse(storedCart) as CartItem[];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStoredCart(readStoredUser())
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    window.localStorage.setItem(getCartKey(user.email), JSON.stringify(cartItems));
  }, [cartItems, user]);

  const setAuthenticatedUser = (nextUser: User) => {
    const email = String(nextUser.email ?? nextUser.gmail ?? "")
      .trim()
      .toLowerCase();

    const normalizedUser = {
      id: nextUser.id,
      name: String(nextUser.name ?? email).trim(),
      email,
      gmail: String(nextUser.gmail ?? email).trim().toLowerCase(),
    };

    window.localStorage.setItem(currentUserKey, JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    setCartItems(readStoredCart(normalizedUser));
  };

  const logout = () => {
    window.localStorage.removeItem(currentUserKey);
    setUser(null);
    setCartItems([]);
  };

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((cartItem) => cartItem.id !== id)
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = useMemo(
    () => ({
      user,
      cartItems,
      cartCount: cartItems.reduce((count, item) => count + item.quantity, 0),
      setAuthenticatedUser,
      logout,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cartItems, user]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}
