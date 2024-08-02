"use client"

import { useEffect, useRef, useState } from "react"
import { Circle, Canvas as FabricCanvas, Group, Line, Text } from "fabric";
import axios from "axios";
import { TrackWithId } from "@/types/types";
import Modal from "./Modal";
import { spotifyApi } from "@/utils/spotifyApi";
import Stepper from "./Stepper";
import { AppDispatch, useAppSelector } from "@/app/lib/store";
import { useDispatch } from "react-redux";
import { setSelectedTrack } from "@/app/lib/features/selected-track-slice";
import { addAccessToken } from "@/app/lib/features/access_token-slice";

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const [isModal, setIsModal] = useState(false);

    const [dataset, setDataset] = useState<TrackWithId[]>([])
    // Максимальное и минимально допустимые радиусы круга
    const maxRadius = 60;
    const minRadius = 25;
    // Значение quantity из Redux Store
    const quantity = useAppSelector((state) => state.quantityReducer.value.quantity)
    // Авторизация в Spotify для получения jwt токена
    const authorization = async () => {
        const response = await spotifyApi.post('', null, {
          params: {
              grant_type: 'client_credentials',
              client_id: process.env.CLIENT_ID,
              client_secret: process.env.CLIENT_SECRET,
        }}) 
        dispatch(addAccessToken(response.data.access_token))
        return response.data
    }
    // Запрос к базе данных на получение треков
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`http://localhost:3000/api/tracks?page=${quantity}`)
            const data: TrackWithId[] = response.data
            setDataset(data)
        };
        
        fetchData();
        authorization();
    }, [quantity])

    useEffect(() => {
        if (canvasRef.current) {
            // Инициализация Canvas
            const canvas = new FabricCanvas(canvasRef.current);
            // Получение самого большого ранка из данных
            const allTimeRank = dataset.map(item => item.allTimeRank);

            const maxValue = Math.max(...allTimeRank.map(Math.abs));
            const minValue = Math.min(...allTimeRank.map(Math.abs));

            // Круги с названием трека внутри
            const circles = dataset.map((item, index) => {
                const normalizedValue = (Math.abs(item.allTimeRank) - minValue) / (maxValue - minValue);
                const radius = minRadius + normalizedValue * (maxRadius - minRadius);
                // Генерация координат для Circle
                const x = Math.random() * (canvas.width - radius * 3) + radius;
                const y = Math.random() * (canvas.height - radius * 3) + radius;

                const circle = new Circle({
                    radius: radius,
                    fill: dataset[index].categoryColor,
                    originX: 'center',
                    originY: 'center',
                });

                const text = new Text(
                    dataset[index].track.length < 7 
                        ? dataset[index].track.toString()
                        : dataset[index].track.slice(0, 7) + '...', 
                    {
                        fontSize: radius / 2 - 2,
                        originX: 'center',
                        originY: 'center',
                    }
                )

                // Объединение Circle с Text
                const group = new Group([circle, text], {
                    left: x,
                    top: y,
                })
                // Удаление краев
                group.hasControls = group.hasBorders = false;
                // Добавление объектов в Canvas
                canvas.add(group);

                return { group, color: item.categoryColor, radius: radius }
            })
            
            // Объядиняем круги с одинаковым цветом
            const colorMap = new Map<string, any[]>();

            circles.forEach((circle, index) => {
                if (!colorMap.has(circle.color)) {
                    colorMap.set(circle.color, [])
                }
                colorMap.get(circle.color)?.push({...circle.group, radius: circle.radius, categoryNodeColor: dataset[index].categoryNodeColor})

                canvas.bringObjectForward(circle.group)
                canvas.bringObjectToFront(circle.group)
                // при нажатии на круг открыть модальное окно с информацией о треке
                circle.group.on('mousedown', () => {
                    dispatch(setSelectedTrack(dataset[index]))
                    setIsModal(true);
                })
            })
            
            // Объядиняем круги с одинаковым цветом линиями
            colorMap.forEach(circles => {
                circles.forEach((circle1, index) => {
                    for (let i = index + 1; i < circles.length; i++) {
                        const circle2 = circles[i];
                        const line = new Line(
                            [
                                circle1.left + circle1.radius, circle1.top + circle1.radius, circle2.left + circle2.radius, circle2.top + circle2.radius
                            ], 
                            {
                                stroke: circle1.categoryNodeColor,
                                strokeWidth: 7,
                                selectable: false,
                            }
                        )
                        canvas.add(line);
                    }
                })
            })

            return () => {
                canvas.dispose();
            }
        }
    }, [dataset])
    
    return (
        <>
            <canvas ref={canvasRef} width={1920} height={900} />
            {isModal && (
                <Modal onClose={() => setIsModal(false)}/>
            )}
            <Stepper />
        </>
    )
}

export default Canvas