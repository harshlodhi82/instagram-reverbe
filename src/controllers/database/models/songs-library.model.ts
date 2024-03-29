import mongoose from 'mongoose';


const collectionName = 'songs_library';
const songsLibrarySchema: mongoose.Schema<ISongsLibrary> = new mongoose.Schema<ISongsLibrary>({
    search: {
        type: String,
        required: true,
        index: true
    },
    isPosted: {
        type: Boolean,
        default: false,
        index: true
    }
}, { collection: collectionName, timestamps: true });


export const SongsLibrary: mongoose.Model<ISongsLibrary> = mongoose.model<ISongsLibrary>(collectionName, songsLibrarySchema);

export interface ISongsLibrary {
    _id: string;
    search: string;
    isPosted: boolean;
}
