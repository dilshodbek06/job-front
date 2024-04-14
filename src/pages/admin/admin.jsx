import homeIcon from "./images/home.png"
import categoryIcon from "./images/menu.png"
import productsIcon from "./images/products.png"
import sidebarIcon from "./images/layouting.png"
import usersIcon from "./images/users.png"
import podCategoryIcon from "./images/pod-category.png"
import {Link, Outlet, useLocation} from "react-router-dom";
import {useContext, useState} from "react";
import LanguageContext from "../../components/Language/Lan.jsx";
import languageJson from "../../components/Language/language.json"
import {Drawer, Typography} from "@material-tailwind/react";
import CheckAdmin from "../../config/checkAdmin.jsx";

function Admin() {
    const {langIndex} = useContext(LanguageContext)
    const [open, setOpen] = useState(false);
    const openDrawer = () => setOpen(true);
    const closeDrawer = () => setOpen(false);
    const location = useLocation()

    return (
        <div>
            <CheckAdmin>
                <div className={"flex gap-3"}>
                    <div className={"h-min"}>
                        <img onClick={openDrawer} className={"w-12 mx-3 mt-2 cursor-pointer select-none"}
                             src={sidebarIcon}
                             alt="sidebar"/>
                        <Drawer open={open} onClose={closeDrawer}>
                            <div className="mb-2 flex items-center justify-between p-4">
                                <Typography variant="h5" color="blue-gray" className={"mx-auto text-2xl select-none"}>
                                    {languageJson[langIndex]?.admin_panel?.name}
                                </Typography>
                            </div>
                            <div className={`mt-5 `}>
                                <Link to={"/admin/category"} onClick={closeDrawer}>
                                    <div
                                        className={`cursor-pointer ${location.pathname === "/admin/category" ? "bg-gray-200" : ""} hover:bg-gray-200 flex items-center  p-2 gap-5`}>
                                        <img className={"w-[40px] h-[40px]"} src={categoryIcon} alt="logo"/>
                                        <h2 className={"text-2xl font-bold text-center"}>{languageJson[langIndex]?.admin_panel?.cateogry?.name}</h2>
                                    </div>
                                </Link>
                                <Link to={"/admin/pod-category"} onClick={closeDrawer}>
                                    <div
                                        className={`cursor-pointer ${location.pathname === "/admin/pod-category" ? "bg-gray-200" : ""} hover:bg-gray-200 mt-4 flex items-center  p-2 gap-5`}>
                                        <img className={"w-[40px] h-[40px]"} src={podCategoryIcon} alt="logo"/>
                                        <h2 className={"text-2xl font-bold text-center"}>Pod-categories</h2>
                                    </div>
                                </Link>
                                <Link to={"/admin/products"} onClick={closeDrawer}>
                                    <div
                                        className={`cursor-pointer ${location.pathname === "/admin/products" ? "bg-gray-200" : ""} hover:bg-gray-200 mt-4 flex items-center  p-2 gap-5`}>
                                        <img className={"w-[40px] h-[40px]"} src={productsIcon} alt="logo"/>
                                        <h2 className={"text-2xl font-bold text-center"}>{languageJson[langIndex]?.admin_panel?.product?.name}</h2>
                                    </div>
                                </Link>
                                <Link to={"/admin/users"} onClick={closeDrawer}>
                                    <div
                                        className={`cursor-pointer ${location.pathname === "/admin/users" ? "bg-gray-200" : ""} hover:bg-gray-200 mt-4 flex items-center  p-2 gap-5`}>
                                        <img className={"w-[40px] h-[40px]"} src={usersIcon} alt="logo"/>
                                        <h2 className={"text-2xl font-bold text-center"}>{languageJson[langIndex]?.admin_panel?.users}</h2>
                                    </div>
                                </Link>
                                <Link to={"/0"}>
                                    <div
                                        className={`cursor-pointer  hover:bg-gray-200 mt-4 flex items-center  p-2 gap-5`}>
                                        <img className={"w-[40px] h-[40px]"} src={homeIcon} alt="logo"/>
                                        <h2 className={"text-2xl font-bold text-center"}>{languageJson[langIndex]?.admin_panel?.home}</h2>
                                    </div>
                                </Link>
                            </div>
                        </Drawer>
                    </div>
                    <div className={"h-[100vh] overflow-y-scroll w-full"}>
                        <Outlet/>
                    </div>
                </div>
            </CheckAdmin>

        </div>
    );
}

export default Admin;
