insert into julytus.products (id, name, image_url, price, average_rating, barcode, title, type, description, height, width, length, weight, original_value, current_price, stock, status)
values
-- BOOKS
(5, 'Refactoring', 'https://example.com/refactoring.png', 110.0, 0, 'B001', 'Improving Design of Existing Code', 'BOOK', 'Refactoring techniques in practice', 21, 14, 3, 0.48, 130, 110, 20, 1),
(6, 'Design Patterns', 'https://example.com/design-patterns.png', 150.0, 0, 'B002', 'Elements of Reusable OO Software', 'BOOK', 'The GoF patterns bible', 23, 16, 4, 0.60, 180, 150, 35, 1),
(7, 'Clean Architecture', 'https://example.com/clean-architecture.png', 135.0, 0, 'B003', 'A Craftsman''s Guide to Software Structure', 'BOOK', 'Robert C. Martin series', 22, 15, 3, 0.52, 160, 135, 18, 1),
(8, 'Working Effectively with Legacy Code', 'https://example.com/legacy-code.png', 99.0, 0, 'B004', 'Legacy Code Techniques', 'BOOK', 'How to manage big old codebases', 22, 14, 3, 0.44, 120, 99, 12, 1),
(9, 'Algorithms', 'https://example.com/algorithms.png', 89.0, 0, 'B005', 'Algorithms 4th Edition', 'BOOK', 'Algorithm & data structure fundamentals', 24, 18, 4, 0.70, 110, 89, 28, 1),
(10,'Introduction to Algorithms', 'https://example.com/clrs.png', 170.0, 0, 'B006', 'CLRS', 'BOOK', 'MIT CLRS algorithms bible', 25, 19, 5, 1.0, 200, 170, 40, 1),
(11,'You Don''t Know JS', 'https://example.com/ydkjs.png', 45.0, 0, 'B007', 'JavaScript Deep Dive', 'BOOK', 'Advanced JS concepts', 20, 14, 2, 0.30, 60, 45, 50, 1),
(12,'Eloquent JavaScript', 'https://example.com/eloquentjs.png', 38.0, 0, 'B008', 'A Modern Introduction to JS', 'BOOK', 'Great beginner JS book', 21, 15, 2, 0.27, 50, 38, 30, 1),
(13,'Database Internals', 'https://example.com/dbint.png', 120.0, 0, 'B009', 'DB Architecture', 'BOOK', 'How databases work internally', 23, 17, 3, 0.55, 140, 120, 10, 1),
(14,'Deep Learning', 'https://example.com/dlbook.png', 190.0, 0, 'B010', 'Neural Networks and Deep Learning', 'BOOK', 'Ian Goodfellow deep learning guide', 25, 19, 5, 1.10, 220, 190, 22, 1),
(15,'The Mythical Man-Month', 'https://example.com/mmm.png', 55.0, 0, 'B011', 'Software Engineering Essays', 'BOOK', 'Classic SE wisdom', 20, 14, 2, 0.32, 65, 55, 15, 1),
(16,'Soft Skills', 'https://example.com/softskills.png', 50.0, 0, 'B012', 'Developer Life Guide', 'BOOK', 'John Sonmez career/mastery tips', 21, 14, 2, 0.28, 60, 50, 40, 1),

-- CDs
(17,'Greatest Rock Hits', 'https://example.com/cd-rock.png', 14.99, 0, 'CD001', 'Rock Compilation', 'CD', 'Popular rock hits collection', 1, 12, 12, 0.10, 18, 14.99, 120, 1),
(18,'Jazz Classics', 'https://example.com/cd-jazz.png', 16.99, 0, 'CD002', 'Smooth Jazz Collection', 'CD', 'Top jazz performances', 1, 12, 12, 0.10, 20, 16.99, 80, 1),
(19,'Hip Hop Legends', 'https://example.com/cd-hiphop.png', 12.50, 0, 'CD003', 'Hip Hop Mix', 'CD', 'Best of hip hop artists', 1, 12, 12, 0.12, 15, 12.50, 140, 1),
(20,'Classical Essentials', 'https://example.com/cd-classical.png', 17.99, 0, 'CD004', 'Classical Music Collection', 'CD', 'Beethoven, Mozart, Bach', 1, 12, 12, 0.11, 22, 17.99, 70, 1),
(21,'EDM Festival Mix', 'https://example.com/cd-edm.png', 13.99, 0, 'CD005', 'Electronic Mix', 'CD', 'EDM festival playlist', 1, 12, 12, 0.10, 18, 13.99, 95, 1),
(22,'Romantic Piano', 'https://example.com/cd-piano.png', 15.49, 0, 'CD006', 'Piano Collection', 'CD', 'Soft piano tracks', 1, 12, 12, 0.09, 19, 15.49, 110, 1),
(23,'K-Pop Stars', 'https://example.com/cd-kpop.png', 19.99, 0, 'CD007', 'K-Pop Hits', 'CD', 'Top K-pop artists album', 1, 12, 12, 0.10, 25, 19.99, 200, 1),
(24,'Lo-fi Study Mix', 'https://example.com/cd-lofi.png', 11.99, 0, 'CD008', 'Lo-fi Beats', 'CD', 'Relaxing study mix', 1, 12, 12, 0.08, 14, 11.99, 180, 1),

-- DVDs
(25,'Inception', 'https://example.com/dvd-inception.png', 24.99, 0, 'DVD001', 'Inception Movie', 'DVD', 'Christopher Nolan movie', 1.4, 13.5, 19, 0.20, 28, 24.99, 60, 1),
(26,'Interstellar', 'https://example.com/dvd-interstellar.png', 29.99, 0, 'DVD002', 'Interstellar Film', 'DVD', 'Sci-fi masterpiece', 1.4, 13.5, 19, 0.22, 34, 29.99, 55, 1),
(27,'The Matrix', 'https://example.com/dvd-matrix.png', 19.99, 0, 'DVD003', 'Matrix Remastered', 'DVD', 'Sci-fi action', 1.4, 13.5, 19, 0.20, 24, 19.99, 70, 1),
(28,'The Godfather', 'https://example.com/dvd-godfather.png', 22.99, 0, 'DVD004', 'Godfather Trilogy', 'DVD', 'Classic mafia movie', 1.4, 13.5, 19, 0.23, 30, 22.99, 40, 1),
(29,'Titanic', 'https://example.com/dvd-titanic.png', 17.99, 0, 'DVD005', 'Titanic Remastered', 'DVD', 'Romantic drama', 1.3, 13.5, 19, 0.19, 20, 17.99, 65, 1),
(30,'Shrek', 'https://example.com/dvd-shrek.png', 14.99, 0, 'DVD006', 'Shrek Movie', 'DVD', 'Animated comedy', 1.2, 13.5, 19, 0.18, 18, 14.99, 80, 1),

-- NEWSPAPERS (optional)
(31,'The Global Times', 'https://example.com/news1.png', 2.5, 0, 'NP001', 'World News Edition', 'NEWSPAPER', 'Daily world news', 40, 30, 1, 0.1, 3.0, 2.5, 500, 1),
(32,'Tech Daily', 'https://example.com/news2.png', 3.0, 0, 'NP002', 'Tech Headlines', 'NEWSPAPER', 'Latest in tech', 40, 30, 1, 0.1, 3.5, 3.0, 300, 1),
(33,'Sports Weekly', 'https://example.com/news3.png', 2.0, 0, 'NP003', 'Weekly Sports Review', 'NEWSPAPER', 'Sports analysis', 40, 30, 1, 0.1, 2.5, 2.0, 200, 1),
(34,'Finance Watch', 'https://example.com/news4.png', 4.0, 0, 'NP004', 'Financial Insights', 'NEWSPAPER', 'Market analytics', 40, 30, 1, 0.1, 4.5, 4.0, 150, 1);

insert into julytus.books (product_id, authors, cover_type, publisher, publication_date, pages, language, genre)
values
    (5, 'Martin Fowler', 'Soft Cover', 'Addison-Wesley', '2019-01-01', 450, 'English', 'Software Engineering'),
    (6, 'Erich Gamma et al.', 'Hard Cover', 'Pearson', '2005-01-01', 395, 'English', 'Design Patterns'),
    (7, 'Robert C. Martin', 'Hard Cover', 'Pearson', '2017-09-20', 350, 'English', 'Architecture'),
    (8, 'Michael Feathers', 'Soft Cover', 'Prentice Hall', '2010-02-10', 500, 'English', 'Legacy Code'),
    (9, 'Robert Sedgewick', 'Hard Cover', 'Addison-Wesley', '2014-04-04', 1100, 'English', 'Algorithms'),
    (10,'Cormen, Leiserson, Rivest, Stein', 'Hard Cover', 'MIT Press', '2010-07-31', 1300, 'English', 'Algorithms'),
    (11,'Kyle Simpson', 'Soft Cover', 'O''Reilly', '2015-11-15', 280, 'English', 'JavaScript'),
    (12,'Marijn Haverbeke', 'Soft Cover', 'No Starch Press', '2018-12-01', 450, 'English', 'JavaScript'),
    (13,'Alex Petrov', 'Hard Cover', 'O''Reilly', '2019-05-15', 350, 'English', 'Databases'),
    (14,'Ian Goodfellow', 'Hard Cover', 'MIT Press', '2016-11-18', 775, 'English', 'AI'),
    (15,'Fred Brooks', 'Soft Cover', 'Addison-Wesley', '1995-06-01', 350, 'English', 'Software Engineering'),
    (16,'John Sonmez', 'Soft Cover', 'Simple Programmer', '2015-01-01', 320, 'English', 'Career');


insert into julytus.cds (artists, genre, length_seconds, record_label, release_date, product_id)
values
    ('Queen', 'Rock', 4200, 'EMI', '2020-08-01', 17),
    ('Miles Davis', 'Jazz', 3900, 'Columbia Records', '2021-04-01', 18),
    ('Eminem', 'Hip Hop', 3800, 'Aftermath', '2022-01-01', 19),
    ('Mozart Philharmonic', 'Classical', 5400, 'Deutsche Grammophon', '2019-06-15', 20),
    ('Various EDM Artists', 'EDM', 3600, 'Spinnin Records', '2022-03-10', 21),
    ('Yiruma', 'Piano', 3300, 'Sony Music', '2020-09-09', 22),
    ('BlackPink', 'K-Pop', 4000, 'YG Entertainment', '2023-02-02', 23),
    ('Lo-Fi Beats', 'Lo-Fi', 4500, 'Chillhop Music', '2021-12-12', 24);


insert into julytus.dvds (director, disc_type, genre, language, release_date, runtime_minutes, studio, subtitles, product_id)
values
    ('Christopher Nolan', 'BLU_RAY', 'Sci-Fi', 'English', '2020-01-01', 148, 'Warner Bros', 'English, French, Spanish', 25),
    ('Christopher Nolan', 'BLU_RAY', 'Sci-Fi', 'English', '2019-12-12', 169, 'Paramount', 'English, Chinese', 26),
    ('Wachowskis', 'BLU_RAY', 'Sci-Fi', 'English', '2021-07-07', 136, 'Warner Bros', 'English, Japanese', 27),
    ('Francis Ford Coppola', 'DVD', 'Crime', 'English', '2022-02-02', 175, 'Paramount', 'English, Italian', 28),
    ('James Cameron', 'DVD', 'Romance', 'English', '2020-08-15', 195, '20th Century Fox', 'English, Spanish', 29),
    ('Andrew Adamson', 'DVD', 'Animation', 'English', '2019-01-01', 90, 'DreamWorks', 'English', 30);