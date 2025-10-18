type NotificationDataValue =
  | string
  | number
  | boolean
  | null
  | NotificationDataInterface

export interface NotificationDataInterface {
  [key: string]: NotificationDataValue
}
