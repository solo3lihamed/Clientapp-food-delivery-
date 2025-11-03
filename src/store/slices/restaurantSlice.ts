import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { restaurantAPI } from '../../services/api';

export interface Category {
  id: number;
  name: string;
  description: string;
  image?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  image?: string;
  cover_image?: string;
  cuisine_type: string;
  price_range: string;
  average_rating: number;
  total_reviews: number;
  is_open: boolean;
  delivery_fee: number;
  minimum_order: number;
  estimated_delivery_time: number;
  categories: Category[];
  distance?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  category?: number;
  category_name?: string;
  calories?: number;
  ingredients?: string;
  allergens?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  order_count: number;
}

interface RestaurantState {
  categories: Category[];
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    category?: string;
    cuisine?: string;
    minRating?: number;
    maxDeliveryFee?: number;
    priceRange?: string;
  };
}

const initialState: RestaurantState = {
  categories: [],
  restaurants: [],
  selectedRestaurant: null,
  menuItems: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'restaurants/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.getRestaurants(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  }
);

export const fetchRestaurant = createAsyncThunk(
  'restaurants/fetchRestaurant',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.getRestaurant(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant');
    }
  }
);

export const fetchMenuItems = createAsyncThunk(
  'restaurants/fetchMenuItems',
  async ({ restaurantId, params }: { restaurantId: number; params?: any }, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.getMenuItems(restaurantId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu items');
    }
  }
);

export const searchRestaurants = createAsyncThunk(
  'restaurants/searchRestaurants',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.searchRestaurants(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
      state.menuItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.restaurants = action.payload.results || action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Restaurant
      .addCase(fetchRestaurant.fulfilled, (state, action) => {
        state.selectedRestaurant = action.payload;
      })
      // Fetch Menu Items
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.menuItems = action.payload.results || action.payload;
      })
      // Search Restaurants
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.restaurants = action.payload;
      });
  },
});

export const { setSearchQuery, setFilters, clearFilters, clearError, clearSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
