import { BaseApi } from '@/shared/infrastructure/base-api.js'

const notificationsPath = '/notifications'

export class NotificationsApi extends BaseApi {
  constructor () {
    super()
  }

  getAllActive () {
    return this.http.get(notificationsPath)
  }

  getByEquipment (equipmentId) {
    return this.http.get(`${notificationsPath}/equipment/${equipmentId}`)
  }

  dismiss (notificationId) {
    return this.http.patch(`${notificationsPath}/${notificationId}/dismiss`)
  }
}
