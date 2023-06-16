-- public.category definition
CREATE TABLE IF NOT EXISTS public.category(
	id serial NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	CONSTRAINT category_pk PRIMARY KEY (id)
);

-- public.user definition
CREATE TABLE IF NOT EXISTS public."user" (
	id serial NOT NULL,
	username varchar(30) NOT NULL,
	"password" varchar(50) NOT NULL,
	email varchar(60) NOT NULL,
	"name" varchar(100) NOT NULL,
	balance numeric(10,2) NOT NULL DEFAULT 0.00,
	tax_id varchar(10) NULL,
	CONSTRAINT user_pk PRIMARY KEY (id)
);


-- public.item definition
CREATE TABLE IF NOT EXISTS public.item (
	id serial NOT NULL,
	"name" text NOT NULL,
	category_id int NOT NULL,
	owner_id int NOT NULL,
	description text NULL,
	price numeric(10,2) NOT NULL,
	quantity int NOT NULL,
	CONSTRAINT item_pk PRIMARY KEY (id),
	CONSTRAINT item_fk_cat FOREIGN KEY (category_id) REFERENCES public.category(id),
	CONSTRAINT item_fk_user FOREIGN KEY (owner_id) REFERENCES public."user"(id)
);


-- public."order" definition
CREATE TABLE IF NOT EXISTS public."order" (
	id serial NOT NULL,
	user_id int NOT NULL,
	paid bool NOT NULL DEFAULT false,
	delivery_address text NULL,
	CONSTRAINT order_pk PRIMARY KEY (id),
	CONSTRAINT order_fk_user FOREIGN KEY (user_id) REFERENCES public."user"(id)
);


-- public.order_content definition
CREATE TABLE IF NOT EXISTS public.order_content (
	order_id int NOT NULL,
	item_id int NOT NULL,
	quantity int NOT NULL DEFAULT 1,
	CONSTRAINT order_content_fk_item FOREIGN KEY (item_id) REFERENCES public.item(id),
	CONSTRAINT order_content_fk_order FOREIGN KEY (order_id) REFERENCES public."order"(id)
);