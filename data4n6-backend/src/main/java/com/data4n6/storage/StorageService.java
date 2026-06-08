package com.data4n6.storage;

import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final MinioClient minio;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.endpoint}")
    private String endpoint;

    /**
     * Uploads a file to MinIO and returns its object name (key).
     */
    public String upload(MultipartFile file, String folder) {
        String ext    = getExtension(file.getOriginalFilename());
        String key    = folder + "/" + UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        try {
            minio.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error uploading file to storage: " + e.getMessage());
        }
        return key;
    }

    /**
     * Returns a pre-signed URL valid for 7 days to access a private object.
     */
    public String getPresignedUrl(String key) {
        try {
            return minio.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .method(Method.GET)
                    .expiry(7, TimeUnit.DAYS)
                    .build());
        } catch (Exception e) {
            return endpoint + "/" + bucket + "/" + key;
        }
    }

    /**
     * Returns the public URL (for buckets with public read policy).
     */
    public String getPublicUrl(String key) {
        return endpoint + "/" + bucket + "/" + key;
    }

    /**
     * Deletes an object from MinIO.
     */
    public void delete(String key) {
        try {
            minio.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .build());
        } catch (Exception ignored) {}
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "";
    }
}
