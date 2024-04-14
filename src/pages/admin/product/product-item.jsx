import {Card, CardBody, CardFooter, CardHeader, Typography} from "@material-tailwind/react";
import {useContext, useState} from "react";
import LanguageContext from "../../../components/Language/Lan.jsx";
import languageJson from "../../../components/Language/language.json"
import axios from "axios";
import {BASE_URL} from "../../../config/constanse.js";
import {toast} from "react-toastify";

function ProductItem({product, getProducts, handleEdit}) {
    const {langIndex} = useContext(LanguageContext)

    const [titleTruncate, setTitleTruncate] = useState(false)
    const [descTruncate, setDescTruncate] = useState(false)

    const handleDelete = (id) => {
        axios({
            url: BASE_URL + "/api/product/" + id,
            method: "delete"
        }).then(() => {
            getProducts()
            toast.success("delete successfully")
        }).catch(() => {
            toast.error("delete error")
        })
    }

    return (
        <Card key={product?.id} className="w-52">
            <CardHeader shadow={false} floated={false}
                        className="h-32 flex justify-center items-center  p-1">
                <img
                    src={BASE_URL + `/api/attachment/${product?.attachmentId}?prefix=product`}
                    alt="card-image"
                    className="h-full w-full"
                />
            </CardHeader>
            <CardBody className={"h-auto"}>
                <Typography color="blue-gray"
                            className={`font-medium cursor-pointer select-none break-all `}>
                    <span className={"font-bold"}>  {languageJson[langIndex]?.price}:</span> {product?.price} sum
                </Typography>
                <Typography onClick={() => setTitleTruncate(!titleTruncate)} color="blue-gray"
                            className={`font-medium cursor-pointer select-none break-all ${!titleTruncate ? 'truncate' : ''} `}>
                    <span className={"font-bold"}>  {languageJson[langIndex]?.name}:</span> {product?.title}
                </Typography>

                <Typography onClick={() => setDescTruncate(!descTruncate)}
                            variant="small"
                            color="gray"
                            className={`font-normal cursor-pointer select-none opacity-75 ${!descTruncate ? 'truncate' : ''} break-all`}
                >
                    {languageJson[langIndex]?.description}: {product?.description}
                </Typography>
            </CardBody>
            <CardFooter className="pt-0 flex justify-between items-center">
                <div className={"cursor-pointer hover:bg-gray-100 rounded-lg p-1 flex justify-center items-center"}
                     onClick={() => handleDelete(product?.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                    </svg>

                </div>
                <div onClick={() => handleEdit(product)}
                     className={"cursor-pointer hover:bg-gray-100 rounded-lg p-1 flex justify-center items-center"}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
                    </svg>
                </div>
            </CardFooter>
        </Card>
    );
}

export default ProductItem;
