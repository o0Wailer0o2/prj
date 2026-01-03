package vn.backend.entity.data.mysql;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class User extends BaseEntity {
    Integer id;

    String fullName;

    String email;

    @JsonIgnore
    String password;

    String phoneNumber;

    String avatarUrl;

    LocalDate birthday;

    Integer active;

    String roleName;

    Integer roleId;
}
