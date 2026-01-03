package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;

import vn.backend.core.data.request.CreateOrderRequest;
import vn.backend.core.data.request.OrderFilterRequest;
import vn.backend.core.service.OrderService;
import vn.backend.core.service.UserService;
import vn.backend.core.util.Mapper;
import vn.backend.core.util.SecurityUtil;
import vn.backend.entity.data.mysql.Order;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private OrderService service;
    @Autowired
    private UserService userService;

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Page<Order>>> list(
            @ModelAttribute OrderFilterRequest filter,
            Pageable pageable
    ) {
        var result = service.getList(
                filter,
                pageable
        );
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/get")
    public ResponseEntity<ApiResponse<Order>> get(
            @RequestParam Integer id
    ) {
        var result = service.getById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Order>> create(
            @RequestBody CreateOrderRequest req
    ) {
        String email = SecurityUtil.getCurrentLogin()
                .orElse(null);

        var user = userService.getUserByEmail(email);

        req.getOrder().setUserId(user.getId());

        var result = service.create(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<Order>> update(
            @RequestBody Order req
    ) {
        var result = service.update(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/delete")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @RequestParam Integer id
    ) {
        var result = service.delete(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}