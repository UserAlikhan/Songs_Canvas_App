import KMeans from 'node-kmeans'

export function clusterSongs(songs: any[], k: number) {
    const vectors = songs.map(song => Object.values(song).map(Number))
    // const kmeans = new KMeans(k)
    const clusters = KMeans.clusterize(vectors, k)
    return clusters
}