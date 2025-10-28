export const alertSound = require('../../assets/audio/alert.mp3');
export const infoSound = require('../../assets/audio/info.mp3');

type CountdownMap = Record<string, any>;

const voices: Record<string, CountdownMap> = {
  'enUS/male': {
    '1': require('../../assets/audio/countdown/enUS/male/1.mp3'),
    '2': require('../../assets/audio/countdown/enUS/male/2.mp3'),
    '3': require('../../assets/audio/countdown/enUS/male/3.mp3'),
    '4': require('../../assets/audio/countdown/enUS/male/4.mp3'),
    '5': require('../../assets/audio/countdown/enUS/male/5.mp3'),
  },
  'enUS/female': {
    '1': require('../../assets/audio/countdown/enUS/female/1.mp3'),
    '2': require('../../assets/audio/countdown/enUS/female/2.mp3'),
    '3': require('../../assets/audio/countdown/enUS/female/3.mp3'),
    '4': require('../../assets/audio/countdown/enUS/female/4.mp3'),
    '5': require('../../assets/audio/countdown/enUS/female/5.mp3'),
  },
  'esMX/male': {
    '1': require('../../assets/audio/countdown/esMX/male/1.mp3'),
    '2': require('../../assets/audio/countdown/esMX/male/2.mp3'),
    '3': require('../../assets/audio/countdown/esMX/male/3.mp3'),
    '4': require('../../assets/audio/countdown/esMX/male/4.mp3'),
    '5': require('../../assets/audio/countdown/esMX/male/5.mp3'),
  },
  'koKR/male': {
    '1': require('../../assets/audio/countdown/koKR/male/1.mp3'),
    '2': require('../../assets/audio/countdown/koKR/male/2.mp3'),
    '3': require('../../assets/audio/countdown/koKR/male/3.mp3'),
    '4': require('../../assets/audio/countdown/koKR/male/4.mp3'),
    '5': require('../../assets/audio/countdown/koKR/male/5.mp3'),
  },
  'koKR/female': {
    '1': require('../../assets/audio/countdown/koKR/female/1.mp3'),
    '2': require('../../assets/audio/countdown/koKR/female/2.mp3'),
    '3': require('../../assets/audio/countdown/koKR/female/3.mp3'),
    '4': require('../../assets/audio/countdown/koKR/female/4.mp3'),
    '5': require('../../assets/audio/countdown/koKR/female/5.mp3'),
  },
};

export const getCountdownSound = (voicePath: string, number: string): any => {
  return voices[voicePath]?.[number] ?? null;
};

export default { alertSound, infoSound, getCountdownSound };
