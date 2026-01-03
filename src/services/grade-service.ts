interface Impact {
  emissions: number,
  waterUse: number,
  landUse: number,
  eutrophication: number,
  total: number
}

interface Grades {
  emissionsGrade: string,
  waterUseGrade: string,
  landUseGrade: string,
  eutrophicationGrade: string,
  overallGrade: string
}

//..................PRIVATE METHODS............

function calcGrade(percentageOfAvg: number): string {
  
  if (percentageOfAvg > 200) {
    return 'D-';
  } else if (percentageOfAvg > 150) {
    return 'D';
  } else if (percentageOfAvg > 125) {
    return 'D+';
  } else if (percentageOfAvg > 100) {
    return 'C-';
  } else if (percentageOfAvg === 100) {
    return 'C';
  } else if (percentageOfAvg > 85) {
    return 'C+';
  } else if (percentageOfAvg > 75) {
    return 'B-';
  } else if (percentageOfAvg > 65) {
    return 'B';
  } else if (percentageOfAvg > 60) {
    return 'B+';
  } else if (percentageOfAvg > 55) {
    return 'A-';
  } else if (percentageOfAvg > 50) {
    return 'A';
  } else {
    return 'A+';
  } 
}

//..................PUBLIC METHODS............

function calcGrades(percentageOfAvg: Impact): Grades {
  const emissionsGrade: string = calcGrade(percentageOfAvg.emissions);
  const waterUseGrade: string = calcGrade(percentageOfAvg.waterUse);
  const landUseGrade: string = calcGrade(percentageOfAvg.landUse);
  const eutrophicationGrade: string = calcGrade(percentageOfAvg.eutrophication);

  const overallGrade: string = calcGrade(percentageOfAvg.total);

  return {
    emissionsGrade,
    waterUseGrade,
    landUseGrade,
    eutrophicationGrade,
    overallGrade
  };
}


export default {
  calcGrades,
};