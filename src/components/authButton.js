import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

export default function AuthButton() {
  const { logout, isAuthenticated, loginWithPopup } = useAuth0();

  return (
    <Button
      onClick={() => {
        isAuthenticated
          ? logout({
              logoutParams: {
                returnTo: `${window.location.origin}/tejan-alnoor`,
              },
            })
          : loginWithPopup();
      }}
      fullWidth
    >
      {isAuthenticated ? "تسجيل الخروج" : "تسجيل الدخول"}
    </Button>
  );
}
