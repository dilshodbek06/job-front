import { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemPrefix,
  Option,
  Select,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import ProductItem from "./product-item.jsx";
import { toast } from "react-toastify";
import LanguageContext from "../../../components/Language/Lan.jsx";
import languageJson from "../../../components/Language/language.json";
import axios from "axios";
import { BASE_URL } from "../../../config/constanse.js";
import { List as ListOrder } from "react-movable";

function ProductPage() {
  const { langIndex } = useContext(LanguageContext);

  const [state, setState] = useState({
    loading: false,
    open: false,
    name: "",
    description: "",
    price: 0,
    imgUrl: null,
    active: false,
    podCategories: [],
    products: [],
    podCategoryId: "",
    filterPodCategories: [],
    editingId: "",
    isEdit: false,
    currentDragPodCategoryId: null,
    orderModalOpen: false,
    orderSelectedProducts: [],
    currentPage: null,
    totalPage: 0,
  });

  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    getPodCategories();
    getProducts();
  }, []);

  // get pod categories
  const getPodCategories = () => {
    axios({
      url: BASE_URL + "/api/podCategory/0",
      method: "get",
    })
      .then((res) => {
        setState((prev) => ({ ...prev, podCategories: res.data }));
      })
      .catch(() => {
        toast.error("error getting pod categories");
      });
  };

  // get products
  const getProducts = (page) => {
    setState((prev) => ({ ...prev, loading: true }));
    let params = {
      podCategories: state.filterPodCategories.join(","),
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
          currentPage: res.data?.pageable?.pageNumber,
        }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };

  // handle modal open
  const handleOpen = () => setState((prev) => ({ ...prev, open: !state.open }));

  // handle image
  const handleFile = async (e) => {
    const maxFileSizeInBytes = 2 * 1024 * 1024;
    let file = e.target.files[0];
    if (file?.size > maxFileSizeInBytes) {
      toast.warning("Please upload an image smaller than 2 MB");
    } else {
      setPhoto(file);
      const base64 = await convertToBase64(file);
      const imageUrl = URL.createObjectURL(file);
      setState((prev) => ({ ...prev, imgUrl: imageUrl }));
    }
  };

  // convert to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // handle modal close
  const handleClose = () => {
    clearData();
    setState((prev) => ({
      ...prev,
      open: false,
      isEdit: false,
      editingId: "",
      podCategoryId: "",
    }));
  };

  // handle save data
  const handleSave = () => {
    if (
      state.podCategoryId !== "" &&
      state.name !== "" &&
      state.description !== "" &&
      state.imgFile !== null
    ) {
      const data = {
        title: state.name,
        description: state.description,
        price: state.price,
        active: state.active,
        podCategory_id: state.podCategoryId,
      };

      let formData = new FormData();
      formData.append("product", JSON.stringify(data));
      formData.append("file", photo);

      if (!state.isEdit) {
        axios({
          url: BASE_URL + "/api/product",
          method: "post",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then(() => {
            getProducts();
            clearData();
            setState((prev) => ({
              ...prev,
              open: false,
              isEdit: false,
              editingId: "",
              podCategoryId: "",
            }));
            toast.success("saved success");
          })
          .catch(() => {
            toast.error("failed to save");
          });
      } else {
        axios({
          url: BASE_URL + "/api/product/" + state.editingId,
          method: "put",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then(() => {
            getProducts();
            clearData();
            setState((prev) => ({
              ...prev,
              open: false,
              isEdit: false,
              editingId: "",
              podCategoryId: "",
            }));
            toast.success("update success");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      toast.warning("you must fill all fields");
    }
  };

  // clear modal data
  const clearData = () => {
    setState((prev) => ({
      ...prev,
      name: "",
      description: "",
      podCategoryId: "",
      price: 0,
      imgUrl: null,
      active: false,
    }));
  };

  // handle pod category id
  const handleChange = (e) => {
    setState((prev) => ({ ...prev, podCategoryId: e }));
  };

  // handle Filter
  const handleFilter = (e, id) => {
    getProductsByFilter(e.target.checked, id);
  };

  // handle get products by filter
  const getProductsByFilter = (event, categoryId) => {
    setState((prev) => ({ ...prev, loading: true, currentPage: 0 }));
    let exists = checkIfExists(categoryId);
    if (exists !== -1) {
      state.filterPodCategories.splice(exists, 1);
    } else if (categoryId !== undefined && categoryId !== null) {
      state.filterPodCategories.push(categoryId);
    }

    let params = {
      podCategories: state.filterPodCategories.join(","),
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
          products: res.data.content,
          loading: false,
          totalPage: res.data?.totalPages,
          currentPage: res.data?.pageable?.pageNumber,
        }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };

  // check filter pod categories id
  function checkIfExists(categoryId) {
    for (let i = 0; i < state.filterPodCategories.length; i++) {
      let item = state.filterPodCategories[i];
      if (item === categoryId) {
        return i;
      }
    }
    return -1;
  }

  // edit product
  const handleEdit = (product) => {
    setState((prev) => ({
      ...prev,
      podCategoryId: product.podCategoryId,
      open: true,
      isEdit: true,
      editingId: product.id,
      name: product.title,
      description: product.description,
      price: product.price,
      active: product.active,
    }));
    setPhoto(product?.attachmentId);
  };

  // handle order product modal
  const handleOrderModalOpen = () =>
    setState((prev) => ({ ...prev, orderModalOpen: !state.orderModalOpen }));

  // handle order modal close
  const handleOrderModalClose = () => {
    setState((prev) => ({
      ...prev,
      orderModalOpen: false,
      currentDragPodCategoryId: null,
    }));
  };

  // handle order modal select pod-category
  const handleOrderSelectChange = (e) => {
    setState((prev) => ({ ...prev, currentDragPodCategoryId: e }));
    axios({
      url: BASE_URL + "/api/product/" + e,
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setState((prev) => ({ ...prev, orderSelectedProducts: res.data }));
      })
      .catch(() => {
        toast.error("something went wrong");
      });
  };

  // product drag and drop
  const handleDrag = (oldIndex, newIndex) => {
    axios({
      url: BASE_URL + "/api/product/order",
      method: "PUT",
      data: null,
      params: {
        podCategoryId: state.currentDragPodCategoryId,
        previousIndex: oldIndex,
        nextIndex: newIndex,
      },
    })
      .then(() => {
        getProducts();
        axios({
          url: BASE_URL + "/api/product/" + state.currentDragPodCategoryId,
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            setState((prev) => ({ ...prev, orderSelectedProducts: res.data }));
          })
          .catch(() => {
            toast.error("something went wrong");
          });
        toast.success("order updated success");
      })
      .catch(() => {
        toast.error("order updated error");
      });
  };

  // pagination
  const loadProducts = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
    getProducts(page);
  };
  const next = () => {
    loadProducts(state.currentPage + 1);
  };
  const prev = () => {
    if (state.currentPage === 0) return;
    loadProducts(state.currentPage - 1);
  };

  return (
    <div>
      <div className={"rounded block md:flex gap-3 p-3 min-h-[40rem]"}>
        <div>
          <Button onClick={handleOpen} variant="gradient">
            {languageJson[langIndex]?.admin_panel?.product?.add_btn}
          </Button>
          <button
            onClick={handleOrderModalOpen}
            className={"bg-gray-900 p-2 px-4 ml-2 mt-1 md:mt-0  rounded-md text-white"}
          >
            order
          </button>
          <div className={"mt-4"}>
            <Card
              className={"overflow-y-scroll h-[196px] md:h-auto select-none"}
            >
              <h1 className={"text-center text-2xl"}>Pod-categories</h1>
              <List>
                {state.podCategories.length !== 0 ? (
                  state.podCategories.map((category, index) => (
                    <ListItem
                      onChange={(e) => handleFilter(e, category.id)}
                      key={index}
                      className="p-0"
                    >
                      <label className="flex w-full cursor-pointer items-center px-3 py-2">
                        <ListItemPrefix className="mr-3">
                          <Checkbox
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
                  <span className={"opacity-75 mx-auto"}>not found data</span>
                )}
              </List>
            </Card>
          </div>
        </div>

        <div className={"mt-3"}>
          <Dialog
            dismiss={{ outsidePress: false }}
            open={state.open}
            handler={handleOpen}
          >
            <DialogHeader
              style={{ textAlign: "center" }}
              className={"text-center mx-auto"}
            >
              {languageJson[langIndex]?.admin_panel?.product?.rodal?.name2}
            </DialogHeader>
            <DialogBody divider>
              <div className={"mt-1"}>
                <Select
                  value={state.podCategoryId}
                  onChange={handleChange}
                  label={
                    languageJson[langIndex]?.admin_panel?.product?.rodal
                      ?.select_category
                  }
                >
                  {state.podCategories?.map((category, index) => (
                    <Option key={index} value={category.id}>
                      {category.title}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className={"mt-3"}>
                <Input
                  value={state.name}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  color="blue"
                  label={
                    languageJson[langIndex]?.admin_panel?.product?.rodal
                      ?.product_name
                  }
                />
              </div>
              <div className={"mt-4"}>
                <Input
                  value={state.description}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  color="blue"
                  label={
                    languageJson[langIndex]?.admin_panel?.product?.rodal
                      ?.description
                  }
                />
              </div>
              <div className={"mt-4"}>
                <Input
                  value={state.price}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, price: e.target.value }))
                  }
                  color="blue"
                  label={
                    languageJson[langIndex]?.admin_panel?.product?.rodal?.price
                  }
                  type={"number"}
                />
              </div>
              <div className={"mt-2"}>
                <Checkbox
                  checked={state.active}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, active: e.target.checked }))
                  }
                  label={
                    languageJson[langIndex]?.admin_panel?.product?.rodal?.active
                  }
                />
              </div>
              <div className={"mt-1 flex justify-between gap-3 items-center"}>
                <Input
                  color="blue"
                  label="img"
                  type={"file"}
                  onChange={handleFile}
                />
                <img
                  className="h-14 w-14 rounded-full object-cover object-center"
                  src={
                    state.imgUrl
                      ? state.imgUrl
                      : state.isEdit
                      ? BASE_URL + `/api/attachment/${photo}?prefix=product`
                      : "https://images.unsplash.com/photo-1682407186023-12c70a4a35e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80"
                  }
                  alt="product image"
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="text"
                color="red"
                onClick={handleClose}
                className="mr-1"
              >
                <span>
                  {languageJson[langIndex]?.admin_panel?.product?.rodal?.cansel}
                </span>
              </Button>
              <Button variant="gradient" color="green" onClick={handleSave}>
                <span>
                  {
                    languageJson[langIndex]?.admin_panel?.product?.rodal
                      ?.save_btn
                  }
                </span>
              </Button>
            </DialogFooter>
          </Dialog>
        </div>

        <div
          className={
            "flex justify-center md:justify-normal gap-5 flex-wrap w-full  overflow-y-scroll"
          }
        >
          {state.loading ? (
            <Spinner color="blue" />
          ) : state.products.length !== 0 ? (
            state.products?.map((product, index) => (
              <div key={index}>
                <ProductItem
                  handleEdit={handleEdit}
                  getProducts={getProducts}
                  key={index}
                  product={product}
                />
              </div>
            ))
          ) : (
            <p className={"opacity-75 mx-auto mt-3"}>not found data</p>
          )}
        </div>

        {/*   order product modal   */}
        <Dialog
          size={"xs"}
          dismiss={{ outsidePress: false }}
          open={state.orderModalOpen}
          handler={handleOrderModalOpen}
        >
          <DialogHeader className={"text-center mx-auto"}>
            {" "}
            Products column order{" "}
          </DialogHeader>
          <DialogBody>
            <div>
              <Select
                value={state?.currentDragPodCategoryId}
                onChange={handleOrderSelectChange}
                label={
                  languageJson[langIndex]?.admin_panel?.product?.rodal
                    ?.select_category
                }
              >
                {state.podCategories?.map((category, index) => (
                  <Option key={index} value={category.id}>
                    {category.title}
                  </Option>
                ))}
              </Select>
            </div>
            <hr className="mt-1" />
            <div className={"mt-1"}>
              {state.currentDragPodCategoryId !== null ? (
                <ListOrder
                  values={state.orderSelectedProducts}
                  onChange={({ oldIndex, newIndex }) =>
                    handleDrag(oldIndex, newIndex)
                  }
                  renderList={({ children, props }) => (
                    <ul
                      style={{ overflowY: "scroll", maxHeight: "50vh" }}
                      className="py-1 text-center flex flex-col items-center "
                      {...props}
                    >
                      {children}
                    </ul>
                  )}
                  renderItem={({ value, props, isDragged }) => (
                    <li
                      className={`p-1 rounded bg-gray-200 my-2 w-full cursor-move ${
                        isDragged
                          ? "bg-gray-500 z-[9999] list-none text-white text-center"
                          : ""
                      }`}
                      {...props}
                    >
                      {value?.title}
                    </li>
                  )}
                />
              ) : (
                <p className={"text-center mt-3 opacity-75"}>
                  please select pod-category{" "}
                </p>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleOrderModalClose}
              className="mr-1"
            >
              <span>cancel</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </div>

      <div className={"p-2  w-full mb-1"}>
        {/*  pagination  */}
        {state.currentPage !== null && (
          <div className={"flex justify-center p-3 py-4 select-none"}>
            <div className="flex items-center gap-6">
              <IconButton
                size="sm"
                variant="outlined"
                onClick={prev}
                disabled={state.currentPage === 0}
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
                Page{" "}
                <strong className="text-gray-900">
                  {state.currentPage + 1}
                </strong>{" "}
                of
                <strong className="text-gray-900"> {state.totalPage}</strong>
              </Typography>
              <IconButton
                size="sm"
                variant="outlined"
                onClick={next}
                disabled={
                  state.currentPage + 1 === state.totalPage ||
                  state.totalPage === 0
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
      </div>
    </div>
  );
}

export default ProductPage;
