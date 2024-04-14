import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
import PodCategoryItem from "../pod-category/pod-category-item.jsx";
import { BASE_URL } from "../../../config/constanse.js";
import { List as ListOrder } from "react-movable";

function PodCategory() {
  const [state, setState] = useState({
    podCategories: [],
    categories: [],
    open: false,
    orderModalOpen: false,
    isEdit: false,
    loading: false,
    title: "",
    description: "",
    active: false,
    imgUrl: null,
    categoryId: "",
    filterCategories: [],
    editingId: "",
    currentPage: null,
    totalPage: 0,
  });

  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    getPodCategories();
  }, []);
  const getCategories = () => {
    axios({
      url: BASE_URL + "/api/category/pcategory",
      method: "get",
    })
      .then((res) => {
        setState((prev) => ({ ...prev, categories: res.data }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // get pod categories
  const getPodCategories = (page) => {
    setState((prev) => ({ ...prev, loading: true }));

    let params = {
      categories: state.filterCategories.join(","),
      page: page,
    };
    axios({
      url: BASE_URL + "/api/podCategory/filter",
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      params: params,
    })
      .then((res) => {
        setState((prev) => ({
          ...prev,
          podCategories: res.data.content,
          loading: false,
          totalPage: res.data?.totalPages,
          currentPage: res.data?.pageable?.pageNumber,
        }));
      })
      .catch(() => {
        setState({ ...state, loading: false });
      });
  };

  // handle modal open
  const handleOpen = () => setState((prev) => ({ ...prev, open: !state.open }));

  // handle order modal open
  const handleOrderModalOpen = () =>
    setState((prev) => ({ ...prev, orderModalOpen: !state.orderModalOpen }));

  // handle image file
  const handleFile = async (e) => {
    let file = e.target.files[0];
    const maxFileSizeInBytes = 2 * 1024 * 1024;
    if (file?.size > maxFileSizeInBytes) {
      toast.warning("Please upload an image smaller than 2 MB");
    } else {
      setPhoto(file);
      const base64 = await convertToBase64(file);
      const imageUrl = URL.createObjectURL(file);
      setState((prev) => ({ ...prev, imgUrl: imageUrl }));
    }
  };

  // convert image file to base64
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

  // save pod category
  const handleSave = () => {
    if (state.title !== "" && state.description !== "") {
      const data = {
        title: state.title,
        description: state.description,
        active: state.active,
        category_id: state.categoryId,
      };

      let formData = new FormData();
      formData.append("podCategory", JSON.stringify(data));
      formData.append("file", photo);

      if (!state.isEdit) {
        axios({
          url: BASE_URL + "/api/podCategory",
          method: "POST",
          data: formData,
        })
          .then(() => {
            getPodCategories();
            clearData();
            setState((prev) => ({
              ...prev,
              open: false,
              isEdit: false,
              editingId: "",
              categoryId: "",
            }));
            toast.success("saved success");
          })
          .catch(() => {
            toast.error("saved error");
          });
      } else {
        axios({
          url: BASE_URL + "/api/podCategory/" + state.editingId,
          method: "PUT",
          data: formData,
        })
          .then(() => {
            getPodCategories();
            clearData();
            setState((prev) => ({
              ...prev,
              open: false,
              isEdit: false,
              editingId: "",
              categoryId: "",
            }));
            toast.success("update success");
          })
          .catch(() => {
            toast.error("update error");
          });
      }
    } else {
      toast.warning("you must fill all fields");
    }
  };

  // handle select category
  const handleChange = (e) => {
    setState((prev) => ({ ...prev, categoryId: e }));
  };

  // close modal
  const handleClose = () => {
    setState((prev) => ({
      ...prev,
      open: false,
      isEdit: false,
      editingId: "",
      categoryId: "",
    }));
    clearData();
  };

  // handle order modal close
  const handleOrderModalClose = () => {
    setState((prev) => ({ ...prev, orderModalOpen: false }));
  };

  //clear data
  const clearData = () => {
    setState((prev) => ({
      ...prev,
      title: "",
      description: "",
      imgUrl: null,
      active: false,
    }));
    setPhoto(null);
  };

  // handle filter
  const handleFilter = (e, id) => {
    getPodCategoriesByFilter(e.target.checked, id);
  };

  // get pod-categories by filter
  const getPodCategoriesByFilter = (event, categoryId) => {
    setState((prev) => ({ ...prev, loading: true, currentPage: 0 }));
    let exists = checkIfExists(categoryId);
    if (exists !== -1) {
      state.filterCategories.splice(exists, 1);
    } else if (categoryId !== undefined && categoryId !== null) {
      state.filterCategories.push(categoryId);
    }

    let params = {
      categories: state.filterCategories.join(","),
      page: 0,
    };

    axios({
      url: BASE_URL + "/api/podCategory/filter",
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      params: params,
    })
      .then((res) => {
        setState((prev) => ({
          ...prev,
          podCategories: res.data.content,
          loading: false,
          totalPage: res.data?.totalPages,
          currentPage: res.data?.pageable?.pageNumber,
        }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };

  // check category exist in filter array
  function checkIfExists(categoryId) {
    for (let i = 0; i < state.filterCategories.length; i++) {
      let item = state.filterCategories[i];
      if (item === categoryId) {
        return i;
      }
    }
    return -1;
  }

  // edit pod category
  const handleEdit = (podCategory) => {
    setState((prev) => ({
      ...prev,
      categoryId: podCategory.categoryId,
      open: true,
      isEdit: true,
      editingId: podCategory.id,
      title: podCategory.title,
      description: podCategory.description,
      active: podCategory.active,
    }));
    setPhoto(podCategory?.attachmentId);
  };

  // order pod-category
  const handleDrag = (oldIndex, newIndex) => {
    axios({
      url: BASE_URL + "/api/podCategory/order",
      method: "PUT",
      data: null,
      params: {
        previousIndex: oldIndex,
        nextIndex: newIndex,
      },
    })
      .then(() => {
        getPodCategories();
        toast.success("order updated success");
      })
      .catch((err) => {
        console.log(err);
        toast.error("order updated error");
      });
  };

  // pagination
  const loadProducts = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
    getPodCategories(page);
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
      <div className={"rounded block md:flex gap-3  p-3 min-h-[40rem]"}>
        <div>
          <Button onClick={handleOpen} variant="gradient">
            +pod-category
          </Button>
          <button
            onClick={handleOrderModalOpen}
            className={"bg-gray-900 p-2 px-5 ml-2 rounded-md text-white"}
          >
            order
          </button>
          <div className={"mt-4"}>
            <Card
              className={"overflow-y-scroll h-[196px] md:h-auto select-none"}
            >
              <h1 className={"text-center text-2xl"}>Categories</h1>
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
              {" "}
              Add pod-category{" "}
            </DialogHeader>
            <DialogBody divider>
              <div className={"mt-1"}>
                <Select
                  value={state.categoryId}
                  onChange={handleChange}
                  label={"select category"}
                >
                  {state.categories?.map((category, index) => (
                    <Option key={index} value={category.id}>
                      {category.title}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className={"mt-3"}>
                <Input
                  value={state.title}
                  onChange={(e) =>
                    setState({ ...state, title: e.target.value })
                  }
                  color="blue"
                  label={"title"}
                />
              </div>
              <div className={"mt-4"}>
                <Input
                  value={state.description}
                  onChange={(e) =>
                    setState({ ...state, description: e.target.value })
                  }
                  color="blue"
                  label={"description"}
                />
              </div>
              <div className={"mt-2"}>
                <Checkbox
                  checked={state.active}
                  onChange={(e) =>
                    setState({ ...state, active: e.target.checked })
                  }
                  label={"active"}
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
                      ? BASE_URL + `/api/attachment/${photo}?prefix=podCategory`
                      : "https://images.unsplash.com/photo-1682407186023-12c70a4a35e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80"
                  }
                  alt="pod category image"
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
                <span>cancel</span>
              </Button>
              <Button variant="gradient" color="green" onClick={handleSave}>
                <span>save</span>
              </Button>
            </DialogFooter>
          </Dialog>
        </div>
        <div
          className={
            "flex justify-center md:justify-normal gap-5 flex-wrap w-full min-h-[85vh]"
          }
        >
          {state.loading ? (
            <Spinner color="blue" />
          ) : state.podCategories.length !== 0 ? (
            state.podCategories?.map((podCategory, index) => (
              <div key={index}>
                <PodCategoryItem
                  key={index}
                  handleEdit={handleEdit}
                  podCategory={podCategory}
                />
              </div>
            ))
          ) : (
            <p className={"opacity-75 mx-auto mt-3"}>not found data</p>
          )}
        </div>

        {/*   order pod-category modal   */}
        <Dialog
          size={"xs"}
          dismiss={{ outsidePress: false }}
          open={state.orderModalOpen}
          handler={handleOrderModalOpen}
        >
          <DialogHeader className={"text-center mx-auto"}>
            {" "}
            Pod-categories column order{" "}
          </DialogHeader>
          <DialogBody>
            <div className={"mt-1"}>
              <ListOrder
                values={state.podCategories}
                onChange={({ oldIndex, newIndex }) =>
                  handleDrag(oldIndex, newIndex)
                }
                renderList={({ children, props }) => (
                  <ul
                    style={{ overflowY: "scroll", maxHeight: "55vh" }}
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

      <div className={"p-2 w-full mb-1"}>
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

export default PodCategory;
