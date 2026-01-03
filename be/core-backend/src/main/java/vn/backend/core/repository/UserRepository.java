package vn.backend.core.repository;

import org.jooq.*;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.data.request.ProductFilterRequest;
import vn.backend.core.data.request.UserFilterRequest;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.User;

import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Products.PRODUCTS;
import static vn.entity.backend.tables.Roles.ROLES;
import static vn.entity.backend.tables.Users.USERS;

@Repository
public class UserRepository {

    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getUserFields() {
        return asList(
                USERS.ID,
                USERS.AVATAR_URL,
                USERS.BIRTHDAY,
                USERS.EMAIL,
                USERS.FULL_NAME,
                USERS.PASSWORD,
                USERS.PHONE_NUMBER,
                USERS.ACTIVE,
                USERS.ROLE_ID
        );
    }

    private Condition getWhereCondition(String keyword, Integer status) {
        Condition condition = DSL.trueCondition();

        if (!CommonUtils.NVL(keyword).isEmpty()) {
            String lowerKeyword = "%" + keyword.toLowerCase() + "%";
            condition = condition.and(
                    DSL.lower(USERS.FULL_NAME).like(lowerKeyword)
                            .or(DSL.lower(USERS.EMAIL).like(lowerKeyword))
                            .or(USERS.PHONE_NUMBER.like(lowerKeyword))
            );
        }

        if (CommonUtils.NVL(status) > 0) {
            condition = condition.and(USERS.ACTIVE.eq(status));
        }

        return condition;
    }

    private List<OrderField<?>> buildOrderBy(UserFilterRequest filter) {
        String sortBy = filter != null ? filter.getSortBy() : null;
        String sortDir = filter != null ? filter.getSortDir() : null;

        // If no sortBy then sortDir is not needed
        if (CommonUtils.NVL(sortBy).isEmpty()) {
            return List.of(USERS.ID.desc());
        }

        Field<?> sortField = switch (sortBy) {
            case "email" -> USERS.EMAIL;
            case "fullname" -> USERS.FULL_NAME;
            case "active" -> USERS.ACTIVE;
            case "role" -> USERS.ROLE_NAME;
            default -> USERS.ID;
        };

        boolean isDesc = "desc".equalsIgnoreCase(sortDir);
        return List.of(isDesc ? sortField.desc() : sortField.asc());
    }

    public List<User> getUserByCriteria(UserFilterRequest filter, Pageable pageable) {
        Condition condition = getWhereCondition(filter.getKeyword(), filter.getStatus());
        List<OrderField<?>> orderBy = buildOrderBy(filter);
        var fields = new ArrayList<>(getUserFields());
        fields.add(ROLES.NAME.as("role_name"));
        return dslContext.select(fields)
                .from(USERS).leftJoin(ROLES).on(USERS.ROLE_ID.eq(ROLES.ID))
                .where(condition)
                .orderBy(orderBy)
                .offset(pageable.getOffset())
                .limit(pageable.getLimit())
                .fetchInto(User.class);
    }

    public Long countUserByCriteria(UserFilterRequest filter) {
        Condition condition = getWhereCondition(filter.getKeyword(), filter.getStatus());
        return dslContext.selectCount()
                .from(USERS)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public User getUserById(Integer id) {
        List<Field<?>> selectedFields = new ArrayList<>(getUserFields());
        selectedFields.addAll(
                asList(
                        ROLES.NAME.as("role_name")
        ));

        return dslContext.select(selectedFields)
                .from(USERS)
                .leftJoin(ROLES).on(ROLES.ID.eq(USERS.ROLE_ID))
                .where(USERS.ID.eq(id))
                .fetchOptionalInto(User.class)
                .orElse(null);
    }

    public User getUserByEmail(String email) {
        List<Field<?>> selectedFields = new ArrayList<>(getUserFields());
        selectedFields.addAll(
                asList(
                        ROLES.NAME.as("role_name")
                ));

        SelectConditionStep<?> select = dslContext.select(selectedFields)
                .from(USERS)
                .leftJoin(ROLES).on(ROLES.ID.eq(USERS.ROLE_ID))
                .where(USERS.EMAIL.eq(email));
        return select
                .fetchOptionalInto(User.class)
                .orElse(null);
    }

    public User insertUser(User user) {
        dslContext.insertInto(USERS)
                .set(USERS.AVATAR_URL, user.getAvatarUrl())
                .set(USERS.BIRTHDAY, user.getBirthday())
                .set(USERS.EMAIL, user.getEmail())
                .set(USERS.FULL_NAME, user.getFullName())
                .set(USERS.PASSWORD, user.getPassword())
                .set(USERS.PHONE_NUMBER, user.getPhoneNumber())
                .set(USERS.ACTIVE, user.getActive())
                .set(USERS.ROLE_ID, user.getRoleId())
                .execute();
        user.setId(dslContext.lastID().intValue());
        return user;
    }

    public User updateUser(User user) {
        dslContext.update(USERS)
                .set(USERS.AVATAR_URL, user.getAvatarUrl())
                .set(USERS.BIRTHDAY, user.getBirthday())
                .set(USERS.EMAIL, user.getEmail())
                .set(USERS.FULL_NAME, user.getFullName())
                .set(USERS.PASSWORD, user.getPassword())
                .set(USERS.PHONE_NUMBER, user.getPhoneNumber())
                .set(USERS.ACTIVE, user.getActive())
                .set(USERS.ROLE_ID, user.getRoleId())
                .where(USERS.ID.eq(user.getId()))
                .execute();
        return user;
    }

    public User updateInfo(User user) {
        dslContext.update(USERS)
                .set(USERS.AVATAR_URL, user.getAvatarUrl())
                .set(USERS.BIRTHDAY, user.getBirthday())
                .set(USERS.EMAIL, user.getEmail())
                .set(USERS.FULL_NAME, user.getFullName())
                .set(USERS.PHONE_NUMBER, user.getPhoneNumber())
                .where(USERS.ID.eq(user.getId()))
                .execute();
        return user;
    }

    public Integer deleteUser(Integer id) {
        return dslContext.deleteFrom(USERS)
                .where(USERS.ID.eq(id))
                .execute();
    }
}
