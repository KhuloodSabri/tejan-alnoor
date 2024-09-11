import logo from "./logo.svg";
import "./App.css";
import { useStudents } from "./services/students";
import FuzzySearch from "fuzzy-search";
import { useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box, Card, colors, Stack } from "@mui/material";
import SearchPage from "./pages/search";
import { createTheme, ThemeProvider, Theme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
import StudenPage from "./pages/student";
import { useNavigate } from "react-router-dom";

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

            <Card
              elevation={8}
              sx={{
                maxWidth: 700,
                mx: "auto",
                mt: 2,
                py: 5,
                px: { xs: 2, md: 5 },
                boxSizing: "border-box",
                minWidth: "min(600px, calc(100vw - 40px))",
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
                {/* <Route path="/contact" element={<Contact />} /> */}
              </Routes>
            </Card>
          </Stack>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
