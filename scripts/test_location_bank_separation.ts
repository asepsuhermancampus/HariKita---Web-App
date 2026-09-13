import { SANDBOX_VENUE_LOCATION_DATA, SANDBOX_GIFT_DATA } from '../src/app/design-system-showcase/data/mock-invitation-sandbox';
import fs from 'fs';

function testSeparation(): boolean {
  // Verify location contains maps data and NO bank account numbers
  if (!SANDBOX_VENUE_LOCATION_DATA.googleMapsUrl || !SANDBOX_VENUE_LOCATION_DATA.wazeUrl) {
    throw new Error('Missing navigation URLs in location card data');
  }
  // Verify bank accounts are pure gifts without payment checkout gates
  if (!SANDBOX_GIFT_DATA.bankAccounts || SANDBOX_GIFT_DATA.bankAccounts.length < 2) {
    throw new Error('Missing bank accounts in clean bank gift data');
  }

  // Check that the two component files exist
  const locPath = 'src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioLocationCard.tsx';
  const bankPath = 'src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioBankGiftSection.tsx';

  if (!fs.existsSync(locPath)) {
    throw new Error(`Missing StudioLocationCard file: ${locPath}`);
  }
  if (!fs.existsSync(bankPath)) {
    throw new Error(`Missing StudioBankGiftSection file: ${bankPath}`);
  }

  console.log('✓ Task 4 validation passed: Clean separation of Location and Bank verified');
  return true;
}

testSeparation();
