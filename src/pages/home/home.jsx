import Header from "../../components/header/header.jsx";
import Product from "../../components/product/product.jsx";
import {
  Badge,
  Card,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemPrefix,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  SpeedDial,
  SpeedDialHandler,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useContext, useEffect, useState } from "react";
import LanguageContext from "../../components/Language/Lan.jsx";
import languageJson from "../../components/Language/language.json";
import SpeedDialCompone from "../../components/speed-dial/speed-dial.jsx";
import axios from "axios";
import CheckAdmin from "../../config/checkAdmin.jsx";
import CheckAgent from "../../config/checkAgent.jsx";
import Logo from "../../components/header/logo.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../config/constanse.js";
import Timer from "../../components/timer/timer.jsx";
import Skeleton from "../../components/skeleton/Skeleton.jsx";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setModalOpen } from "../../redux/slices/cart/cartSlice.js";

function Home() {
  const { langIndex } = useContext(LanguageContext);
  const allCartProducts = useSelector((state) => state.cart?.products);

  const id = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [state, setState] = useState({
    filterCategories: [],
    filter2Categories: [],
    loading: false,
    dateLoading: false,
    categories: [],
    products: [],
    isAdmin: false,
    active: null,
    totalPage: 0,
  });

  useEffect(() => {
    getDate();
  }, []);
  // get date for check admin
  const getDate = () => {
    let token = localStorage.getItem("token");
    if (token !== null) {
      setState((prev) => ({ ...prev, dateLoading: true }));
      axios({
        url: BASE_URL + "/api/auth/get/me",
        method: "get",
        headers: {
          Authorization: token,
        },
      })
        .then((res) => {
          if (res.data.expiration_date === null) {
            setState((prev) => ({ ...prev, isAdmin: true }));
          }
          setState((prev) => ({ ...prev, dateLoading: false }));
        })
        .catch(() => {
          setState((prev) => ({ ...prev, dateLoading: false }));
        });
    }
  };

  useEffect(() => {
    getPodCategories();
    checkPathId();
  }, []);

  // check home page for admin or user
  const checkPathId = () => {
    let token = localStorage.getItem("token");
    axios({
      url: BASE_URL + "/api/auth/get/me",
      method: "get",
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        if (
          res.data?.roles[0].name !== "ROLE_ADMIN" &&
          id?.id !== res.data?.category_id
        ) {
          navigate("/login");
        }
      })
      .catch(() => {
        toast.error("something went wrong");
        navigate("/login");
      });
  };

  // get pod-categories
  const getPodCategories = () => {
    axios({
      url: BASE_URL + "/api/podCategory/" + id?.id,
      method: "get",
    })
      .then((res) => {
        if (res.data.length !== 0) {
          setState((prev) => ({ ...prev, categories: res.data }));
          for (let i = 0; i < res.data.length; i++) {
            state.filter2Categories.push(res.data[i].id);
          }
          getProducts();
        }
      })
      .catch(() => {
        navigate("/404");
      });
  };

  // get products
  const getProducts = (page) => {
    setState((prev) => ({ ...prev, loading: true }));
    let params = {
      podCategories:
        state.filterCategories.length === 0
          ? state.filter2Categories.join(",")
          : state.filterCategories.join(","),
      page: page,
    };
    axios({
      url: BASE_URL + "/api/product/filter",
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      params: params,
    })
      .then((res) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          products: res.data.content,
          totalPage: res.data?.totalPages,
          active: res.data?.pageable?.pageNumber,
        }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };

  // get product by filter
  const getProductsByFilter = (event, categoryId) => {
    setState((prev) => ({ ...prev, loading: true, active: 0 }));
    let exists = checkIfExists(categoryId);
    if (exists !== -1) {
      state.filterCategories.splice(exists, 1);
    } else if (categoryId !== undefined && categoryId !== null) {
      state.filterCategories[0] = categoryId;
    }

    let params = {
      podCategories:
        state.filterCategories.length === 0
          ? state.filter2Categories.join(",")
          : state.filterCategories.join(","),
      page: 0,
    };

    axios({
      url: BASE_URL + "/api/product/filter",
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      params: params,
    })
      .then((res) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          products: res.data.content,
          totalPage: res.data?.totalPages,
          active: res.data?.pageable?.pageNumber,
        }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };

  function checkIfExists(categoryId) {
    for (let i = 0; i < state.filterCategories.length; i++) {
      let item = state.filterCategories[i];
      if (item === categoryId) {
        return i;
      }
    }
    return -1;
  }

  const handleFilter = (e, id) => {
    getProductsByFilter(e.target.checked, id);
  };

  // pagination
  const loadProducts = (page) => {
    setState((prev) => ({ ...prev, active: page }));
    getProducts(page);
  };
  const next = () => {
    loadProducts(state.active + 1);
  };
  const prev = () => {
    if (state.active === 0) return;
    loadProducts(state.active - 1);
  };

  return (
    <div>
      {/* Header  */}
      <div className={"shadow-md"}>
        <Header />
      </div>
      <div>
        {state.dateLoading ? (
          <div className={" p-1 py-2 flex justify-center"}>
            <Spinner color="blue" />
          </div>
        ) : (
          !state.isAdmin && (
            <div className={"p-3"}>
              <Timer />
            </div>
          )
        )}
      </div>

      <div className={"p-2 block md:flex gap-3"}>
        {/*  categories filter  desktop view*/}
        <div className={" px-1 py-4 rounded sticky top-2 z-50 hidden md:block"}>
          <div>
            <h2 className={"text-center text-2xl"}>
              {languageJson[langIndex]?.home_js?.category}
            </h2>
          </div>
          <div className={"mt-3 select-none"}>
            <Card className={"overflow-y-scroll max-h-screen py-1"}>
              <List>
                {state.categories.length !== 0 ? (
                  state.categories.map((category, index) => (
                    <ListItem
                      onChange={(e) => handleFilter(e, category.id)}
                      key={index}
                      className="p-0"
                    >
                      <label className="flex w-full cursor-pointer items-center px-3 py-2">
                        <ListItemPrefix className="mr-3">
                          <Checkbox
                            checked={
                              state.filterCategories.filter(
                                (f) => f === category?.id
                              ).length !== 0
                            }
                            ripple={false}
                            className="hover:before:opacity-0"
                            containerProps={{
                              className: "p-0",
                            }}
                          />
                        </ListItemPrefix>
                        <Typography
                          color="blue-gray"
                          className="font-medium break-all"
                        >
                          {category.title}
                        </Typography>
                      </label>
                    </ListItem>
                  ))
                ) : (
                  <div className={"text-center"}>
                    <span>not found data</span>
                  </div>
                )}
              </List>
            </Card>
          </div>
        </div>

        {/*  categories filter  mobile view*/}
        <div className={"md:hidden absolute top-3 cursor-pointer"}>
          <Menu>
            <div className={"flex justify-center"}>
              <MenuHandler>
                <div>
                  <Logo />
                </div>
              </MenuHandler>
            </div>
            <MenuList>
              {state.categories?.length !== 0
                ? state.categories?.map((cat) => (
                    <MenuItem
                      onChange={(e) => handleFilter(e, cat.id)}
                      key={cat?.id}
                      className="p-0"
                    >
                      <label
                        htmlFor={cat?.id}
                        className="flex cursor-pointer items-center gap-2 p-2"
                      >
                        <Checkbox
                          defaultChecked={
                            state.filterCategories.filter((f) => f === cat?.id)
                              .length !== 0
                          }
                          ripple={false}
                          id={cat?.id}
                          containerProps={{ className: "p-0" }}
                          className="hover:before:content-none"
                        />
                        {cat.title}
                      </label>
                    </MenuItem>
                  ))
                : "no data"}
            </MenuList>
          </Menu>
        </div>

        <div className={"w-full "}>
          {/*  products */}
          <div className={"w-full mt-2 h-[75vh] overflow-y-auto home-scroll"}>
            <div
              className={
                "flex flex-wrap gap-2 pl:gap-5  justify-center md:justify-normal md:gap-5 mt-2"
              }
            >
              {state.loading ? (
                Array.from("testlar").map((it, ind) => <Skeleton key={ind} />)
              ) : state?.products?.length !== 0 ? (
                state?.products?.map((product) => (
                  <>
                    <Product key={product.id} product={product} />
                  </>
                ))
              ) : (
                <p className={"text-center mx-auto opacity-80 text-[#bc5f5f]"}>
                  not found product
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*  pagination  */}
      {state.active !== null && (
        <div className={"flex justify-center p-3 py-4 select-none"}>
          <div className="flex items-center gap-6">
            <IconButton
              size="sm"
              variant="outlined"
              onClick={prev}
              disabled={state.active === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </IconButton>
            <Typography color="gray" className="font-normal">
              Page <strong className="text-gray-900">{state.active + 1}</strong>{" "}
              of
              <strong className="text-gray-900"> {state.totalPage}</strong>
            </Typography>
            <IconButton
              size="sm"
              variant="outlined"
              onClick={next}
              disabled={
                state.active + 1 === state.totalPage || state.totalPage === 0
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </IconButton>
          </div>
        </div>
      )}

      {/*  speed dial admin  */}
      <div>
        <CheckAdmin>
          <div className="fixed bottom-28 right-6 md:right-12 z-[2]">
            <SpeedDialCompone location={window.location.origin + "/login"} />
          </div>
        </CheckAdmin>
        <CheckAgent>
          <div className="fixed bottom-28 right-6 md:right-12 z-[2]">
            <SpeedDialCompone location={window.location.origin + "/login"} />
          </div>
        </CheckAgent>
      </div>
      <div
        onClick={() => dispatch(setModalOpen(true))}
        className="fixed bottom-14 right-6 md:right-12 z-[2]"
      >
        <SpeedDial>
          <SpeedDialHandler>
            <Badge content={allCartProducts?.length}>
              <IconButton color="green" size="lg" className="rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              </IconButton>
            </Badge>
          </SpeedDialHandler>
        </SpeedDial>
      </div>
    </div>
  );
}

export default Home;
