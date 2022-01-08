import { CfnOutput, Stack } from "aws-cdk-lib";
import { CloudFrontWebDistribution } from "aws-cdk-lib/aws-cloudfront";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import {join } from 'path';


export class WebAppDeployment {

    private stack: Stack;
    private bucketSuffix: string;
    private deploymentBucket: Bucket;


    constructor(stack: Stack, suffix: string) {
        this.stack = stack;
        this.bucketSuffix = suffix;

        this.initialize();
    }

    private initialize() {
        const bucketName = 'space-app-web' + this.bucketSuffix;
        this.deploymentBucket = new Bucket(
            this.stack, 
            'space-app-web-id', 
            {
                bucketName: bucketName,
                publicReadAccess: true,
                websiteIndexDocument: 'index.html'
            }
        );
        new BucketDeployment(this.stack, 'space-app-web-deployment', {
            destinationBucket: this.deploymentBucket,
            sources: [
                Source.asset(
                    join(__dirname, '..', '..', 'space-finder-frontend', 'build')
                )
            ]
        });
        new CfnOutput(this.stack,'spaceFinderWebS3Url', {
            value: this.deploymentBucket.bucketWebsiteUrl
        });

        const cloudFront = new CloudFrontWebDistribution(
            this.stack,
            'space-app-web-distribution',
            {
                originConfigs: [
                    {
                        behaviors: [
                            {
                                isDefaultBehavior:  true
                            }
                        ],
                        s3OriginSource: {
                            s3BucketSource: this.deploymentBucket
                        }
                    }
                ]
            }
        )
        new CfnOutput(this.stack,'spaceFinderCloudfront3Url', {
            value: cloudFront.distributionDomainName
        });
    }

}