CREATE TABLE blogs(
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes INT NOT NULL DEFAULT 0
);

insert into blogs (author, url, title, likes) values ('Sally Rooney', 'https://www.goodreads.com/book/show/208931300-intermezzo', 'Intermezzo', 9);
insert into blogs (author, url, title, likes) values ('Percival Everett', 'https://www.goodreads.com/book/show/173754979-james', 'James', 3);