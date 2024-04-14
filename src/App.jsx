import {useEffect, useState} from "react";
import {Suspense, lazy} from 'react';
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
// components
const Home = lazy(() => import('./pages/home/home.jsx'));
import Login from "./pages/login/login.jsx";
import ProductPage from "./pages/admin/product/product-page.jsx"
import CategoryPage from "./pages/admin/category/category-page.jsx"
import Admin from "./pages/admin/admin.jsx";
import NotFound from "./components/404/not-found.jsx";
import Users from "./pages/admin/users/users.jsx";
import PodCategory from "./pages/admin/pod-category/pod-category.jsx";
import Main from "./pages/main/main.jsx";
import PageLoad from "./components/page-load/page-load.jsx";
import LanguageContext from "./components/Language/Lan";
import {BASE_URL} from "./config/constanse.js";

function App() {
    const location = useLocation()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false);
    const [langIndex, setLangIndex] = useState(0)

    const getMe = () => {
        if (location.pathname !== "/login" || location.pathname !== "/register") {
            if (localStorage.getItem("token")) {
                let token = localStorage.getItem("token")
                axios({
                    url: BASE_URL + "/api/auth/get/me",
                    method: "get",
                    headers: {
                        Authorization: token
                    }
                }).then(res => {
                    if (location.pathname === "/0" && !(res.data?.roles[0].name === "ROLE_ADMIN")) {
                        navigate("/404")
                    }
                }).catch(() => {
                    navigate("/login")
                    localStorage.removeItem("token")
                })
            } else {
                navigate("/login")
            }
        }
    }

    function checkLanguageIndex() {
        const indexLang = localStorage.getItem("langIndex");
        if (indexLang === null || indexLang < 0 || indexLang > 2) {
            return;
        }
        setLangIndex(JSON.parse(localStorage.getItem("langIndex")))
    }

    function changeLanguageIndex(index) {
        setLangIndex(index);
        localStorage.setItem("langIndex", index);
    }

    useEffect(() => {
        checkLanguageIndex()
    }, []);

    // loading
    useEffect(() => {
            getMe()
            setLoading(true);
            const loadingTimeout = setTimeout(() => {
                setLoading(false);
            }, 1000);

            return () => clearTimeout(loadingTimeout);
        }, [location.pathname]
    )

    if (loading) {
        return (
            <PageLoad/>
        )
    }

    return (
        // eslint-disable-next-line react/jsx-no-undef
        <LanguageContext.Provider value={{langIndex, setLangIndex, changeLanguageIndex}}>
            <div>
                <ToastContainer className={"z-[10000] w-2/3 mx-auto"}/>
                <Routes>
                    <Route path={"/"} element={<Main/>}/>
                    <Route path={"/:id"} element={<Suspense fallback={<PageLoad/>}> <Home/> </Suspense>}/>
                    <Route path={"/login"} element={<Login/>}/>
                    <Route path={"/404"} element={<NotFound/>}/>
                    <Route path={"/admin"} element={<Admin/>}>
                        <Route path={"/admin"} element={<Navigate to={"/admin/category"}/>}/>
                        <Route path={"/admin/products"} element={<ProductPage/>}/>
                        <Route path={"/admin/category"} element={<CategoryPage/>}/>
                        <Route path={"/admin/pod-category"} element={<PodCategory/>}/>
                        <Route path={"/admin/users"} element={<Users/>}/>
                    </Route>
                </Routes>
            </div>
        </LanguageContext.Provider>

    )
}

export default App
