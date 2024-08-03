// Модальное окно
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Recommendations from './Recommendations';
import { useAppSelector } from '@/app/lib/store';

function Modal({ onClose }: {  onClose: () => void }) {
    // Получение значение access_token и track из Redux Store
    const access_token = useAppSelector((state) => state.access_tokenReducer.value.access_token);
    const track = useAppSelector((state) => state.selectedTrackReducer.value)
    // Локальная переменная для хранения информации о треке из Spotify
    const [trackInfo, setTrackInfo] = useState<any>();
    // Запрос на поиск трека по название к Api Spotify
    const getTrack = async () => {
        const response = await axios.get(`https://api.spotify.com/v1/search`, { 
            headers: {
                Authorization: `Bearer ${access_token}` 
            },
            params: {
                q: track.track,
                include_external: "audio",
                type: 'track',

            }
        })
        console.log('response ', response)
        
        if (response.data.tracks) {
            const trackWithPreview = response.data.tracks.items.find((item: any) => item.preview_url !== null);
            setTrackInfo(trackWithPreview)
            console.log('trackWithPreview ', trackWithPreview)
            return response.data
        }
    }

    useEffect(() => {
        getTrack();
    }, [])
    
    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Modal content */}
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                    {/* Modal content */}
                    <div className="bg-white p-2 sm:p-6 sm:pb-4">
                        <div className=' flex flex-row justify-center'>
                            {trackInfo && trackInfo.album.images[0].url && (
                                <img src={trackInfo.album.images[0].url} alt={track.track} className="w-[85px] h-[85px] rounded-md mr-4"/>
                            )}
                            <div className=' flex flex-col justify-between w-full'>
                                <h3 className="text-xl leading-6 items-center text-center font-bold uppercase mb-3 text-gray-900" id="modal-headline">
                                    {track.track}
                                </h3>
                                <h3 className="text-base leading-6 items-center text-center text-gray-500" id="modal-headline">
                                    Album Name: {track.albumName}
                                </h3>
                                <h3 className="text-base leading-6 items-center text-center text-gray-500" id="modal-headline">
                                    Artist: {track.artist}
                                </h3>
                                <div className=' flex flex-row w-full justify-between px-2'>
                                    <p>Spotify Popularity: {Math.abs(track.spotifyPopularity.toFixed(2))}</p>
                                    <p>Views: {Math.abs(track.youtubeViews.toFixed(2))} billion</p>
                                </div>

                                {trackInfo && trackInfo.album && trackInfo.artists && (
                                    <div className=' items-start justify-between'>
                                        <p className="text-base text-gray-500">
                                            {trackInfo.album.album_type} - {trackInfo.album.name} - {trackInfo.album.release_date}
                                        </p>
                                        <p className="text-base text-gray-500">
                                            {trackInfo.artists[0].type} - {trackInfo.artists[0].name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                            
                        
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <div className="mt-5 flex justify-center">
                                {trackInfo && trackInfo.preview_url ? (
                                    <audio controls src={trackInfo.preview_url} className="mt-2" />
                                ) : (
                                    <p className="mt-2 text-sm text-gray-500">No preview available.</p>
                                )}
                            </div>
                        </div>

                    </div>
                    <h1 className=' font-bold text-black ml-4'>Recommendations</h1>
                    <div className=' flex bg-white p-2 w-full border-black border-t-2 border-b-2'>
                        <Recommendations id={track.id} />
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal