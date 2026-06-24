import { useCommunitySync } from '../hooks/useCommunitySync';

/** Invisible helper that syncs local uploads to the API for global search. */
export default function CommunitySyncRunner() {
    useCommunitySync();
    return null;
}
