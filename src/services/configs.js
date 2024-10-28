import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/supervisor/configs"
    : "https://5nvqhwbweydlc2yfyoqca5dyie0sonpg.lambda-url.eu-north-1.on.aws/configs";

const ADMIN_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/admin/configs"
    : "https://dtoo4lhm5ojwgql5xfxpmo6nru0alhkp.lambda-url.eu-north-1.on.aws/configs";

export const useCurrentSemesterDetails = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const url = `${BASE_URL}/currentSemester`;

      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    data,
    loading,
  };
};
