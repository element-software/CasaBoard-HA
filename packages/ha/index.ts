export { HAProvider } from "./provider/HAProvider";
export { useHA } from "./provider/HAProvider";
export { useEntity } from "./hooks/useEntity";
export { useEntities } from "./hooks/useEntities";
export { useEntitiesByIds } from "./hooks/useEntitiesByIds";
export { useEntityCount } from "./hooks/useEntityCount";
export { useEntityHistory } from "./hooks/useEntityHistory";
export { useAlarm } from "./hooks/useAlarm";
export type { UseAlarmOptions, UseAlarmResult } from "./hooks/useAlarm";
export type { EntityHistoryPoint } from "./hooks/entityHistory";
export { toChartDate } from "./hooks/entityHistory";
export {
  FORCE_ARM_DOMAINS,
  normalizeAlarmAction,
  isAlarmActive,
  resolveAlarmGestureAction,
  readArmExceptions,
  formatArmFailureMessage,
  serviceErrorMessage,
  getAlarmSecurityStatus,
  requiresAlarmCode,
  getAlarmPanelSnapshot,
  callAlarmService,
  forceArmAlarm,
  cancelForceArmAlarm,
  toAlarmCallFailure,
} from "./alarm/alarm";
export type {
  AlarmPanelService,
  AlarmAction,
  AlarmSecurityTone,
  AlarmSecurityStatus,
  AlarmArmFailure,
  AlarmPanelSnapshot,
  AlarmCallResult,
} from "./alarm/alarm";
export {
  connect,
  getEntity,
  reauthenticate,
  createLocalStorageTokenStore,
  classifyConnectionError,
  haConnectionFailure,
  HAConnectionError,
  throwConnectionFailure,
  normalizeHassUrl,
  testLongLivedTokenConnection,
  completeOAuthCallback,
  isOAuthCallbackUrl,
  oauthRedirectUrl,
  alignAuthHassUrl,
  readIngressPrefixFromBrowser,
  resolveBrowserHassUrl,
  rewriteHassMediaUrl,
} from "./connection";
export type {
  HATokenStore,
  HAConnectProps,
  HAConnectionFailure,
  HAConnectionFailureCode,
  NormalizeHassUrlResult,
  TestLongLivedTokenResult,
  BrowserLocationLike,
} from "./connection";
export {
  CAMERA_FEATURE_STREAM,
  addWebRtcCandidate,
  cameraSupportsHls,
  cameraSupportsWebRtc,
  ensureFreshAccessToken,
  getCameraCapabilities,
  getCameraHlsUrl,
  getCameraMjpegUrl,
  getCameraPosterUrl,
  getWebRtcClientConfiguration,
  joinHassUrl,
  subscribeWebRtcOffer,
} from "./camera/stream";
export type {
  CameraCapabilities,
  CameraStreamType,
  WebRtcClientConfiguration,
  WebRtcOfferEvent,
} from "./camera/stream";
export {
  findProblematicEntities,
  listEntityRegistry,
  removeEntityRegistryEntries,
  removeEntityRegistryEntry,
} from "./registry/entityRegistry";
export type {
  EntityRegistryEntry,
  ProblematicEntity,
  ProblematicEntityReason,
} from "./registry/entityRegistry";
export { ignoreRepairIssue, listRepairIssues } from "./repairs/repairs";
export type { RepairIssue, RepairSeverity } from "./repairs/repairs";
export type { ConnectResult, EntityDomain, EntityId, HAConnection } from "./types";
export { matchesTrigger, isOutsideCooldown } from "./events/popupTrigger";
export type {
  PopupTriggerConfig,
  PopupTriggerMode,
} from "./events/popupTrigger";
