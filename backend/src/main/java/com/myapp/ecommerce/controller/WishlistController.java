package com.myapp.ecommerce.controller;

import com.myapp.ecommerce.model.WishlistItem;
import com.myapp.ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist());
    }

    @PostMapping
    public ResponseEntity<List<WishlistItem>> addToWishlist(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(wishlistService.addToWishlist(request.get("productId")));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<List<WishlistItem>> removeFromWishlist(@PathVariable String itemId) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(itemId));
    }

    @DeleteMapping
    public ResponseEntity<?> clearWishlist() {
        wishlistService.clearWishlist();
        return ResponseEntity.ok().build();
    }
}
