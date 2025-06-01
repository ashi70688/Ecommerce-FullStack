package com.myapp.ecommerce.repository;

import com.myapp.ecommerce.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param; 

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    Page<Product> findByActiveTrue(Pageable pageable);
    
    Page<Product> findByActiveTrueAndCategoryContainingAndPriceBetweenAndRatingGreaterThanEqual(
            @Param("active") boolean active,
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") double minRating,
            Pageable pageable
    );

    default Page<Product> findByFilters(
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            double minRating,
            Pageable pageable
    ) {
        return findByActiveTrueAndCategoryContainingAndPriceBetweenAndRatingGreaterThanEqual(
            true,
            category != null ? category : "",
            minPrice != null ? minPrice : BigDecimal.ZERO,
            maxPrice != null ? maxPrice : new BigDecimal("999999.99"),
            minRating,
            pageable
        );
    }

    List<Product> findByCategoryAndIdNot(String category, String productId);
    
    List<Product> findByCategory(String category);

    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);
    
    @Query(value = "{}", fields = "{}", count = true)
    List<String> findAllCategories();
    
    @Query(value = "{}", fields = "{_id: 0, category: 1}")
    List<String> findDistinctCategories();
}
