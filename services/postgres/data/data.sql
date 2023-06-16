INSERT INTO public.category (id,"name", description) VALUES
    (1,'Household supplies','sample text sample text sample text'),
    (2,'Computer parts','Lorem Ipsum lores im damet'),
    (3,'Building materials',''),
    (4,'Entertainment',''),
    (5,'Alcohol','');

INSERT INTO public."user" (id,username,"password",email,"name",balance,tax_id) VALUES
    (1,'neterpila1','my_password','neterpila1@foo.bar','Grzegorz Testowski',4567.11,NULL),
    (2,'neterpila2','my_password','neterpila2@foo.bar','Michał Debuggowski',234.23,NULL),
    (3,'neterpila3','my_password','neterpila3@foo.bar','Jakub Kowalski',345.876,NULL),
    (4,'neterpila4','my_password','neterpila4@foo.bar','Imien Nazwiskowski',6567.89,NULL);

INSERT INTO public.item (id,"name",category_id,description,owner_id,price,quantity) VALUES
    (1,'Cegła (szt.)',3,'Cegła zwykła',2,0.80,90),
    (2,'NVIDIA RTX 3090Ti',2,'uuuuu',2,2983.00,2),
    (3,'Zestaw Lego Rynek Glówny',4,'Coś tam w opisie',3,200.00,4),
    (4,'Captain Morgan Spiced Gold',5,'Zamiksuj z Coca Colą',3,59.20,40);

INSERT INTO public."order" (id,user_id,paid,delivery_address) VALUES
    (1,1,false,'Kraków, ul. Kowala Kowalskiego 12b'),
    (2,4,false,'Kraków, ul. Kowala Kowalskiego 13a');

INSERT INTO public.order_content (order_id,item_id,quantity) VALUES
    (1,1,23),
    (1,2,1),
    (2,1,5),
    (2,3,1),
    (2,4,2);