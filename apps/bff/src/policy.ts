import type { UserContext } from '../../packages/shared/api-types';

export type HasRoleCondition = { operator: 'hasRole'; roles: string[] };
export type HasGroupCondition = { operator: 'isInGroup'; groups: string[] };
export type AndCondition = { operator: 'and'; rules: PolicyRule[] };
export type OrCondition = { operator: 'or'; rules: PolicyRule[] };
export type NotCondition = { operator: 'not'; rule: PolicyRule };

export type PolicyRule =
    | HasRoleCondition
    | HasGroupCondition
    | AndCondition
    | OrCondition
    | NotCondition;

/**
 * Evaluates a JSON policy AST against a user's context.
 */
export const evaluatePolicy = (rule: PolicyRule, user: UserContext): boolean => {
    switch (rule.operator) {
        case 'hasRole':
            // Exact match for roles
            return rule.roles.some(role => user.roles.includes(role));

        case 'isInGroup':
            // NEW: Check if any of the user's groups START WITH any of the required groups.
            // This allows hierarchical inheritance (e.g., requiring "/admin" allows "/admin/subgroup")
            return rule.groups.some(requiredGroup =>
                user.groups.some(userGroup => userGroup.startsWith(requiredGroup))
            );

        case 'and':
            return rule.rules.every(subRule => evaluatePolicy(subRule, user));

        case 'or':
            return rule.rules.some(subRule => evaluatePolicy(subRule, user));

        case 'not':
            return !evaluatePolicy(rule.rule, user);

        default:
            console.warn(`Unknown operator encountered in policy AST`, rule);
            return false;
    }
};