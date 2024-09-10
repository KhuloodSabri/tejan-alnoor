import {
  Box,
  ClickAwayListener,
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
          fontWeight: 700,
          letterSpacing: 0.6,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

export default function RevisitProgressBar({ student }) {
  const [hintIndexOpen, setHintIndexOpen] = React.useState(null);

  const getAyahProgressDetails = (progress) => {
    const surah = commulativeSuar.findLast(
      (item) => item.commulativeOffset <= progress
    );
    const ayah = progress - surah.commulativeOffset + 1; // starts from 1
    return { surah: surah.surah, ayah };
  };

  const getPrgoressLabel = (progress) => {
    if (student.progressUnit === "ayah") {
      return `${progress.surah} (${translateNumberToArabic(progress.ayah)})`;
    }

    return `صفــ ${translateNumberToArabic(progress.page)} ــحة`;
  };

  const getHint = (progressRange) => {
    let prefix = "أتم الطالب";
    if (student.gender === "female") {
      prefix = "أتمت الطالبة";
    }

    if (student.progressUnit === "ayah") {
      return `${prefix} مراجعة الآيات من سورة ${
        progressRange[0].surah
      } آية (${translateNumberToArabic(progressRange[0].ayah)}) إلى سورة ${
        progressRange[1].surah
      } آية (${translateNumberToArabic(progressRange[1].ayah)})`;
    }

    return `${prefix} مراجعة الصفحات من صفحة ${translateNumberToArabic(
      progressRange[0].page
    )} إلى صفحة ${translateNumberToArabic(progressRange[1].page)}`;
  };

  const rangesWithDetails = (student.revisitProgress ?? []).map((range) => [
    {
      offset: range[0] - student.start,
      ...(student.progressUnit === "ayah"
        ? getAyahProgressDetails(range[0])
        : { page: range[0] }),
    },
    {
      offset: range[1] - student.start,
      ...(student.progressUnit === "ayah"
        ? getAyahProgressDetails(range[1])
        : { page: range[1] }),
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
        {rangesWithDetails.map((range, index) => (
          <ClickAwayListener
            key={range[0].offset}
            onClickAway={() => {
              if (hintIndexOpen === index) {
                setHintIndexOpen(null);
              }
            }}
          >
            <Box
              onMouseLeave={() => {
                setHintIndexOpen(null);
              }}
            >
              <Tooltip
                title={getHint(range)}
                open={hintIndexOpen === index}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                slotProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: colors.teal["500"],
                      fontSize: 15,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      letterSpacing: 0.5,
                    },
                  },
                }}
              >
                <Box
                  key={range[0].offset}
                  bgcolor={lighten(colors.teal["A700"], 0.85)}
                  position={"absolute"}
                  left={(range[0].offset / total) * 100 + "%"}
                  width={
                    ((range[1].offset - range[0].offset + 1) / total) * 100 +
                    "%"
                  } // inclusive
                  minHeight={50}
                  borderRadius={
                    range[0].offset === 0
                      ? "10px 0 0 10px"
                      : range[1].offset === total
                      ? "0 10px 0 10px"
                      : 0
                  }
                  onClick={() => {
                    setHintIndexOpen(index);
                  }}
                  onMouseEnter={() => {
                    setHintIndexOpen(index);
                  }}
                ></Box>
              </Tooltip>
            </Box>
          </ClickAwayListener>
        ))}
      </Box>
      <Stack minWidth="100%" position="relative">
        {rangesWithDetails.map((range) => (
          <Box key={range[0].offset}>
            <ProgressLabel
              position={`calc(${(range[0].offset / total) * 100}% + 2px);`} // 2px for border
              text={getPrgoressLabel(range[0])}
            />
            <ProgressLabel
              position={`${((range[1].offset + 1) / total) * 100}%`}
              text={getPrgoressLabel(range[1])}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
