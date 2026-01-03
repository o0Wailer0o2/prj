package vn.backend.entity.data.mysql;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class ProductRating extends BaseEntity {
    Integer id;
    Integer productId;
    Integer userId;
    Integer rating; // từ (1-5 sao)
    String comment;
}
