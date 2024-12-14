import client from './weaviateClient.js';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

// Helper function to convert file to base64
function toBase64(filePath) {
    const img = readFileSync(filePath);
    return Buffer.from(img).toString('base64');
}

// Function to check if an image already exists in the database
async function imageExists(text) {
    try {
        const res = await client.graphql.get()
            .withClassName('Meme')  // Replace with your class name
            .withFields(['text'])  // Search based on 'text' field or image hash
            .withWhere({
                path: ['text'],
                operator: 'Equal',
                valueString: text,  // Assuming the 'text' field is unique for each image
            })
            .do();

        // If a result is found, the image already exists
        return res.data.Get.Meme.length > 0;
    } catch (error) {
        console.error('Error checking image existence:', error);
        return false;
    }
}

// Function to upload a new image
export async function uploadImage() {
    const imgFiles = readdirSync('./img');  // Get list of image files in 'img' folder
    
    // Process each image file
    const promises = imgFiles.map(async (imgFile) => {
        const filePath = path.join('./img', imgFile);  // Build the full file path
        const b64 = toBase64(filePath);  // Convert image to base64

        // Clean the filename and remove extension, replace underscores with spaces
        const text = imgFile.replace(/\.[^/.]+$/, '').split('_').join(' ');

        // Check if the image already exists in the database
        const exists = await imageExists(text);
        
        if (!exists) {
            // If it doesn't exist, upload it to the database
            try {
                await client.data.creator()
                    .withClassName('Meme')
                    .withProperties({
                        image: b64,
                        text: text,
                    })
                    .do();
                console.log(`Successfully uploaded: ${imgFile}`);
            } catch (error) {
                console.error(`Failed to upload ${imgFile}:`, error);
            }
        } else {
            console.log(`Image already exists: ${imgFile}, skipping.`);
        }
    });

    // Wait for all uploads to complete
    await Promise.all(promises);
}

export async function searchImage() {
    const test = Buffer.from(readFileSync('./test2.jpg')).toString('base64');

    const resImage = await client.graphql.get()
        .withClassName('Meme')
        .withFields(['image'])
        .withNearImage({ image: test })
        .withLimit(1)
        .do();

    // Write result to filesystem
    const result = resImage.data.Get.Meme[0].image;
    writeFileSync('./result.jpg', result, 'base64');
}