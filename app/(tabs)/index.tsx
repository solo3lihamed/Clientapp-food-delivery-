import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store/store';
import { fetchCategories, fetchRestaurants } from '../../src/store/slices/restaurantSlice';
import { fetchCart } from '../../src/store/slices/cartSlice';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { categories, restaurants, isLoading } = useSelector((state: RootState) => state.restaurants);
  const { cart } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(fetchCategories());
    dispatch(fetchRestaurants());
    dispatch(fetchCart());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryEmoji}>🍕</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderRestaurant = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.restaurantCard}>
      <View style={styles.restaurantImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.restaurantImage} />
        ) : (
          <View style={styles.restaurantImagePlaceholder}>
            <Text style={styles.restaurantImagePlaceholderText}>🍽️</Text>
          </View>
        )}
        <View style={styles.deliveryBadge}>
          <Text style={styles.deliveryText}>{item.estimated_delivery_time} min</Text>
        </View>
      </View>
      
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCuisine}>{item.cuisine_type}</Text>
        
        <View style={styles.restaurantMeta}>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>⭐ {item.average_rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.total_reviews})</Text>
          </View>
          <Text style={styles.priceRange}>{item.price_range}</Text>
        </View>
        
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryFee}>
            Delivery: ${item.delivery_fee === 0 ? 'Free' : item.delivery_fee.toFixed(2)}
          </Text>
          <Text style={styles.minimumOrder}>Min: ${item.minimum_order.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.first_name || 'User'}! 👋</Text>
            <Text style={styles.subGreeting}>What would you like to eat today?</Text>
          </View>
          {cart && cart.total_items > 0 && (
            <TouchableOpacity style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.total_items}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Popular Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Restaurants</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={restaurants.slice(0, 5)}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  cartBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAll: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 5,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  restaurantCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  restaurantImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  restaurantImagePlaceholderText: {
    fontSize: 40,
  },
  deliveryBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceRange: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryFee: {
    fontSize: 12,
    color: '#666',
  },
  minimumOrder: {
    fontSize: 12,
    color: '#666',
  },
});
