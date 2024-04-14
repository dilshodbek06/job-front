/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from "react";
import { BASE_URL } from "../../config/constanse.js";
import "./product.scss";
import LanguageContext from "../../components/Language/Lan.jsx";
import languageJson from "../../components/Language/language.json";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Spinner,
} from "@material-tailwind/react";
// import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cart/cartSlice.js";

// eslint-disable-next-line react/prop-types, react/display-name
const Product = React.memo(({ product, key }) => {
  const { langIndex } = useContext(LanguageContext);
  const dispatch = useDispatch();

  const [titleTruncate, setTitleTruncate] = useState(false);
  const [descTruncate, setDescTruncate] = useState(false);
  const [isLabelShow, setIsLabelShow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const checkIsNew = () => {
    return (
      new Date().getTime() - new Date(product?.created_at).getTime() <=
      604800000
    );
  };

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
          if (res.data?.roles[0].name === "ROLE_ADMIN") {
            setIsLabelShow(true);
          }
        })
        .catch(() => {
          setIsLabelShow(false);
        });
    } else {
      setIsLabelShow(false);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  const handleAddToCart = (produc) => {
    dispatch(addToCart({ ...produc, quantity: quantity }));
  };

  const handleOpen = () => setIsOpen((cur) => !cur);

  const handleClickProduct = (item) => {
    setIsOpen(true);
    setSelectedProduct(item);
  };

  return (
    <>
      <div key={key} className="box">
        {checkIsNew() && (
          <div className="ribbon">
            <span>NEW</span>
          </div>
        )}
        <div
          onClick={() => handleClickProduct(product)}
          className={"card-header"}
        >
          <img
            className="select-none"
            src={
              BASE_URL +
              `/api/attachment/${product?.attachmentId}?prefix=product`
            }
            alt="image"
          />
        </div>
        <div className={"card-body"}>
          <p
            onClick={() => setTitleTruncate(!titleTruncate)}
            className={` font-bold cursor-pointer select-none text-gray-800 ${
              !titleTruncate ? "truncate" : ""
            }`}
          >
            {isLabelShow ? <span>{languageJson[langIndex]?.name}:</span> : ""}
            <span className={"font-bold opacity-90"}>{product?.title} </span>
          </p>
          <p
            onClick={() => setDescTruncate(!descTruncate)}
            className={` cursor-pointer select-none text-gray-800 font-bold ${
              !descTruncate ? "truncate" : ""
            }`}
          >
            {isLabelShow ? <span>{languageJson[langIndex]?.title}:</span> : ""}{" "}
            <span className={"font-medium"}>{product?.description}</span>
          </p>
          <p
            className={
              "select-none font-bold bg-yellow-500 tracking-wide text-black w-fit p-1 rounded-md px-2"
            }
          >
            {isLabelShow ? <span>{languageJson[langIndex]?.price}:</span> : ""}
            <span className={"font-bold"}>
              {product?.price.toLocaleString()} sum{" "}
            </span>
          </p>
        </div>
        <div className={"card-footer flex items-center justify-between gap-3"}>
          {product?.active ? (
            <>
              <input
                min={0}
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 px-2.5 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button
                disabled={!product?.active}
                onClick={() => handleAddToCart(product)}
                type="button"
                className={`text-white cursor-pointer  bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br  focus:outline-none font-medium rounded-lg text-sm px-6 py-2.5 text-center inline-flex items-center`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 21"
                >
                  <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z" />
                </svg>
              </button>
            </>
          ) : (
            <Button className="w-[90%]" color={"red"}>
              {languageJson[langIndex]?.home_js?.header?.no}
            </Button>
          )}
        </div>
      </div>
      <Dialog open={isOpen} handler={handleOpen}>
        {selectedProduct === null ? (
          <Spinner />
        ) : (
          <DialogBody>
            <div className=" max-h-[30rem] max-w-[45rem] overflow-auto">
              <img
                alt="nature"
                className="w-full h-auto rounded-lg object-cover object-center"
                src={
                  BASE_URL +
                  `/api/attachment/${selectedProduct?.attachmentId}?prefix=product`
                }
              />
            </div>
          </DialogBody>
        )}

        <DialogFooter className="justify-end">
          <button
            onClick={() => setIsOpen(false)}
            type="button"
            className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            {languageJson[langIndex]?.home_js?.header?.dialog_close}
          </button>
        </DialogFooter>
      </Dialog>
    </>
  );
});

export default Product;
