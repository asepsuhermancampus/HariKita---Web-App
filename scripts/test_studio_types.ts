import { SANDBOX_STUDIO_DEFAULTS, SANDBOX_VENUE_LOCATION_DATA } from '../src/app/design-system-showcase/data/mock-invitation-sandbox';
import { InvitationStudioConfig } from '../src/types/invitation-studio';

function validateTypes(): boolean {
  const cfg: InvitationStudioConfig = SANDBOX_STUDIO_DEFAULTS;
  if (!cfg.themeColor || !cfg.coupleVariant || !cfg.placementStyle) {
    throw new Error('Default config missing mandatory fields');
  }
  if (!SANDBOX_VENUE_LOCATION_DATA.googleMapsUrl || !SANDBOX_VENUE_LOCATION_DATA.qrPayload) {
    throw new Error('Venue location data missing maps/QR payload');
  }
  console.log('✓ Task 1 validation passed: Studio types and defaults valid');
  return true;
}

validateTypes();
