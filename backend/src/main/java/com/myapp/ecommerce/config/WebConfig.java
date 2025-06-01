package com.myapp.ecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig class with CORS configuration removed.
 * CORS is now handled exclusively through @CrossOrigin("*") annotations on controllers.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration has been removed
}
