/**
 * Represents a User entity.
 * @class
 */
export class User {
    /**
     * @param {Object} params
     * @param {string} [params.id]
     * @param {string} [params.tenantId]
     * @param {string} [params.name] - Nombre completo.
     * @param {string} [params.email]
     * @param {string} [params.role] - owner, provider.
     * @param {string} [params.status] - active, inactive.
     * @param {string} [params.phone]
     * @param {string} [params.locale]
     * @param {string} [params.timezone]
     * @param {string} [params.lastLoginAt]
     * @param {string} [params.password] - Solo para transporte/registro.
     */
    constructor({ id = null, tenantId = '', name = '', email = '', role = 'user',
                    status = 'active', phone = '', locale = 'es', timezone = 'America/Lima',
                    lastLoginAt = null, password = '' }) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.phone = phone;
        this.locale = locale;
        this.timezone = timezone;
        this.lastLoginAt = lastLoginAt;
        this.password = password;
    }

    get firstName() {
        return this.name.split(' ')[0] || '';
    }

    get lastName() {
        return this.name.split(' ').slice(1).join(' ') || '';
    }

    get displayName() {
        return this.name || this.email;
    }
}