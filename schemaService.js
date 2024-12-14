import client from './weaviateClient.js';

export async function createSchema() {
    const className = 'Meme';

    // Check if the class already exists and delete it if so
    const existingSchema = await client.schema.getter().do();
    const classExists = existingSchema.classes.some(cls => cls.class === className);

    if (classExists) {
        console.log(`Deleting existing class: ${className}`);
        await client.schema.classDeleter().withClassName(className).do();
    }

    const schemaConfig = {
        class: className,
        vectorizer: 'img2vec-neural',
        vectorIndexType: 'hnsw',
        moduleConfig: {
            'img2vec-neural': {
                imageFields: ['image'],
            },
        },
        properties: [
            {
                name: 'image',
                dataType: ['blob'],
            },
            {
                name: 'text',
                dataType: ['string'],
            },
        ],
    };

    await client.schema.classCreator().withClass(schemaConfig).do();
    console.log(`Created class: ${className}`);
}