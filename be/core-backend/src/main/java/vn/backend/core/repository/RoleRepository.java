package vn.backend.core.repository;

import org.jooq.*;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.entity.data.mysql.Role;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Roles.ROLES;

@Repository
public class RoleRepository {

    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getRoleFields() {
        return asList(ROLES.ID, ROLES.NAME);
    }

    public List<Role> getRoleByCriteria(String name, Pageable pageable) {
        Condition condition = DSL.trueCondition();

        if (name != null && !name.trim().isEmpty()) {
            condition = condition.and(ROLES.NAME.likeIgnoreCase("%" + name.trim() + "%"));
        }

        return dslContext.select(getRoleFields())
                .from(ROLES)
                .where(condition)
                .orderBy(ROLES.ID.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit())
                .fetchInto(Role.class);
    }

    public Long countRoleByCriteria(String name) {
        Condition condition = DSL.trueCondition();
        if (name != null && !name.trim().isEmpty()) {
            condition = condition.and(ROLES.NAME.likeIgnoreCase("%" + name.trim() + "%"));
        }

        return dslContext.selectCount()
                .from(ROLES)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public Role getRoleById(Integer id) {
        return dslContext.select(getRoleFields())
                .from(ROLES)
                .where(ROLES.ID.eq(id))
                .fetchOptionalInto(Role.class)
                .orElse(null);
    }

    public Role insertRole(Role role) {
        dslContext.insertInto(ROLES)
                .set(ROLES.NAME, role.getName())
                .execute();
        role.setId(dslContext.lastID().intValue());
        return role;
    }

    public Role updateRole(Role role) {
        dslContext.update(ROLES)
                .set(ROLES.NAME, role.getName())
                .where(ROLES.ID.eq(role.getId()))
                .execute();
        return role;
    }

    public Integer deleteRole(Integer id) {
        return dslContext.deleteFrom(ROLES)
                .where(ROLES.ID.eq(id))
                .execute();
    }
}
