import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT_APPWRITE = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
    .setEndpoint(ENDPOINT_APPWRITE)
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        //Check if doc exist in db
        const result = await database.listDocuments(DB_ID, COLLECTION_ID, [
            Query.equal("searchTerm", searchTerm),
        ]);

        // If it does update the count
        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DB_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            });
        } else {
            //If no doc found create a new doc and set count as 1
            await database.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            });
        }
    } catch (e) {
        console.log(e);
    }
};

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DB_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count"),
        ]);

        return result.documents;
    } catch (err) {
        console.log(err);
    }
};
