package com.myapp.ecommerce.service;

import com.myapp.ecommerce.model.WishlistItem;
import com.myapp.ecommerce.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductService productService;
    private final AuthService authService;

    public List<WishlistItem> getWishlist() {
        String userId = authService.getCurrentUser().getId();
        List<WishlistItem> items = wishlistItemRepository.findByUserId(userId);
        items.forEach(item -> item.setProduct(productService.getProduct(item.getProductId())));
        return items;
    }

    @Transactional
    public List<WishlistItem> addToWishlist(String productId) {
        String userId = authService.getCurrentUser().getId();
        // Validate that product exists, will throw exception if not found
        productService.getProduct(productId);

        if (wishlistItemRepository.findByUserIdAndProductId(userId, productId).isEmpty()) {
            WishlistItem wishlistItem = WishlistItem.builder()
                    .userId(userId)
                    .productId(productId)
                    .build();
            wishlistItemRepository.save(wishlistItem);
        }

        return getWishlist();
    }

    @Transactional
    public List<WishlistItem> removeFromWishlist(String itemId) {
        String userId = authService.getCurrentUser().getId();
        WishlistItem wishlistItem = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        if (!wishlistItem.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to remove this wishlist item");
        }

        wishlistItemRepository.delete(wishlistItem);
        return getWishlist();
    }

    @Transactional
    public void clearWishlist() {
        String userId = authService.getCurrentUser().getId();
        wishlistItemRepository.deleteByUserId(userId);
    }
}
