import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./constanse.js";

// eslint-disable-next-line react/prop-types
function CheckAgent({ children }) {
  const [hasUser, setHasUser] = useState(false);

  function getUser() {
    let token = localStorage.getItem("token");
    if (token !== null) {
      axios({
        url: BASE_URL + "/api/auth/get/me",
        method: "get",
        headers: {
          Authorization: token,
        },
      })
        .then((res) => {
          if (res.data?.roles[0]?.name === "ROLE_AGENT") {
            setHasUser(true);
          }
        })
        .catch(() => {
          setHasUser(false);
        });
    } else {
      setHasUser(false);
    }
  }

  useEffect(() => {
    getUser();
  }, []);
  return (
    <div className={"d-inline-block"}>{hasUser ? <>{children}</> : <></>}</div>
  );
}

export default CheckAgent;
