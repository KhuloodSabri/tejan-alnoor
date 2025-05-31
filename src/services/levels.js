import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import _ from "lodash";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/supervisor/levels"
    : "https://5nvqhwbweydlc2yfyoqca5dyie0sonpg.lambda-url.eu-north-1.on.aws/levels";

const ADMIN_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/admin/levels"
    : "https://dtoo4lhm5ojwgql5xfxpmo6nru0alhkp.lambda-url.eu-north-1.on.aws/levels";

export const useLevels = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      console.log("Fetching levels data...");
      const url = `${BASE_URL}`;

      try {
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setData(_.orderBy(response.data, "levelID"));
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
