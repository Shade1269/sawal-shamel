import { FastUserProfile, FastAuthSignUpArgs, SignUpServices } from './useFastAuth';

export function performSignUpRuntime(
  args: FastAuthSignUpArgs,
  services: SignUpServices
): Promise<{ success: boolean; profile?: FastUserProfile; error?: Error }>;
