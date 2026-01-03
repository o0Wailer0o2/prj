package vn.backend.core.repository;

import org.jooq.*;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.data.request.ProductFilterRequest;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.Product;

import java.time.LocalDateTime;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Products.PRODUCTS;

@Repository
public class ProductRepository {

    @Autowired
    private DSLContext dsl;

    private static List<Field<?>> getFields() {
        return asList(
                PRODUCTS.ID,
                PRODUCTS.NAME,
                PRODUCTS.IMAGE_URL,
                PRODUCTS.PRICE,
                PRODUCTS.AVERAGE_RATING,
                PRODUCTS.BARCODE,
                PRODUCTS.TITLE,
                PRODUCTS.DESCRIPTION,
                PRODUCTS.HEIGHT,
                PRODUCTS.WIDTH,
                PRODUCTS.LENGTH,
                PRODUCTS.WEIGHT,
                PRODUCTS.ORIGINAL_VALUE,
                PRODUCTS.CURRENT_PRICE,
                PRODUCTS.STOCK,
                PRODUCTS.STATUS,
                PRODUCTS.TYPE,
                PRODUCTS.CREATED_AT,
                PRODUCTS.UPDATED_AT
        );
    }

    private Condition buildWhereCondition(ProductFilterRequest filter) {
        Condition condition = DSL.trueCondition();

        if (filter == null) {
            return condition;
        }

        if (!CommonUtils.NVL(filter.getKeyword()).isEmpty()) {
            String kw = "%" + filter.getKeyword().toLowerCase() + "%";
            condition = condition.and(
                    DSL.lower(PRODUCTS.NAME).like(kw)
                            .or(DSL.lower(PRODUCTS.TITLE).like(kw))
                            .or(DSL.lower(PRODUCTS.DESCRIPTION).like(kw))
            );
        }

        List<String> types = filter.getTypes();
        if (types == null || types.isEmpty()) {
            condition = DSL.falseCondition();
        } else {
            condition = condition.and(PRODUCTS.TYPE.in(types));
        }

        if (CommonUtils.NVL(filter.getStatus()) > 0) {
            condition = condition.and(PRODUCTS.STATUS.eq(filter.getStatus()));
        }

        if (filter.getMinPrice() != null) {
            condition = condition.and(PRODUCTS.CURRENT_PRICE.ge(filter.getMinPrice()));
        }
        if (filter.getMaxPrice() != null) {
            condition = condition.and(PRODUCTS.CURRENT_PRICE.le(filter.getMaxPrice()));
        }

        if (filter.getMinRating() != null) {
            condition = condition.and(PRODUCTS.AVERAGE_RATING.ge(filter.getMinRating()));
        }
        if (filter.getMaxRating() != null) {
            condition = condition.and(PRODUCTS.AVERAGE_RATING.le(filter.getMaxRating()));
        }

        if (filter.getInStock() != null && filter.getInStock()) {
            condition = condition.and(PRODUCTS.STOCK.gt(0));
        }
        if (filter.getMinStock() != null) {
            condition = condition.and(PRODUCTS.STOCK.ge(filter.getMinStock()));
        }

        return condition;
    }

    private List<OrderField<?>> buildOrderBy(ProductFilterRequest filter) {
        String sortBy = filter != null ? filter.getSortBy() : null;
        String sortDir = filter != null ? filter.getSortDir() : null;

        if (CommonUtils.NVL(sortBy).isEmpty()) {
            return List.of(PRODUCTS.ID.desc());
        }

        Field<?> sortField = switch (sortBy) {
            case "title" -> PRODUCTS.TITLE;
            case "currentPrice" -> PRODUCTS.CURRENT_PRICE;
            case "originalValue" -> PRODUCTS.ORIGINAL_VALUE;
            case "averageRating" -> PRODUCTS.AVERAGE_RATING;
            case "stock" -> PRODUCTS.STOCK;
            default -> PRODUCTS.ID;
        };

        boolean isDesc = "desc".equalsIgnoreCase(sortDir);
        return List.of(isDesc ? sortField.desc() : sortField.asc());
    }

    public List<Product> getByCriteria(ProductFilterRequest filter, Pageable pageable) {
        Condition condition = buildWhereCondition(filter);
        List<OrderField<?>> orderBy = buildOrderBy(filter);

        return dsl.select(getFields())
                .from(PRODUCTS)
                .where(condition)
                .orderBy(orderBy)
                .offset(pageable.getOffset())
                .limit(pageable.getLimit())
                .fetchInto(Product.class);
    }

    public Long countByCriteria(ProductFilterRequest filter) {
        Condition condition = buildWhereCondition(filter);

        return dsl.selectCount()
                .from(PRODUCTS)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public Product getById(Integer id) {
        return dsl.select(getFields())
                .from(PRODUCTS)
                .where(PRODUCTS.ID.eq(id))
                .fetchOptionalInto(Product.class)
                .orElse(null);
    }

    public Product insert(Product p) {
        dsl.insertInto(PRODUCTS)
                .set(PRODUCTS.NAME, p.getName())
                .set(PRODUCTS.IMAGE_URL, p.getImageUrl())
                .set(PRODUCTS.PRICE, p.getPrice())
                .set(PRODUCTS.AVERAGE_RATING, p.getAverageRating())
                .set(PRODUCTS.BARCODE, p.getBarcode())
                .set(PRODUCTS.TITLE, p.getTitle())
                .set(PRODUCTS.DESCRIPTION, p.getDescription())
                .set(PRODUCTS.HEIGHT, p.getHeight())
                .set(PRODUCTS.WIDTH, p.getWidth())
                .set(PRODUCTS.LENGTH, p.getLength())
                .set(PRODUCTS.WEIGHT, p.getWeight())
                .set(PRODUCTS.ORIGINAL_VALUE, p.getOriginalValue())
                .set(PRODUCTS.CURRENT_PRICE, p.getCurrentPrice())
                .set(PRODUCTS.STOCK, p.getStock())
                .set(PRODUCTS.STATUS, p.getStatus())
                .set(PRODUCTS.TYPE, p.getType())
                .execute();

        p.setId(dsl.lastID().intValue());
        return p;
    }

    public Product update(Product p) {
        dsl.update(PRODUCTS)
                .set(PRODUCTS.NAME, p.getName())
                .set(PRODUCTS.IMAGE_URL, p.getImageUrl())
                .set(PRODUCTS.PRICE, p.getPrice())
                .set(PRODUCTS.AVERAGE_RATING, p.getAverageRating())
                .set(PRODUCTS.BARCODE, p.getBarcode())
                .set(PRODUCTS.TITLE, p.getTitle())
                .set(PRODUCTS.DESCRIPTION, p.getDescription())
                .set(PRODUCTS.HEIGHT, p.getHeight())
                .set(PRODUCTS.WIDTH, p.getWidth())
                .set(PRODUCTS.LENGTH, p.getLength())
                .set(PRODUCTS.WEIGHT, p.getWeight())
                .set(PRODUCTS.ORIGINAL_VALUE, p.getOriginalValue())
                .set(PRODUCTS.CURRENT_PRICE, p.getCurrentPrice())
                .set(PRODUCTS.STOCK, p.getStock())
                .set(PRODUCTS.STATUS, p.getStatus())
                .set(PRODUCTS.TYPE, p.getType())
                .where(PRODUCTS.ID.eq(p.getId()))
                .execute();

        return p;
    }

    public Integer delete(Integer id) {
        return dsl.deleteFrom(PRODUCTS)
                .where(PRODUCTS.ID.eq(id))
                .execute();
    }

    public List<Product> getByIds(List<Integer> ids) {
        return dsl.selectFrom(PRODUCTS)
                .where(PRODUCTS.ID.in(ids))
                .fetchInto(Product.class);
    }

    public Integer deleteByIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }

        return dsl.deleteFrom(PRODUCTS)
                .where(PRODUCTS.ID.in(ids))
                .execute();
    }

    public int deductStock(Integer productId, Integer quantity) {
        return dsl.update(PRODUCTS)
                .set(PRODUCTS.STOCK, PRODUCTS.STOCK.sub(quantity))
                .where(PRODUCTS.ID.eq(productId)
                        .and(PRODUCTS.STOCK.ge(quantity))) // Chỉ trừ khi stock >= quantity
                .execute();
    }

    public int restoreStock(Integer productId, Integer quantity) {
        return dsl.update(PRODUCTS)
                .set(PRODUCTS.STOCK, PRODUCTS.STOCK.add(quantity))
                .where(PRODUCTS.ID.eq(productId))
                .execute();
    }
}