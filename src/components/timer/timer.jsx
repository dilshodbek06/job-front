import {useEffect, useState, useCallback} from "react";
import axios from "axios";
import {BASE_URL} from "../../config/constanse.js";

const Timer = () => {


    useEffect(() => {
        getDate()
    }, [])

    const [date, setDate] = useState("")
    const [countDownTime, setCountDownTIme] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
    });

    const getDate = () => {
        let token = localStorage.getItem('token');
        if (token !== null) {
            axios({
                url: BASE_URL + '/api/auth/get/me', method: 'get', headers: {
                    Authorization: token,
                }
            }).then(res => {
                setDate(res.data?.expiration_date)
            }).catch(err => {
                console.log(err)
            })
        }
    }


    const getTimeDiffrence = (countDownTime) => {
        const currentTime = new Date().getTime();
        const timeDiffrence = countDownTime - currentTime;
        let days =
            Math.floor(timeDiffrence / (24 * 60 * 60 * 1000)) >= 10
                ? `${Math.floor(timeDiffrence / (24 * 60 * 60 * 1000))}`
                : `0${Math.floor(timeDiffrence / (24 * 60 * 60 * 1000))}`;
        const hours =
            Math.floor((timeDiffrence % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)) >=
            10
                ? `${Math.floor(
                    (timeDiffrence % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)
                )}`
                : `0${Math.floor(
                    (timeDiffrence % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)
                )}`;
        const minutes =
            Math.floor((timeDiffrence % (60 * 60 * 1000)) / (1000 * 60)) >= 10
                ? `${Math.floor((timeDiffrence % (60 * 60 * 1000)) / (1000 * 60))}`
                : `0${Math.floor((timeDiffrence % (60 * 60 * 1000)) / (1000 * 60))}`;
        const seconds =
            Math.floor((timeDiffrence % (60 * 1000)) / 1000) >= 10
                ? `${Math.floor((timeDiffrence % (60 * 1000)) / 1000)}`
                : `0${Math.floor((timeDiffrence % (60 * 1000)) / 1000)}`;
        if (timeDiffrence < 0) {
            setCountDownTIme({
                days: "00",
                hours: "00",
                minutes: "00",
                seconds: "00",
            });
            clearInterval();
        } else {
            setCountDownTIme({
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds,
            });
        }
    };

    const startCountDown = useCallback(() => {
        {
            if (date !== "") {
                const customDate = new Date(date)
                let countDownDate = new Date(
                    customDate?.getFullYear(),
                    customDate?.getMonth(),
                    customDate?.getDate(),
                    customDate?.getHours(),
                    customDate?.getMinutes(),
                    customDate?.getSeconds()
                );
                setInterval(() => {
                    getTimeDiffrence(countDownDate.getTime());
                }, 1000);
            }
        }
    }, [date]);


    useEffect(() => {
        startCountDown();
    }, [startCountDown]);


    return (
        <div
            className="scale-75 bg-[conic-gradient(at_bottom_left _var(--tw-gradient-stops))] from-fuchsia-300 via-green-400 to-rose-700">
            <div className="flex justify-center flex-col gap-4">
                <div className="flex gap-2 items-center justify-center">
                    <div className="flex gap-1 ">
            <span
                className="bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl">
              {countDownTime?.days?.charAt(0)}
            </span>
                        <span
                            className="bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl">
              {countDownTime?.days?.charAt(1)}
            </span>
                        <span
                            className={
                                countDownTime?.days?.length <= 2
                                    ? "hidden"
                                    : "bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl"
                            }
                        >
              {countDownTime?.days?.charAt(2)}
            </span>
                    </div>
                    <span className="text-[#FBFAF8] text-[20px] sm:text-[40px]">:</span>
                    <div className="flex gap-1 shadow-lg">
            <span
                className="bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl">
              {countDownTime?.hours?.charAt(0)}
            </span>
                        <span
                            className="bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl">
              {countDownTime?.hours?.charAt(1)}
            </span>
                    </div>
                    <span className="text-[#FBFAF8] text-[20px] sm:text-[40px]">:</span>
                    <div className="flex gap-1">
            <span
                className="bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl">
              {countDownTime?.minutes?.charAt(0)}
            </span>
                        <span
                            className="bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl">
              {countDownTime?.minutes?.charAt(1)}
            </span>
                    </div>
                    <span className="text-[#FBFAF8] text-[20px] sm:text-[40px]">:</span>
                    <div className="flex gap-1">
            <span
                className="bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl">
              {countDownTime?.seconds?.charAt(0)}
            </span>
                        <span
                            className="bg-[#2D3C7B] font-semibold text-[#FBFAF8] text-[20px] sm:text-[40px] py-1 px-2  rounded drop-shadow-xl">
              {countDownTime?.seconds?.charAt(1)}
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Timer;
