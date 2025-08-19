import axios from "axios";
import { CLIPDROP_API_KEY } from '@env';

/**
 * Axios instance configured for Clipdrop API.
 * Automatically includes your API key in the header.
 */


const clipdrop = axios.create({
    baseURL: 'https://clipdrop-api.co/',
    headers: {
        'x-api-key': CLIPDROP_API_KEY,
        'Content-Type': 'application/json',
    },
});

export default clipdrop;
