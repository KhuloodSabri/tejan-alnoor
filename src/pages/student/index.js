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
import { surah } from "../../constants/surah";
import { arabicNumbers } from "../../constants/numbers";
// import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import NorthIcon from "@mui/icons-material/North";

export default function StudenPage() {
  const { studentId: studentIdStr } = useParams();
  const studentId = parseInt(studentIdStr);

  const start = 78;
  const end = 114;

  const commulative = surah.slice(start - 1, end).reduce((acc, item) => {
    return [
      ...acc,
      {
        ...item,
        commulativeOffset:
          acc.length > 0
            ? acc[acc.length - 1].commulativeOffset + acc[acc.length - 1].ayah
            : 0,
      },
    ];
  }, []);

  console.log("commulative", commulative);

  const ranges = [
    {
      from: { id: 78, ayah: 1 },
      to: { id: 79, ayah: 46 },
    },
    {
      from: { id: 80, ayah: 1 },
      to: { id: 82, ayah: 19 },
    },
    // {
    //   from: { id: 83, ayah: 1 },
    //   to: { id: 85, ayah: 22 },
    // },
    {
      from: { id: 86, ayah: 1 },
      to: { id: 89, ayah: 30 },
    },
    {
      from: { id: 90, ayah: 1 },
      to: { id: 94, ayah: 8 },
    },
    {
      from: { id: 95, ayah: 1 },
      to: { id: 100, ayah: 11 },
    },
    // {
    //   from: { id: 101, ayah: 1 },
    //   to: { id: 108, ayah: 8 },
    // },
    // {
    //   from: { id: 109, ayah: 1 },
    //   to: { id: 114, ayah: 6 },
    // },
  ];

  const commulativeRanges = ranges.map((range) => {
    return {
      from:
        commulative.find((item) => item.id === range.from.id)
          .commulativeOffset + range.from.ayah,
      to:
        commulative.find((item) => item.id === range.to.id).commulativeOffset +
        range.to.ayah,
    };
  });

  const total =
    commulative[commulative.length - 1].commulativeOffset +
    commulative[commulative.length - 1].ayah;

  console.log("ranges", ranges);
  console.log(
    "commulativeRanges",
    commulativeRanges,
    JSON.stringify(commulativeRanges)
  );
  console.log("total", total);

  return (
    <Box width="100%">
      <Typography variant="h4" align="center">
        الطالبة {studentId}
      </Typography>

      <Box
        minWidth="100%"
        minHeight={50}
        mt={5}
        sx={{
          // bgcolor: colors.grey[200],
          // border: `1px solid ${colors.grey[400]}`,
          border: `2px solid ${colors.teal["A700"]}`,
          borderRadius: 3,
        }}
        position="relative"
      >
        {commulativeRanges.map((range, index) => (
          <Tooltip
            key={range.from}
            title={`أتمت الطالبة المراجعة من ${
              surah.find(({ id }) => id === ranges[index]?.from?.id)?.surah
            }`}
          >
            <Box
              key={range.from}
              bgcolor={lighten(colors.teal["A700"], 0.85)}
              position={"absolute"}
              left={((range.from - 1) / total) * 100 + "%"} // map to 0 index
              width={((range.to - range.from + 1) / total) * 100 + "%"} // inclusive
              minHeight={50}
              borderRadius={
                range.from - 1 === 0
                  ? "10px 0 0 10px"
                  : range.to === total
                  ? "0 10px 0 10px"
                  : 0
              }
            >
              <NorthIcon
                sx={{
                  position: "absolute",
                  bottom: -25,
                  left: -10,
                }}
              />
              <Stack
                sx={{
                  position: "absolute",
                  bottom: -85,
                  transform: "translateX(-50%)",
                }}
                justifyContent="center"
                alignItems="center"
              >
                <Box
                  sx={{
                    backgroundImage: 'url("/tejan-alnoor/ayahIcon.png")',
                    backgroundSize: "28px 30px",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    width: 30,
                    height: 30,
                  }}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{
                      width: "fit-content",
                      lineHeight: "35px",
                      mx: "auto",
                    }}
                  >
                    {ranges[index]?.from?.ayah
                      .toString()
                      .split("")
                      .map((number) => arabicNumbers[number])
                      .join("")}
                  </Typography>
                </Box>
                <Typography lineHeight={1} sx={{ mt: 1 }}>
                  {
                    surah.find(({ id }) => id === ranges[index]?.from?.id)
                      ?.surah
                  }
                </Typography>
              </Stack>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
