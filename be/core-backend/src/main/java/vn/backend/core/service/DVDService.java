package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.core.repository.DVDRepository;
import vn.backend.entity.data.mysql.DVD;

@Service
@RequiredArgsConstructor
public class DVDService {

    private final DVDRepository repo;

    public DVD create(DVD req) {
        return repo.insert(req);
    }

    public DVD update(DVD req) {
        return repo.update(req);
    }

    public DVD getByProductId(Integer productId) {
        return repo.getByProductId(productId);
    }
}
