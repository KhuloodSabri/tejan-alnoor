import * as React from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { colors, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const columns = [
  {
    field: "inputStudentName",
    headerName: "الاسم في الملف المدخل",
    width: 170,
    editable: true,
  },
  {
    field: "inputPhoneNumber",
    headerName: "رقم الجوال في الملف المدخل",
    width: 150,
    editable: true,
  },
  {
    field: "studentName",
    headerName: "الاسم في قاعدة البيانات",
    width: 170,
    editable: true,
  },
  {
    field: "phoneNumber",
    headerName: "رقم الجوال في قاعدة البيانات",
    width: 150,
    editable: true,
  },
  {
    field: "status",
    headerName: "الحالة",
    // type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "link",
    headerName: "",
    // type: "number",
    width: 60,
    editable: true,
    renderCell: (params) => {
      return (
        <IconButton
          component={RouterLink}
          to={`/tejan-alnoor/students/${params.row.studentID}`}
          target="blank"
        >
          <OpenInNewIcon />
        </IconButton>
      );
    },
  },
];

export default function StudentsTable({ students, setSelectedStudentIds }) {
  const handleSelection = (newSelection) => {
    setSelectedStudentIds(newSelection);
  };
  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={students}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 7,
            },
          },
        }}
        pageSizeOptions={[5, 7, 10, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={handleSelection}
        sx={{
          ".MuiDataGrid-columnHeader": {
            backgroundColor: colors.teal["50"],
          },
        }}
      />
    </Box>
  );
}
