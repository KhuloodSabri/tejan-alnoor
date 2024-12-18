import { Box, ListItem, ListItemText } from "@mui/material";
import React, { useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { levels } from "../utils/levels";

export default function SearchStudentResultItem({
  option,
  optionPath,
  ...props
}) {
  const navigate = useNavigate();

  const handleOptionClick = useCallback(() => {
    const existingList = JSON.parse(
      localStorage.getItem("recent-seraches") ?? "[]"
    );

    const newList = [
      option.studentID,
      ...existingList.filter((studentID) => studentID !== option.studentID),
    ]
      .filter((x) => !_.isEmpty(`${x}`))
      .slice(0, 7);

    localStorage.setItem("recent-seraches", JSON.stringify(newList));
  }, [option?.studentID]);

  if (!option) return null;

  return (
    <ListItem
      {...props}
      onClick={() => {
        navigate(optionPath);
        handleOptionClick();
      }}
    >
      <Box width="100%">
        <ListItemText
          primary={
            <MuiLink
              component={RouterLink}
              to={optionPath}
              sx={{ textDecoration: "none" }}
              onClick={() => handleOptionClick()}
            >
              {option.studentName}
            </MuiLink>
          }
          secondary={`${levels[option.levelID]} - المشرفـ/ـة ${
            option.supervisorName
          }`}
          primaryTypographyProps={{ variant: "h6" }}
        />
      </Box>
    </ListItem>
  );
}
