import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { Song, Album, Stats } from "@/types";
import toast from "react-hot-toast";

interface MusicStore {
    songs: Song[];
    albums: Album[];
    currentAlbum: Album | null;
    isLoading: boolean;
    error: string | null;
    madeForYouSongs: Song[];
    featuredSongs: Song[];
    trendingSongs: Song[];
    stats: Stats;

    fetchAlbums: () => Promise<void>;
    fetchAlbumById: (id: string) => Promise<void>;
    fetchFeaturedSongs: () => Promise<void>;
    fetchTrendingSongs: () => Promise<void>;
    fetchMadeForYouSongs: () => Promise<void>;
    fetchStats:() => Promise<void>;
    fetchSongs:() => Promise<void>;
    deleteSong: (id:String) => Promise<void>;
    deleteAlbum: (id:String) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
    albums: [],
    songs: [],
    currentAlbum: null,
    isLoading: false,
    error: null,
    madeForYouSongs: [],
    featuredSongs: [],
    trendingSongs: [],
    stats:{
        totalSongs: 0,
        totalAlbums: 0,
        totalUsers:0,
        totalArtists: 0,
    },

    deleteSong:async(id)=>{
        set({isLoading: true, error: null});
        try {
            await axiosInstance.delete(`/admin/songs/${id}`);
            set((state)=>({
                songs: state.songs.filter(song => song._id !== id)
            }))

            toast.success("Song deleted successfully")
        } catch (error: any) {
            console.log("Error deleting song", error);
            toast.error("Error deleting song");
        } finally{
            set({ isLoading: false });
        }
    },

    deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

    fetchSongs: async () => {
        set({ songs: [], isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs");
            console.log("Fetched songs:", response.data); // Debugging log
            set({ songs: response.data});
        } catch (error: any) {
            console.error("Fetch error:", error);
            set({ error: error.message});
        } finally{
            set({ isLoading: false });
        }
      },
      

    fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},
    

    fetchAlbums: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/albums");
            set({ albums: response.data });
        } catch (error: any) {
            set({ error: error.response?.data?.message || "An error occurred" });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAlbumById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/albums/${id}`);
            set({ currentAlbum: response.data });
        } catch (error: any) {
            set({ error: error.response.data.message || "An error occurred" });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFeaturedSongs: async ()=>{
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/featured");
            set({ featuredSongs: response.data });
        } catch (error: any) {
            set({ error: error.response.data.message || "An error occurred" });
        } finally {
            set({ isLoading: false });
        }
    },
    fetchTrendingSongs: async ()=>{
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/trending");
            set({ trendingSongs: response.data });
        } catch (error: any) {
            set({ error: error.response.data.message || "An error occurred" });
        } finally {
            set({ isLoading: false });
        }
    },
    fetchMadeForYouSongs: async ()=>{
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/madeforyou");
            set({ madeForYouSongs: response.data });
        } catch (error: any) {
            set({ error: error.response.data.message || "An error occurred" });
        } finally {
            set({ isLoading: false });
        }
    },
}));
