import {
    Button,
    Checkbox,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader, IconButton,
    Input,
    Spinner, Typography
} from "@material-tailwind/react";
import {useContext, useEffect, useState} from "react";
import CategoryItem from "./category-item.jsx";
import {toast} from "react-toastify";
import LanguageContext from "../../../components/Language/Lan.jsx";
import languageJson from "../../../components/Language/language.json"
import axios from "axios";
import {BASE_URL} from "../../../config/constanse.js";


function CategoryPage() {
    const {langIndex} = useContext(LanguageContext)

    const [state, setState] = useState({
        open: false,
        isEdit: false,
        loading: false,
        title: "",
        description: "",
        active: false,
        imgUrl: null,
        categories: [],
        editingId: "",
        currentPage: null,
        totalPage: 0

    });
    const [photo, setPhoto] = useState(null)

    useEffect(() => {
        getCategories()
    }, [])

    // get categories
    const getCategories = (page) => {
        setState(prev => ({...prev, loading: true}))
        let params = {
            page: page
        }
        axios({
            url: BASE_URL + "/api/category",
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
            params: params
        }).then(res => {
            setState(prev => ({
                ...prev, categories: res.data.content, loading: false, totalPage: res.data?.totalPages,
                currentPage: res.data?.pageable?.pageNumber
            }))
        }).catch(() => {
            setState(prev => ({...prev, loading: false}))
        })
    }
    const handleOpen = () =>setState(prev => ({...prev, open: !state.open}))
    // handle file
    const handleFile = async (e) => {
        const maxFileSizeInBytes = 2 * 1024 * 1024;
        let file = e.target.files[0];
        if (file?.size > maxFileSizeInBytes) {
            toast.warning("Please upload an image smaller than 2 MB")
        } else {
            setPhoto(file);
            const base64 = await convertToBase64(file)
            const imageUrl = URL.createObjectURL(file);
            setState(prev => ({...prev, imgUrl: imageUrl}))
        }

    }
    // convert to base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file);
            fileReader.onload = (() => {
                resolve(fileReader.result)
            })
            fileReader.onerror = ((error) => {
                reject(error)
            })
        })
    }
    // handle save data
    const handleSave = () => {
        if (state.title !== "" && state.description !== "") {
            const data = {
                title: state.title,
                description: state.description,
                active: state.active,
            }
            let formData = new FormData();
            formData.append("category", JSON.stringify(data))
            formData.append("file", photo)

            if (!state.isEdit) {
                axios({
                    url: BASE_URL + "/api/category",
                    method: "POST",
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }).then(() => {
                    getCategories()
                    clearData()
                    setState(prev => ({...prev, open: false, isEdit: false, editingId: ""}))
                    toast.success("saved success")
                }).catch(() => {
                    toast.error("something went wrong")

                })
            } else {
                axios({
                    url: BASE_URL + "/api/category/" + state.editingId,
                    method: "PUT",
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }).then(() => {
                    getCategories()
                    clearData()
                    setState(prev => ({...prev, open: false, isEdit: false, editingId: ""}))
                    toast.success("update success")
                }).catch(() => {
                    toast.error("something went wrong")
                })
            }
        } else {
            toast.warning("you must fill all fields")
        }
    }
    // handle close modal
    const handleClose = () => {
        clearData()
        setState(prev => ({...prev, open: false, isEdit: false, editingId: ""}))
    }
    // clear data
    const clearData = () => {
        setState(prev => ({...prev, title: "", description: "", imgUrl: null, active: false}))
        setPhoto(null)
    }
    // update category
    const handleEdit = (category) => {
        setState(prev => ({
            ...prev,
            open: true,
            isEdit: true,
            editingId: category.id,
            title: category.title,
            active: category.active,
            description: category.description,
        }))
        setPhoto(category?.photo?.id)
    }
    // pagination
    const loadProducts = (page) => {
        setState(prev => ({...prev, currentPage: page}))
        getCategories(page)
    }
    const next = () => {
        loadProducts(state.currentPage + 1)
    };
    const prev = () => {
        if (state.currentPage === 0) return;
        loadProducts(state.currentPage - 1)
    };


    return (
        <div className={"rounded  p-3 min-h-[40rem]"}>
            <div className={"w-auto"}>
                <Button onClick={handleOpen}
                        variant="gradient">{languageJson[langIndex]?.admin_panel?.cateogry?.add_btn}</Button>
            </div>
            <div className={"mt-3"}>
                <Dialog dismiss={{outsidePress: false}} open={state.open} handler={handleOpen}>
                    <DialogHeader style={{textAlign: "center"}}
                                  className={"text-center mx-auto"}>{languageJson[langIndex]?.admin_panel?.cateogry?.add_btn}</DialogHeader>
                    <DialogBody divider>
                        <div className={"mt-1"}>
                            <Input value={state.title}
                                   onChange={(e) => setState(prev => ({...prev, title: e.target.value}))
                                   } color="blue"
                                   label={languageJson[langIndex]?.admin_panel?.cateogry?.rodal?.title}/>
                        </div>
                        <div className={"mt-4"}>
                            <Input value={state.description}
                                   onChange={(e) => setState(prev => ({...prev, description: e.target.value}))}
                                   color="blue"
                                   label={languageJson[langIndex]?.admin_panel?.cateogry?.rodal?.description}/>
                        </div>
                        <div className={"mt-2"}>
                            <Checkbox checked={state.active}
                                      onChange={(e) => setState(prev => ({...prev, active: e.target.checked}))}
                                      label={languageJson[langIndex]?.admin_panel?.cateogry?.rodal?.active}/>
                        </div>
                        <div className={"mt-1 flex justify-between gap-3 items-center"}>
                            <Input color="blue" label="img" type={"file"} onChange={handleFile}/>
                            <img
                                className="h-14 w-14 rounded-full object-cover object-center"
                                src={state.imgUrl ? state.imgUrl : state.isEdit ? BASE_URL + `/api/attachment/${photo}?prefix=category` : "https://images.unsplash.com/photo-1682407186023-12c70a4a35e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80"}
                                alt="category image"
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
                            <span>{languageJson[langIndex]?.admin_panel?.cateogry?.rodal?.cansel}</span>
                        </Button>
                        <Button variant="gradient" color="green" onClick={handleSave}>
                            <span>{languageJson[langIndex]?.admin_panel?.cateogry?.rodal?.save_btn}</span>
                        </Button>
                    </DialogFooter>
                </Dialog>
            </div>

            <div className={"flex gap-2 flex-wrap w-full "}>
                {
                    state.loading ? <Spinner color="blue"/> : state.categories?.map((category, index) => (
                        <div className={" h-min"} key={index}>
                            <CategoryItem handleEdit={handleEdit} category={category}/>
                        </div>
                    ))
                }
            </div>

            <div className={"p-2 mb-1  bottom-0"}>
                {/*  pagination  */}
                {
                    state.currentPage !== null && <div className={"flex justify-center p-3 py-4 select-none"}>
                        <div className="flex items-center gap-6">
                            <IconButton
                                size="sm"
                                variant="outlined"
                                onClick={prev}
                                disabled={state.currentPage === 0}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.5}
                                     stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
                                </svg>

                            </IconButton>
                            <Typography color="gray" className="font-normal">
                                Page <strong className="text-gray-900">{state.currentPage + 1}</strong> of
                                <strong
                                    className="text-gray-900"> {state.totalPage}</strong>
                            </Typography>
                            <IconButton
                                size="sm"
                                variant="outlined"
                                onClick={next}
                                disabled={state.currentPage + 1 === state.totalPage}
                            >
                                < svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                                </svg>
                            </IconButton>
                        </div>
                    </div>
                }
            </div>


        </div>
    );
}

export default CategoryPage;