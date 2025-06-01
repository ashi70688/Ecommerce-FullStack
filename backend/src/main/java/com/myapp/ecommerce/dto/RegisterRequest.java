package com.myapp.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class RegisterRequest extends AuthRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String name;
}
