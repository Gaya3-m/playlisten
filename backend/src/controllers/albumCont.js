import {Album} from "../models/albumModel.js";

export const getAllAlbums= async (req, res, next) =>{
    try{
        const albums=await Album.find();
        res.status(200).json(albums);
    }
    catch(error){
        next(error);
    }
}

export const getAlbumById= async (req, res, next) =>{
    try {
        const {albumId}=req.params;

        //when we fetch an album we have to fetch all the songs in it
        const album= await Album.findById(albumId).populate("songs");

        if(!album){
            return res.status(404).json({message: "Album not found"});
        }
        res.status(200).json(album);

    } catch (error) {
        next(error);
    }
}
