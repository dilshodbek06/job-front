import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Input,
  Select,
  Option,
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialHandler,
  Spinner,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import CheckAdmin from "../../config/checkAdmin.jsx";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../config/constanse.js";

// eslint-disable-next-line react/prop-types
function SpeedDialCompone({ location }) {
  const [state, setState] = useState({
    loading: false,
    createLoading: false,
    categories: [],
    categoryId: "",
    rolName: "",
    open: false,
    phone: "",
    password: "",
    telegramToken: "",
    chatId: "",
    date: "",
    urlData: null,
  });

  const urlCategoryId = useParams();

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = () => {
    setState((prev) => ({ ...prev, loading: true }));
    axios({
      url: BASE_URL + "/api/category/pcategory",
      method: "get",
    })
      .then((res) => {
        setState((prev) => ({ ...prev, categories: res.data, loading: false }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loading: false }));
        toast.error("something went wrong");
      });
  };
  const handleCopyLink = () => {
    const textArea = document.createElement("textarea");
    textArea.value = location;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    toast.success("Link copied successfully");
  };
  const handleGlobalShare = () => {
    if (state.urlData !== null) {
      toast.warning("please create new login and password");
    } else {
      if (navigator.share) {
        navigator
          .share({
            title: location,
            phone: state.urlData?.phone,
            password: state.urlData?.password,
          })
          .then(() => {
            setState((prev) => ({ ...prev, urlData: null }));
          })
          .catch((error) => console.log("Не удалось поделиться", error));
      }
    }
  };
  const handleModalOpen = () => {
    setState((prev) => ({ ...prev, open: true }));
  };
  const handleCloseModal = () => {
    setState((prev) => ({ ...prev, open: false }));
    clearModalData();
  };
  // handle agent save
  const handleAgentSave = () => {
    if (
      state.password !== "" &&
      state.phone !== "" &&
      state.date !== "" &&
      state.categoryId !== "" &&
      state.chatId !== "" &&
      state.telegramToken !== "" &&
      state?.rolName !== ""
    ) {
      const currentDate = new Date(state.date);
      const myDate = currentDate.getTime();
      const data = {
        phone: state.phone?.startsWith("+") ? state?.phone : "+" + state?.phone,
        telegram_token: state.telegramToken,
        chatId: state.chatId,
        password: state.password,
        expiration_date: myDate,
        category_id:
          state.categoryId === "" ? urlCategoryId?.id : state.categoryId,
        role_name: state.rolName,
      };
      setState((prev) => ({ ...prev, createLoading: true }));

      axios({
        url: BASE_URL + "/api/auth/agent/register/user",
        method: "post",
        data: data,
      })
        .then((res) => {
          if (
            res.data ===
            "userga berilayotgan vaqt hozirgi vaqtdan keyinda bo'lishi kerak!"
          ) {
            toast.error(
              "userga berilayotgan vaqt hozirgi vaqtdan keyinda bo'lishi kerak!"
            );
          } else {
            setState((prev) => ({ ...prev, urlData: data }));
            toast.success("login password generated");
            handleCloseModal();
            clearModalData();
          }
          setState((prev) => ({ ...prev, createLoading: false }));
        })
        .catch((err) => {
          if (err?.response?.data === "kategoriya band") {
            toast.warning("this category is busy");
            setState((prev) => ({ ...prev, createLoading: false }));
            return;
          }
          if (err?.response?.data === "telefon nomer band") {
            toast.warning("this phone number is busy");
            setState((prev) => ({ ...prev, createLoading: false }));
            return;
          }
          clearModalData();
          setState((prev) => ({ ...prev, createLoading: false }));
        });
    } else {
      toast.warning("Please fill all fields");
    }
  };
  // handle client save
  const handleClientSave = () => {
    if (
      state.password !== "" &&
      state.phone !== "" &&
      state.date !== "" &&
      state.categoryId !== "" &&
      state?.rolName !== ""
    ) {
      const currentDate = new Date(state.date);
      const myDate = currentDate.getTime();
      const data = {
        phone: state.phone?.startsWith("+") ? state?.phone : "+" + state?.phone,
        password: state.password,
        expiration_date: myDate,
        category_id:
          state.categoryId === "" ? urlCategoryId?.id : state.categoryId,
        role_name: state.rolName,
      };
      setState((prev) => ({ ...prev, createLoading: true }));

      axios({
        url: BASE_URL + "/api/auth/client/register/user",
        method: "post",
        data: data,
      })
        .then((res) => {
          if (
            res.data ===
            "userga berilayotgan vaqt hozirgi vaqtdan keyinda bo'lishi kerak!"
          ) {
            toast.error(
              "userga berilayotgan vaqt hozirgi vaqtdan keyinda bo'lishi kerak!"
            );
          } else {
            setState((prev) => ({ ...prev, urlData: data }));
            toast.success("login password generated");
            handleCloseModal();
            clearModalData();
          }
          setState((prev) => ({ ...prev, createLoading: false }));
        })
        .catch(() => {
          clearModalData();
          setState((prev) => ({ ...prev, createLoading: false }));
        });
    } else {
      toast.warning("Please fill all fields");
    }
  };
  // clear data
  const clearModalData = () => {
    setState((prev) => ({
      ...prev,
      phone: "",
      password: "",
      date: "",
      categoryId: "",
      telegramToken: "",
      chatId: "",
      rolName: "",
    }));
  };

  const handleChange = (e) => {
    setState((prev) => ({ ...prev, categoryId: e }));
  };
  // handle role
  const handleRolChange = (e) => {
    setState((prev) => ({ ...prev, rolName: e }));
  };

  return (
    <div>
      <SpeedDial>
        <SpeedDialHandler>
          <IconButton size="lg" className="rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className=" hidden h-5 w-5 group-hover:block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className=" block h-5 w-5 group-hover:hidden"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </IconButton>
        </SpeedDialHandler>
        <SpeedDialContent>
          <SpeedDialAction>
            <svg
              onClick={handleCopyLink}
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
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          </SpeedDialAction>
          <SpeedDialAction>
            <svg
              onClick={handleGlobalShare}
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
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
          </SpeedDialAction>
          <SpeedDialAction>
            <svg
              onClick={handleModalOpen}
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
                d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5"
              />
            </svg>
          </SpeedDialAction>
        </SpeedDialContent>
      </SpeedDial>

      {/*  modal  */}
      <div>
        <Dialog dismiss={{ outsidePress: false }} open={state.open} size={"xs"}>
          <DialogHeader className={" flex justify-center"}>
            Generate new phone and password
          </DialogHeader>
          <DialogBody divider>
            <CheckAdmin>
              <div className={"mt-1"}>
                <Select
                  size="md"
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
            </CheckAdmin>
            <CheckAdmin>
              {state.loading ? (
                <Spinner className={"mt-3 mx-auto"} color="blue" />
              ) : (
                <div className={"mt-4"}>
                  <Select onChange={handleRolChange} label="Select role">
                    <Option value={"client"}>Client</Option>
                    <Option value={"agent"}>Agent</Option>
                  </Select>
                </div>
              )}
            </CheckAdmin>
            <div className={"mt-4"}>
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
            {state?.rolName !== "client" && (
              <div>
                <div className={"mt-4"}>
                  <Input
                    type={"tel"}
                    value={state.telegramToken}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        telegramToken: e.target.value,
                      }))
                    }
                    color="blue"
                    label={"telegram token"}
                  />
                </div>
                <div className={"mt-4"}>
                  <Input
                    type={"tel"}
                    value={state.chatId}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, chatId: e.target.value }))
                    }
                    color="blue"
                    label={"chat ID"}
                  />
                </div>
              </div>
            )}

            <div className={"mt-4"}>
              <Input
                value={state.password}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, password: e.target.value }))
                }
                color="blue"
                label={"password"}
              />
            </div>
            <div className={"mt-4"}>
              <Input
                type={"datetime-local"}
                value={state.date}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, date: e.target.value }))
                }
                color="blue"
                label={"active-time"}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCloseModal}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
            <Button
              loading={state?.createLoading}
              variant="gradient"
              color="green"
              onClick={
                state?.rolName === "agent" ? handleAgentSave : handleClientSave
              }
            >
              <span>save</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
}

export default SpeedDialCompone;
