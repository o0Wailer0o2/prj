package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.core.repository.NewspaperRepository;
import vn.backend.entity.data.mysql.Newspaper;

@Service
@RequiredArgsConstructor
public class NewspaperService {

    private final NewspaperRepository repo;

    public Newspaper create(Newspaper req) {
        return repo.insert(req);
    }

    public Newspaper update(Newspaper req) {
        return repo.update(req);
    }

    public Newspaper getByProductId(Integer productId) {
        return repo.getByProductId(productId);
    }
}