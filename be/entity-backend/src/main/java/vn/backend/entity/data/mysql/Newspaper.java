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
public class Newspaper extends Product {
    Integer productId;
    String editorInChief;
    String publisher;
    LocalDateTime publicationDate;
    Integer issueNumber;
    String frequency;
    String issn;
    String language;
    String sections;
}