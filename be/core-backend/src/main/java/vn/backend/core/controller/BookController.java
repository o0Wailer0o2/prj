package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.BookService;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Book;

@RestController
public class BookController {

    @Autowired
    private BookService service;

    @PostMapping("/book/create")
    public ResponseEntity<ApiResponse<Book>> create(@RequestBody Book req) {
        var result = service.create(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/book/update")
    public ResponseEntity<ApiResponse<Book>> update(@RequestBody Book req) {
        var result = service.update(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/book/get")
    public ResponseEntity<ApiResponse<Book>> get(@RequestParam Integer productId) {
        var result = service.getByProductId(productId);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
