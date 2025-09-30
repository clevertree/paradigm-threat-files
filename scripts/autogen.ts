import sharp from 'sharp';
import {glob} from 'glob';
import {upsertImage} from "@/scripts/db";

import {config} from "dotenv";

config({path: ['.env.local', '../.env.local']})

async function processImages(imageDirectory: string): Promise<void> {
    try {
        const imagePaths = await glob(`${imageDirectory}/**/*.{jpg,jpeg,png,gif,webp}`);

        for (const imagePath of imagePaths) {
            console.log(`Processing: ${imagePath}`);

            const image = sharp(imagePath);
            const metadata = await image.metadata();

            // Generate 8x8 blurDataURL
            const blurDataURLBuffer = await image
                .resize(8, 8, {fit: 'cover'}) // Resize to 8x8
                .toBuffer();

            // const blurDataURL = `data:image/${metadata.format};base64,${blurDataURLBuffer.toString('base64')}`;
            const blurDataURL = blurDataURLBuffer.toString('base64');

            const [file, created] = await upsertImage(imagePath,
                metadata.width,
                metadata.height,
                metadata.format,
                blurDataURL);
            // if (created) {
            //     console.log('Inserted file: ', file);
            // } else {
            // console.log('Updated file: ', imagePath);
            // }
        }
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

// Example usage: Replace 'images' with your project's image directory
const projectImageDirectory = './';
processImages(projectImageDirectory);