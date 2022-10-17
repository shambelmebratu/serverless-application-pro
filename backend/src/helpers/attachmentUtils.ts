import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
export class AttachmentUtils {
  constructor(
    private s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private bucketName = process.env.S3_BUCKET_NAME,
    private urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  getPresignedUploadURL(todoId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}