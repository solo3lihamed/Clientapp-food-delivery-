import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderAPI } from '../../services/api';

export interface OrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  menu_item_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export interface OrderTracking {
  id: number;
  status: string;
  status_display: string;
  message: string;
  timestamp: string;
}

export interface Order {
  id: number;
  order_number: string;
  restaurant: number;
  restaurant_name: string;
  restaurant_image?: string;
  status: string;
  status_display: string;
  payment_status: string;
  payment_status_display: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_address: string;
  delivery_phone: string;
  delivery_instructions?: string;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  estimated_delivery_time: string;
  actual_delivery_time?: string;
  payment_method: string;
  special_instructions?: string;
  items: OrderItem[];
  tracking_updates: OrderTracking[];
  created_at: string;
}

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  paymentMethods: any[];
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  paymentMethods: [],
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrder(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createOrder(orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelOrder(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel order');
    }
  }
);

export const processPayment = createAsyncThunk(
  'orders/processPayment',
  async ({ orderId, paymentData }: { orderId: number; paymentData: any }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.processPayment(orderId, paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Payment failed');
    }
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'orders/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getPaymentMethods();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.results || action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Order
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel Order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      // Process Payment
      .addCase(processPayment.fulfilled, (state, action) => {
        if (action.payload.order) {
          const index = state.orders.findIndex(order => order.id === action.payload.order.id);
          if (index !== -1) {
            state.orders[index] = action.payload.order;
          }
          if (state.selectedOrder?.id === action.payload.order.id) {
            state.selectedOrder = action.payload.order;
          }
        }
      })
      // Fetch Payment Methods
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload.payment_methods;
      });
  },
});

export const { clearError, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
