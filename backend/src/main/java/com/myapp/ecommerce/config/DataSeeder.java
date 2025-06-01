package com.myapp.ecommerce.config;

import com.myapp.ecommerce.model.Product;
import com.myapp.ecommerce.model.Role;
import com.myapp.ecommerce.model.User;
import com.myapp.ecommerce.repository.ProductRepository;
import com.myapp.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedUsers();
        }

        if (productRepository.count() == 0) {
            seedProducts();
        }
    }

    private void seedUsers() {
        // Create admin user
        User admin = User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("admin123"))
                .name("Admin User")
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        // Create regular user
        User user = User.builder()
                .email("user@example.com")
                .password(passwordEncoder.encode("user123"))
                .name("Regular User")
                .role(Role.USER)
                .enabled(true)
                .build();

        userRepository.saveAll(List.of(admin, user));
    }

    private void seedProducts() {
        List<Product> products = List.of(
            Product.builder()
                .name("Modern Desk Lamp")
                .description("A sleek and modern desk lamp with adjustable brightness")
                .price(new BigDecimal("49.99"))
                .category("Lighting")
                .image("https://example.com/images/desk-lamp.jpg")
                .rating(4.5)
                .onSale(false)
                .specifications(Map.of(
                    "Color", "Black",
                    "Material", "Aluminum",
                    "Height", "16 inches",
                    "Power", "LED 9W"
                ))
                .stock(50)
                .active(true)
                .build(),

            Product.builder()
                .name("Ergonomic Office Chair")
                .description("High-quality ergonomic office chair with lumbar support")
                .price(new BigDecimal("299.99"))
                .originalPrice(new BigDecimal("399.99"))
                .category("Furniture")
                .image("https://example.com/images/office-chair.jpg")
                .rating(4.8)
                .onSale(true)
                .specifications(Map.of(
                    "Color", "Gray",
                    "Material", "Mesh and Metal",
                    "Weight Capacity", "300 lbs",
                    "Adjustable Height", "Yes"
                ))
                .stock(25)
                .active(true)
                .build(),

            Product.builder()
                .name("Wireless Keyboard")
                .description("Compact wireless keyboard with long battery life")
                .price(new BigDecimal("79.99"))
                .category("Electronics")
                .image("https://example.com/images/keyboard.jpg")
                .rating(4.3)
                .onSale(false)
                .specifications(Map.of(
                    "Color", "White",
                    "Connectivity", "Bluetooth 5.0",
                    "Battery Life", "6 months",
                    "Compatible", "Windows/Mac"
                ))
                .stock(100)
                .active(true)
                .build(),

            Product.builder()
                .name("Smart Monitor")
                .description("27-inch 4K monitor with built-in smart features")
                .price(new BigDecimal("449.99"))
                .originalPrice(new BigDecimal("499.99"))
                .category("Electronics")
                .image("https://example.com/images/monitor.jpg")
                .rating(4.6)
                .onSale(true)
                .specifications(Map.of(
                    "Size", "27 inches",
                    "Resolution", "4K UHD",
                    "Refresh Rate", "144Hz",
                    "Panel Type", "IPS"
                ))
                .stock(30)
                .active(true)
                .build(),

            Product.builder()
                .name("Desk Organizer")
                .description("Bamboo desk organizer with multiple compartments")
                .price(new BigDecimal("29.99"))
                .category("Accessories")
                .image("https://example.com/images/organizer.jpg")
                .rating(4.2)
                .onSale(false)
                .specifications(Map.of(
                    "Material", "Bamboo",
                    "Dimensions", "12x8x4 inches",
                    "Compartments", "6",
                    "Color", "Natural Wood"
                ))
                .stock(75)
                .active(true)
                .build()
        );

        productRepository.saveAll(products);
    }
}
