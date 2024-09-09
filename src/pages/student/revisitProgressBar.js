import {
  Box,
  colors,
  lighten,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { commulativeSuar } from "../../utils/surah";
import { arabicNumbers, translateNumberToArabic } from "../../utils/numbers";

function ProgressLabel({ position, text }) {
  return (
    <Box
      boxSizing="border-box"
      sx={{
        position: "absolute",
        borderLeft: `2px solid ${colors.teal["A700"]}`,
        left: position,
        backgroundColor: colors.common.white,
      }}
    >
      <Typography
        variant="subtitle2"
        lineHeight={1}
        whiteSpace="nowrap"
        fontSize={{ xs: 13, sm: 14 }}
        component="div"
        color={colors.teal["400"]}
        sx={{
          mt: "auto",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          rotate: "-180deg",
          py: 2,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

export default function revisitProgressBar({ student }) {
  const getAyahProgressDetails = (progress) => {
    const surah = commulativeSuar.findLast(
      (item) => item.commulativeOffset <= progress
    );
    const ayah = progress - surah.commulativeOffset + 1; // starts from 1
    return { surah: surah.surah, ayah };
  };

  const rangesWithDetails = (student.revisitProgress ?? []).map((range) => [
    {
      offset: range[0] - student.start,
      ...getAyahProgressDetails(range[0]),
    },
    {
      offset: range[1] - student.start,
      ...getAyahProgressDetails(range[1]),
    },
  ]);

  const total = student.end - student.start + 1;

  return (
    <Box width="100%">
      <Box
        minWidth="100%"
        minHeight={50}
        mt={5}
        sx={{
          border: `2px solid ${colors.teal["A700"]}`,
          borderRadius: 3,
        }}
        position="relative"
      >
        {rangesWithDetails.map((range) => (
          <Tooltip
            key={range[0].offset}
            // title={`أتمت الطالبة المراجعة من ${
            //   surah.find(({ id }) => id === ranges[index]?.from?.id)?.surah
            // }`}
          >
            <Box
              key={range[0].offset}
              bgcolor={lighten(colors.teal["A700"], 0.85)}
              position={"absolute"}
              left={(range[0].offset / total) * 100 + "%"}
              width={
                ((range[1].offset - range[0].offset + 1) / total) * 100 + "%"
              } // inclusive
              minHeight={50}
              borderRadius={
                range[0].offset === 0
                  ? "10px 0 0 10px"
                  : range[1].offset === total
                  ? "0 10px 0 10px"
                  : 0
              }
            ></Box>
          </Tooltip>
        ))}
      </Box>
      <Stack minWidth="100%" position="relative">
        {rangesWithDetails.map((range) => (
          <Box key={range[0].offset}>
            <ProgressLabel
              position={`calc(${(range[0].offset / total) * 100}% + 2px);`} // 2px for border
              text={`${range[0].surah} (${translateNumberToArabic(
                range[0].ayah
              )})`}
            />
            <ProgressLabel
              position={`${((range[1].offset + 1) / total) * 100}%`}
              text={`${range[1].surah} (${translateNumberToArabic(
                range[1].ayah
              )})`}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
