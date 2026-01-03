package vn.backend.core.repository;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.entity.data.mysql.Newspaper;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Newspapers.NEWSPAPERS;
@Repository
public class NewspaperRepository {

    @Autowired
    private DSLContext dsl;

    private static List<Field<?>> getFields() {
        return asList(
                NEWSPAPERS.PRODUCT_ID,
                NEWSPAPERS.EDITOR_IN_CHIEF,
                NEWSPAPERS.PUBLISHER,
                NEWSPAPERS.PUBLICATION_DATE,
                NEWSPAPERS.ISSUE_NUMBER,
                NEWSPAPERS.FREQUENCY,
                NEWSPAPERS.ISSN,
                NEWSPAPERS.LANGUAGE,
                NEWSPAPERS.SECTIONS
        );
    }

    public Newspaper getByProductId(Integer productId) {
        return dsl.select(getFields())
                .from(NEWSPAPERS)
                .where(NEWSPAPERS.PRODUCT_ID.eq(productId))
                .fetchOptionalInto(Newspaper.class)
                .orElse(null);
    }

    public Newspaper insert(Newspaper n) {
        dsl.insertInto(NEWSPAPERS)
                .set(NEWSPAPERS.PRODUCT_ID, n.getProductId())
                .set(NEWSPAPERS.EDITOR_IN_CHIEF, n.getEditorInChief())
                .set(NEWSPAPERS.PUBLISHER, n.getPublisher())
                .set(NEWSPAPERS.PUBLICATION_DATE, n.getPublicationDate())
                .set(NEWSPAPERS.ISSUE_NUMBER, n.getIssueNumber())
                .set(NEWSPAPERS.FREQUENCY, n.getFrequency())
                .set(NEWSPAPERS.ISSN, n.getIssn())
                .set(NEWSPAPERS.LANGUAGE, n.getLanguage())
                .set(NEWSPAPERS.SECTIONS, n.getSections())
                .execute();
        return n;
    }

    public Newspaper update(Newspaper n) {
        dsl.update(NEWSPAPERS)
                .set(NEWSPAPERS.EDITOR_IN_CHIEF, n.getEditorInChief())
                .set(NEWSPAPERS.PUBLISHER, n.getPublisher())
                .set(NEWSPAPERS.PUBLICATION_DATE, n.getPublicationDate())
                .set(NEWSPAPERS.ISSUE_NUMBER, n.getIssueNumber())
                .set(NEWSPAPERS.FREQUENCY, n.getFrequency())
                .set(NEWSPAPERS.ISSN, n.getIssn())
                .set(NEWSPAPERS.LANGUAGE, n.getLanguage())
                .set(NEWSPAPERS.SECTIONS, n.getSections())
                .where(NEWSPAPERS.PRODUCT_ID.eq(n.getProductId()))
                .execute();
        return n;
    }

    public Integer delete(Integer productId) {
        return dsl.deleteFrom(NEWSPAPERS)
                .where(NEWSPAPERS.PRODUCT_ID.eq(productId))
                .execute();
    }

    public Integer deleteByProductIds(List<Integer> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return 0;
        }
        return dsl.deleteFrom(NEWSPAPERS)
                .where(NEWSPAPERS.PRODUCT_ID.in(productIds))
                .execute();
    }
}
