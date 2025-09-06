# Next Step: Remove Drift Detection and State Management Code

## Problem
The current infrastructure management system has state collection, drift detection, and state comparison logic that we're not implementing yet. This code adds complexity and assumptions we don't need right now. We need to remove all state-related functionality to simplify the system.

## Files to Change
- `test/adapter-foundation.tap.js`: 
  - Delete lines 96-98: `t.ok(plan.expectedState.alice, 'Plan expected state includes alice')` and similar assertions
  - Delete lines 169-172: `t.ok(plan.expectedState.alice)` and `t.ok(plan.expectedState.bob)` tests
  - Delete lines 46-49: `InfrastructureAdapter.Alice.prototype.getCurrentState = async () => ({ aliceData: [...], timestamp: Date.now() })`
  - Delete lines 61-64: `InfrastructureAdapter.Bob.prototype.getCurrentState = async () => ({ bobData: [...], timestamp: Date.now() })`
  - Remove all other test assertions that expect `plan.expectedState` or `plan.stateHash` properties
- `src/core/planner.js`:
  - Remove state collection logic from `generatePlan` function (calls to `adapter.getCurrentState()`)
  - Remove `expectedState` and `stateHash` properties from returned plan objects
  - Update function signatures to not expect or use state parameters

## Validation
- Run `yarn tap:file test/adapter-foundation.tap.js` - all tests pass
- Run `grep -r "expectedState\|stateHash\|getCurrentState" src/ test/` - should return no matches  
- Generate a plan and confirm no state fields: `node -e "import('./src/index.js').then(async ({generatePlan}) => { const {LookupTable} = await import('@graffio/functional'); const plan = await generatePlan('create-environment', {environment: 'test'}, LookupTable([], null, 'name')); console.log('Has expectedState:', !!plan.expectedState); console.log('Has stateHash:', !!plan.stateHash); })"`
