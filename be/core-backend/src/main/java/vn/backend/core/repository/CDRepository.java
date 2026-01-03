package vn.backend.core.repository;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.entity.data.mysql.CD;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Cds.CDS;

@Repository
public class CDRepository {

    @Autowired
    private DSLContext dsl;

    private static List<Field<?>> getFields() {
        return asList(
                CDS.PRODUCT_ID,
                CDS.ARTISTS,
                CDS.RECORD_LABEL,
                CDS.GENRE,
                CDS.RELEASE_DATE,
                CDS.LENGTH_SECONDS
        );
    }

    public CD getByProductId(Integer productId) {
        return dsl.select(getFields())
                .from(CDS)
                .where(CDS.PRODUCT_ID.eq(productId))
                .fetchOptionalInto(CD.class)
                .orElse(null);
    }

    public CD insert(CD cd) {
        dsl.insertInto(CDS)
                .set(CDS.PRODUCT_ID, cd.getProductId())
                .set(CDS.ARTISTS, cd.getArtists())
                .set(CDS.RECORD_LABEL, cd.getRecordLabel())
                .set(CDS.GENRE, cd.getGenre())
                .set(CDS.RELEASE_DATE, cd.getReleaseDate())
                .set(CDS.LENGTH_SECONDS, cd.getLengthSeconds())
                .execute();
        return cd;
    }

    public CD update(CD cd) {
        dsl.update(CDS)
                .set(CDS.ARTISTS, cd.getArtists())
                .set(CDS.RECORD_LABEL, cd.getRecordLabel())
                .set(CDS.GENRE, cd.getGenre())
                .set(CDS.RELEASE_DATE, cd.getReleaseDate())
                .set(CDS.LENGTH_SECONDS, cd.getLengthSeconds())
                .where(CDS.PRODUCT_ID.eq(cd.getProductId()))
                .execute();
        return cd;
    }

    public Integer delete(Integer productId) {
        return dsl.deleteFrom(CDS)
                .where(CDS.PRODUCT_ID.eq(productId))
                .execute();
    }

    public Integer deleteByProductIds(List<Integer> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return 0;
        }
        return dsl.deleteFrom(CDS)
                .where(CDS.PRODUCT_ID.in(productIds))
                .execute();
    }

}
