LOAD DATA LOCAL INFILE '/Users/davebailes/Documents/Code/FoodPrint/foodprint-backend/src/csv-data/mysql-cronometer.csv'
INTO TABLE Cronometer_Food_Mapping
FIELDS TERMINATED BY '|'
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 15 ROWS
(cronometer_food_name, food_id, @food_name);