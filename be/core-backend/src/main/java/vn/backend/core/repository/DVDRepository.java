package vn.backend.core.repository;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.entity.data.mysql.DVD;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Dvds.DVDS;

@Repository
public class DVDRepository {

    @Autowired
    private DSLContext dsl;

    private static List<Field<?>> getFields() {
        return asList(
                DVDS.PRODUCT_ID,
                DVDS.DISC_TYPE,
                DVDS.DIRECTOR,
                DVDS.RUNTIME_MINUTES,
                DVDS.STUDIO,
                DVDS.LANGUAGE,
                DVDS.SUBTITLES,
                DVDS.RELEASE_DATE,
                DVDS.GENRE
        );
    }

    public DVD getByProductId(Integer productId) {
        return dsl.select(getFields())
                .from(DVDS)
                .where(DVDS.PRODUCT_ID.eq(productId))
                .fetchOptionalInto(DVD.class)
                .orElse(null);
    }

    public DVD insert(DVD dvd) {
        dsl.insertInto(DVDS)
                .set(DVDS.PRODUCT_ID, dvd.getProductId())
                .set(DVDS.DISC_TYPE, dvd.getDiscType())
                .set(DVDS.DIRECTOR, dvd.getDirector())
                .set(DVDS.RUNTIME_MINUTES, dvd.getRuntimeMinutes())
                .set(DVDS.STUDIO, dvd.getStudio())
                .set(DVDS.LANGUAGE, dvd.getLanguage())
                .set(DVDS.SUBTITLES, dvd.getSubtitles())
                .set(DVDS.RELEASE_DATE, dvd.getReleaseDate())
                .set(DVDS.GENRE, dvd.getGenre())
                .execute();
        return dvd;
    }

    public DVD update(DVD dvd) {
        dsl.update(DVDS)
                .set(DVDS.DISC_TYPE, dvd.getDiscType())
                .set(DVDS.DIRECTOR, dvd.getDirector())
                .set(DVDS.RUNTIME_MINUTES, dvd.getRuntimeMinutes())
                .set(DVDS.STUDIO, dvd.getStudio())
                .set(DVDS.LANGUAGE, dvd.getLanguage())
                .set(DVDS.SUBTITLES, dvd.getSubtitles())
                .set(DVDS.RELEASE_DATE, dvd.getReleaseDate())
                .set(DVDS.GENRE, dvd.getGenre())
                .where(DVDS.PRODUCT_ID.eq(dvd.getProductId()))
                .execute();
        return dvd;
    }

    public Integer delete(Integer productId) {
        return dsl.deleteFrom(DVDS)
                .where(DVDS.PRODUCT_ID.eq(productId))
                .execute();
    }

    public Integer deleteByProductIds(List<Integer> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return 0;
        }
        return dsl.deleteFrom(DVDS)
                .where(DVDS.PRODUCT_ID.in(productIds))
                .execute();
    }

}
