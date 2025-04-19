export function getStudentSemesterStartWeek(student, semesterDetails) {
  const joinYear = student.joinYear;
  const joinSemester = student.joinSemester;
  const joinMonth = student.joinMonth;
  let monthsSinceJoin = (semesterDetails.year - joinYear) * 7;

  monthsSinceJoin += (semesterDetails.semester - 1) * 3; // 1 and 2 are 3 months
  monthsSinceJoin -= (joinSemester - 1) * 3; // 1 and 2 are 3 months
  monthsSinceJoin -= joinMonth - 1;

  monthsSinceJoin -= student.frozenSemesters.reduce((acc, semester) => {
    if (
      semester.year >= semesterDetails.year &&
      semester.semester >= semesterDetails.semester
    ) {
      return acc;
    }

    return acc + getSemesterMonthsCount(semester);
  }, 0);

  // This case should not be hit
  return Math.max(monthsSinceJoin * 4, 0);
}

export function getSemesterMonthsCount(semester) {
  return semester.semester === 1 || semester.semester === 2 ? 3 : 1;
}

export function getPrevSemester(semester) {
  if (semester.semester === 1) {
    return {
      year: semester.year - 1,
      semester: 3,
    };
  }

  return {
    year: semester.year,
    semester: semester.semester - 1,
  };
}

export function getNextSemester(semester) {
  if (semester.semester === 3) {
    return {
      year: semester.year + 1,
      semester: 1,
    };
  }

  return {
    year: semester.year,
    semester: semester.semester + 1,
  };
}

export function getSemesterName(semester) {
  if (semester.semester === 1) {
    return `الفصل الأول  ${semester.year}`;
  }

  if (semester.semester === 2) {
    return `الفصل الثاني  ${semester.year}`;
  }

  return `الفصل الصيفي  ${semester.year}`;
}

export const compareSemesters = (semester1, semester2) => {
  if (semester1.year < semester2.year) {
    return -1;
  }

  if (semester1.year > semester2.year) {
    return 1;
  }

  if (semester1.semester < semester2.semester) {
    return -1;
  }

  if (semester1.semester > semester2.semester) {
    return 1;
  }

  if (semester1.month < semester2.month) {
    return -1;
  }

  if (semester1.month > semester2.month) {
    return 1;
  }

  return 0;
};

export const getSemestersMonthsDiff = (semester1, semester2) => {
  let diff = (semester2.year - semester1.year) * 7;
  diff += (semester2.semester - 1) * 3;
  diff -= (semester1.semester - 1) * 3;
  diff += semester2.month;
  diff -= semester1.month;
  return diff;
};
