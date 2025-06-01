package com.myapp.ecommerce.controller;

import com.myapp.ecommerce.model.CartItem;
import com.myapp.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    @PostMapping
    public ResponseEntity<List<CartItem>> addToCart(
            @RequestBody Map<String, Object> request) {
        String productId = (String) request.get("productId");
        int quantity = (int) request.get("quantity");
        return ResponseEntity.ok(cartService.addToCart(productId, quantity));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<List<CartItem>> updateCartItem(
            @PathVariable String itemId,
            @RequestBody Map<String, Integer> request) {
        return ResponseEntity.ok(cartService.updateCartItem(itemId, request.get("quantity")));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<List<CartItem>> removeFromCart(@PathVariable String itemId) {
        return ResponseEntity.ok(cartService.removeFromCart(itemId));
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok().build();
    }
}
