import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import {
  Avatar,
  Drawer,
  IconButton,
  Input,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography,
} from "@material-tailwind/react";
import Language from "../Language/Language.jsx";
import LanguageContext from "../Language/Lan.jsx";
import languageJson from "../Language/language.json";
import CheckAdmin from "../../config/checkAdmin.jsx";
import Logo from "./logo.jsx";
import Button from "../button/button.jsx";
import { BASE_URL } from "../../config/constanse.js";
import userIcon from "./images/user.png";
import uzbIcon from "./images/uzb.png";
import rusIcon from "./images/rus.png";
import engIcon from "./images/usa.png";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteItem,
  resetCart,
  setModalOpen,
} from "../../redux/slices/cart/cartSlice.js";
import { GeolocationControl, Map, Placemark, YMaps } from "react-yandex-maps";

function Header() {
  const { langIndex } = useContext(LanguageContext);
  const { changeLanguageIndex } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapIsLoad, setMapIsLoad] = useState(false);
  const [maps, setMaps] = useState(null);
  const [adressTitle, setAdressTitle] = useState("");
  const location = useLocation();

  const uzbekistanBounds = [
    [37.185208, 55.975924], // Southwest corner
    [45.586804, 73.269953], // Northeast corner
  ];

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, modalOpen } = useSelector((state) => state.cart);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const checkIsAdmin = () => {
    axios({
      url: BASE_URL + "/api/auth/get/me",
      method: "get",
      headers: {
        Authorization:
          localStorage.getItem("token") && localStorage.getItem("token"),
      },
    })
      .then((response) => {
        if (response.data?.roles[0].name === "ROLE_ADMIN") {
          navigate("/admin");
        } else {
          toast.warning("you aren't admin");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const calculateAllPrice = () => {
    let s = 0;
    for (let i = 0; i < products.length; i++) {
      s += products[i].price * parseInt(products[i].quantity);
    }
    return s;
  };

  const sendMessageToTelegram = async () => {
    const currentUrl = location.pathname.substring(1);
    const formData = new FormData();
    const response = await axios.post(
      BASE_URL + `/api/product/order/${currentUrl}`
    );
    formData.append("chat_id", response?.data?.chatId);
    formData.append("parse_mode", "HTML");

    let itemCaption = "";
    let allPrice = calculateAllPrice();
    products.forEach((element, index) => {
      console.log(element);
      itemCaption += ` 
         <b>${index + 1}.nomi:</b> ${element.title}
      🧾<b>tarif:</b>  ${element.description}
      💰<b>narxi:</b>  ${element.quantity} x ${element.price} =${
        element.quantity * element.price
      } UZS
      🔄<b>soni:</b> ${element.quantity} ta
       `;
    });
    itemCaption =
      itemCaption +
      ` 
       <b>jami narx:</b> ${allPrice?.toLocaleString()} sum
       <b>telefon:</b> ${phone}       ${
        selectedLocation !== null
          ? `<b>joylashuv:</b> <a href="https://maps.google.com/?q=${selectedLocation[0]},${selectedLocation[1]}">${adressTitle}</a>`
          : ""
      }
       `;

    formData.append("caption", itemCaption);

    try {
      if (imgFile === null) {
        const response = await axios.get(
          BASE_URL +
            `/api/attachment/${products[0]?.attachmentId}?prefix=product`,
          {
            responseType: "blob",
          }
        );

        // Append image data to FormData
        formData.append(
          "photo",
          new Blob([response.data], { type: "image/png" }),
          "image.png"
        );
      } else {
        formData.append(
          "photo",
          new Blob([imgFile], { type: "image/png" }),
          "image.png"
        );
      }
      setIsLoading(true);

      await axios.post(
        `https://api.telegram.org/bot${response?.data?.telegramToken}/sendPhoto`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsLoading(false);

      toast.success(
        languageJson[langIndex]?.home_js?.basket?.messages.success,
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
      clearCart();
      dispatch(setModalOpen(false));
    } catch (error) {
      toast.error(languageJson[langIndex]?.home_js?.basket?.messages.error, {
        position: "top-center",
        autoClose: 1000,
      });
      setIsLoading(false);
    }
  };

  function findMyLocation() {
    if (navigator.geolocation) {
      // Geolocation is supported
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      toast.warning("Geolocation is not supported by your browser.");
      // Geolocation is not supported by this browser
    }
  }

  function showPosition(position) {
    toast.success("success",{
      autoClose:500
    })
    // Retrieve latitude and longitude from the position object
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    // Now you have the latitude and longitude, you can use them as needed
    setSelectedLocation([latitude, longitude]);
    console.log("Latitude: " + latitude + ", Longitude: " + longitude);
  }

  function showError(error) {
    toast.error("something went wrong");
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.");
        break;
    }
  }

  const handleFileImage = (e) => {
    let file = e.target.files[0];
    setImgFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImgUrl(imageUrl);
  };

  const clearCart = () => {
    setImgFile(null);
    setImgUrl(null);
    setPhone("");
    setAdressTitle("");
    setSelectedLocation(null);
    dispatch(resetCart());
  };

  const handleDeletePhoto = () => {
    setImgFile(null);
    setImgUrl(null);
  };

  const handleOnLoad = (ymaps) => {
    setMaps(ymaps);
    setMapIsLoad(true);
  };

  const handlePlacemarkClick = (e) => {
    const coords = e.get("coords");
    if (
      coords[0] >= uzbekistanBounds[0][0] &&
      coords[0] <= uzbekistanBounds[1][0] &&
      coords[1] >= uzbekistanBounds[0][1] &&
      coords[1] <= uzbekistanBounds[1][1]
    ) {
      setSelectedLocation(coords);
      maps?.geocode(coords).then((res) => {
        const firstGeoObject = res.geoObjects?.get(0);
        const address = firstGeoObject?.getAddressLine();
        setAdressTitle(address);
      });
    } else {
      setSelectedLocation(null);
      alert(languageJson[langIndex]?.home_js?.basket?.messages.within_uzb);
    }
  };

  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap justify-between p-2 items-center">
        <b className="cursor-pointer ml-2 flex title-font font-medium items-center text-gray-900  md:mb-0">
          <span className="hidden md:block">
            <Logo />
          </span>
          <span className="ml-10 md:ml-2 text-xl">
            {languageJson[langIndex]?.home_js?.header?.name}
          </span>
        </b>

        <div className={"hidden md:flex items-center gap-2"}>
          {!localStorage.getItem("token") ? (
            <Link to={"/login"}>
              <button className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
                Login
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-4 h-4 ml-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </button>
            </Link>
          ) : (
            <div onClick={handleLogOut}>
              <Button name={languageJson[langIndex]?.home_js?.header?.logout} />
            </div>
          )}

          <CheckAdmin>
            <div onClick={checkIsAdmin}>
              <Button name={languageJson[langIndex]?.home_js?.header?.admin} />
            </div>
          </CheckAdmin>

          <div className={"mt-4 md:mt-0"}>
            <Language />
          </div>
          {/* shopping cart  */}
          <button
            onClick={() => dispatch(setModalOpen(true))}
            type="button"
            className="relative inline-flex items-center p-2 text-sm font-medium text-center  rounded-full hover:bg-gray-50"
          >
            <span className="mr-1">
              {languageJson[langIndex]?.home_js?.header?.cart_title}{" "}
            </span>
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
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            <span className="sr-only">Notifications</span>
            <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
              {products?.length}
            </div>
          </button>
        </div>

        <div className={"flex items-center gap-3 md:hidden"}>
          <button
            onClick={() => dispatch(setModalOpen(true))}
            type="button"
            className="relative mb-[-4px] inline-flex items-center p-2 text-sm font-medium text-center  rounded-full hover:bg-gray-50"
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
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            <span className="sr-only">Notifications</span>
            <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
              {products?.length}
            </div>
          </button>
          <Menu>
            <MenuHandler>
              <Avatar
                variant="circular"
                alt="tania andrew"
                className="cursor-pointer p-1"
                src={userIcon}
              />
            </MenuHandler>
            <MenuList>
              <CheckAdmin>
                <MenuItem
                  onClick={checkIsAdmin}
                  className="flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <Typography variant="small" className="font-normal">
                    Admin
                  </Typography>
                </MenuItem>
              </CheckAdmin>

              <MenuItem disabled={true} className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <Typography variant="small" className="font-normal">
                    Language
                  </Typography>
                </div>
              </MenuItem>
              <div className={"outline-none"}>
                <div
                  onClick={() => changeLanguageIndex(1)}
                  className={
                    "cursor-pointer flex justify-between items-center px-3 hover:bg-gray-50 rounded-full "
                  }
                >
                  <img className={"w-8 h-8"} src={uzbIcon} alt="uzb" />
                  <p>UZB</p>
                </div>
                <div
                  onClick={() => changeLanguageIndex(2)}
                  className={
                    "cursor-pointer flex justify-between items-center px-3 hover:bg-gray-50 rounded-full "
                  }
                >
                  <img className={"w-8 h-8"} src={rusIcon} alt="rus" />
                  <p>RUS</p>
                </div>
                <div
                  onClick={() => changeLanguageIndex(0)}
                  className={
                    "cursor-pointer flex justify-between items-center px-3 hover:bg-gray-50 rounded-full "
                  }
                >
                  <img className={"w-8 h-8"} src={engIcon} alt="eng" />
                  <p>ENG</p>
                </div>
              </div>
              <hr className="my-2 border-blue-gray-50" />
              <MenuItem className="flex items-center gap-2 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                  />
                </svg>
                <Typography
                  onClick={handleLogOut}
                  variant="small"
                  className="font-normal"
                >
                  Log Out
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>

      {/* drawer */}
      <Drawer
        size={460}
        placement="right"
        open={modalOpen}
        onClose={() => dispatch(setModalOpen(false))}
        className="p-3 w-full"
      >
        <div className="mb-6 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            {languageJson[langIndex]?.home_js?.basket?.cart_title}{" "}
            {products?.length !== 0 && (
              <span className="md:ml-3 ml-1 ">
                {" "}
                {languageJson[langIndex]?.home_js?.basket?.total_price}:
                <span className="opacity-80 font-medium text-blue-800 text-[18px]">
                  {calculateAllPrice()?.toLocaleString()} UZS
                </span>
              </span>
            )}
          </Typography>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => dispatch(setModalOpen(false))}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>
        <div className=" h-[87vh] mt-[-25px] overflow-auto p-1">
          {products.length !== 0 ? (
            products?.map((item, ind) => (
              <>
                <div
                  key={ind}
                  className="flex p-1 justify-between items-center"
                >
                  <div>
                    <img
                      className="w-20 h-20 object-cover object-center rounded-sm"
                      src={
                        BASE_URL +
                        `/api/attachment/${item?.attachmentId}?prefix=product`
                      }
                      alt="image"
                    />
                  </div>
                  <div>
                    <p className="font-bold">
                      {item?.title?.substring(0, 12)}...
                    </p>
                    <p className="opacity-95 font-medium ">
                      {item?.description?.substring(0, 12)}...
                    </p>
                    <p className="mt-6">{item?.quantity}x</p>
                  </div>
                  <div className="flex flex-col justify-evenly">
                    <p> {item.price} UZS </p>
                    <p
                      onClick={() => dispatch(deleteItem(item.id))}
                      className="text-blue-800 mt-12 cursor-pointer"
                    >
                      {languageJson[langIndex]?.home_js?.basket?.remove_btn}
                    </p>
                  </div>
                </div>
                <hr className="mt-2" />
              </>
            ))
          ) : (
            <p>{languageJson[langIndex]?.home_js?.basket?.empty_cart}</p>
          )}
          {products?.length ? (
            <div className="mt-2">
              <b>
                {languageJson[langIndex]?.home_js?.basket?.user_information}
              </b>
              <div className="mt-1 pr-2">
                <Input
                  className="w-1/2"
                  color="blue"
                  label={languageJson[langIndex]?.home_js?.basket?.phone_input}
                  type={"tel"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <div className="mt-2">
                  <b>
                    {languageJson[langIndex]?.home_js?.basket?.upload_photo}
                  </b>
                  {imgFile ? (
                    <div className="flex w-[80%] items-center justify-between">
                      <img
                        className="object-cover mt-1"
                        width={100}
                        height={100}
                        src={imgUrl}
                        alt="photo"
                      />

                      <b
                        onClick={handleDeletePhoto}
                        className="text-red-500 cursor-pointer select-none"
                      >
                        {languageJson[langIndex]?.home_js?.basket?.remove_photo}
                      </b>
                    </div>
                  ) : (
                    <label className="cursor-pointer mt-2">
                      <input
                        value={imgFile}
                        onChange={handleFileImage}
                        type="file"
                        hidden
                      />
                      <div className="w-full flex justify-center items-center border-dashed border-2 border-blue-400 min-h-[70px]">
                        {
                          languageJson[langIndex]?.home_js?.basket
                            ?.upload_description
                        }
                      </div>
                    </label>
                  )}
                  <div className="mt-1 relative">
                    <button
                      onClick={() => findMyLocation()}
                      className="absolute top-7 left-1 z-[1] bg-white p-1 shadow-md border font-medium rounded-sm hover:bg-gray-50 text-center inline-flex items-center"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 448 512"
                        fill="currentColor"
                        height="1em"
                        width="1em"
                      >
                        <path d="M429.6 92.1c4.9-11.9 2.1-25.6-7-34.7s-22.8-11.9-34.7-7l-352 144c-14.2 5.8-22.2 20.8-19.3 35.8S32.7 256 48 256h176v176c0 15.3 10.8 28.4 25.8 31.4s30-5.1 35.8-19.3l144-352z" />
                      </svg>

                      <span className="sr-only">Icon description</span>
                    </button>
                    <b>
                      {languageJson[langIndex]?.home_js?.basket?.location_title}
                    </b>
                    <div>
                      {!mapIsLoad && "loading map..."}
                      <YMaps
                        query={{
                          apikey: "e24090ad-351e-4321-8071-40c04c55f144\n",
                          lang: "en_US",
                          coordorder: "latlong",
                        }}
                      >
                        <Map
                          width={"auto"}
                          bounds={uzbekistanBounds}
                          onLoad={(ymaps) => handleOnLoad(ymaps)}
                          defaultState={{ center: [39.7748, 64.428], zoom: 10 }}
                          onClick={(e) => handlePlacemarkClick(e)}
                        >
                          {selectedLocation && (
                            <Placemark
                              geometry={selectedLocation}
                              properties={{
                                balloonContent: selectedLocation,
                              }}
                            />
                          )}
                        </Map>
                      </YMaps>
                    </div>
                  </div>
                </div>
                <div className=" p-1 mt-1 flex justify-end">
                  <button
                    onClick={sendMessageToTelegram}
                    type="button"
                    className="text-white disabled:opacity-50 bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 "
                    disabled={phone === ""}
                  >
                    <svg
                      className="w-3.5 h-3.5 me-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 18 21"
                    >
                      <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z" />
                    </svg>
                    {isLoading
                      ? "loading..."
                      : languageJson[langIndex]?.home_js?.basket?.buy_btn}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </Drawer>
    </header>
  );
}

export default Header;
