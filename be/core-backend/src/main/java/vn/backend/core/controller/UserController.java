package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.annotation.IsAdmin;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.data.request.ProductFilterRequest;
import vn.backend.core.data.request.UserFilterRequest;
import vn.backend.core.service.UserService;
import vn.backend.core.util.Mapper;
import vn.backend.core.util.SecurityUtil;
import vn.backend.entity.data.mysql.Product;
import vn.backend.entity.data.mysql.User;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @IsAdmin
    @GetMapping("/user/list")
    public ResponseEntity<ApiResponse<Page<User>>> list(
            UserFilterRequest filter,
            Pageable pageable
    ) {
        var result = userService.getList(filter, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Lấy thông tin chi tiết user theo ID
     */
    @GetMapping("/user/getById")
    public ResponseEntity<ApiResponse<User>> getUserDetail(
            @RequestParam Integer id) {
        var result = userService.getUserById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Thêm hoặc cập nhật user (upsert)
     */
    @PostMapping("/user/update")
    @IsAdmin
    public ResponseEntity<ApiResponse<User>> upsertUser(
            @RequestBody User user) {
        User result;
        if (user.getId() == null || user.getId() <= 0) {
            result = userService.insertUser(user);
        } else {
            result = userService.updateUser(user);
        }

        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Cập nhật mật khẩu người dùng
     */
//    @PostMapping("/user/update-password")
//    public ResponseEntity<ApiResponse<User>> updatePassword(
//            @RequestParam Integer id,
//            @RequestParam String newPassword,
//            Principal principal) {
//
//        var result = userService.updateUserPassword(id, newPassword);
//        return Mapper.map(result, ApiResponse::okEntity);
//    }

    /**
     * Xóa người dùng
     */
    @DeleteMapping("/user/delete/{id}")
//    @IsAdmin
    public ResponseEntity<ApiResponse<Integer>> deleteUser(
            @PathVariable Integer id) {

        var result = userService.deleteUser(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    //Lấy thông tin người dùng đang login
    @GetMapping("/user/info")
    public ResponseEntity<ApiResponse<User>> getMyInfo(
    ) {
        String email = SecurityUtil.getCurrentLogin()
                .orElse(null);
        var result = userService.getUserByEmail(email);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    //Cập nhật thông tin (khách đăng nhập dùng)
    @PostMapping("/user/info")
    public ResponseEntity<ApiResponse<User>> updateMyInfo(
            @RequestBody User user
    ) {
        String email = SecurityUtil.getCurrentLogin()
                .orElse(null);

        var result = userService.updateInfo(user);
        return Mapper.map(result, ApiResponse::okEntity);
    }

//    @PostMapping("/user/update-status")
//    public ResponseEntity<ApiResponse<Integer>> updateUserStatus(
//            @RequestParam Integer id,
//            @RequestParam Integer active,
//            Principal principal) {
//
//        checkPermission(principal, "/user/", "UPDATE");
//
//        var result = userService.updateUserStatus(id, active);
//        return Mapper.map(result, ApiResponse::okEntity);
//    }
}
