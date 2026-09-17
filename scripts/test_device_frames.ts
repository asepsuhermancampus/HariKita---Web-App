import { DEVICE_FRAME_CONFIGS } from '../src/app/design-system-showcase/components/invitation-hub/studio/DeviceFrameContainer';
import fs from 'fs';

function testFrames(): boolean {
  const frames = ['iphone-15-pro', 'iphone-se', 'galaxy-s24', 'pixel-8', 'iphone-max'] as const;
  frames.forEach((f) => {
    const cfg = DEVICE_FRAME_CONFIGS[f];
    if (!cfg || cfg.width < 320 || cfg.height < 600) {
      throw new Error(`Invalid frame config for ${f}`);
    }
  });

  const previewPath = 'src/app/design-system-showcase/components/invitation-hub/studio/InvitationDevicePreview.tsx';
  if (!fs.existsSync(previewPath)) {
    throw new Error(`Missing InvitationDevicePreview file: ${previewPath}`);
  }

  console.log('✓ Task 7 validation passed: 5 smartphone frame viewports & device preview verified');
  return true;
}

testFrames();
