import {create} from "zustand";
import {Song} from "@/types";
import { useChatStore } from "./useChatStore";

interface PlayerStore{
    currentSong: Song | null,
    isPlaying: boolean,
    queue: Song[],
    currentIndex: number,
    loop: boolean,

    initializeQueue: (songs: Song[]) => void,
    playAlbum: (songs: Song[], startIndex?: number) => void,
    setCurrentSong: (song: Song | null) => void,
    togglePlay: () => void,
    playNext: () => void,
    playPrevious: () => void,
    shuffleQueue: () => void,
    toggleLoop: () => void,
}

export const usePlayerStore = create<PlayerStore>((set, get) =>({
    currentSong: null,
    isPlaying: false,
    queue: [],
    currentIndex: -1,
    loop: false,

    initializeQueue: (songs: Song[])=>{
        set({
            queue: songs,
            currentSong: get().currentSong || songs[0],
            currentIndex: get().currentIndex === -1 ? 0: get().currentIndex
        })
    },
    playAlbum:(songs: Song[], startIndex=0)=>{
        if(songs.length === 0) return;
        const song = songs[startIndex];
        console.log("Playing album, setting song:", song);

        const socket=useChatStore.getState().socket;
        if(socket.auth){
            socket.emit("update_activity", {
                userId:socket.auth.userId,
                activity: `Playing ${song.title} by ${song.artist}`
            })
        }
        set({
            queue: songs,
            currentSong: song,
            currentIndex: startIndex,
            isPlaying: true
        })
    },
    setCurrentSong: (song: Song | null) =>{
        if(!song) return;

        const socket=useChatStore.getState().socket;
        if(socket.auth){
            socket.emit("update_activity", {
                userId:socket.auth.userId,
                activity: `Playing ${song.title} by ${song.artist}`
            })
        }

        const songIndex=get().queue.findIndex((s)=> s._id===song._id);
            set({
                currentSong: song,
                isPlaying: true,
                currentIndex: songIndex!==-1 ? songIndex : get().currentIndex
            })
        },

        togglePlay:()=>{
            const willStartPlaying = !get().isPlaying;

            const currentSong=get().currentSong;
            const socket=useChatStore.getState().socket;
            if(socket.auth){
            socket.emit("update_activity", {
                userId:socket.auth.userId,
                activity: 
                willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${currentSong.artist}`:"Idle",
            })
        }

            set({
                isPlaying: willStartPlaying,
            }) 
        },
        playNext: ()=>{
            const { currentIndex, queue, loop }=get()
            if(loop){
                set({
                    isPlaying: true,
                    currentSong: queue[currentIndex],
                });
                const audio = document.querySelector("audio");
                if (audio) audio.currentTime = 0; 
                return;
            }
            const nextIndex=currentIndex+1

                if(nextIndex < queue.length){
                    const nextsong = queue[nextIndex]

                    const socket=useChatStore.getState().socket;
                    if(socket.auth){
                    socket.emit("update_activity", {
                    userId:socket.auth.userId,
                    activity: `Playing ${nextsong.title} by ${nextsong.artist}`
                })
            }
                    set({
                        currentSong: nextsong,
                        currentIndex: nextIndex,
                        isPlaying: true
                    })
                }
                else{
                    //no next song
                    set({
                        isPlaying: false,
                    })

                    const socket=useChatStore.getState().socket;
                    if(socket.auth){
                        socket.emit("update_activity", {
                        userId:socket.auth.userId,
                        activity: "Idle"
                        })
                    }
                }
        },
        playPrevious: ()=>{
            const{ currentIndex, queue, loop}=get()
            if (loop) {
                set({
                    isPlaying: true,
                    currentSong: queue[currentIndex],
                });
        
                const audio = document.querySelector("audio");
                if (audio) audio.currentTime = 0; 
                return;
            }
        
            const previousIndex=currentIndex-1
        
            if(previousIndex>=0){
                const previousSong=queue[previousIndex]
                const socket=useChatStore.getState().socket;
                if(socket.auth){
                    socket.emit("update_activity", {
                    userId:socket.auth.userId,
                    activity: `Playing ${previousSong.title} by ${previousSong.artist}`
                })
            }
                set({
                    currentSong: previousSong,
                    currentIndex: previousIndex,
                    isPlaying: true
                })
            }
            else{
                // no previous song
                set({
                    isPlaying: false,
                })

                const socket=useChatStore.getState().socket;
                if(socket.auth){
                    socket.emit("update_activity", {
                    userId:socket.auth.userId,
                    activity: "Idle"
                    })
                }
            }

        },
        shuffleQueue: () => {
            const { queue, currentIndex, currentSong } = get();
        
            if (queue.length <= 1) return; // No need to shuffle if 1 or 0 songs
        
            // Separate current song from the rest
            const songsToShuffle = queue.filter((_, index) => index !== currentIndex);
        
            // Fisher-Yates Shuffle Algorithm
            for (let i = songsToShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [songsToShuffle[i], songsToShuffle[j]] = [songsToShuffle[j], songsToShuffle[i]];
            }
        
            // Reassemble queue: Keep current song at the beginning
            const shuffledQueue = [currentSong!, ...songsToShuffle];
        
            set({
                queue: shuffledQueue,
                currentIndex: 0, // Keep current song at index 0
                isPlaying: true, // Ensure playback continues
            });
        },   
        
        toggleLoop:()=>{
            set((state)=>({
            loop: !state.loop
            }))
        }
    }
))