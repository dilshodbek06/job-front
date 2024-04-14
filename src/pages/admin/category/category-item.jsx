import {Card, CardBody, CardFooter, CardHeader, Checkbox, Typography} from "@material-tailwind/react";
import {toast} from "react-toastify";
import {useContext, useState} from "react";
import LanguageContext from "../../../components/Language/Lan.jsx";
import languageJson from "../../../components/Language/language.json"
import axios from "axios";
import {BASE_URL} from "../../../config/constanse.js";

function CategoryItem({category, handleEdit}) {
    const {langIndex} = useContext(LanguageContext)
    const [titleTruncate, setTitleTruncate] = useState(false)
    const [descTruncate, setDescTruncate] = useState(false)


    const handleChangeActive = (event, categoryId) => {
        axios({
            url: BASE_URL + "/api/category/active/" + categoryId,
            method: "PUT",
            params: {
                active: event.target.checked
            }
        }).then(() => {
            toast.success("change success ")
        })
    }

    return (
        <Card key={category?.id} className="w-56">
            <CardHeader shadow={false} floated={false} className="h-32 flex justify-center items-center">
                <img
                    src={BASE_URL + `/api/attachment/${category?.photo?.id}?prefix=${category?.photo?.prefix}`}
                    alt="card-image"
                    className="w-full h-full"
                />
            </CardHeader>
            <CardBody className={"h-auto w-full"}>
                <Typography onClick={() => setTitleTruncate(!titleTruncate)} color="blue-gray"
                            className={`font-medium cursor-pointer select-none break-all ${!titleTruncate ? 'truncate' : ''} `}>
                    {languageJson[langIndex]?.title}: {category?.title}
                </Typography>
                <Typography onClick={() => setDescTruncate(!descTruncate)}
                            variant="small"
                            color="gray"
                            className={`font-normal cursor-pointer select-none opacity-75 ${!descTruncate ? 'truncate' : ''} break-all`}
                >
                    {languageJson[langIndex]?.description}: {category?.description}
                </Typography>
            </CardBody>
            <CardFooter className="pt-0 flex justify-between items-center">
                <Checkbox onChange={(event) => handleChangeActive(event, category?.id)}
                          label={category?.active ? "active" : "no active"} defaultChecked={category?.active}/>
                <div onClick={() => handleEdit(category)}
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

export default CategoryItem;

