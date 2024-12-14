import { createSchema } from './schemaService.js';
import { uploadImage, searchImage } from './imageService.js';

async function main() {
    try {
        await createSchema();
        await uploadImage();
        await searchImage();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();