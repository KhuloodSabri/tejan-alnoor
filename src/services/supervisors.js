import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/supervisor/supervisors"
    : "https://5nvqhwbweydlc2yfyoqca5dyie0sonpg.lambda-url.eu-north-1.on.aws/students";

const ADMIN_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/admin/supervisors"
    : "https://dtoo4lhm5ojwgql5xfxpmo6nru0alhkp.lambda-url.eu-north-1.on.aws/supervisors";

export const useSupervisorsByName = (name) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!name) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchData = async () => {
      try {
        const token = await getAccessTokenSilently();

        const url = `${ADMIN_BASE_URL}?name=${encodeURIComponent(name)}`;
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          throw new Error("Failed to search students");
        }

        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently, name]);

  return {
    data,
    loading,
  };
};
