export interface ISettings {
  key: string;
  value: string;
  name?: string;
  updatedAt?: Date;
}

export interface ISettingsInput {
  key: string;
  value: string;
  name?: string;
}

export interface ISettingsUpdate {
  key?: string;
  value?: string;
  name?: string;
  updatedAt?: Date;
}

export interface ISettingsQuery {
  key?: string;
}
