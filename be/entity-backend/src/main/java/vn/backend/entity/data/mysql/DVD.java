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
public class DVD extends Product {
    Integer productId;
    String discType;
    String director;
    Integer runtimeMinutes;
    String studio;
    String language;
    String subtitles;
    LocalDateTime releaseDate;
    String genre;
}