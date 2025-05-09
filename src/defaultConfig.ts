import type * as database from './bot/database';

export const defaultConfig: database.config.ConfigType = {
  sessionId: '',
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
      treeLevel: 1,
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
      treeLevel: 1,
      blood: true,
      dust: false,
      exoticCoins: false,
      durationMinutes: 60,
    },
    mapMission: {
      enabled: true,
      squads: 1,
    },
  },
};
