create table Food ( 
    food_id int unsigned not null,
    name varchar(100) not null, 
    category varchar(100) not null, 
    emissions decimal(6,2) not null,
    water_use decimal(6,2) not null,
    land_use decimal(6,2) not null,
    eutrophication decimal(6,2) not null,
    PRIMARY KEY (food_id) 
);

create table Cronometer_Food_Mapping ( 
    cronometer_food_id int unsigned not null AUTO_INCREMENT, 
    cronometer_food_name varchar(100) not null, 
    food_id int unsigned not null, 
    PRIMARY KEY (cronometer_food_id), 
    FOREIGN KEY (food_id) references Food(food_id) 
);