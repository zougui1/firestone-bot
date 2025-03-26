import type * as database from './database';

export const defaultConfig: database.config.ConfigType = {
  features: {
    engineerTools: {
      enabled: true,
    },
    campaignLoot: {
      enabled: true,
    },
    guardianTraining: {
      enabled: true,
      guardian: 'Vermillion',
    },
    firestoneResearch: {
      enabled: true,
    },
    guildExpedition: {
      enabled: true,
    },
    oracleRitual: {
      enabled: true,
    },
    pickaxesClaiming: {
      enabled: true,
    },
    alchemyExperiment: {
      enabled: true,
    },
    mapMission: {
      enabled: true,
    },
  },
};
