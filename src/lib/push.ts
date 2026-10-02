import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const setupPushNotifications = async () => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('Push notifications not supported on web platform.');
    return;
  }

  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.warn('Push notification permission denied.');
    return;
  }

  await PushNotifications.register();

  await PushNotifications.addListener('registration', token => {
    console.info('Push registration success, token: ' + token.value);
    // Aqui você enviaria o token para o seu backend/Firebase
  });

  await PushNotifications.addListener('registrationError', err => {
    console.error('Push registration error: ', err.error);
  });

  await PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push received: ', notification);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    console.log('Push action performed: ', notification);
  });
};
