import "./login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/constanse.js";
import { toast } from "react-toastify";
import telegramIcon from "./images/telegram.svg";
import facebookIcon from "./images/facebook.svg";
import instagramIcon from "./images/instagram.svg";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = () => {
    if (phone !== "" && password !== "") {
      setLoading(true);
      axios({
        url: BASE_URL + "/api/auth/login/public",
        method: "post",
        data: {
          phone,
          password,
        },
      })
        .then((res) => {
          setLoading(false);
          if (
            res.data ===
            "kechirasiz siz ushbu login parol bilan autentifikatsiya qilish vaqtingiz tugagan!"
          ) {
            toast.warning(res.data);
          }
          localStorage.setItem("token", res.data?.access_token);
          if (res.data?.categoryId) {
            navigate("/" + res.data?.categoryId);
          } else {
            navigate("/0");
          }
        })
        .catch(() => {
          toast.error("login or password wrong");
          setLoading(false);
        });
    } else {
      toast.warning("please fill all fields");
    }
  };

  return (
    <div className={"outer"}>
      <div className="contact-wrapper">
        <header className="login-cta">
          <h2>Account Login</h2>
        </header>
        <form>
          <div className="form-row">
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <span>Phone number</span>
          </div>
          <div className="form-row">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span>Password</span>
          </div>
          <div className="form-row"></div>
          <div className="form-row">
            <button onClick={handleLogin} type="button">
              {loading ? "Loading..." : "Login to your Account!"}{" "}
            </button>
          </div>
        </form>
        <div className="socials-wrapper">
          <header>
            <h2>Contact us</h2>
          </header>
          <ul>
            <li title={"telegram"}>
              <a href="https://t.me/+998991250805" className="facebook">
                <img src={telegramIcon} alt="telegram" />
              </a>
            </li>
            <li title={"facebook"}>
              <a href="#" className="twitter">
                <img src={facebookIcon} alt="telegram" />
              </a>
            </li>
            <li title={"instagram"}>
              <a href="#" className="twitch">
                <img src={instagramIcon} alt="telegram" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
