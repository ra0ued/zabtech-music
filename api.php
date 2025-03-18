<?php

header('Content-Type: application/json');

function scanMusicDir($dir): array
{
    $result = [];
    $artists = array_diff(scandir($dir), ['.', '..']);

    foreach ($artists as $artist) {
        $artistPath = "$dir/$artist";

        if (is_dir($artistPath)) {
            $albums = array_diff(scandir($artistPath), ['.', '..']);
            $artistData = ['albums' => []];

            foreach ($albums as $album) {
                $albumPath = "$artistPath/$album";

                if (is_dir($albumPath)) {
                    $tracks = array_filter(
                        array_diff(scandir($albumPath), ['.', '..']),
                        fn($file) => str_ends_with(strtolower($file), '.mp3')
                    );

                    $artistData['albums'][$album] = array_values(array_map(
                        fn($track) => "/audio/$artist/$album/$track",
                        $tracks
                    ));
                }
            }
            $result[$artist] = $artistData;
        }
    }

    return $result;
}

echo json_encode(scanMusicDir(__DIR__ . '/audio'), JSON_OBJECT_AS_ARRAY);
