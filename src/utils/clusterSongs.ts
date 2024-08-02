import { kmeans } from 'ml-kmeans'

export  function clusterSongs(songs: any[], k: number) {
    const vectors = songs.map(song => Object.values(song).map(Number));
    const clusters = kmeans(vectors, k, { initialization: 'random' })
    return clusters;
}