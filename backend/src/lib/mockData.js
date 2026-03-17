"use strict";
// Mock data for testing without Spotify API
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEY_NAMES = exports.mockGenres = exports.mockAudioFeatures = exports.mockArtists = exports.mockTracks = void 0;
exports.getKeyName = getKeyName;
exports.mockTracks = [
    {
        id: '1',
        name: 'Blinding Lights',
        artists: [{ id: 'a1', name: 'The Weeknd' }],
        album: {
            id: 'al1',
            name: 'After Hours',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' }]
        },
        duration_ms: 200000
    },
    {
        id: '2',
        name: 'Bohemian Rhapsody',
        artists: [{ id: 'a2', name: 'Queen' }],
        album: {
            id: 'al2',
            name: 'A Night at the Opera',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a' }]
        },
        duration_ms: 354000
    },
    {
        id: '3',
        name: 'Shape of You',
        artists: [{ id: 'a3', name: 'Ed Sheeran' }],
        album: {
            id: 'al3',
            name: '÷ (Divide)',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96' }]
        },
        duration_ms: 233000
    },
    {
        id: '4',
        name: 'Smells Like Teen Spirit',
        artists: [{ id: 'a4', name: 'Nirvana' }],
        album: {
            id: 'al4',
            name: 'Nevermind',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2739293c743fa542094336c5e12' }]
        },
        duration_ms: 301000
    },
    {
        id: '5',
        name: 'Billie Jean',
        artists: [{ id: 'a5', name: 'Michael Jackson' }],
        album: {
            id: 'al5',
            name: 'Thriller',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273de437d960dda1ac0a3586d97' }]
        },
        duration_ms: 294000
    },
    {
        id: '6',
        name: 'Hotel California',
        artists: [{ id: 'a6', name: 'Eagles' }],
        album: {
            id: 'al6',
            name: 'Hotel California',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2734637341b9f507521afa9a778' }]
        },
        duration_ms: 391000
    },
    {
        id: '7',
        name: 'Uptown Funk',
        artists: [{ id: 'a7', name: 'Bruno Mars' }, { id: 'a8', name: 'Mark Ronson' }],
        album: {
            id: 'al7',
            name: 'Uptown Special',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e419ccba0baa8bd3f3d7abf2' }]
        },
        duration_ms: 270000
    },
    {
        id: '8',
        name: 'Sweet Child O\' Mine',
        artists: [{ id: 'a9', name: 'Guns N\' Roses' }],
        album: {
            id: 'al8',
            name: 'Appetite for Destruction',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27321ebf49b3292c3f0f575f0f5' }]
        },
        duration_ms: 356000
    },
    {
        id: '9',
        name: 'Rolling in the Deep',
        artists: [{ id: 'a10', name: 'Adele' }],
        album: {
            id: 'al9',
            name: '21',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2732118bf9b198b05a95ded6300' }]
        },
        duration_ms: 228000
    },
    {
        id: '10',
        name: 'Lose Yourself',
        artists: [{ id: 'a11', name: 'Eminem' }],
        album: {
            id: 'al10',
            name: '8 Mile Soundtrack',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273726d48d93d02e1271774f023' }]
        },
        duration_ms: 326000
    },
    {
        id: '11',
        name: 'Stairway to Heaven',
        artists: [{ id: 'a12', name: 'Led Zeppelin' }],
        album: {
            id: 'al11',
            name: 'Led Zeppelin IV',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69' }]
        },
        duration_ms: 482000
    },
    {
        id: '12',
        name: 'Someone Like You',
        artists: [{ id: 'a10', name: 'Adele' }],
        album: {
            id: 'al9',
            name: '21',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2732118bf9b198b05a95ded6300' }]
        },
        duration_ms: 285000
    },
    {
        id: '13',
        name: 'Wonderwall',
        artists: [{ id: 'a13', name: 'Oasis' }],
        album: {
            id: 'al12',
            name: '(What\'s the Story) Morning Glory?',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273d0cb4c60b93bb0c53433b6c5' }]
        },
        duration_ms: 258000
    },
    {
        id: '14',
        name: 'Radioactive',
        artists: [{ id: 'a14', name: 'Imagine Dragons' }],
        album: {
            id: 'al13',
            name: 'Night Visions',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273407bd04707c463bbb3c09fd8' }]
        },
        duration_ms: 187000
    },
    {
        id: '15',
        name: 'Thriller',
        artists: [{ id: 'a5', name: 'Michael Jackson' }],
        album: {
            id: 'al5',
            name: 'Thriller',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273de437d960dda1ac0a3586d97' }]
        },
        duration_ms: 357000
    },
    {
        id: '16',
        name: 'Bad Guy',
        artists: [{ id: 'a15', name: 'Billie Eilish' }],
        album: {
            id: 'al14',
            name: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27350a3147b4edd7701a876c6ce' }]
        },
        duration_ms: 194000
    },
    {
        id: '17',
        name: 'Levitating',
        artists: [{ id: 'a16', name: 'Dua Lipa' }],
        album: {
            id: 'al15',
            name: 'Future Nostalgia',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2739c2fbf5a29b5e28e250a296c' }]
        },
        duration_ms: 203000
    },
    {
        id: '18',
        name: 'Hey Jude',
        artists: [{ id: 'a17', name: 'The Beatles' }],
        album: {
            id: 'al16',
            name: 'Hey Jude',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273a983a6469b32c1ba3c5ce37a' }]
        },
        duration_ms: 431000
    },
    {
        id: '19',
        name: 'Starboy',
        artists: [{ id: 'a1', name: 'The Weeknd' }, { id: 'a18', name: 'Daft Punk' }],
        album: {
            id: 'al17',
            name: 'Starboy',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452' }]
        },
        duration_ms: 230000
    },
    {
        id: '20',
        name: 'One',
        artists: [{ id: 'a19', name: 'Metallica' }],
        album: {
            id: 'al18',
            name: '...And Justice for All',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273cf84c5b276431b473e924802' }]
        },
        duration_ms: 446000
    },
    {
        id: '21',
        name: 'Take On Me',
        artists: [{ id: 'a20', name: 'a-ha' }],
        album: {
            id: 'al19',
            name: 'Hunting High and Low',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2736e875199cf7db7d8db8e2c89' }]
        },
        duration_ms: 225000
    },
    {
        id: '22',
        name: 'Don\'t Stop Believin\'',
        artists: [{ id: 'a21', name: 'Journey' }],
        album: {
            id: 'al20',
            name: 'Escape',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273c5653f9038e42efad2f8a266' }]
        },
        duration_ms: 251000
    },
    {
        id: '23',
        name: 'Crazy in Love',
        artists: [{ id: 'a22', name: 'Beyoncé' }, { id: 'a23', name: 'Jay-Z' }],
        album: {
            id: 'al21',
            name: 'Dangerously in Love',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2730e58a0f8308c1ad403d105e7' }]
        },
        duration_ms: 236000
    },
    {
        id: '24',
        name: 'Creep',
        artists: [{ id: 'a24', name: 'Radiohead' }],
        album: {
            id: 'al22',
            name: 'Pablo Honey',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2736f1a8b1e16a8e31f9c27e6e3' }]
        },
        duration_ms: 238000
    },
    {
        id: '25',
        name: 'Mr. Brightside',
        artists: [{ id: 'a25', name: 'The Killers' }],
        album: {
            id: 'al23',
            name: 'Hot Fuss',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273ccdddd46119a4ff53eaf1f5d' }]
        },
        duration_ms: 222000
    }
];
exports.mockArtists = [
    { id: 'a1', name: 'The Weeknd', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26f5cb' }] },
    { id: 'a2', name: 'Queen', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb0261696c5df3be99da6ed3f3' }] },
    { id: 'a3', name: 'Ed Sheeran', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb3bcef85e105dfc42399ef0ba' }] },
    { id: 'a4', name: 'Nirvana', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36' }] },
    { id: 'a5', name: 'Michael Jackson', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb0e08ea2c4d6789fbf5cbe0aa' }] },
    { id: 'a10', name: 'Adele', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb68f6e5892075d7f22615bd17' }] },
    { id: 'a11', name: 'Eminem', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eba00b11c129b27a88fc72f36b' }] },
    { id: 'a12', name: 'Led Zeppelin', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4a21b4760d2ecb7b0dcdc8da' }] },
    { id: 'a13', name: 'Oasis', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb8a75d49a5856a5e4302f97ec' }] },
    { id: 'a14', name: 'Imagine Dragons', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb920dc5e27a2c8e8c4e8b8d79' }] },
    { id: 'a15', name: 'Billie Eilish', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb6a5e5e3a8c6f6a3f6c3f0b5a' }] },
    { id: 'a16', name: 'Dua Lipa', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb7d2d8e1fa66d5f4356b5fb39' }] },
    { id: 'a17', name: 'The Beatles', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433' }] },
    { id: 'a19', name: 'Metallica', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb69ca98dd3083f1082d740e44' }] },
    { id: 'a20', name: 'a-ha', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb8dc8ba7f3c2e7c0e9c3e8b6a' }] },
    { id: 'a21', name: 'Journey', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb0e08f5d9e8c9b8d9b8c9b8d9' }] },
    { id: 'a22', name: 'Beyoncé', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb0c68f6c95232e716f0abec97' }] },
    { id: 'a24', name: 'Radiohead', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eba03696716c9ee605006047fd' }] },
    { id: 'a25', name: 'The Killers', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb8c4a8e8b8d8c8d8b8c8d8e8b' }] },
];
exports.mockAudioFeatures = {
    '1': { id: '1', tempo: 171, key: 1, mode: 1, energy: 0.73, danceability: 0.51, valence: 0.33, acousticness: 0.0014, instrumentalness: 0.0, liveness: 0.09, speechiness: 0.06, loudness: -5.93 },
    '2': { id: '2', tempo: 72, key: 0, mode: 1, energy: 0.40, danceability: 0.39, valence: 0.22, acousticness: 0.28, instrumentalness: 0.0, liveness: 0.24, speechiness: 0.05, loudness: -9.81 },
    '3': { id: '3', tempo: 96, key: 1, mode: 0, energy: 0.65, danceability: 0.83, valence: 0.93, acousticness: 0.58, instrumentalness: 0.0, liveness: 0.09, speechiness: 0.08, loudness: -6.18 },
    '4': { id: '4', tempo: 117, key: 5, mode: 0, energy: 0.92, danceability: 0.50, valence: 0.26, acousticness: 0.0014, instrumentalness: 0.0, liveness: 0.12, speechiness: 0.05, loudness: -4.56 },
    '5': { id: '5', tempo: 117, key: 11, mode: 0, energy: 0.81, danceability: 0.88, valence: 0.82, acousticness: 0.036, instrumentalness: 0.0, liveness: 0.07, speechiness: 0.06, loudness: -3.20 },
    '6': { id: '6', tempo: 75, key: 2, mode: 0, energy: 0.51, danceability: 0.50, valence: 0.46, acousticness: 0.0085, instrumentalness: 0.27, liveness: 0.18, speechiness: 0.03, loudness: -8.65 },
    '7': { id: '7', tempo: 115, key: 4, mode: 1, energy: 0.89, danceability: 0.86, valence: 0.97, acousticness: 0.0028, instrumentalness: 0.0, liveness: 0.16, speechiness: 0.08, loudness: -4.37 },
    '8': { id: '8', tempo: 125, key: 4, mode: 1, energy: 0.84, danceability: 0.45, valence: 0.61, acousticness: 0.0057, instrumentalness: 0.0, liveness: 0.33, speechiness: 0.04, loudness: -5.92 },
    '9': { id: '9', tempo: 105, key: 0, mode: 0, energy: 0.76, danceability: 0.73, valence: 0.36, acousticness: 0.0044, instrumentalness: 0.0, liveness: 0.08, speechiness: 0.03, loudness: -5.71 },
    '10': { id: '10', tempo: 86, key: 2, mode: 0, energy: 0.76, danceability: 0.65, valence: 0.23, acousticness: 0.070, instrumentalness: 0.0, liveness: 0.11, speechiness: 0.28, loudness: -6.47 },
    '11': { id: '11', tempo: 82, key: 9, mode: 0, energy: 0.43, danceability: 0.34, valence: 0.23, acousticness: 0.65, instrumentalness: 0.0, liveness: 0.11, speechiness: 0.03, loudness: -9.50 },
    '12': { id: '12', tempo: 135, key: 9, mode: 1, energy: 0.42, danceability: 0.60, valence: 0.24, acousticness: 0.51, instrumentalness: 0.0, liveness: 0.10, speechiness: 0.03, loudness: -6.95 },
    '13': { id: '13', tempo: 87, key: 11, mode: 1, energy: 0.61, danceability: 0.53, valence: 0.43, acousticness: 0.12, instrumentalness: 0.0, liveness: 0.14, speechiness: 0.04, loudness: -6.21 },
    '14': { id: '14', tempo: 136, key: 2, mode: 0, energy: 0.84, danceability: 0.60, valence: 0.31, acousticness: 0.0011, instrumentalness: 0.0, liveness: 0.13, speechiness: 0.07, loudness: -4.29 },
    '15': { id: '15', tempo: 118, key: 1, mode: 0, energy: 0.72, danceability: 0.83, valence: 0.48, acousticness: 0.012, instrumentalness: 0.0, liveness: 0.28, speechiness: 0.15, loudness: -6.18 },
    '16': { id: '16', tempo: 135, key: 7, mode: 0, energy: 0.43, danceability: 0.70, valence: 0.56, acousticness: 0.33, instrumentalness: 0.0, liveness: 0.10, speechiness: 0.38, loudness: -11.37 },
    '17': { id: '17', tempo: 103, key: 2, mode: 0, energy: 0.70, danceability: 0.70, valence: 0.87, acousticness: 0.011, instrumentalness: 0.0, liveness: 0.08, speechiness: 0.06, loudness: -4.33 },
    '18': { id: '18', tempo: 72, key: 5, mode: 1, energy: 0.44, danceability: 0.36, valence: 0.35, acousticness: 0.17, instrumentalness: 0.0, liveness: 0.25, speechiness: 0.03, loudness: -9.41 },
    '19': { id: '19', tempo: 186, key: 11, mode: 1, energy: 0.80, danceability: 0.68, valence: 0.49, acousticness: 0.0016, instrumentalness: 0.0, liveness: 0.10, speechiness: 0.05, loudness: -5.45 },
    '20': { id: '20', tempo: 182, key: 2, mode: 0, energy: 0.73, danceability: 0.40, valence: 0.22, acousticness: 0.0017, instrumentalness: 0.60, liveness: 0.12, speechiness: 0.03, loudness: -7.89 },
    '21': { id: '21', tempo: 169, key: 9, mode: 1, energy: 0.85, danceability: 0.50, valence: 0.84, acousticness: 0.013, instrumentalness: 0.0, liveness: 0.30, speechiness: 0.06, loudness: -6.92 },
    '22': { id: '22', tempo: 119, key: 4, mode: 1, energy: 0.58, danceability: 0.52, valence: 0.69, acousticness: 0.0046, instrumentalness: 0.0, liveness: 0.33, speechiness: 0.03, loudness: -7.55 },
    '23': { id: '23', tempo: 100, key: 5, mode: 0, energy: 0.87, danceability: 0.73, valence: 0.71, acousticness: 0.0046, instrumentalness: 0.0, liveness: 0.06, speechiness: 0.22, loudness: -4.15 },
    '24': { id: '24', tempo: 92, key: 7, mode: 1, energy: 0.76, danceability: 0.49, valence: 0.14, acousticness: 0.0082, instrumentalness: 0.0, liveness: 0.13, speechiness: 0.05, loudness: -6.28 },
    '25': { id: '25', tempo: 148, key: 2, mode: 1, energy: 0.91, danceability: 0.35, valence: 0.24, acousticness: 0.0014, instrumentalness: 0.0, liveness: 0.11, speechiness: 0.06, loudness: -4.67 },
};
exports.mockGenres = [
    'pop', 'rock', 'hip-hop', 'r-n-b', 'electronic', 'jazz', 'classical',
    'country', 'metal', 'indie', 'folk', 'blues', 'reggae', 'punk', 'soul',
    'disco', 'latin', 'k-pop', 'ambient', 'house'
];
exports.KEY_NAMES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
function getKeyName(key, mode) {
    if (key < 0 || key > 11)
        return 'Unknown';
    const keyName = exports.KEY_NAMES[key];
    const modeName = mode === 1 ? 'Major' : 'Minor';
    return `${keyName} ${modeName}`;
}
//# sourceMappingURL=mockData.js.map