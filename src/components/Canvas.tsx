"use client"

import { useEffect, useRef, useState } from "react"
import { Circle, Canvas as FabricCanvas, Group, Line, Text } from "fabric";
import axios from "axios";
import { ExtendedGroup, Song } from "@/types/types";
import Modal from "./Modal";
import { spotifyApi } from "@/utils/spotifyApi";

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isModal, setIsModal] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<Song | null>(null);
    const [access_token, setAccess_token] = useState<string>();

    const [dataset, setDataset] = useState<Song[]>([])

    const maxRadius = 60;
    const minRadius = 25;

    const authorization = async () => {
        const response = await spotifyApi.post('', null, {
          params: {
              grant_type: 'client_credentials',
              client_id: process.env.CLIENT_ID,
              client_secret: process.env.CLIENT_SECRET,
        }}) 
        setAccess_token(response.data.access_token)
        return response.data
    }

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get("http://localhost:3000/api/tracks?page=1")
            const data: Song[] = response.data
            setDataset(data)
        };
        
        fetchData();
        authorization();
    }, [])

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = new FabricCanvas(canvasRef.current);

            const allTimeRank = dataset.map(item => item.allTimeRank);

            const maxValue = Math.max(...allTimeRank.map(Math.abs));
            const minValue = Math.min(...allTimeRank.map(Math.abs));

            // Круги с названием трека внутри
            const circles = dataset.map((item, index) => {
                const normalizedValue = (Math.abs(item.allTimeRank) - minValue) / (maxValue - minValue);
                const radius = minRadius + normalizedValue * (maxRadius - minRadius);
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

                
                const group = new Group([circle, text], {
                    left: x,
                    top: y,
                })

                group.hasControls = group.hasBorders = false;
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
                    setSelectedTrack(dataset[index]);
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
            <canvas ref={canvasRef} width={1920} height={900}/>
            {isModal && selectedTrack && (
                <Modal acess_token={access_token} track={selectedTrack} onClose={() => setIsModal(false)}/>
            )}
        </>
    )
}

export default Canvas