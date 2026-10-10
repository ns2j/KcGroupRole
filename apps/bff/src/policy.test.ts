import test from 'node:test';
import assert from 'node:assert';
import { evaluatePolicy, PolicyRule } from './policy';
import { UserContext } from '../../packages/shared/api-types';

test('evaluatePolicy - hasRole exact match', () => {
    const user: UserContext = { roles: ['manager', 'user'], groups: [] };
    const rule: PolicyRule = { operator: 'hasRole', roles: ['manager'] };
    assert.strictEqual(evaluatePolicy(rule, user), true);
    
    const rule2: PolicyRule = { operator: 'hasRole', roles: ['admin'] };
    assert.strictEqual(evaluatePolicy(rule2, user), false);
});

test('evaluatePolicy - isInGroup exact and hierarchical match', () => {
    const user: UserContext = { roles: [], groups: ['/A/B', '/admin123'] };
    
    // Exact match
    assert.strictEqual(evaluatePolicy({ operator: 'isInGroup', groups: ['/A/B'] }, user), true);
    
    // Hierarchical match (user is in /A/B, which is a subgroup of /A)
    assert.strictEqual(evaluatePolicy({ operator: 'isInGroup', groups: ['/A'] }, user), true);
    
    // Prefix trap match (user is in /admin123, policy requires /admin - should fail!)
    assert.strictEqual(evaluatePolicy({ operator: 'isInGroup', groups: ['/admin'] }, user), false);
});

test('evaluatePolicy - complex AST (and / or)', () => {
    const user: UserContext = { roles: ['manager'], groups: ['/A/B'] };
    
    const rule: PolicyRule = {
        operator: 'or',
        rules: [
            { operator: 'hasRole', roles: ['super-manager'] },
            {
                operator: 'and',
                rules: [
                    { operator: 'hasRole', roles: ['manager'] },
                    { operator: 'isInGroup', groups: ['/A'] }
                ]
            }
        ]
    };
    
    // Matches the 'and' condition branch
    assert.strictEqual(evaluatePolicy(rule, user), true);
    
    // Change user so they don't have the required group
    const userFail: UserContext = { roles: ['manager'], groups: ['/B'] };
    assert.strictEqual(evaluatePolicy(rule, userFail), false);
});

test('evaluatePolicy - not operator', () => {
    const user: UserContext = { roles: ['manager'], groups: [] };
    
    // User does NOT have 'admin' role, so (not hasRole 'admin') should be true
    const rule: PolicyRule = {
        operator: 'not',
        rule: { operator: 'hasRole', roles: ['admin'] }
    };
    assert.strictEqual(evaluatePolicy(rule, user), true);

    // User DOES have 'manager' role, so (not hasRole 'manager') should be false
    const rule2: PolicyRule = {
        operator: 'not',
        rule: { operator: 'hasRole', roles: ['manager'] }
    };
    assert.strictEqual(evaluatePolicy(rule2, user), false);
});

test('evaluatePolicy - empty conditions behavior', () => {
    const user: UserContext = { roles: ['manager'], groups: ['/A'] };
    
    // Empty roles array in hasRole returns false (Array.prototype.some returns false for empty arrays)
    assert.strictEqual(evaluatePolicy({ operator: 'hasRole', roles: [] }, user), false);

    // Empty groups array in isInGroup returns false
    assert.strictEqual(evaluatePolicy({ operator: 'isInGroup', groups: [] }, user), false);

    // Empty rules array in 'or' returns false (Array.prototype.some returns false)
    assert.strictEqual(evaluatePolicy({ operator: 'or', rules: [] }, user), false);

    // Empty rules array in 'and' returns true (Array.prototype.every returns true for empty arrays)
    assert.strictEqual(evaluatePolicy({ operator: 'and', rules: [] }, user), true);
});
