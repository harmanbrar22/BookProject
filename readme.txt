// Query to form a table in database
    
		create table booksread(
	    bookid SERIAL PRIMARY KEY,
	    title VARCHAR(50) UNIQUE NOT NULL,	
	    coverid INTEGER,
		author varchar(50)
    	);
		
create table booksreview (
		reviewid SERIAL PRIMARY KEY,
		bookid integer references booksread(bookid),
		review text,
		rating numeric(2,1) check (rating>0 and rating<=5),
		date timestamp DEFAULT CURRENT_TIMESTAMP
	);

