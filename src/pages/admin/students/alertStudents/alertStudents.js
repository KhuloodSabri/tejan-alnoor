// src/pages/StudentAlertsPage.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  Container,
  Box,
  Typography,
  Checkbox,
  Button,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import _ from "lodash";
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/admin"
    : "https://dtoo4lhm5ojwgql5xfxpmo6nru0alhkp.lambda-url.eu-north-1.on.aws";
const buildStudentsUrl = (params) => {
  const url = new URL(`${BASE_URL}/students/alerts`, window.location.origin);
  url.searchParams.set("year", params.year);
  url.searchParams.set("semester", params.semester);
  url.searchParams.set("month", params.month);
  url.searchParams.set("checkRoundNumber", params.checkRoundNumber);
  url.searchParams.set("gender", params.gender);
  return url.toString();
};

async function fetchStudentsAPI(
  { year, semester, month, checkRoundNumber, gender },
  token
) {
  const url = buildStudentsUrl({
    year,
    semester,
    month,
    checkRoundNumber,
    gender,
  });

  const res = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return Array.isArray(res.data) ? res.data : [];
}

async function submitAlertsAPI(payloadArray, token) {
  const res = await axios.post(`${BASE_URL}/alertStudents`, payloadArray, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

async function submitUpdateAlertAPI(alertId, payload, token) {
  const res = await axios.put(`${BASE_URL}/alerts/${alertId}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, i) => String(currentYear - i));

const semesters = [
  { value: "1", label: "الأول" },
  { value: "2", label: "الثاني" },
  { value: "3", label: "الصيفي" },
];

const months = Array.from({ length: 3 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const checkRounds = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
];

const genders = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
];

const StudentAlertsPage = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [filters, setFilters] = useState({
    year: "",
    semester: "",
    month: "",
    checkRoundNumber: "",
    gender: "",
  });

  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkedRows, setCheckedRows] = useState([]);
  const [recoverSubmittingRows, setRecoverSubmittingRows] = useState([]);

  const isFiltersValid = useMemo(() => {
    return (
      filters.year !== "" &&
      filters.semester !== "" &&
      filters.month !== "" &&
      filters.checkRoundNumber !== "" &&
      filters.gender !== ""
    );
  }, [filters]);

  const handleLoad = async () => {
    if (!isFiltersValid) return;
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const data = await fetchStudentsAPI(filters, token);
      // Same student can have two alerts (from memorizing and visit)
      const normalized = data.map((s, idx) => ({
        id: `row-${idx}`,
        studentID: s.studentID ?? s.id ?? `S-${idx}`,
        studentName: s.studentName ?? s.name ?? "—",
        supervisorName: s.supervisorName ?? s.supervisor ?? "—",
        phoneNumber: s.phoneNumber ?? s.phone ?? "—",
        alertType: s.alertType ?? "—",
        alertSource: s.alertSource ?? "—",
        gender: s.gender ?? "—",
        alertId: s.alertId || null,
        alertRecoveredAt: s.alertRecoveredAt || null,
      }));
      setRows(normalized);
      setCheckedRows([]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (id) => {
    setCheckedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submissionPayload = useMemo(() => {
    const nowUnix = Math.floor(Date.now() / 1000);

    return rows
      .filter((r) => checkedRows.includes(r.id))
      .map((r) => ({
        studentID: r.studentID,
        createdAt: nowUnix,
        alertType: r.alertType ?? "—",
        alertSource: r.alertSource ?? "—",
        year: Number(filters.year || currentYear),
        semester: Number(filters.semester || 1),
        month: Number(filters.month || 1),
        checkRoundNumber: Number(filters.checkRoundNumber || 1),
        alertId: r.alertId || null,
        alertRecoveredAt: r.alertRecoveredAt || null,
      }));
  }, [rows, checkedRows, filters]);

  const handleSubmitAlerts = async () => {
    if (submissionPayload.length === 0) return;
    try {
      const token = await getAccessTokenSilently();

      setSubmitting(true);
      await submitAlertsAPI(submissionPayload, token);
      alert("تم إرسال التنبيهات بنجاح ✅");
      setCheckedRows([]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
      handleLoad();
    }
  };

  const handleToggleRecovered = async (id, value) => {
    const row = rows.find((r) => r.id === id);

    if (!row?.alertId) {
      return;
    }

    try {
      setRecoverSubmittingRows((prev) => [...prev, id]);
      const token = await getAccessTokenSilently();
      await submitUpdateAlertAPI(
        row.alertId,
        {
          recoveredAt: value ? Math.floor(Date.now() / 1000) : null,
        },
        token
      );
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, alertRecoveredAt: value ? Date.now() : null }
            : r
        )
      );
    } catch (err) {
      console.error(err);
      window.alert(
        `حدث خطأ أثناء تحديث حالة المعالجة للطالبـ/ـة ${row.studentName}`
      );
    } finally {
      setRecoverSubmittingRows((prev) => prev.filter((x) => x !== id));
    }
  };

  const columns = [
    {
      field: "studentName",
      headerName: "اسم الطالب",
      width: 150,
      renderCell: (params) => (
        <Box height="100%" display="flex" alignItems="center">
          <Typography
            onClick={() =>
              navigate(
                `/tejan-alnoor/admin/editStudents/${params.row.studentID}`
              )
            }
            sx={{ color: "primary.main", cursor: "pointer" }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    { field: "supervisorName", headerName: "اسم المشرف" },
    { field: "phoneNumber", headerName: "رقم الهاتف", width: 160 },
    { field: "alertType", headerName: "الحالة" },
    { field: "alertSource", headerName: "المصدر" },
    {
      field: "gender",
      headerName: "الجنس",
      width: 110,
      valueFormatter: ({ value }) =>
        value === "male" ? "ذكر" : value === "female" ? "أنثى" : value,
    },
    {
      field: "select",
      headerName: "اختيار للإرسال",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (params.row.alertId) {
          return (
            <Box height="100%" display="flex" alignItems="center">
              <Typography color="success.main">أُرسِل سابقا</Typography>
            </Box>
          );
        }
        return (
          <Checkbox
            checked={checkedRows.includes(params.row.id)}
            onChange={() => handleCheck(params.row.id)}
          />
        );
      },
    },
    {
      field: "recoveredAt",
      headerName: "معالجة الطالب",

      renderHeader: () => (
        <Tooltip
          title="هل عالج الطالب هذا التنبيه؟ (مثلا إذا كان الطالب مقصرا في المراجعة، هل نجح في الامتحان بعلامة فوق 95، أو هل اتدارك ما عليه)"
          arrow
        >
          <span>معالجة الطالب</span>
        </Tooltip>
      ),
      renderCell: (params) => {
        if (!params.row.alertId) {
          return (
            <Box height="100%" width="100%" display="flex" alignItems="center">
              <Typography sx={{ mx: "auto" }} color="text.secondary">
                لم يرسل بعد
              </Typography>
            </Box>
          );
        }
        const isLoading = recoverSubmittingRows.includes(params.row.id);

        if (isLoading) {
          return (
            <Box height="100%" width="100%" display="flex" alignItems="center">
              <CircularProgress size={20} sx={{ mx: "auto" }} />
            </Box>
          );
        }

        return (
          <Box height="100%" width="100%" display="flex" alignItems="center">
            <ToggleButtonGroup
              value={Boolean(params.row.alertRecoveredAt)}
              exclusive
              onChange={(_event, newValue) => {
                if (_.isNil(newValue)) return;
                handleToggleRecovered(params.row.id, newValue);
              }}
              sx={{ mx: "auto" }}
            >
              <ToggleButton
                value={true}
                disabled={!params.row.alertId}
                color="success"
                size="small"
                sx={{ minWidth: 28, height: 28, p: 0 }}
              >
                <CheckIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton
                value={false}
                disabled={!params.row.alertId}
                color="error"
                size="small"
                sx={{ minWidth: 28, height: 28, p: 0 }}
              >
                <CloseIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        );
      },
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      {/* Filters / Query Params */}
      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          عوامل التصفية
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="السنة"
              value={filters.year}
              onChange={(e) =>
                setFilters((f) => ({ ...f, year: e.target.value }))
              }
              fullWidth
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="الفصل"
              value={filters.semester}
              onChange={(e) =>
                setFilters((f) => ({ ...f, semester: e.target.value }))
              }
              fullWidth
            >
              {semesters.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="الشهر"
              value={filters.month}
              onChange={(e) =>
                setFilters((f) => ({ ...f, month: e.target.value }))
              }
              fullWidth
            >
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="جولة التحقق"
              value={filters.checkRoundNumber}
              onChange={(e) =>
                setFilters((f) => ({ ...f, checkRoundNumber: e.target.value }))
              }
              fullWidth
            >
              {checkRounds.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="الجنس"
              value={filters.gender}
              onChange={(e) =>
                setFilters((f) => ({ ...f, gender: e.target.value }))
              }
              fullWidth
            >
              {genders.map((g) => (
                <MenuItem key={g.value} value={g.value}>
                  {g.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Search button */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                onClick={handleLoad}
                disabled={!isFiltersValid || loading}
              >
                بحث
              </Button>
              {!isFiltersValid && (
                <Typography variant="body2" sx={{ alignSelf: "center" }}>
                  يرجى اختيار جميع القيم.
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Grid */}
      <Box sx={{ height: 450, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>

      {/* Submit */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          disabled={checkedRows.length === 0 || submitting}
          onClick={handleSubmitAlerts}
        >
          إرسال التنبيهات للطلاب المحددين
        </Button>
      </Stack>
    </Container>
  );
};

export default StudentAlertsPage;
