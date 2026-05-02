import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type OrderType = 'MARKET' | 'LIMIT';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'REJECTED' | 'CANCELLED';
export type ProductType = 'INTRADAY' | 'DELIVERY';

export interface PaperOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  product: ProductType;
  quantity: number;
  price: number;
  triggerPrice?: number;
  status: OrderStatus;
  timestamp: number;
  reason?: string;
}

export interface PaperHolding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  product: ProductType;
  realizedPnl: number;
}

interface PaperTradeState {
  balance: number;
  usedMargin: number;
  orders: PaperOrder[];
  holdings: PaperHolding[];

  placeOrder: (order: Omit<PaperOrder, 'id' | 'status' | 'timestamp'>, currentPrice: number) => { success: boolean; message: string };
  cancelOrder: (id: string) => void;
  resetAccount: () => void;
  // MongoDB persistence
  syncToMongo: () => Promise<void>;
  loadFromMongo: () => Promise<void>;
}

const INITIAL_BALANCE = 1000000;

export const usePaperTradeStore = create<PaperTradeState>()(
  persist(
    (set, get) => ({
      balance: INITIAL_BALANCE,
      usedMargin: 0,
      orders: [],
      holdings: [],

      syncToMongo: async () => {
        const { balance, usedMargin, orders, holdings } = get();
        try {
          await fetch('/api/paper/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance, usedMargin, orders, holdings }),
          });
        } catch {
          // localStorage still has the data — silent fail
        }
      },

      loadFromMongo: async () => {
        try {
          const res = await fetch('/api/paper/sync');
          if (!res.ok) return;
          const { state } = await res.json();
          if (!state) return;
          set({
            balance: state.balance,
            usedMargin: state.usedMargin,
            orders: state.orders ?? [],
            holdings: state.holdings ?? [],
          });
        } catch {
          // Fall back to persisted localStorage state
        }
      },

      placeOrder: (order, currentPrice) => {
        const { balance, usedMargin } = get();

        if (order.quantity <= 0) return { success: false, message: 'Quantity must be greater than 0' };

        const marginRequired =
          order.side === 'BUY'
            ? (order.type === 'MARKET' ? currentPrice : order.price) *
              order.quantity *
              (order.product === 'INTRADAY' ? 0.2 : 1)
            : 0;

        if (order.side === 'BUY' && balance - usedMargin < marginRequired) {
          return { success: false, message: 'Insufficient margin' };
        }

        const newOrder: PaperOrder = {
          ...order,
          id: uuidv4(),
          status: order.type === 'MARKET' ? 'EXECUTED' : 'PENDING',
          timestamp: Date.now(),
          price: order.type === 'MARKET' ? currentPrice : order.price,
        };

        set(state => {
          let newHoldings = [...state.holdings];
          let newBalance = state.balance;
          let newUsedMargin = state.usedMargin;

          if (newOrder.status === 'EXECUTED') {
            const idx = newHoldings.findIndex(
              h => h.symbol === order.symbol && h.product === order.product
            );
            const totalValue = newOrder.price * newOrder.quantity;

            if (order.side === 'BUY') {
              newBalance -= totalValue;
              if (idx >= 0) {
                const existing = newHoldings[idx];
                const totalCost = existing.avgPrice * existing.quantity + totalValue;
                const newQty = existing.quantity + newOrder.quantity;
                newHoldings[idx] = { ...existing, quantity: newQty, avgPrice: totalCost / newQty };
              } else {
                newHoldings.push({
                  symbol: order.symbol,
                  quantity: order.quantity,
                  avgPrice: newOrder.price,
                  product: order.product,
                  realizedPnl: 0,
                });
              }
            } else {
              if (idx >= 0) {
                const existing = newHoldings[idx];
                if (existing.quantity >= newOrder.quantity) {
                  const pnl = (newOrder.price - existing.avgPrice) * newOrder.quantity;
                  newBalance += totalValue;
                  if (existing.quantity === newOrder.quantity) {
                    newHoldings.splice(idx, 1);
                  } else {
                    newHoldings[idx] = {
                      ...existing,
                      quantity: existing.quantity - newOrder.quantity,
                      realizedPnl: existing.realizedPnl + pnl,
                    };
                  }
                } else {
                  newOrder.status = 'REJECTED';
                  newOrder.reason = 'Insufficient holding quantity for sell order';
                }
              } else {
                newOrder.status = 'REJECTED';
                newOrder.reason = 'No holdings to sell';
              }
            }
          } else {
            if (order.side === 'BUY') newUsedMargin += marginRequired;
          }

          return {
            orders: [newOrder, ...state.orders],
            holdings: newHoldings,
            balance: newBalance,
            usedMargin: newUsedMargin,
          };
        });

        if (newOrder.status !== 'REJECTED') {
          void get().syncToMongo();
        }

        if (newOrder.status === 'REJECTED') {
          return { success: false, message: newOrder.reason || 'Order rejected' };
        }
        return { success: true, message: 'Order placed successfully' };
      },

      cancelOrder: (id) => {
        set(state => {
          const order = state.orders.find(o => o.id === id);
          if (!order || order.status !== 'PENDING') return state;

          let newUsedMargin = state.usedMargin;
          if (order.side === 'BUY') {
            newUsedMargin -= order.price * order.quantity * (order.product === 'INTRADAY' ? 0.2 : 1);
          }

          return {
            orders: state.orders.map(o => (o.id === id ? { ...o, status: 'CANCELLED' } : o)),
            usedMargin: newUsedMargin,
          };
        });

        void get().syncToMongo();
      },

      resetAccount: () => {
        set({ balance: INITIAL_BALANCE, usedMargin: 0, orders: [], holdings: [] });
        void get().syncToMongo();
      },
    }),
    { name: 'exponent-paper-trade-storage' }
  )
);
