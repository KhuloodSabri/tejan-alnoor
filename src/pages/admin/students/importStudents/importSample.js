import { Button, Typography } from "@mui/material";
import React from "react";

const sampleData = `اسم الطالب/ة,الجنس,اسم المشرف/ة,المستوى,الدفعة,سنة الانضمام,فصل الانضمام,شهر الانضمام,رقم الهاتف
خلود خالد صبري,أنثى,أسيل صبري,مستوى 2,1,2024,2,1,9701234567
شهد حسونة,أنثى,يارا غزال,مستوى 1,1,2024,1,1,9705993332
محمد برغوثي,ذكر,أحمد نزال,مستوى جزء عم,1,2024,3,1,`;

export default function ImportSample() {
  const handleDownload = () => {
    // Create a Blob from the CSV string
    const blob = new Blob(["\ufeff" + sampleData], {
      type: "text/csv;",
    });

    // Create a link element
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob); // Create a URL for the Blob
    link.href = url;
    link.download = "sample.csv"; // Set the desired file name

    // Append to the document and trigger click
    document.body.appendChild(link);
    link.click(); // Programmatically click the link to trigger download

    // Clean up: remove the link and revoke the object URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Typography variant="caption">
      يمكنك استخدام
      <Button onClick={handleDownload}>
        <Typography variant="caption" fontWeight={700}>
          هذا الملف
        </Typography>
      </Button>
      كنموذج لرفع الطلاب
    </Typography>
  );
}
