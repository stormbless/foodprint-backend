LOAD DATA LOCAL INFILE '/Users/davebailes/Documents/Code/FoodPrint/foodprint-backend/src/csv-data/mysql-food.csv'
INTO TABLE Food
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 16 ROWS
(name, category, emissions, water_use, land_use, eutrophication);