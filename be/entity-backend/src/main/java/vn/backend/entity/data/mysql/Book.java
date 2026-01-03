package vn.backend.entity.data.mysql;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;


@SuperBuilder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Book extends Product {
    Integer productId;
    String authors;
    String coverType;
    String publisher;
    LocalDateTime publicationDate;
    Integer pages;
    String language;
    String genre;
}