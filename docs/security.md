# ForgeSight AI — Enterprise Security & Compliance

## Security Architecture

1. **Authentication & Password Hashing**:
   - Industry-standard PBKDF2 HMAC SHA-256 password hashing with dedicated salt.
   - JWT Access Tokens signed via HS256 algorithm with configurable expiration.

2. **Role-Based Access Control (RBAC)**:
   - Enforces 4 operational roles: `Admin`, `Plant Manager`, `Maintenance Engineer`, and `Operator`.
   - Restricts critical operations (such as approving recommendations or injecting failure stress tests) to authorized roles.

3. **Enterprise Audit Trail**:
   - Every security-sensitive action (alert acknowledgement, recommendation approval, CSV dataset ingestion, failure simulation trigger) creates an immutable record in `AuditLog` with user ID, name, timestamp, and machine context.

4. **Input Data Sanitation & Verification**:
   - FastAPI Pydantic schema validation on all incoming payload bodies.
   - CSV data import parser verifies required columns and sanitizes numerical inputs to prevent SQL injection or unhandled runtime exceptions.
