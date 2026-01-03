package vn.backend.core.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.DVDService;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.DVD;

@RestController
public class DVDController {

    @Autowired
    private DVDService service;

    @PostMapping("/dvd/create")
    public ResponseEntity<ApiResponse<DVD>> create(@RequestBody DVD req) {
        var result = service.create(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/dvd/update")
    public ResponseEntity<ApiResponse<DVD>> update(@RequestBody DVD req) {
        var result = service.update(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/dvd/get")
    public ResponseEntity<ApiResponse<DVD>> get(@RequestParam Integer productId) {
        var result = service.getByProductId(productId);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
