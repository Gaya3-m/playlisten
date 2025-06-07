import { usePlayerStore } from "@/stores/usePlayerStore"
import { useEffect, useRef } from "react"

const AudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const prevSongRef = useRef<string | null>(null)
    const {currentSong, isPlaying, playNext} =usePlayerStore();

    // useEffect(()=>{
    //     console.log("Current Song URL:", currentSong?.audioUrl);
    // }, [currentSong])

    //handle play-pause
    useEffect(()=>{
        if(isPlaying){
            audioRef.current?.play()
            .catch((error) => console.error("Error playing audio:", error));;
        }
        else{
            audioRef.current?.pause();
        }
    }, [isPlaying])

    //handle when a song ends
    useEffect(()=>{
        const audio=audioRef.current;

        const handleEnded=()=>{
            playNext();
            prevSongRef.current = currentSong?._id ?? null;
        }
        
        audio?.addEventListener("ended", handleEnded);
        return()=>{
            audio?.removeEventListener("ended", handleEnded);
        }
    }, [playNext]);

    //handle song changes
    useEffect(()=>{
        if(!audioRef.current || !currentSong) return;
        const audio=audioRef.current;
        console.log("New song detected, updating source:", currentSong.audioUrl);

        //check if it is actually a new song
        const isSongChange=prevSongRef.current !== currentSong?._id;
        if(isSongChange){
            audio.src = currentSong?.audioUrl;
            audio.load();
            audio.currentTime=0; //reset
            prevSongRef.current = currentSong?._id ?? null;
            if (isPlaying) {
                audio.play().catch((error) => console.error("Error playing audio:", error));
            }
        }
    }, [currentSong, isPlaying])
    return (
    <div>
        <audio ref={audioRef}/>
    </div>
    )
}

export default AudioPlayer
