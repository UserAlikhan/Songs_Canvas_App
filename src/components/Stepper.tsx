"use client"

import { increase, decrease } from "@/app/lib/features/quantity-slice"
import { AppDispatch, useAppSelector } from "@/app/lib/store";
import { useDispatch } from "react-redux";

function Stepper() {
    const dispatch = useDispatch<AppDispatch>();
    const quantity = useAppSelector((state) => state.quantityReducer.value.quantity);
    // Увеличения колличества Circle на Canvas
    const increment = () => {
        dispatch(increase());
    };
    // Уменьшение колличества Circle на Canvas
    const decrement = () => {
        dispatch(decrease())
    }
    return (
        <div className="absolute bottom-10 right-10 m-7">
            <div className="flex flex-col items-center border-2 border-black w-[56px] h-[120px]">
                <button onClick={decrement} className="px-2 py-1 rounded w-full font-bold text-3xl">-</button>
                <span className="mx-2">{quantity}</span>
                <button onClick={increment} className="px-2 py-1 rounded w-full font-bold text-3xl">+</button>
            </div>
        </div>
    )
}

export default Stepper