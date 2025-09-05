/*
 * Firebase Adapter - Main Export
 */

import { InfrastructureAdapter } from '../../types/index.js'
import { executeStep } from './executor.js'
import { generateSteps, validateConfig } from './planner.js'

import { getCurrentState } from './state.js'

InfrastructureAdapter.Firebase.prototype.getCurrentState = getCurrentState
InfrastructureAdapter.Firebase.prototype.generateSteps = generateSteps
InfrastructureAdapter.Firebase.prototype.validateConfig = validateConfig
InfrastructureAdapter.Firebase.prototype.executeStep = executeStep
