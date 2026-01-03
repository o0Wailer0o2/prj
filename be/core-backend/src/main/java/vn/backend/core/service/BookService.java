package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.core.repository.BookRepository;
import vn.backend.entity.data.mysql.Book;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository repo;

    public Book create(Book req) {
        return repo.insert(req);
    }

    public Book update(Book req) {
        return repo.update(req);
    }

    public Book getByProductId(Integer productId) {
        return repo.getByProductId(productId);
    }
}
