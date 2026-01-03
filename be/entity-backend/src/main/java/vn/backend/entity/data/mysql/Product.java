package vn.backend.entity.data.mysql;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product extends BaseEntity {
    Integer id;
    String name;
    String imageUrl;

    Double price;

    @Builder.Default
    Double averageRating = 0.0;

    String barcode;
    String title;
    String description;

    Double height;
    Double width;
    Double length;
    Double weight;

    Double originalValue;
    Double currentPrice;

    @Builder.Default
    Integer stock = 0;

    Integer status;

    String type; // BOOK / CD / DVD / NEWSPAPER (gợi ý thêm)
}
