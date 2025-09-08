/*
 * Test Migration 999 - Invalid Export
 *
 * This migration exports something other than a function
 * for testing validation scenarios.
 */

const invalidExport = { notAFunction: true, value: 'This should cause validation to fail' }

export default invalidExport
