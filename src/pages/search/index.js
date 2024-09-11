import {
  Autocomplete,
  Box,
  colors,
  Divider,
  lighten,
  List,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import _ from "lodash";
import { useStudents } from "../../services/students";
import FuzzySearch from "fuzzy-search";
import SearchResultItem from "./searchResultItem";
import { normalizeString } from "../../utils/string";

export default function SearchPage() {
  const { data: students, loading } = useStudents(); // This will fetch the data from the Google Sheet

  const recentSearches = JSON.parse(
    localStorage.getItem("recent-seraches") ?? "[]"
  );

  console.log("recentSearches", recentSearches);

  const filterOptions = (options, { inputValue }) => {
    const normalizedOptions =
      options.map((option) => ({
        ...option,
        normalizedName: normalizeString(option.studentName),
        normalizedSupervisorName: normalizeString(option.supervisorName),
      })) ?? [];

    const searcher = new FuzzySearch(
      normalizedOptions,
      [
        "studentName",
        "normalizedName",
        "supervisorName",
        "normalizedSupervisorName",
      ],
      {
        caseSensitive: true,
        sort: true,
      }
    );
    return searcher.search(normalizeString(inputValue));
  };

  return (
    <Stack>
      <Autocomplete
        dir="rtl"
        disablePortal
        options={students}
        sx={{ width: "100%" }}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="ابحثـ/ـي عن طالبـ/ـة باستخدام اسمهـ/ـا أو اسم المشرفـ/ـة"
            variant="standard"
          />
        )}
        getOptionLabel={(option) => option.studentName}
        filterOptions={filterOptions}
        renderOption={(props, option) => (
          <Box key={props.key}>
            <SearchResultItem option={option} {..._.omit(props, "key")} />
            <Divider />
          </Box>
        )}
      />

      {recentSearches.length > 0 && (
        <Stack
          mt={7}
          py={3}
          bgcolor={lighten(colors.teal[50], 0.3)}
          borderRadius={1}
        >
          <Typography
            variant="h5"
            sx={{
              px: 2,
              width: "fit-content",
              pr: 5,
            }}
          >
            قمت بالبحث مؤخراً
            <Divider />
          </Typography>

          <List>
            {recentSearches.map((id) => (
              <Box key={id}>
                <SearchResultItem
                  option={students.find(
                    (student) => student.studentID === Number(id)
                  )}
                  sx={{ px: 2 }}
                />
              </Box>
            ))}
          </List>
        </Stack>
      )}
    </Stack>
  );
}
