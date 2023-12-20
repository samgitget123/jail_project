import { NativeModules } from 'react-native';

export const initialize = async () => {
    console.log('TrustFingerInit')
    const deviceInfo = await NativeModules.TrustFinger.initTrustFinger();
    console.log('isSupport1:::::::::' + JSON.stringify(deviceInfo));
    return deviceInfo;
}

export const captureRawData = async(isVerifyFinger) => {
    console.log('captureRawData')
    await NativeModules.TrustFinger.captureRawData(isVerifyFinger);
    // console.log('captureRawData:::::::::' + JSON.stringify(capturedImage));
    // return captureRawData;
}

export const isSameFinger = async(imagePath1, imagePath2, imagePath3) => {
    const isSameFinger = await NativeModules.TrustFinger.isSameFinger(imagePath1, imagePath2, imagePath3);
    return isSameFinger;
}


export const verifyFinger = async(imagePath, fingerPosition) => {
    console.log('verify')
    console.log('imagePath:' +   imagePath)
    await NativeModules.TrustFinger.verify(imagePath,fingerPosition);
}

export const verifyFin = async(imagePath1,imagePath2) => {
    // console.log('verify')
    // console.log('imagePath1:' + imagePath1);
    // console.log('imagePath2:' + imagePath2);
    const isVerified =  await NativeModules.TrustFinger.verifyFinger(imagePath1,imagePath2);
    const isMatched = isVerified.isVerifyFinger;
    console.log(':isMatching:' + isMatched);
    return isMatched;
}
