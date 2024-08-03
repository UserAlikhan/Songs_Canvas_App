"use client"

import { useEffect, useRef, useState } from "react"
import { Circle, Canvas as FabricCanvas, Group, Line, Point, Text } from "fabric";
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
    const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
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
              client_id: "f6eb6273375a40318e5566dad0aa73a9",
              client_secret: "59c1ea5b2eb349f09dacfc71a85c02fa",
        }}) 
        dispatch(addAccessToken({ access_token: response.data.access_token }))
        return response.data
    }
    // Запрос к базе данных на получение треков
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`https://useralikhan-github-io.vercel.app/api/tracks?page=${quantity}`)
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
            canvas.allowTouchScrolling = true;
            // Получение самого большого ранка из данных
            const allTimeRank = dataset.map(item => item.allTimeRank);

            const maxValue = Math.max(...allTimeRank.map(Math.abs));
            const minValue = Math.min(...allTimeRank.map(Math.abs));

            let isPanning = false;
            let lastMouseX = 0;
            let lastMouseY = 0;
            // выставления координат мыши при клике и разрешение прокрутки
            canvas.on('mouse:down', (event: any) => {
                isPanning = true;
                lastMouseX = event.e.clientX;
                lastMouseY = event.e.clientY;
            });
            // функционал передвижения по canvas
            canvas.on('mouse:move', (event: any) => {
                if (isPanning) {
                    const deltaX: number = event.e.clientX - lastMouseX;
                    const deltaY: number = event.e.clientY - lastMouseY;
                    const delta = new Point(deltaX, deltaY);

                    canvas.relativePan(delta);
                    lastMouseX = event.e.clientX;
                    lastMouseY = event.e.clientY;
                }
            });
            // при отпускании мыши запрет на прокрутку
            canvas.on('mouse:up', () => {
                isPanning = false;
            });
            // скрол
            canvas.on('mouse:wheel', (event) => {
                const delta = event.e.deltaY;
                const zoom = canvas.getZoom();
                const zoomPoint = new Point(event.e.offsetX, event.e.offsetY);
                const newZoom = zoom * (1 - delta / 200);
                canvas.zoomToPoint(zoomPoint, newZoom);
                event.e.preventDefault();
                event.e.stopPropagation();
            });

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
                });
                group.set('zIndex', 100);
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

                // при нажатии на круг открыть модальное окно с информацией о треке
                circle.group.on('mousedown', () => {
                    dispatch(setSelectedTrack(dataset[index]))
                    setIsModal(true);
                })

                circle.group.on('mouseover', function(e) {
                    const { left, top } = circle.group.getBoundingRect()
                    setTooltip({ 
                        visible: true, 
                        text: `Track: ${dataset[index].track}. Click To Get More Information`, 
                        x: left, y: top 
                    })
                })

                circle.group.on('mouseout', function(e) {
                    setTooltip({ visible: false, text: '', x: 0, y: 0 })
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
                                zIndex: 1
                            }
                        )
                        canvas.add(line);
                        // Круги над линиями
                        canvas._objects.sort((a: any, b: any) => (a.zIndex > b.zIndex) ? 1 : -1);
                        canvas.renderAll();
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
            {tooltip.visible && (
                <div style={{
                    position: 'absolute',
                    left: tooltip.x,
                    top: tooltip.y,
                    background: 'white',
                    padding: '5px',
                    border: '1px solid black'
                }}>
                    {tooltip.text}
                </div>
            )}
            {isModal && (
                <Modal onClose={() => setIsModal(false)}/>
            )}
            <Stepper />
        </>
    )
}

export default Canvas
