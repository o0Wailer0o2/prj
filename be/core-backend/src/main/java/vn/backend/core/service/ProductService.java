package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.data.request.ProductFilterRequest;
import vn.backend.core.data.response.ProductDetailResponse;
import vn.backend.core.repository.*;
import vn.backend.entity.data.mysql.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final BookRepository bookRepo;
    private final CDRepository cdRepo;
    private final DVDRepository dvdRepo;
    private final NewspaperRepository newspaperRepo;

    public Page<Product> getList(ProductFilterRequest filter, Pageable pageable) {
        CompletableFuture<List<Product>> fuList =
                CompletableFuture.supplyAsync(() ->
                        productRepo.getByCriteria(filter, pageable)
                );

        CompletableFuture<Long> fuCount =
                CompletableFuture.supplyAsync(() ->
                        productRepo.countByCriteria(filter)
                );

        List<Product> list = fuList.join();
        Long count = fuCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public Product getById(Integer id) {
        return productRepo.getById(id);
    }

    public ProductDetailResponse getDetailById(Integer id) {

        Product p = productRepo.getById(id);
        if (p == null) return null;

        ProductDetailResponse.ProductDetailResponseBuilder builder =
                ProductDetailResponse.builder().product(p);

        switch (p.getType()) {
            case "BOOK" -> {
                Book b = bookRepo.getByProductId(id);
                if (b != null) mergeProductIntoChild(p, b);
                builder.book(b);
            }
            case "CD" -> {
                CD c = cdRepo.getByProductId(id);
                if (c != null) mergeProductIntoChild(p, c);
                builder.cd(c);
            }
            case "DVD" -> {
                DVD d = dvdRepo.getByProductId(id);
                if (d != null) mergeProductIntoChild(p, d);
                builder.dvd(d);
            }
            case "NEWSPAPER" -> {
                Newspaper n = newspaperRepo.getByProductId(id);
                if (n != null) mergeProductIntoChild(p, n);
                builder.newspaper(n);
            }
        }
        return builder.build();

    }

    public Product create(Product p) {
        return productRepo.insert(p);
    }

    public Product update(Product p) {
        return productRepo.update(p);
    }


    public Integer delete(Integer id) {
        Product p = productRepo.getById(id);
        if (p == null) return 0;

        switch (p.getType()) {
            case "BOOK" -> bookRepo.delete(id);
            case "CD" -> cdRepo.delete(id);
            case "DVD" -> dvdRepo.delete(id);
            case "NEWSPAPER" -> newspaperRepo.delete(id);
        }

        return productRepo.delete(id);
    }

    @Transactional
    public Integer deleteByIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }

        List<Product> products = productRepo.getByIds(ids);
        if (products.isEmpty()) {
            return 0;
        }

        Map<String, List<Integer>> productIdsByType = products.stream()
                .collect(Collectors.groupingBy(
                        Product::getType,
                        Collectors.mapping(Product::getId, Collectors.toList())
                ));

        productIdsByType.forEach((type, productIds) -> {
            switch (type) {
                case "BOOK" -> bookRepo.deleteByProductIds(productIds);
                case "CD" -> cdRepo.deleteByProductIds(productIds);
                case "DVD" -> dvdRepo.deleteByProductIds(productIds);
                case "NEWSPAPER" -> newspaperRepo.deleteByProductIds(productIds);
            }
        });

        return productRepo.deleteByIds(ids);
    }

    public List<Product> getByIds(List<Integer> ids) {
        return productRepo.getByIds(ids);
    }

    private void mergeProductIntoChild(Product p, Product child) {
        child.setId(p.getId());
        child.setName(p.getName());
        child.setImageUrl(p.getImageUrl());
        child.setPrice(p.getPrice());
        child.setAverageRating(p.getAverageRating());
        child.setBarcode(p.getBarcode());
        child.setTitle(p.getTitle());
        child.setDescription(p.getDescription());
        child.setHeight(p.getHeight());
        child.setWidth(p.getWidth());
        child.setLength(p.getLength());
        child.setWeight(p.getWeight());
        child.setOriginalValue(p.getOriginalValue());
        child.setCurrentPrice(p.getCurrentPrice());
        child.setStock(p.getStock());
        child.setStatus(p.getStatus());
        child.setType(p.getType());
        child.setCreatedAt(p.getCreatedAt());
        child.setUpdatedAt(p.getUpdatedAt());
    }
}