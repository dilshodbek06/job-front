import {useEffect} from "react";
import axios from "axios";
import {BASE_URL} from "../../config/constanse.js";
import {useNavigate} from "react-router-dom";

function Main() {

    useEffect(() => {
        checkMainPage()
    }, [])

    const navigate = useNavigate()
    const checkMainPage = () => {
        let token = localStorage.getItem("token")
        axios({
            url: BASE_URL + "/api/auth/get/me",
            method: "get",
            headers: {
                Authorization: token
            }
        }).then(res => {
            if (res.data?.category_id === null) {
                navigate("/0")
            } else {
                navigate(`/${res.data?.category_id}`)
            }
        })
    }

    return (
        <div>

        </div>
    );
}

export default Main;