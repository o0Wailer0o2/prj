package vn.backend.core.repository;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.entity.data.mysql.Book;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Books.BOOKS;

@Repository
public class BookRepository {

    @Autowired
    private DSLContext dsl;

    private static List<Field<?>> getFields() {
        return asList(
                BOOKS.PRODUCT_ID,
                BOOKS.AUTHORS,
                BOOKS.COVER_TYPE,
                BOOKS.PUBLISHER,
                BOOKS.PUBLICATION_DATE,
                BOOKS.PAGES,
                BOOKS.LANGUAGE,
                BOOKS.GENRE
        );
    }

    public Book getByProductId(Integer productId) {
        return dsl.select(getFields())
                .from(BOOKS)
                .where(BOOKS.PRODUCT_ID.eq(productId))
                .fetchOptionalInto(Book.class)
                .orElse(null);
    }

    public Book insert(Book book) {
        dsl.insertInto(BOOKS)
                .set(BOOKS.PRODUCT_ID, book.getProductId())
                .set(BOOKS.AUTHORS, book.getAuthors())
                .set(BOOKS.COVER_TYPE, book.getCoverType())
                .set(BOOKS.PUBLISHER, book.getPublisher())
                .set(BOOKS.PUBLICATION_DATE, book.getPublicationDate())
                .set(BOOKS.PAGES, book.getPages())
                .set(BOOKS.LANGUAGE, book.getLanguage())
                .set(BOOKS.GENRE, book.getGenre())
                .execute();
        return book;
    }

    public Book update(Book book) {
        dsl.update(BOOKS)
                .set(BOOKS.AUTHORS, book.getAuthors())
                .set(BOOKS.COVER_TYPE, book.getCoverType())
                .set(BOOKS.PUBLISHER, book.getPublisher())
                .set(BOOKS.PUBLICATION_DATE, book.getPublicationDate())
                .set(BOOKS.PAGES, book.getPages())
                .set(BOOKS.LANGUAGE, book.getLanguage())
                .set(BOOKS.GENRE, book.getGenre())
                .where(BOOKS.PRODUCT_ID.eq(book.getProductId()))
                .execute();
        return book;
    }

    public Integer delete(Integer productId) {
        return dsl.deleteFrom(BOOKS)
                .where(BOOKS.PRODUCT_ID.eq(productId))
                .execute();
    }

    public Integer deleteByProductIds(List<Integer> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return 0;
        }
        return dsl.deleteFrom(BOOKS)
                .where(BOOKS.PRODUCT_ID.in(productIds))
                .execute();
    }
}
