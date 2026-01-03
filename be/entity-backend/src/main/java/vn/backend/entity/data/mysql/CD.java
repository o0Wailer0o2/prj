package vn.backend.entity.data.mysql;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@SuperBuilder
public class CD extends Product {
    Integer productId;
    String artists;
    String recordLabel;
    String genre;
    LocalDateTime releaseDate;
    Integer lengthSeconds;
}