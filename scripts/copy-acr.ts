#!/usr/bin/env tsx

import { execa } from 'execa';
import { z } from 'zod';

const envSchema = z.object({
  IMAGE_NAME: z.string().min(1, 'IMAGE_NAME is required'),
  VERSION: z.string().min(1, 'VERSION is required'),
  SOURCE_ACR: z.string().min(1, 'SOURCE_ACR is required'),
  TARGET_ACR: z.string().min(1, 'TARGET_ACR is required'),
  DRY_RUN: z.string().optional().transform(val => val === 'true')
});

type EnvConfig = z.infer<typeof envSchema>;

interface CopyAcrOptions {
  imageName: string;
  version: string;
  sourceAcr: string;
  targetAcr: string;
  dryRun: boolean;
}

class AcrCopyError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AcrCopyError';
  }
}

async function validateEnvironment(): Promise<EnvConfig> {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

async function authenticateAcr(acrUrl: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`🔍 [DRY RUN] Would authenticate to ${acrUrl}`);
    return;
  }

  try {
    console.log(`🔍 Authenticating to ${acrUrl}...`);
    await execa('az', ['acr', 'login', '--name', acrUrl.replace('.azurecr.io', '')]);
    console.log(`✅ Authenticated to ${acrUrl}`);
  } catch (error) {
    throw new AcrCopyError(`Failed to authenticate to ${acrUrl}`, error as Error);
  }
}

async function pullImage(sourceAcr: string, imageName: string, dryRun: boolean): Promise<string> {
  const sourceImage = `${sourceAcr}/${imageName}`;
  
  if (dryRun) {
    console.log(`📥 [DRY RUN] Would pull ${sourceImage}`);
    return sourceImage;
  }

  try {
    console.log(`📥 Pulling ${sourceImage}...`);
    await execa('docker', ['pull', sourceImage]);
    console.log(`✅ Image pulled successfully`);
    return sourceImage;
  } catch (error) {
    throw new AcrCopyError(`Failed to pull image ${sourceImage}`, error as Error);
  }
}

async function tagImage(sourceImage: string, targetAcr: string, imageName: string, version: string, dryRun: boolean): Promise<string> {
  const imageBase = imageName.includes(':') ? imageName.split(':')[0] : imageName;
  const targetImage = `${targetAcr}/${imageBase}:${version}`;
  
  if (dryRun) {
    console.log(`🏷️  [DRY RUN] Would tag ${sourceImage} as ${targetImage}`);
    return targetImage;
  }

  try {
    console.log(`🏷️  Tagging as ${targetImage}...`);
    await execa('docker', ['tag', sourceImage, targetImage]);
    console.log(`✅ Image tagged successfully`);
    return targetImage;
  } catch (error) {
    throw new AcrCopyError(`Failed to tag image ${sourceImage} as ${targetImage}`, error as Error);
  }
}

async function pushImage(targetImage: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`📤 [DRY RUN] Would push ${targetImage}`);
    return;
  }

  try {
    console.log(`📤 Pushing ${targetImage}...`);
    await execa('docker', ['push', targetImage]);
    console.log(`✅ Image pushed successfully`);
  } catch (error) {
    throw new AcrCopyError(`Failed to push image ${targetImage}`, error as Error);
  }
}

export async function copyAcrImage(options: CopyAcrOptions): Promise<void> {
  const { imageName, version, sourceAcr, targetAcr, dryRun } = options;

  try {
    await authenticateAcr(sourceAcr, dryRun);
    await authenticateAcr(targetAcr, dryRun);

    const sourceImage = await pullImage(sourceAcr, imageName, dryRun);
    const targetImage = await tagImage(sourceImage, targetAcr, imageName, version, dryRun);
    await pushImage(targetImage, dryRun);

    const imageBase = imageName.includes(':') ? imageName.split(':')[0] : imageName;
    const finalTarget = `${targetAcr}/${imageBase}:${version}`;
    console.log(`✅ Copy completed: ${imageName} → ${finalTarget}`);
  } catch (error) {
    if (error instanceof AcrCopyError) {
      console.error(`❌ ${error.message}`);
      if (error.cause) {
        console.error(`   Caused by: ${error.cause.message}`);
      }
    } else {
      console.error(`❌ Unexpected error: ${error}`);
    }
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const env = await validateEnvironment();
  
  await copyAcrImage({
    imageName: env.IMAGE_NAME,
    version: env.VERSION,
    sourceAcr: env.SOURCE_ACR,
    targetAcr: env.TARGET_ACR,
    dryRun: env.DRY_RUN || false
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}