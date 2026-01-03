package vn.backend.core.data.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFilterRequest {

    // Search
    String keyword;

    // Category filter
    // Param header: &types=Book&types=DVD
    List<String> types;

    // Status filter
    Integer status;

    // Price range filter
    Double minPrice;
    Double maxPrice;

    // Rating filter
    Double minRating;
    Double maxRating;

    // Stock filter
    Boolean inStock;  // true = stock > 0
    Integer minStock;

    // Sorting
    String sortBy;   //
    String sortDir;  // asc, desc

    // Date range filter
    String fromDate;  // ISO date string
    String toDate;
}
