package com.myapp.ecommerce.service;

import com.myapp.ecommerce.model.CartItem;
import com.myapp.ecommerce.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final AuthService authService;

    public List<CartItem> getCart() {
        String userId = authService.getCurrentUser().getId();
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        items.forEach(item -> item.setProduct(productService.getProduct(item.getProductId())));
        return items;
    }

    @Transactional
    public List<CartItem> addToCart(String productId, int quantity) {
        String userId = authService.getCurrentUser().getId();
        // Validate that product exists
        productService.getProduct(productId);

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .map(item -> {
                    item.setQuantity(item.getQuantity() + quantity);
                    return item;
                })
                .orElse(CartItem.builder()
                        .userId(userId)
                        .productId(productId)
                        .quantity(quantity)
                        .build());

        cartItemRepository.save(cartItem);
        return getCart();
    }

    @Transactional
    public List<CartItem> updateCartItem(String itemId, int quantity) {
        String userId = authService.getCurrentUser().getId();
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this cart item");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return getCart();
    }

    @Transactional
    public List<CartItem> removeFromCart(String itemId) {
        String userId = authService.getCurrentUser().getId();
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to remove this cart item");
        }

        cartItemRepository.delete(cartItem);
        return getCart();
    }

    @Transactional
    public void clearCart() {
        String userId = authService.getCurrentUser().getId();
        cartItemRepository.deleteByUserId(userId);
    }
}
