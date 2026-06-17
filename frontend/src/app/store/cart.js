import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [], // Array of { product: {...}, quantity: 1 }
  
  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.product.id === product.id);
    
    if (existing) {
      set({
        items: items.map(i => 
          i.product.id === product.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },
  
  removeItem: (productId) => {
    set({ items: get().items.filter(i => i.product.id !== productId) });
  },
  
  updateQuantity: (productId, qty) => {
    const qtyInt = parseInt(qty, 10);
    if (isNaN(qtyInt) || qtyInt <= 0) return;
    
    set({
      items: get().items.map(i => 
        i.product.id === productId 
          ? { ...i, quantity: qtyInt }
          : i
      )
    });
  },
  
  clearCart: () => set({ items: [] }),

  // Dynamic calculations for Cart totals & scheme notifications
  getCartDetails: () => {
    const items = get().items;
    let totalItemsCount = 0;
    let originalSubtotal = 0; // standard b2b prices before schemes
    let grandTotal = 0; // after all schemes applied
    const itemDetails = items.map(item => {
      const { product, quantity } = item;
      totalItemsCount += quantity;
      
      const b2bPrice = product.b2b_discount_price;
      const mrp = product.mrp;
      
      let pricePerUnit = b2bPrice;
      let freeUnits = 0;
      let schemeAppliedText = '';
      
      if (product.scheme) {
        const scheme = product.scheme;
        if (scheme.type === 'BUY_X_GET_Y') {
          if (quantity >= scheme.buy_qty) {
            freeUnits = Math.floor(quantity / scheme.buy_qty) * scheme.get_qty;
            schemeAppliedText = `Buy ${scheme.buy_qty} Get ${scheme.get_qty} Free (+${freeUnits} bonus units)`;
          }
        } else if (scheme.type === 'PERCENTAGE') {
          const discountAmt = b2bPrice * (scheme.discount_pct / 100);
          pricePerUnit = b2bPrice - discountAmt;
          schemeAppliedText = `${scheme.name} (${scheme.discount_pct}% OFF)`;
        }
      }

      const itemTotal = pricePerUnit * quantity;
      originalSubtotal += b2bPrice * quantity;
      grandTotal += itemTotal;

      return {
        ...item,
        pricePerUnit,
        freeUnits,
        schemeAppliedText,
        itemTotal
      };
    });

    return {
      items: itemDetails,
      totalItemsCount,
      originalSubtotal,
      savings: originalSubtotal - grandTotal,
      grandTotal
    };
  }
}));
