// Список рекомендаций
import { TrackWithId } from '@/types/types'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

function Recommendations({ id }: { id: string }) {
    const [recommendationsList, setRecommedationsList] = useState<TrackWithId[]>([]);
    const [page, setPage] = useState(1);

    const findSimilarSongs = async () => {
        const response = await axios.get(`http://localhost:3000/api/tracks/recommendations/${id}?page=${page}`)
        
        if (response.data) {
            setRecommedationsList(response.data)
            return response.data
        }
    }

    useEffect(() => {
        findSimilarSongs();
    }, [page, findSimilarSongs]);

    return (
        <div className="flex flex-row h-[260px] overflow-x-scroll">
            {recommendationsList &&
                recommendationsList.map(recommendation => (
                    <div key={recommendation.id} className="w-full flex flex-col border-purple-400 border-l-2 border-r-2 text-gray-500 p-4">
                        <p className="text-center items-center font-bold text-black uppercase text-base">{recommendation.track}</p>
                        <p className="text-sm text-center items-center font-bold text-gray-700">{recommendation.albumName}</p>
                        <p className="text-sm">
                            <span className=' font-bold'>Artist:</span> {recommendation.artist}
                        </p>
                        <p className="text-sm">
                            <span className=' font-bold'>Spotify Popularity:</span> {Math.abs(recommendation.spotifyPopularity).toFixed(2)}
                        </p>
                        <p className="text-sm">
                            <span className=' font-bold'>YouTube Views:</span> {Math.abs(recommendation.youtubeViews)}
                        </p>
                    </div>
                ))
            }
            <button className=' bg-purple-400 p-1 rounded-md' onClick={() => setPage(prevPage => prevPage + 1)}>
                Load More
            </button>    
        </div>
    )
}

export default Recommendations