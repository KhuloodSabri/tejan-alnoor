import { Button } from "@mui/material";
import React, { useCallback } from "react";
import Papa from "papaparse";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";

export default function StudentsDownload({ students, text }) {
  const mapStudentsToRows = useCallback(() => {
    return students.map((student) => {
      return {
        "اسم الطالب/ة": student.studentName,
        الجنس: student.gender === "male" ? "ذكر" : "أنثى",
        "اسم المشرف/ة": student?.supervisorName,
        المستوى: student?.level,
        الدفعة: student?.groupNumber,
        "سنة الانضمام": student?.joinYear,
        "فصل الانضمام": student?.joinSemester,
        "شهر الانضمام": student?.joinMonth,
        "رقم الهاتف": student?.phoneNumber,
      };
    });
  }, [students]);

  const handleDownload = () => {
    // Create a Blob from the CSV string
    const blob = new Blob(
      ["\ufeff" + Papa.unparse(mapStudentsToRows(students))],
      {
        type: "text/csv;",
      }
    );

    // Create a link element
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob); // Create a URL for the Blob
    link.href = url;
    link.download = "الطلاب غير المضافين.csv"; // Set the desired file name

    // Append to the document and trigger click
    document.body.appendChild(link);
    link.click(); // Programmatically click the link to trigger download

    // Clean up: remove the link and revoke the object URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<SimCardDownloadIcon />}
      onClick={handleDownload}
      sx={{ boxShadow: "none" }}
    >
      {text}
    </Button>
  );
}
