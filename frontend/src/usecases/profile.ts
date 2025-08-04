import {
  fetchProfile as fetchProfileService,
  fetchLevels as fetchLevelsService,
  updatePoints as updatePointsService,
} from 'src/infrastructure/api/profileService';

export const fetchProfile = fetchProfileService;
export const fetchLevels = fetchLevelsService;
export const updatePoints = updatePointsService;
