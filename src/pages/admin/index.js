import React from "react";
import { Outlet, useLocation, Link as RouterLink } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  colors,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SyncIcon from "@mui/icons-material/Sync";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";
import AuthButton from "../../components/authButton";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading, loginWithPopup, logout } =
    useAuth0();
  const location = useLocation();
  const isRootPage = location.pathname === "/tejan-alnoor/admin";
  const [profileEl, setProfileEl] = React.useState(null);
  const [logoutPopperOpen, setLogoutPopperOpen] = React.useState(false);

  React.useEffect(() => {
    const handleLogin = async () => {
      if (!isAuthenticated && !isLoading) {
        await loginWithPopup();
      }
    };

    handleLogin();
  }, [isAuthenticated, isLoading, loginWithPopup]);

  const handleClick = (event) => {
    setProfileEl(event.currentTarget);
    setLogoutPopperOpen((prev) => !prev);
  };

  console.log("user", user);
  console.log("isAuthenticated", isAuthenticated);
  console.log("isLoading", isLoading);

  if (isLoading || !isAuthenticated) {
    return (
      <Box width="fit-content" mx="auto" mt={10}>
        {!isLoading && (
          <Typography variant="h6">
            يجب تسجيل الدخول. اضغط هنا ل
            <Button onClick={loginWithPopup}>تسجيل الدخول</Button>
          </Typography>
        )}
        {isLoading && (
          <Typography variant="h6">يجب إتمام تسجيل الدخول</Typography>
        )}
        {isLoading && (
          <Box width="fit-content" mx="auto" mt={1}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    );
  }

  if (isAuthenticated) {
    console.log(user);

    if (!user["tejan-alnoor/roles"].includes("admin")) {
      return (
        <Alert severity="error">
          أنت لا تملك صلاحيات الأدمن! بإمكانك التواصل مع مسؤولي الملتقى لمنحك
          الصلاحيات
        </Alert>
      );
    }
    return (
      <Box position="relative">
        <Stack
          position="absolute"
          height={35}
          sx={{
            width: { xs: "calc(100% + 26px)", md: "calc(100% + 76px)" },
            backgroundColor: colors.teal[300],
            top: -38,
            left: { xs: -13, md: -38 },
            borderRadius: "15px 15px 3px 3px",
            px: { xs: 0.5, sm: 1 },
            boxSizing: "border-box",
          }}
          justifyContent={isRootPage ? "end" : "space-between"}
          flexDirection="row"
          alignItems="center"
        >
          {!isRootPage && (
            <Box>
              <IconButton
                component={RouterLink}
                to={`/tejan-alnoor/admin`}
                size="small"
                sx={{
                  color: "white",
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          )}
          <ClickAwayListener onClickAway={() => setLogoutPopperOpen(false)}>
            <Box>
              <Button
                size="small"
                sx={{
                  color: "white",
                  textTransform: "none",
                }}
                endIcon={<PersonIcon />}
                onClick={handleClick}
              >
                {user.name ?? user.email}
              </Button>
              <Popper
                open={logoutPopperOpen}
                anchorEl={profileEl}
                placement="bottom-end"
                transition
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper>
                      <Button
                        onClick={() =>
                          logout({
                            logoutParams: {
                              returnTo: `${window.location.origin}/tejan-alnoor`,
                            },
                          })
                        }
                      >
                        تسجيل الخروج
                      </Button>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </Box>
          </ClickAwayListener>
        </Stack>
        {isRootPage && (
          <Box maxWidth={300} mx="auto">
            <List>
              <ListItem>
                <ListItemButton
                  sx={{
                    backgroundColor: colors.teal[50],
                    color: colors.blue["500"],
                    "&:hover": {
                      backgroundColor: colors.teal[100],
                    },
                  }}
                  component={RouterLink}
                  to="students/exportProgress"
                >
                  <ListItemIcon sx={{ color: colors.blue["500"] }}>
                    <SyncIcon />
                  </ListItemIcon>
                  <ListItemText primary="تحديث قوائم إنجاز الطلاب" />
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton
                  sx={{
                    backgroundColor: colors.teal[50],
                    color: colors.blue["500"],
                    "&:hover": {
                      backgroundColor: colors.teal[100],
                    },
                  }}
                  component={RouterLink}
                  to="students/exportProgress"
                >
                  <ListItemIcon sx={{ color: colors.blue["500"] }}>
                    <PlaylistAddIcon />
                  </ListItemIcon>
                  <ListItemText primary="إضافة قائمة من الطلاب" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        )}
        <Box pt={2} px={{ xs: 1, md: 2 }}>
          <Outlet />
        </Box>
      </Box>
    );
  }

  return null;
}
