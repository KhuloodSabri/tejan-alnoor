export const getPositiveProgressPrefix = (student) => {
  return student.gender === "male" ? "أتم الطالب " : "أتمت الطالبة ";
};

export const getNegativeProgressPrefix = (student) => {
  return student.gender === "male" ? "لم يتم الطالب " : "لم تتم الطالبة ";
};

export const getStudentDescription = (student) => {
  return student.gender === "male" ? "طالب" : "طالبة";
};
