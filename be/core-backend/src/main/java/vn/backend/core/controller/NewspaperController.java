package vn.backend.core.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.NewspaperService;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Newspaper;
@RestController
public class NewspaperController {

    @Autowired
    private NewspaperService service;

    @PostMapping("/newspaper/create")
    public ResponseEntity<ApiResponse<Newspaper>> create(@RequestBody Newspaper req) {
        var result = service.create(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/newspaper/update")
    public ResponseEntity<ApiResponse<Newspaper>> update(@RequestBody Newspaper req) {
        var result = service.update(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/newspaper/get")
    public ResponseEntity<ApiResponse<Newspaper>> get(@RequestParam Integer productId) {
        var result = service.getByProductId(productId);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
