/**
 * Goal model for AccountaBuddy.
 * Goals can have any timescale (daily, weekly, monthly); reminders are always daily by default.
 */

export const TIMESCALE_DAILY = 'daily';
export const TIMESCALE_WEEKLY = 'weekly';
export const TIMESCALE_MONTHLY = 'monthly';

export const TIMESCALES = [TIMESCALE_DAILY, TIMESCALE_WEEKLY, TIMESCALE_MONTHLY];

export const REMINDER_POLICY_DEFAULT = 'default';

/**
 * Creates a new goal object.
 * @param {Object} params
 * @param {string} params.name - Goal name
 * @param {string} [params.description] - Optional description
 * @param {string} [params.timescale] - 'daily' | 'weekly' | 'monthly'
 * @param {string} [params.reminderPolicy] - For future use (e.g. 'default' | 'aggressive' | 'gentle')
 * @returns {Object} Goal
 */
export const createGoal = ({ name, description = '', timescale = TIMESCALE_DAILY, reminderPolicy = REMINDER_POLICY_DEFAULT }) => ({
  id: Date.now().toString(),
  name: name.trim(),
  description: description.trim(),
  timescale,
  reminderPolicy,
  createdAt: new Date().toISOString(),
  responses: [],
});

/**
 * Migrates a habit object (legacy) to a goal.
 * @param {Object} habit - Legacy habit from AsyncStorage
 * @returns {Object} Goal
 */
export const habitToGoal = (habit) => ({
  ...habit,
  timescale: habit.timescale ?? TIMESCALE_DAILY,
  reminderPolicy: habit.reminderPolicy ?? REMINDER_POLICY_DEFAULT,
});
