import _ from "lodash";
import { getLevelMemorizingDirection } from "./levels";
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
  let startWeek = Math.max(monthsSinceJoin * 4, 0);

  startWeek += (semesterDetails.month - 1) * 4; // 4 weeks in a month

  if (
    student.joinYear === semesterDetails.year &&
    student.joinSemester === semesterDetails.semester
  ) {
    startWeek -= (student.joinMonth - 1) * 4;
  }

  return startWeek;
}

export function getStudentSemesterLevelID(student, semesterDetails) {
  const sortedChanges = (student.levelChanges ?? []).sort((a, b) =>
    compareSemesters(a.semester, b.semester)
  );

  const prevLevelChange = sortedChanges.find((levelChange) => {
    return compareSemesters(levelChange.semester, semesterDetails) <= 0;
  });

  if (prevLevelChange) {
    return prevLevelChange.toLevelID;
  }

  const nextLevelChange = sortedChanges.find((levelChange) => {
    return compareSemesters(levelChange.semester, semesterDetails) > 0;
  });

  if (nextLevelChange) {
    return nextLevelChange.fromLevelID;
  }

  return student.levelID;
}

export function getStudentSemesterLevelChangesPlanShift(
  student,
  semesterDetails,
  levels
) {
  const sortedChanges = (student.levelChanges ?? []).sort((a, b) =>
    compareSemesters(a.semester, b.semester)
  );

  const lastLevelChange = sortedChanges.findLast((levelChange) => {
    return compareSemesters(levelChange.semester, semesterDetails) <= 0;
  });

  if (!lastLevelChange) {
    return 0;
  }

  const levelsMap = _.keyBy(levels, (level) => level.levelID);

  let newLevelPlanStartMonth = 0;
  //levelID 0 has different memorizing direction than other levels
  if (
    getLevelMemorizingDirection(lastLevelChange.toLevelID) !==
    getLevelMemorizingDirection(lastLevelChange.fromLevelID)
  ) {
    const prevChangeFromSameDirection = sortedChanges.find((levelChange) => {
      // needs to be before
      if (
        compareSemesters(levelChange.semester, lastLevelChange.semester) >= 0
      ) {
        return false;
      }

      return (
        getLevelMemorizingDirection(lastLevelChange.toLevelID) ===
        getLevelMemorizingDirection(levelChange.fromLevelID)
      );
    });

    if (prevChangeFromSameDirection) {
      newLevelPlanStartMonth = levelsMap[
        lastLevelChange.toLevelID
      ].monthsPlanByPage.findIndex(
        (monthProgress) =>
          prevChangeFromSameDirection.memorizingProgress < monthProgress
      );
    } else {
      newLevelPlanStartMonth = 0;
    }
  } else {
    newLevelPlanStartMonth = levelsMap[
      lastLevelChange.toLevelID
    ].monthsPlanByPage.findIndex(
      (monthProgress) => lastLevelChange.memorizingProgress < monthProgress
    );
  }

  const lastLevelChangeStartWeek = getStudentSemesterStartWeek(student, {
    year: lastLevelChange.semester.year,
    semester: lastLevelChange.semester.semester,
    month: lastLevelChange.semester.month,
  });

  let shift = newLevelPlanStartMonth * 4 - lastLevelChangeStartWeek;
  return shift;
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
