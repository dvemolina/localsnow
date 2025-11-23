import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { slugifyString } from '../utils/generics';

//CREATE SERVICE/REPOSITORY IN USER/INSTRUCTOR TO UPLOAD THE IMAGE / QUALIFICATION
//USE UUID FOR THE FILENAME IN THE REPO

export class StorageService {
    private s3Client: S3Client;
    
    constructor() {
       
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
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
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: fileName,
                    Body: compressedBuffer,
                    ContentType: "image/webp",
                    CacheControl: 'no-cache' // Add this to prevent caching
                })
            );

            const profileImageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`
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
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: fileName,
                    Body: compressedBuffer,
                    ContentType: "image/webp"
                })
            );
    
            // Return the public URL of the uploaded image
            return `${process.env.R2_PUBLIC_URL}/${fileName}`;
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
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: finalFileName,
                    Body: fileBuffer,
                    ContentType: "application/pdf"
                })
            );

            // Return the public URL of the uploaded PDF
            return `${process.env.R2_PUBLIC_URL}/${finalFileName}`;
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
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: fileName,
                    Body: compressedBuffer,
                    ContentType: "image/webp",
                    CacheControl: 'public, max-age=31536000' // Cache for 1 year
                })
            );

            return `${process.env.R2_PUBLIC_URL}/${fileName}`;
        } catch (error) {
            console.error('Error uploading resort image to R2:', error);
            throw new Error('Failed to upload resort image');
        }
    }
}
