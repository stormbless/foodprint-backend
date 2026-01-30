// create/use database foodprint;
use foodprint;
// create timeseries collection that stores user food entries
db.createCollection("user_food_entries", {
   timeseries: {
       timeField: "date",
       metaField: "userEmail",
       granularity: "hours"
    }
})