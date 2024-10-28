import { Link, Stack, Typography } from "@mui/material";
import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useAuth0 } from "@auth0/auth0-react";

export default function UpdateListButton({ buttonText, submit }) {
  const [loading, setLoading] = React.useState(false);
  const [exportUrl, setExportUrl] = React.useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const handleClick = async () => {
    setLoading(true);
    setExportUrl(null);
    const token = await getAccessTokenSilently({});
    const { spreadsheetId } = await submit(token);
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
        {buttonText}
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
