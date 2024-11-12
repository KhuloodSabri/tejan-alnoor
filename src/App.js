import "./App.css";

import React, { useEffect } from "react";
import { Routes, Route, Link as RouterLink } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  ClickAwayListener,
  colors,
  Fade,
  IconButton,
  Paper,
  Popper,
  Stack,
} from "@mui/material";
import SearchPage from "./pages/search";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
import StudenPage from "./pages/student";
import { useNavigate } from "react-router-dom";
import ExportProgressPage from "./pages/admin/students/exportProgress";
import AuthProvider from "./components/authProvider";
import AdminPage from "./pages/admin";
import MenuIcon from "@mui/icons-material/Menu";
import AuthButton from "./components/authButton";
import ImportStudents from "./pages/admin/students/importStudents";
import EditStudentsPage from "./pages/admin/students/editStudents";
import EditStudentPage from "./pages/admin/students/editStudents/editStudent";

// Create rtl cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: "rtl",
});

function App() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuEl, setMenuEl] = React.useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const redirect = params.get("redirect");
    if (redirect) {
      navigate(redirect);
    }
  }, [navigate]);

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <div dir="rtl">
            <Stack
              sx={{
                background: `linear-gradient(to bottom, ${colors.teal[50]}, 30%, ${colors.teal[300]})`,
                minHeight: "100vh",
              }}
            >
              <Box sx={{ maxWidth: 250, maxHeight: 250, mx: "auto", mt: 2 }}>
                <img
                  src="/tejan-alnoor/logo2.png"
                  alt="logo"
                  style={{ maxWidth: "100%" }}
                />
              </Box>

              <Box
                maxWidth={`calc(100vw - 30px)`}
                mx="auto"
                position={"relative"}
                boxSizing={"border-box"}
              >
                <Box position="absolute" top={-170}>
                  <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                    <Box>
                      <IconButton
                        onClick={(event) => {
                          setMenuEl(event.currentTarget);
                          setMenuOpen((prev) => !prev);
                        }}
                      >
                        <MenuIcon />
                      </IconButton>
                      <Popper
                        open={menuOpen}
                        anchorEl={menuEl}
                        placement="bottom-start"
                        transition
                      >
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps} timeout={350}>
                            <Paper>
                              <Box>
                                <Button
                                  fullWidth
                                  component={RouterLink}
                                  to="/tejan-alnoor"
                                >
                                  الصفحة الرئيسية
                                </Button>
                              </Box>
                              <Box>
                                <Button
                                  fullWidth
                                  component={RouterLink}
                                  to="/tejan-alnoor/admin"
                                >
                                  صفحة الأدمن
                                </Button>
                              </Box>
                              <Box>
                                <AuthButton />
                              </Box>
                            </Paper>
                          </Fade>
                        )}
                      </Popper>
                    </Box>
                  </ClickAwayListener>
                </Box>
                <Card
                  elevation={8}
                  sx={{
                    maxWidth: `min(1000px, 100%)`,
                    mx: "auto",
                    mt: 2,
                    py: 5,
                    px: { xs: 2, md: 5 },
                    boxSizing: "border-box",
                    minWidth: "min(600px, calc(100vw - 30px))",
                    borderRadius: 4,
                    minHeight: "calc(100vh - 250px)",
                  }}
                >
                  <Routes>
                    <Route path="/tejan-alnoor" element={<SearchPage />} />
                    <Route
                      path="/tejan-alnoor/students/:studentId"
                      element={<StudenPage />}
                    />

                    <Route path="/tejan-alnoor/admin" element={<AdminPage />}>
                      <Route
                        path="students/exportProgress"
                        element={<ExportProgressPage />}
                      />
                      <Route
                        path="students/importStudents"
                        element={<ImportStudents />}
                      />
                      <Route
                        path="students/editStudents"
                        element={<EditStudentsPage />}
                      />
                      <Route
                        path="students/editStudents/:studentId"
                        element={<EditStudentPage />}
                      />
                    </Route>
                  </Routes>
                </Card>
              </Box>
            </Stack>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
