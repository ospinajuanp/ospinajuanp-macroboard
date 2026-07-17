import { z } from 'zod';

export const ActionTypeSchema = z.enum([
  'OBS_SCENE',
  'OBS_MUTE',
  'OBS_RECORD',
  'OBS_STREAM',
  'HOTKEY',
  'MACRO',
]);

export const ButtonSchema = z.object({
  id: z.string().min(1).max(128),
  icon: z.string().min(1).max(64),
  action: ActionTypeSchema,
  payload: z.string().max(4096),
  label: z.string().max(64).optional(),
  color: z.string().max(64).optional(),
});

export const TriggerMessageSchema = z.object({
  type: z.literal('TRIGGER'),
  buttonId: z.string().min(1),
  action: ActionTypeSchema,
  payload: z.string().max(4096).optional(),
});

export const ConfigUpdateMessageSchema = z.object({
  type: z.literal('CONFIG_UPDATE'),
  buttons: z.array(ButtonSchema).max(500).optional(),
});

export const ClientTypeMessageSchema = z.object({
  type: z.literal('CLIENT_TYPE'),
  clientType: z.enum(['mobile', 'admin']),
});

export const GetScenesMessageSchema = z.object({
  type: z.literal('GET_SCENES'),
});

export const WSClientMessageSchema = z.discriminatedUnion('type', [
  TriggerMessageSchema,
  ConfigUpdateMessageSchema,
  ClientTypeMessageSchema,
  GetScenesMessageSchema,
]);

export type TriggerMessage = z.infer<typeof TriggerMessageSchema>;
export type ConfigUpdateMessage = z.infer<typeof ConfigUpdateMessageSchema>;
export type ClientTypeMessage = z.infer<typeof ClientTypeMessageSchema>;
export type GetScenesMessage = z.infer<typeof GetScenesMessageSchema>;
export type WSClientMessageValidated = z.infer<typeof WSClientMessageSchema>;