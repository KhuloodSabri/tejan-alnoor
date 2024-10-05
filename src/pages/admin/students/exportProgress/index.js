import { Button, Link, Stack, Typography } from "@mui/material";
import React from "react";
import { exportStudentProgress } from "../../../../services/students";
import LoadingButton from "@mui/lab/LoadingButton";
import { useAuth0 } from "@auth0/auth0-react";

export default function ExportProgressPage() {
  const [loading, setLoading] = React.useState(false);
  const [exportUrl, setExportUrl] = React.useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const handleClick = async () => {
    setLoading(true);
    setExportUrl(null);
    const token = await getAccessTokenSilently({
      // authorizationParams: { scope: "openid profile email offline_access" },
    });
    const { spreadsheetId } = await exportStudentProgress(token);
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
