import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type User = {
  id?: string;
  name?: string;
  email: string;
  gmail?: string;
  phone?: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  customImages?: string[];
  quantity: number;
};

export type WishlistItem = Omit<CartItem, "quantity">;

type StoreContextValue = {
  user: User | null;
  cartItems: CartItem[];
  cartCount: number;
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  setAuthenticatedUser: (user: User) => void;
  updateAuthenticatedUser: (user: User) => void;
  logout: () => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);
const currentUserKey = "memory-magnets-current-user-supabase";
const legacyCurrentUserKey = "memory-magnets-current-user";
const cartKeyPrefix = "memory-magnets-cart";
const wishlistKeyPrefix = "memory-magnets-wishlist";

const getCartKey = (email: string) => `${cartKeyPrefix}-${email}`;
const getWishlistKey = (email: string) => `${wishlistKeyPrefix}-${email}`;

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

  try {
    const storedCart = window.localStorage.getItem(getCartKey(user.email));
    if (!storedCart) {
      return [];
    }
    const parsed = JSON.parse(storedCart);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredWishlist(user: User | null) {
  if (!user) {
    return [];
  }

  try {
    const storedWishlist = window.localStorage.getItem(getWishlistKey(user.email));
    if (!storedWishlist) {
      return [];
    }
    const parsed = JSON.parse(storedWishlist);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStoredCart(readStoredUser())
  );
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() =>
    readStoredWishlist(readStoredUser())
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    try {
      window.localStorage.setItem(getCartKey(user.email), JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [cartItems, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    try {
      window.localStorage.setItem(
        getWishlistKey(user.email),
        JSON.stringify(wishlistItems)
      );
    } catch (e) {
      console.error("Failed to save wishlist to localStorage:", e);
    }
  }, [wishlistItems, user]);

  const setAuthenticatedUser = (nextUser: User) => {
    const email = String(nextUser.email ?? nextUser.gmail ?? "")
      .trim()
      .toLowerCase();

    const normalizedUser = {
      id: nextUser.id,
      name: String(nextUser.name ?? email).trim(),
      email,
      gmail: String(nextUser.gmail ?? email).trim().toLowerCase(),
      phone: String(nextUser.phone ?? "").trim(),
    };

    try {
      window.localStorage.setItem(currentUserKey, JSON.stringify(normalizedUser));
    } catch (e) {
      console.error("Failed to save user to localStorage:", e);
    }
    setUser(normalizedUser);
    setCartItems(readStoredCart(normalizedUser));
    setWishlistItems(readStoredWishlist(normalizedUser));
  };

  const updateAuthenticatedUser = (nextUser: User) => {
    const email = String(nextUser.email ?? nextUser.gmail ?? "")
      .trim()
      .toLowerCase();

    const normalizedUser = {
      id: nextUser.id,
      name: String(nextUser.name ?? email).trim(),
      email,
      gmail: String(nextUser.gmail ?? email).trim().toLowerCase(),
      phone: String(nextUser.phone ?? "").trim(),
    };

    try {
      if (user?.email && user.email !== normalizedUser.email) {
        window.localStorage.removeItem(getCartKey(user.email));
        window.localStorage.removeItem(getWishlistKey(user.email));
      }

      window.localStorage.setItem(currentUserKey, JSON.stringify(normalizedUser));
      window.localStorage.setItem(
        getCartKey(normalizedUser.email),
        JSON.stringify(cartItems)
      );
      window.localStorage.setItem(
        getWishlistKey(normalizedUser.email),
        JSON.stringify(wishlistItems)
      );
    } catch (e) {
      console.error("Failed to update user/cart/wishlist in localStorage:", e);
    }
    setUser(normalizedUser);
  };

  const logout = () => {
    window.localStorage.removeItem(currentUserKey);
    setUser(null);
    setCartItems([]);
    setWishlistItems([]);
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

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((currentItems) => {
      const existingItem = currentItems.find(
        (wishlistItem) => wishlistItem.id === item.id
      );

      if (existingItem) {
        return currentItems;
      }

      return [...currentItems, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((currentItems) =>
      currentItems.filter((wishlistItem) => wishlistItem.id !== id)
    );
  };

  const isInWishlist = (id: string) =>
    wishlistItems.some((wishlistItem) => wishlistItem.id === id);

  const value = {
    user,
    cartItems,
    cartCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    wishlistItems,
    wishlistCount: wishlistItems.length,
    setAuthenticatedUser,
    updateAuthenticatedUser,
    logout,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}
