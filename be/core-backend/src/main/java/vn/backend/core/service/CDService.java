package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.core.repository.CDRepository;
import vn.backend.entity.data.mysql.CD;

@Service
@RequiredArgsConstructor
public class CDService {

    private final CDRepository repo;

    public CD create(CD req) {
        return repo.insert(req);
    }

    public CD update(CD req) {
        return repo.update(req);
    }

    public CD getByProductId(Integer productId) {
        return repo.getByProductId(productId);
    }
}
