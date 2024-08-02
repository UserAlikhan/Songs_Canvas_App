export function categorizeSongs(songs: any[], similarities: any[]) {
    const threshold = 0.8
    const groups: any[][] = [];

    songs.forEach(song => {
        const newGroup = [song]
        groups.push(newGroup)
    })

    // Группировка песен
    similarities.forEach(similarity => {
        if (similarity.value > threshold) {
            const song1 = similarity.song1
            const song2 = similarity.song2

            let group1: any[] | undefined
            let group2: any[] | undefined

            // найти группы в которых находятся song1 и song2
            for (const group of groups) {
                if (group.includes(song1)) {
                    group1 = group
                }
                if (group.includes(song2)) {
                    group2 = group
                }
            }

            // если обе песни находятся в разных группах объединить песни
            if (group1 && group2 && group1 !== group2) {
                group1.push(...group2)
                groups.splice(groups.indexOf(group2), 1)
            }
        }
    })
    // присвоение цветов группам
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    const colorsNode = ['purple', 'pink', 'red', 'black', 'yellow'];
    groups.forEach((group, index) => {
        const color = colors[index % colors.length]
        const colorNode = colorsNode[index % colorsNode.length]

        group.forEach(song => {
            song.categoryColor = color;
            song.categoryNodeColor = colorNode;
        });
    })

    console.log('groups ', groups)

    const categorizedSongs = groups.flat()
    console.log('categorizedSongs ', categorizedSongs)
    console.log('categorizedSongs.length ', categorizedSongs.length)
    return categorizedSongs
}