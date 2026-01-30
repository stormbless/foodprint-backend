// create timeseries collection that stores user food entries
db.createCollection("user_food_entries", {
   timeseries: {
       timeField: "date",
       metaField: "userEmail",
       granularity: "hours"
    }
})