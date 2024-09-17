import { Button, Link, Stack, Typography } from "@mui/material";
import React from "react";
import { exportStudentProgress } from "../../../../services/students";
import LoadingButton from "@mui/lab/LoadingButton";
import { Link as RouterLink } from "react-router-dom";

export default function ExportProgressPage({}) {
  const [loading, setLoading] = React.useState(false);
  const [exportUrl, setExportUrl] = React.useState(null);

  const handleClick = async () => {
    setLoading(true);
    setExportUrl(null);
    const { spreadsheetId } = await exportStudentProgress();
    console.log("eresult", spreadsheetId);
    setExportUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    setLoading(false);
  };
  return (
    <Stack>
      <LoadingButton
        variant="contained"
        loading={loading}
        onClick={handleClick}
      >
        اضغط لتحديث قائمة إنجاز الطلاب
      </LoadingButton>
      {exportUrl && (
        <Typography variant="body1" sx={{ mt: 3, textAlign: "center" }}>
          اضغط{" "}
          <Link href={exportUrl} target="_blank">
            هنا
          </Link>{" "}
          لرؤية القائمة المحدثة
        </Typography>
      )}
    </Stack>
  );
}
