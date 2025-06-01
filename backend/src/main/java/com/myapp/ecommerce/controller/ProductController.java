package com.myapp.ecommerce.controller;

import com.myapp.ecommerce.model.Product;
import com.myapp.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String minPriceStr,
            @RequestParam(required = false) String maxPriceStr,
            @RequestParam(required = false, defaultValue = "0") double minRating,
            @RequestParam(required = false, defaultValue = "featured") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        System.out.println("getProducts called with params:");
        System.out.println("category: " + category);
        System.out.println("minPrice: " + minPriceStr);
        System.out.println("maxPrice: " + maxPriceStr);
        System.out.println("minRating: " + minRating);
        System.out.println("sort: " + sort);
        System.out.println("page: " + page);
        System.out.println("size: " + size);

        BigDecimal minPrice = null;
        if (minPriceStr != null && !minPriceStr.isEmpty()) {
            try {
                minPrice = new BigDecimal(minPriceStr);
            } catch (NumberFormatException e) {
                System.out.println("Invalid minPrice format: " + minPriceStr);
            }
        }

        BigDecimal maxPrice = null;
        if (maxPriceStr != null && !maxPriceStr.isEmpty()) {
            try {
                maxPrice = new BigDecimal(maxPriceStr);
            } catch (NumberFormatException e) {
                System.out.println("Invalid maxPrice format: " + maxPriceStr);
            }
        }

        return ResponseEntity.ok(productService.getProducts(category, minPrice, maxPrice, minRating, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<Product>> getRelatedProducts(@PathVariable String id) {
        return ResponseEntity.ok(productService.getRelatedProducts(id));
    }

    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @Valid @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/allcategories")
    public ResponseEntity<Set<String>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }

}
