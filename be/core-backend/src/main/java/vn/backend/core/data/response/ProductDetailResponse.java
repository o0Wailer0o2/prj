package vn.backend.core.data.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.backend.entity.data.mysql.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDetailResponse {
    Product product;

    Book book;
    CD cd;
    DVD dvd;
    Newspaper newspaper;
}