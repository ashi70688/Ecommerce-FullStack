package com.myapp.ecommerce.repository;

import com.myapp.ecommerce.model.WishlistItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends MongoRepository<WishlistItem, String> {
    List<WishlistItem> findByUserId(String userId);
    Optional<WishlistItem> findByUserIdAndProductId(String userId, String productId);
    void deleteByUserId(String userId);
}
