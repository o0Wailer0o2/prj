package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.data.request.ProductFilterRequest;
import vn.backend.core.data.request.UserFilterRequest;
import vn.backend.core.repository.UserRepository;
import vn.backend.entity.data.mysql.Product;
import vn.backend.entity.data.mysql.User;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;

//    public Page<User> getListUserByCriteria(String keyword, Integer status, Pageable pageable) {
//        CompletableFuture<List<User>> futureList = CompletableFuture.supplyAsync(
//                () -> repository.getUserByCriteria(keyword, status, pageable)
//        );
//        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
//                () -> repository.countUserByCriteria(keyword, status)
//        );
//
//        List<User> list = futureList.join();
//        Long count = futureCount.join();
//
//        pageable.setTotal(count);
//        return new Page<>(pageable, list);
//    }

    public Page<User> getList(UserFilterRequest filter, Pageable pageable) {
        CompletableFuture<List<User>> fuList =
                CompletableFuture.supplyAsync(() ->
                        repository.getUserByCriteria(filter, pageable)
                );

        CompletableFuture<Long> fuCount =
                CompletableFuture.supplyAsync(() ->
                        repository.countUserByCriteria(filter)
                );

        List<User> list = fuList.join();
        Long count = fuCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public User getUserById(Integer id) {
        return repository.getUserById(id);
    }

    public User getUserByEmail(String email) {
        User user = repository.getUserByEmail(email);
        return user;
    }

    public User insertUser(User user) {
        //Add default value for these to avoid null pointer later
        if (user.getActive() == null) {
            user.setActive(1);
        }
        if (user.getRoleId() == null) {
            user.setRoleId(2);
        }
        return repository.insertUser(user);
    }

    public User updateUser(User user) {
        return repository.updateUser(user);
    }

    public User updateInfo(User user) {
        return repository.updateInfo(user);
    }

    public Integer deleteUser(Integer id) {
        return repository.deleteUser(id);
    }
}