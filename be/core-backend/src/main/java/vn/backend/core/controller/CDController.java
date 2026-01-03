package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.CDService;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.CD;

@RestController
public class CDController {

    @Autowired
    private CDService service;

    @PostMapping("/cd/create")
    public ResponseEntity<ApiResponse<CD>> create(@RequestBody CD req) {
        var result = service.create(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/cd/update")
    public ResponseEntity<ApiResponse<CD>> update(@RequestBody CD req) {
        var result = service.update(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/cd/get")
    public ResponseEntity<ApiResponse<CD>> get(@RequestParam Integer productId) {
        var result = service.getByProductId(productId);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
