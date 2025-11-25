import { createDevLogger } from './logger-dev.js'

const o = {
    alpha_beta_gamma_delta_0: 0,
    alpha_beta_gamma_delta_1: 1,
    alpha_beta_gamma_delta_2: 2,
    alpha_beta_gamma_delta_3: 3,
    alpha_beta_gamma_delta_4: 4,
    alpha_beta_gamma_delta_5: 5,
    alpha_beta_gamma_delta_6: 6,
    alpha_beta_gamma_delta_7: 7,
    alpha_beta_gamma_delta_8: 8,
    alpha_beta_gamma_delta_9: 9,
    alpha_beta_gamma_delta_10: 10,
    alpha_beta_gamma_delta_11: 11,
    alpha_beta_gamma_delta_12: 12,
    alpha_beta_gamma_delta_13: 13,
    alpha_beta_gamma_delta_14: 14,
    alpha_beta_gamma_delta_15: 15,
    alpha_beta_gamma_delta_16: 16,
    alpha_beta_gamma_delta_17: 17,
    alpha_beta_gamma_delta_18: 18,
    alpha_beta_gamma_delta_19: 19,
}

const logger = createDevLogger()

logger.debug('debug foo foo foo foo foo foo', o)
logger.debug('debug foo foo foo', o)
logger.info('info foo foo', o)
logger.warn('warn', o)
logger.error(new Error('whoa'), o)
