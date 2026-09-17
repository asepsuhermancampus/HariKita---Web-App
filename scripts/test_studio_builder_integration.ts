import fs from 'fs';

function testIntegration(): boolean {
  const hubCode = fs.readFileSync(
    'src/app/design-system-showcase/components/invitation-hub/InvitationHubView.tsx',
    'utf-8'
  );
  if (!hubCode.includes('InvitationStudioBuilder')) {
    throw new Error('InvitationHubView must mount InvitationStudioBuilder');
  }

  const builderPath =
    'src/app/design-system-showcase/components/invitation-hub/studio/InvitationStudioBuilder.tsx';
  if (!fs.existsSync(builderPath)) {
    throw new Error(`Missing builder component: ${builderPath}`);
  }

  console.log('✓ Task 8 validation passed: InvitationStudioBuilder created and mounted in InvitationHubView');
  return true;
}

testIntegration();
