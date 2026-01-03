package vn.backend.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.RoleRepository;
import vn.backend.entity.data.mysql.Role;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class RoleService {

    @Autowired
    private RoleRepository repository;

    public Page<Role> getListRoleByCriteria(String name, Pageable pageable) {
        CompletableFuture<List<Role>> futureList = CompletableFuture.supplyAsync(
                () -> repository.getRoleByCriteria(name, pageable)
        );
        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> repository.countRoleByCriteria(name)
        );

        List<Role> list = futureList.join();
        Long count = futureCount.join();
        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public Role getRoleById(Integer id) {
        return repository.getRoleById(id);
    }

    public Role insertRole(Role role) {
        return repository.insertRole(role);
    }

    public Role updateRole(Role role) {
        return repository.updateRole(role);
    }

    public Integer deleteRole(Integer id) {
        return repository.deleteRole(id);
    }
}
