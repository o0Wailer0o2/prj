package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.data.request.ProductFilterRequest;
import vn.backend.core.data.request.ProductIdsRequest;
import vn.backend.core.data.response.ProductDetailResponse;
import vn.backend.core.service.ProductService;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Product;

import java.util.List;

@RestController
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping("/product/list")
    public ResponseEntity<ApiResponse<Page<Product>>> list(
            ProductFilterRequest filter,
            Pageable pageable
    ) {
        var result = service.getList(filter, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/product/get")
    public ResponseEntity<ApiResponse<Product>> get(
            @RequestParam Integer id
    ) {
        var result = service.getById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/product/detail")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> detail(
            @RequestParam Integer id
    ) {
        var result = service.getDetailById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/product/create")
    public ResponseEntity<ApiResponse<Product>> create(
            @RequestBody Product req
    ) {
        var result = service.create(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/product/update")
    public ResponseEntity<ApiResponse<Product>> update(
            @RequestBody Product req
    ) {
        var result = service.update(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/product/delete")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @RequestParam Integer id
    ) {
        var result = service.delete(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/product/get-by-ids")
    public ResponseEntity<ApiResponse<List<Product>>> getByIds(
            @ModelAttribute ProductIdsRequest request
    ) {
        var result = service.getByIds(request.getIds());
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
