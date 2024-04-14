import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../config/constanse.js";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import SearchButton from "./searchButton.jsx";

function Users() {
  const [state, setState] = useState({
    clients: [],
    categories: [],
    editingId: "",
    open: false,
    phone: "",
    date: "",
    password: "",
    categoryId: "",
    search: "",
  });

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = () => {
    axios({
      url: BASE_URL + "/api/category/pcategory",
      method: "get",
    })
      .then((res) => {
        setState((prev) => ({ ...prev, categories: res.data }));
      })
      .catch(() => {
        toast.error("something went wrong");
      });
  };

  useEffect(() => {
    getClients();
  }, []);

  const getClients = () => {
    let search = state.search.replace("+", "");
    axios({
      url: BASE_URL + "/api/auth/users?search=" + search,
      method: "get",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((res) => {
        setState((prev) => ({ ...prev, clients: res.data }));
      })
      .catch(() => {
        toast.error("something went wrong");
      });
  };

  const handleEdit = (user) => {
    console.log(user);
    setState((prev) => ({
      ...prev,
      open: true,
      phone: user.phone,
      date: user.expiration_date,
      editingId: user.id,
      categoryId: user.category_id,
    }));
  };

  const handleDelete = (id) => {
    axios({
      url: BASE_URL + "/api/auth/" + id,
      method: "delete",
    })
      .then(() => {
        toast.success("deleted success");
        getClients();
      })
      .catch(() => {
        toast.error("something went wrong");
      });
  };

  function isExpired(item) {
    return item.expiration_date
      ? new Date(item?.expiration_date).getTime() < new Date().getTime()
      : "admin";
  }

  const handleOpen = () => setState((prev) => ({ ...prev, open: !state.open }));

  const handleClose = () => {
    clearData();
    setState((prev) => ({ ...prev, open: false, editingId: "" }));
  };

  const clearData = () => {
    setState((prev) => ({ ...prev, phone: "", password: "", date: "" }));
  };

  // const handleSave = () => {
  //   if (state.phone !== "" && state.date !== "") {
  //     if (new Date(state.date) > new Date()) {
  //       axios({
  //         url: BASE_URL + "/api/auth/" + state.editingId,
  //         method: "put",
  //         data: {
  //           phone: state.phone,
  //           password: state.password,
  //           category_id: state.categoryId,
  //           expiration_date: new Date(state.date).getTime(),
  //         },
  //       })
  //         .then(() => {
  //           getClients();
  //           toast.success("update success");
  //           setState((prev) => ({ ...prev, open: false, editingId: "" }));
  //           clearData();
  //         })
  //         .catch(() => {
  //           toast.error("something went wrong");
  //         });
  //     } else {
  //       toast.error("please enter the current date");
  //     }
  //   } else {
  //     toast.warning("please fill all fields");
  //   }
  // };

  const handleSave = () => {
    const { phone, date, editingId, categoryId, password } = state;

    if (!phone && !date) {
      toast.warning("Please fill all fields");
      return;
    }

    const expirationDate = new Date(date);

    if (expirationDate <= new Date()) {
      toast.error("Please enter a date in the future");
      return;
    }

    const config = {
      url: `${BASE_URL}/api/auth/${editingId}`,
      method: "put",
      data: {
        phone,
        password,
        category_id: categoryId,
        expiration_date: expirationDate.getTime(),
      },
    };

    axios(config)
      .then(() => {
        getClients();
        toast.success("Update success");
        setState((prev) => ({ ...prev, open: false, editingId: "" }));
        clearData();
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  const handleChange = (e) => {
    setState((prev) => ({ ...prev, categoryId: e }));
  };

  const handleSearchPhone = () => {
    getClients();
  };

  return (
    <div className={"py-4 h-screen overflow-y-scroll"}>
      <div className="flex flex-col">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-0">
          <div className="inline-block min-w-full py-2">
            <div className="overflow-hidden">
              <div className="mt-1 mb-1 w-1/3">
                <Input
                  value={state.search}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, search: e.target.value }))
                  }
                  type="tel"
                  label="search phone.."
                  icon={
                    <span
                      onClick={handleSearchPhone}
                      className="cursor-pointer rounded-full p-1 mt-[-5px] ml-[-3px] hover:bg-gray-50"
                    >
                      <SearchButton />
                    </span>
                  }
                />
              </div>
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b bg-gray-50 font-medium dark:border-neutral-500">
                  <tr>
                    <th scope="col" className="px-3 py-4">
                      N
                    </th>
                    <th scope="col" className="px-3 py-4">
                      Phone
                    </th>
                    <th scope="col" className="px-3 py-4">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-4">
                      Category
                    </th>
                    <th
                      colSpan={2}
                      scope="col"
                      className="px-3 py-4 text-center"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* map qilib chiziladi */}
                  {state.clients?.map((item, index) => (
                    <tr
                      className={`border-b dark:border-neutral-500  ${
                        isExpired(item) && isExpired(item) !== "admin"
                          ? "line-through"
                          : ""
                      }`}
                      key={index}
                    >
                      <td
                        className={
                          "whitespace-nowrap px-3 border py-4 font-medium"
                        }
                      >
                        {index + 1}
                      </td>
                      <td
                        className={
                          "whitespace-nowrap px-3 border py-4 font-medium"
                        }
                      >
                        {item.phone}
                      </td>
                      <td className={"whitespace-nowrap px-3 border py-4"}>
                        {item.expiration_date === null
                          ? "Admin"
                          : new Date(item.expiration_date)
                              .toString()
                              .substring(0, 25)}
                      </td>
                      <td className={"whitespace-nowrap px-3 border py-4"}>
                        {state.categories.find(
                          (cat) => cat.id === item.category_id
                        )?.title || "not found"}
                      </td>
                      {isExpired(item) !== "admin" ? (
                        <td className={"whitespace-nowrap border py-4"}>
                          <div
                            onClick={() => handleEdit(item)}
                            className={
                              "cursor-pointer hover:bg-gray-100 rounded-lg p-1 flex justify-center items-center"
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
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </div>
                        </td>
                      ) : (
                        <td
                          className={
                            "text-center whitespace-nowrap border py-4 "
                          }
                        >
                          Admin
                        </td>
                      )}
                      {isExpired(item) !== "admin" ? (
                        <td className={"whitespace-nowrap border py-4 "}>
                          <div
                            onClick={() => handleDelete(item?.id)}
                            className={
                              "cursor-pointer hover:bg-gray-100 rounded-lg p-1 flex justify-center items-center"
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
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </div>
                        </td>
                      ) : (
                        <td
                          className={
                            "text-center whitespace-nowrap border py-4 "
                          }
                        >
                          Admin
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* modal for edit user   */}

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
            update user{" "}
          </DialogHeader>
          <DialogBody divider>
            <div className={"mt-1"}>
              <Input
                type={"tel"}
                value={state.phone}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, phone: e.target.value }))
                }
                color="blue"
                label={"phone"}
              />
            </div>
            <div className={"mt-4"}>
              <Input
                value={state.password}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, password: e.target.value }))
                }
                color="blue"
                label={"new password..."}
              />
            </div>
            <div className={"mt-4"}>
              <Input
                min={Date.now()}
                type={"datetime-local"}
                value={state.date}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, date: e.target.value }))
                }
                color="blue"
                label={"active-time"}
              />
            </div>
            <div className={"mt-4"}>
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
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleClose}
              className="mr-1"
            >
              <span>{"Cancel"}</span>
            </Button>
            <Button variant="gradient" color="green" onClick={handleSave}>
              <span>save</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
}

export default Users;
