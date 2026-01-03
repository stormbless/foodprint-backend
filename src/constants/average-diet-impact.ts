// average australian's diet's impact per day on environmental metrics: 
  // greenhouse gas emissions (kg of CO2 equivalents)
  // water use (L)
  // land use (m2)
  // eutrophication (grams of PO4 equivalents)
  
const AVERAGE_DIET_IMPACT = {
  emissionsPerDay: 14.5,
  waterUsePerDay: 681.9, // estimated from abs food group data + our world in data
  landUsePerDay: 28.23, // estimtated from abs food group data + our world in data
  eutrophicationPerDay: 31.5,
  totalPerDay: 1 // total impact measured in number of average diet impact days (e.g. twice avg impact is 2)
};

export default AVERAGE_DIET_IMPACT;