import os
import boto3
from botocore.exceptions import ClientError

class MinioStorageService:
    def __init__(self):
        self.endpoint = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
        self.access_key = os.getenv("MINIO_ROOT_USER", "admin")
        self.secret_key = os.getenv("MINIO_ROOT_PASSWORD", "admin123")
        
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name='us-east-1' # Default for MinIO
        )
        
        self._ensure_buckets_exist()

    def _ensure_buckets_exist(self):
        buckets = ["resumes", "parsed-text", "generated-pdfs"]
        for bucket in buckets:
            try:
                self.s3_client.head_bucket(Bucket=bucket)
            except ClientError as e:
                # If a client error is thrown, then check that it was a 404 error.
                # If it was a 404 error, then the bucket does not exist.
                error_code = int(e.response['Error']['Code'])
                if error_code == 404:
                    self.s3_client.create_bucket(Bucket=bucket)
                    print(f"Created bucket '{bucket}'")

    def upload_file(self, file_path: str, bucket_name: str, object_name: str):
        try:
            self.s3_client.upload_file(file_path, bucket_name, object_name)
            return f"{self.endpoint}/{bucket_name}/{object_name}"
        except ClientError as e:
            print(f"Upload failed: {e}")
            return None

    def upload_file_object(self, file_obj, bucket_name: str, object_name: str):
        try:
            self.s3_client.upload_fileobj(file_obj, bucket_name, object_name)
            return f"{self.endpoint}/{bucket_name}/{object_name}"
        except ClientError as e:
            print(f"Upload failed: {e}")
            return None

storage_service = MinioStorageService()
