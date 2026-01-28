import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { slugifyString } from '../utils/generics';
import { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } from './config';

//CREATE SERVICE/REPOSITORY IN USER/INSTRUCTOR TO UPLOAD THE IMAGE / QUALIFICATION
//USE UUID FOR THE FILENAME IN THE REPO

/**
 * Validates that a URL is absolute (contains a protocol and domain)
 * @throws Error if the URL is relative
 */
function validateAbsoluteUrl(url: string, context: string): void {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.error(`[StorageService] Invalid URL detected in ${context}:`, url);
        console.error(`[StorageService] R2_PUBLIC_URL is: "${R2_PUBLIC_URL}"`);
        throw new Error(
            `Invalid ${context}: URL must be absolute (starting with http:// or https://). ` +
            `Check that R2_PUBLIC_URL environment variable is properly configured.`
        );
    }
}

export class StorageService {
    private s3Client: S3Client;

    constructor() {
        // Validate R2_PUBLIC_URL is properly configured
        if (!R2_PUBLIC_URL || !R2_PUBLIC_URL.startsWith('http')) {
            console.error('[StorageService] R2_PUBLIC_URL is not properly configured:', R2_PUBLIC_URL);
            console.warn(
                '[StorageService] R2_PUBLIC_URL must be set to a full URL (e.g., https://assets.localsnow.org). ' +
                'Profile images will not work correctly without this.'
            );
        }

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });
    }

    async uploadProfileImage(imageBuffer: Buffer, userId: number): Promise<string> {
        const fileName = `profileImgs/${userId}-profileImg`;
        const compressedBuffer = await sharp(imageBuffer)
                            .rotate()
                            .resize(300, 300, { fit: "cover", position: "top" })
                            .webp({ quality: 50 })
                            .toBuffer();

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: fileName,
                    Body: compressedBuffer,
                    ContentType: "image/webp",
                    CacheControl: 'no-cache' // Add this to prevent caching
                })
            );

            const profileImageUrl = `${R2_PUBLIC_URL}/${fileName}`;
            validateAbsoluteUrl(profileImageUrl, 'profile image URL');
            return profileImageUrl;
        } catch (error) {
            console.error('Error uploading to R2:', error);
            throw new Error('Failed to upload image');
        }
    }

    async uploadSchoolLogo(imageBuffer: Buffer,  schoolName: string, userId: number): Promise<string> {
        const cleanSchoolName = slugifyString(schoolName);
        const fileName = `schoolLogos/${cleanSchoolName}-logo-${userId}`;
        const compressedBuffer = await sharp(imageBuffer)
                            .rotate()
                            .resize(300, 300, { fit: "cover", position: "top" })
                            .webp({ quality: 50 })
                            .toBuffer();
    
        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: fileName,
                    Body: compressedBuffer,
                    ContentType: "image/webp"
                })
            );

            // Return the public URL of the uploaded image
            const logoUrl = `${R2_PUBLIC_URL}/${fileName}`;
            validateAbsoluteUrl(logoUrl, 'school logo URL');
            return logoUrl;
        } catch (error) {
            console.error('Error uploading to R2:', error);
            throw new Error('Failed to upload image');
        }
    } 

 
    
    async uploadQualificationPDF(fileBuffer: Buffer, userId: number): Promise<string> {
        // Validate file size (max 5MB)
        if (fileBuffer.length > 5 * 1024 * 1024) {
            throw new Error('File too large (max 5MB)');
        }
        
        /* Validate PDF magic number
        const magicNumber = fileBuffer.slice(0, 4).toString();
        if (!magicNumber.includes('%PDF')) {
            throw new Error('Invalid PDF file');
        }*/

        try {
            const finalFileName = `qualifications/${userId}-qualification`;

            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: finalFileName,
                    Body: fileBuffer,
                    ContentType: "application/pdf"
                })
            );

            // Return the public URL of the uploaded PDF
            const qualificationUrl = `${R2_PUBLIC_URL}/${finalFileName}`;
            validateAbsoluteUrl(qualificationUrl, 'qualification PDF URL');
            return qualificationUrl;
        } catch (error) {
            console.error('Error uploading PDF to R2:', error);
            throw new Error('Failed to upload qualification document');
        }
    }

    async uploadResortImage(imageBuffer: Buffer, resortSlug: string): Promise<string> {
        const fileName = `resorts/${resortSlug}`;
        const compressedBuffer = await sharp(imageBuffer)
            .rotate()
            .resize(1200, 800, { fit: "cover", position: "center" })
            .webp({ quality: 80 })
            .toBuffer();

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: fileName,
                    Body: compressedBuffer,
                    ContentType: "image/webp",
                    CacheControl: 'public, max-age=31536000' // Cache for 1 year
                })
            );

            const resortImageUrl = `${R2_PUBLIC_URL}/${fileName}`;
            validateAbsoluteUrl(resortImageUrl, 'resort image URL');
            return resortImageUrl;
        } catch (error) {
            console.error('Error uploading resort image to R2:', error);
            throw new Error('Failed to upload resort image');
        }
    }
}
